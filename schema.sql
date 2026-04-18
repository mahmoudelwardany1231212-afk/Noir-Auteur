-- Database Schema for User Activity Tracking System

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id VARCHAR(100), -- Nullable, for registered users
    session_id VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    metadata JSONB, -- Stores event-specific data (clicks, etc.)
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance
CREATE INDEX idx_event_type ON events(event_type);
CREATE INDEX idx_session_id ON events(session_id);
CREATE INDEX idx_created_at ON events(created_at);

-- View for Conversion Rate Analysis
-- Calculate conversions (e.g., 'purchase') vs total unique visits
CREATE OR REPLACE VIEW conversion_stats AS
SELECT 
    COUNT(DISTINCT session_id) as total_visits,
    COUNT(DISTINCT CASE WHEN event_type = 'purchase' THEN session_id END) as total_conversions,
    ROUND(
        (COUNT(DISTINCT CASE WHEN event_type = 'purchase' THEN session_id END)::numeric / 
        NULLIF(COUNT(DISTINCT session_id), 0)) * 100, 
    2) as conversion_rate
FROM events;
