// =====================================
// ChatTBM V6.0.4
// Memory Learning Feedback Loop
// =====================================

// This engine learns from user feedback
// and helps ChatTBM improve future responses.

const feedbackMemory = [];

// =====================================
// SAVE USER FEEDBACK
// =====================================

function saveFeedback(data = {}) {

    const feedback = {
        userId: data.userId || "guest",
        message: data.message || "",
        response: data.response || "",
        rating: data.rating || null,
        correction: data.correction || null,
        timestamp: new Date()
    };

    feedbackMemory.push(feedback);

    return {
        success: true,
        message: "Feedback saved successfully",
        feedback
    };
}


// =====================================
// ANALYZE FEEDBACK
// =====================================

function analyzeFeedback() {

    const total = feedbackMemory.length;

    const positive = feedbackMemory.filter(
        item => item.rating === "good"
    ).length;

    const negative = feedbackMemory.filter(
        item => item.rating === "bad"
    ).length;


    return {
        totalFeedback: total,
        positive,
        negative,
        learningStatus:
            total > 0
            ? "ChatTBM is learning from user interactions"
            : "No feedback collected yet"
    };
}


// =====================================
// GET LEARNING DATA
// =====================================

function getFeedbackMemory() {

    return feedbackMemory;

}


// =====================================
// EXPORT ENGINE
// =====================================

module.exports = {
    saveFeedback,
    analyzeFeedback,
    getFeedbackMemory
};
