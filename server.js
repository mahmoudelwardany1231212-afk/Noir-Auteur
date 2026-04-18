require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-Memory storage (Replace with Database Connection in Production)
let eventsDb = [];

/**
 * Endpoint: POST /api/track
 * Receives batched analytics events
 */
app.post('/api/track', (req, res) => {
    try {
        const events = Array.isArray(req.body) ? req.body : [req.body];
        
        const processedEvents = events.map(event => ({
            ...event,
            received_at: new Date().toISOString()
        }));

        eventsDb.push(...processedEvents);
        console.log(`✅ Received ${processedEvents.length} events. Total: ${eventsDb.length}`);
        res.status(200).json({ status: 'success' });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

/**
 * Summary Statistics Calculator
 */
function getAnalyticsSummary() {
    const totalEvents = eventsDb.length;
    const uniqueSessions = new Set(eventsDb.map(e => e.session_id)).size;
    const purchases = eventsDb.filter(e => e.event_type === 'purchase').length;
    const likes = eventsDb.filter(e => e.event_type === 'like').length;
    const nopes = eventsDb.filter(e => e.event_type === 'nope').length;
    
    const conversionRate = uniqueSessions > 0 ? ((purchases / uniqueSessions) * 100).toFixed(2) : 0;

    // Top Movies Analysis
    const movieLikes = {};
    eventsDb.filter(e => e.event_type === 'like').forEach(e => {
        const title = e.metadata?.movie || 'Unknown';
        movieLikes[title] = (movieLikes[title] || 0) + 1;
    });
    
    const topMovies = Object.entries(movieLikes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return {
        totalEvents,
        uniqueSessions,
        purchases,
        likes,
        nopes,
        conversionRate,
        topMovies
    };
}

/**
 * Email Reporting Logic
 */
async function sendWeeklyReport() {
    console.log('📧 Generating weekly analytics report...');
    const stats = getAnalyticsSummary();

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const movieRows = stats.topMovies.map(([title, count]) => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${title}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: #f2ca50; font-weight: bold;">${count} Likes</td>
        </tr>
    `).join('');

    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background: #131313; color: #fff; padding: 40px; border-radius: 20px;">
            <h1 style="color: #f2ca50; border-bottom: 2px solid #f2ca50; padding-bottom: 15px; text-transform: uppercase; letter-spacing: 2px;">Noir Auteur Analytics</h1>
            <p style="color: #aaa;">Weekly Performance Summary Report</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
                <div style="background: #1c1b1b; padding: 20px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #f2ca50;">${stats.uniqueSessions}</div>
                    <div style="font-size: 12px; color: #888; text-transform: uppercase;">Total Visitors</div>
                </div>
                <div style="background: #1c1b1b; padding: 20px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #10b981;">${stats.conversionRate}%</div>
                    <div style="font-size: 12px; color: #888; text-transform: uppercase;">Conv. Rate</div>
                </div>
            </div>

            <h3 style="color: #f2ca50;">Engagement Metrics</h3>
            <ul style="list-style: none; padding: 0;">
                <li style="padding: 10px 0; border-bottom: 1px solid #333;">🛒 Total Purchases: <span style="float: right; color: #10b981;">${stats.purchases}</span></li>
                <li style="padding: 10px 0; border-bottom: 1px solid #333;">❤️ Total Likes: <span style="float: right; color: #f2ca50;">${stats.likes}</span></li>
                <li style="padding: 10px 0; border-bottom: 1px solid #333;">❌ Total Nopes: <span style="float: right; color: #f43f5e;">${stats.nopes}</span></li>
            </ul>

            <h3 style="color: #f2ca50; margin-top: 30px;">Top Performing Movies</h3>
            <table style="width: 100%; border-collapse: collapse; background: #1c1b1b; border-radius: 10px; overflow: hidden;">
                ${movieRows || '<tr><td style="padding: 10px; color: #666;">No interactions yet</td></tr>'}
            </table>

            <p style="margin-top: 40px; font-size: 12px; color: #666; text-align: center;">
                Generated automatically by Noir Auteur Analytics Hub.<br>
                Next report scheduled for next Friday at 12:00 PM.
            </p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"${process.env.REPORT_SENDER_NAME}" <${process.env.SMTP_USER}>`,
            to: process.env.REPORT_RECIPIENT_EMAIL,
            subject: `📊 Weekly Analytical Report: ${new Date().toLocaleDateString()}`,
            html: htmlContent,
        });
        console.log('✅ Weekly report sent successfully to:', process.env.REPORT_RECIPIENT_EMAIL);
    } catch (error) {
        console.error('❌ Failed to send report:', error.message);
    }
}

/**
 * Cron Job: Every Friday at 12:00 PM
 */
cron.schedule('0 12 * * 5', () => {
    sendWeeklyReport();
});

/**
 * Test Endpoint: Send report immediately
 */
app.get('/api/test-report', async (req, res) => {
    await sendWeeklyReport();
    res.json({ status: 'Triggered', message: 'Check your email inbox.' });
});

app.get('/api/stats', (req, res) => {
    res.json(getAnalyticsSummary());
});

app.listen(PORT, () => {
    console.log(`📊 Analytics Server running at http://localhost:${PORT}`);
    console.log(`🕒 Weekly report scheduled for Fridays at 12:00 PM`);
});
