// =====================================
// ChatTBM V6.6
// Content Score Engine
//
// Purpose:
// - Score complete content
// - Detect strengths
// - Detect weaknesses
// - Recommend improvements
// =====================================

function scoreContent(content) {

    const text = String(content).toLowerCase();

    let score = 0;

    const strengths = [];

    const improvements = [];

    // ===============================
    // HOOK
    // ===============================

    if (
        text.includes("nobody") ||
        text.includes("secret") ||
        text.includes("never") ||
        text.includes("imagine")
    ) {

        score += 20;

        strengths.push(
            "Strong opening hook"
        );

    } else {

        improvements.push(
            "Create a stronger opening hook."
        );

    }

    // ===============================
    // STORY
    // ===============================

    if (
        text.includes("story") ||
        text.includes("journey") ||
        text.includes("process") ||
        text.includes("growth") ||
        text.includes("struggle")
    ) {

        score += 20;

        strengths.push(
            "Good storytelling"
        );

    } else {

        improvements.push(
            "Add a clear story progression."
        );

    }

    // ===============================
    // EMOTION
    // ===============================

    if (
        text.includes("dream") ||
        text.includes("family") ||
        text.includes("hope") ||
        text.includes("fear") ||
        text.includes("success")
    ) {

        score += 20;

        strengths.push(
            "Emotional connection"
        );

    } else {

        improvements.push(
            "Add stronger emotional appeal."
        );

    }

    // ===============================
    // CTA
    // ===============================

    if (
        text.includes("follow") ||
        text.includes("share") ||
        text.includes("comment") ||
        text.includes("subscribe")
    ) {

        score += 20;

        strengths.push(
            "Strong call to action"
        );

    } else {

        improvements.push(
            "Finish with a call to action."
        );

    }

    // ===============================
    // LENGTH
    // ===============================

    if (text.length >= 150) {

        score += 20;

        strengths.push(
            "Good content length"
        );

    } else {

        improvements.push(
            "Expand the content slightly."
        );

    }

    if (score > 100) {

        score = 100;

    }

    let level = "Low";

    if (score >= 80) {

        level = "Excellent";

    }

    else if (score >= 60) {

        level = "Good";

    }

    else if (score >= 40) {

        level = "Average";

    }

    return {

        score,

        level,

        strengths,

        improvements

    };

}

module.exports = {

    scoreContent

};
