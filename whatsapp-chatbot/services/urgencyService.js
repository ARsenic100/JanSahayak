require('dotenv').config();
const axios = require('axios');

// Function to classify urgency level using the Python spaCy service
async function classifyUrgency(text) {
    try {
        const response = await axios.post(`${process.env.FLASK_URL}/classify`, {
            text: text
        });
        return response.data.urgency;
    } catch (error) {
        console.error('Error calling spaCy service:', error);
        // Fallback to simple keyword matching if spaCy service is unavailable
        return simpleClassifyUrgency(text);
    }
}

// Fallback function using simple keyword matching
function simpleClassifyUrgency(text) {
    text = text.toLowerCase();
    
    const high_urgency_keywords = new Set([
        "explosion", "fire", "blast", "flood", "short circuit", "electric shock", "gas leak",
        "fatal", "injury", "emergency", "accident", "collapsed", "died", "death", "bleeding",
        "serious", "severe", "critical", "danger", "unsafe", "life-threatening"
    ]);

    const medium_urgency_keywords = new Set([
        "water leakage", "leaking", "internet down", "no internet", "power cut", "no electricity",
        "power outage", "power failure", "blocked road", "clogged", "damaged pipe", "crack in wall",
        "no water", "fan not working", "ac not working", "lift stuck", "broken light", "malfunction",
        "low voltage", "overheating", "network issue", "plumbing issue"
    ]);

    const low_urgency_keywords = new Set([
        "slow wifi", "dust", "noise", "dirty", "garbage", "smell", "mosquito", "rats", "light flicker",
        "dirty floor", "cleaning needed", "unhygienic", "maintenance required", "bugs", "small leak",
        "water drip", "minor issue", "rust", "peeling paint", "old wiring", "slow drainage"
    ]);

    // Check for phrases and words
    const high_score = Array.from(high_urgency_keywords).some(kw => text.includes(kw));
    const medium_score = Array.from(medium_urgency_keywords).some(kw => text.includes(kw));
    const low_score = Array.from(low_urgency_keywords).some(kw => text.includes(kw));

    if (high_score) {
        return "High";
    } else if (medium_score) {
        return "Medium";
    } else if (low_score) {
        return "Low";
    } else {
        return "Low"; // Default to Low if no keywords match
    }
}

module.exports = {
    classifyUrgency
}; 