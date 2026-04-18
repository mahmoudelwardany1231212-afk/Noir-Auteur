require('dotenv').config();
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// 1. Initialize Firebase Admin
let serviceAccount;
try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (e) {
    const fs = require('fs');
    const path = require('path');
    const localKeyPath = path.join(__dirname, '../noir-analytics-b7c31-firebase-adminsdk-fbsvc-d2f3a16abf.json');
    if (fs.existsSync(localKeyPath)) {
        serviceAccount = require(localKeyPath);
    } else {
        console.error('❌ Could not find Firebase Service Account Key.');
        process.exit(1);
    }
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function sendWeeklyReport() {
    console.log('📊 Generating Comprehensive Weekly Report (Last 7 Days)...');
    
    // STRICT WEEKLY FILTER: Last 7 days only
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    try {
        const snapshot = await db.collection('events')
            .where('timestamp', '>=', oneWeekAgo)
            .get();

        const events = [];
        snapshot.forEach(doc => events.push(doc.data()));

        if (events.length === 0) {
            console.log('⚠️ No activity found this week. Report skipped.');
            return;
        }

        // --- ENHANCED ANALYTICS LOGIC ---
        const sessions = new Set(events.map(e => e.session_id));
        const totalVisitors = sessions.size;
        
        const likes = events.filter(e => e.event_type === 'like').length;
        const nopes = events.filter(e => e.event_type === 'nope').length;
        const totalSwipes = likes + nopes;
        
        const conversions = events.filter(e => e.event_type === 'purchase').length;
        
        // Conversions are actions like WhatsApp clicks
        const interestRate = totalSwipes > 0 ? ((likes / totalSwipes) * 100).toFixed(1) : 0;
        const conversionRate = totalVisitors > 0 ? ((conversions / totalVisitors) * 100).toFixed(1) : 0;

        // Top 3 Movies
        const movieLikes = {};
        events.filter(e => e.event_type === 'like').forEach(e => {
            const title = e.metadata?.movie || 'Unknown';
            movieLikes[title] = (movieLikes[title] || 0) + 1;
        });
        const topMovies = Object.entries(movieLikes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        const movieRows = topMovies.map(([title, count], idx) => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #222; color: #eee;">#${idx+1} ${title}</td>
                <td style="padding: 12px; border-bottom: 1px solid #222; text-align: right; color: #f2ca50; font-weight: bold;">${count} Likes</td>
            </tr>
        `).join('');

        // --- EMAIL DESIGN ---
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const htmlContent = `
            <div style="background-color: #0c0c0c; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 20px; max-width: 600px; margin: auto; border: 1px solid #1a1a1a; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #f2ca50; letter-spacing: 5px; margin: 0; font-size: 28px;">NOIR AUTEUR</h1>
                    <p style="color: #666; font-size: 12px; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">Weekly Intelligence Briefing</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
                    <div style="background: #151515; padding: 20px; border-radius: 6px; text-align: center; border: 1px solid #222;">
                        <div style="font-size: 32px; color: #f2ca50; font-weight: bold;">${totalVisitors}</div>
                        <div style="font-size: 10px; color: #888; text-transform: uppercase;">Unique Visitors</div>
                    </div>
                    <div style="background: #151515; padding: 20px; border-radius: 6px; text-align: center; border: 1px solid #222;">
                        <div style="font-size: 32px; color: #10b981; font-weight: bold;">${conversions}</div>
                        <div style="font-size: 10px; color: #888; text-transform: uppercase;">Sales Inquiries</div>
                    </div>
                </div>

                <div style="background: #111; padding: 20px; border-radius: 6px; margin-bottom: 30px; border-left: 4px solid #f2ca50;">
                    <h3 style="margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; color: #f2ca50;">Engagement Metrics</h3>
                    <p style="margin: 5px 0; font-size: 14px;">Total Swipes: <span style="float: right; color: #f2ca50;">${totalSwipes}</span></p>
                    <p style="margin: 5px 0; font-size: 14px;">Like Rate: <span style="float: right; color: #f2ca50;">${interestRate}%</span></p>
                    <p style="margin: 5px 0; font-size: 14px;">Conversion Rate: <span style="float: right; color: #10b981;">${conversionRate}%</span></p>
                </div>

                <h3 style="margin: 10px 0; font-size: 14px; text-transform: uppercase; color: #888;">🔥 Trending This Week</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    ${movieRows}
                </table>

                <div style="text-align: center; margin-top: 40px; color: #444; font-size: 11px;">
                    This report covers the last 7 days. Data remains secure in your Firebase cloud.<br>
                    Generated automatically by Noir Analytics Engine.
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"Noir Intelligence" <${process.env.SMTP_USER}>`,
            to: process.env.REPORT_RECIPIENT_EMAIL,
            subject: `📊 Noir Auteur: Weekly Analytics [${new Date().toLocaleDateString()}]`,
            html: htmlContent,
        });

        console.log('✅ Detailed Weekly Report sent successfully!');
    } catch (error) {
        console.error('❌ Error generating report:', error);
        process.exit(1);
    }
}

sendWeeklyReport();
