// =====================================
// ChatTBM V6.6
// Audience Prediction Engine
//
// Purpose:
// - Predict target audience
// - Estimate confidence
// - Suggest audience category
// =====================================

function predictAudience(content) {

    const text = String(content).toLowerCase();

    let audience = "General";

    let confidence = "Low";

    const reasons = [];

    // ===============================
    // ACTION
    // ===============================

    if (

        text.includes("fight") ||

        text.includes("battle") ||

        text.includes("war")

    ) {

        audience = "Action";

        confidence = "High";

        reasons.push(
            "Action keywords detected."
        );

    }

    // ===============================
    // MOTIVATION
    // ===============================

    else if (

        text.includes("dream") ||

        text.includes("success") ||

        text.includes("growth") ||

        text.includes("journey")

    ) {

        audience = "Motivation";

        confidence = "High";

        reasons.push(
            "Motivational language detected."
        );

    }

    // ===============================
    // COMEDY
    // ===============================

    else if (

        text.includes("funny") ||

        text.includes("laugh") ||

        text.includes("comedy")

    ) {

        audience = "Comedy";

        confidence = "High";

        reasons.push(
            "Comedy elements detected."
        );

    }

    // ===============================
    // EDUCATION
    // ===============================

    else if (

        text.includes("learn") ||

        text.includes("tutorial") ||

        text.includes("guide")

    ) {

        audience = "Education";

        confidence = "Medium";

        reasons.push(
            "Educational content detected."
        );

    }

    // ===============================
    // BUSINESS
    // ===============================

    else if (

        text.includes("business") ||

        text.includes("money") ||

        text.includes("marketing")

    ) {

        audience = "Business";

        confidence = "Medium";

        reasons.push(
            "Business-related content."
        );

    }

    return {

        audience,

        confidence,

        reasons

    };

}

module.exports = {

    predictAudience

};
