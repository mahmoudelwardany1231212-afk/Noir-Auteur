/**
 * Noir Analytics Hub - Firebase Edition
 * Features: Real-time Cloud Storage, Session Tracking, and Automatic Behavioral Capture.
 */

const Analytics = (() => {
    const CONFIG = {
        storageKey: 'noir_session_id',
        debug: true
    };

    let sessionId = null;

    // --- Core Logic ---

    const init = () => {
        setupSession();
        setupAutoTracking();
        
        // Track Initial Page View
        track('page_view', { 
            url: window.location.href, 
            title: document.title,
            referrer: document.referrer || 'direct'
        });
        
        if (CONFIG.debug) console.log('🔥 Firebase Analytics Initialized. Session:', sessionId);
    };

    const setupSession = () => {
        sessionId = localStorage.getItem(CONFIG.storageKey);
        if (!sessionId) {
            sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem(CONFIG.storageKey, sessionId);
        }
    };

    const setupAutoTracking = () => {
        // 1. Click Tracking for data-track targets
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-track="true"]');
            if (target) {
                const elementId = target.id || target.getAttribute('name') || target.innerText.trim();
                track('click', { 
                    element: elementId,
                    tag: target.tagName,
                    text: target.innerText.slice(0, 50)
                });
            }
        });
    };

    /**
     * Public Track Function - Sends directly to Firebase Firestore
     * @param {string} eventType 
     * @param {object} payload 
     */
    const track = async (eventType, payload = {}) => {
        const eventData = {
            event_type: eventType,
            session_id: sessionId,
            url: window.location.href,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            user_agent: navigator.userAgent,
            metadata: payload
        };

        if (CONFIG.debug) console.log(`[Firebase Track] ${eventType}:`, payload);

        try {
            // Send to Firestore Collection 'events'
            if (window.db) {
                await window.db.collection('events').add(eventData);
            } else {
                console.warn('⚠️ Firestore not initialized yet.');
            }
        } catch (error) {
            console.error('❌ Firebase Tracking Error:', error.message);
        }
    };

    // Initialize on load
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

    return {
        track: track,
        getSessionId: () => sessionId
    };
})();

// Export for global use
window.NoirAnalytics = Analytics;
