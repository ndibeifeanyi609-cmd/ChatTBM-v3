/* ===================================
   ChatTBM V5.9.3
   Offline Smart Response Brain
   Part 1A
=================================== */

// ===================================
// MAIN OFFLINE AI
// ===================================

function offlineBrain(message) {

    const text = normalizeMessage(message);

    // -------------------------------
    // Greetings
    // -------------------------------

    if (hasWords(text, [
        "hi",
        "hello",
        "hey",
        "good morning",
        "good afternoon",
        "good evening"
    ])) {

        return randomReply([
            "Hello 👋 I'm ChatTBM. How can I help you today?",
            "Hi! I'm ready to help with content, coding, ideas and questions.",
            "Welcome back! What would you like to create today?"
        ]);

    }

    // -------------------------------
    // Identity
    // -------------------------------

    if (
        text.includes("who are you") ||
        text.includes("what are you")
    ) {

        return "I'm ChatTBM, your AI Content Assistant. I can help with captions, scripts, coding, ideas, explanations and much more—even when you're offline.";

    }

    // -------------------------------
    // Help
    // -------------------------------

    if (
        text.includes("help") ||
        text.includes("what can you do")
    ) {

        return (
            "I can help with:\n\n" +
            "• Captions\n" +
            "• Video ideas\n" +
            "• Scripts\n" +
            "• Coding\n" +
            "• Math\n" +
            "• Motivation\n" +
            "• General questions\n" +
            "• Creative writing"
        );

    }

    // -------------------------------
    // Time
    // -------------------------------

    if (text.includes("time")) {

        return "Current time: " +
            new Date().toLocaleTimeString();

    }

    // -------------------------------
    // Date
    // -------------------------------

    if (
        text.includes("date") ||
        text.includes("today")
    ) {

        return "Today's date is " +
            new Date().toDateString();

    }

    // -------------------------------
    // Math
    // -------------------------------

    const math = solveMath(text);

    if (math !== null) {

        return "The answer is " + math;

    }

    // -------------------------------
    // Caption
    // -------------------------------

    if (text.includes("caption")) {

        return "✨ Create. Inspire. Repeat.\n\nEvery post is another chance to grow.";

    }

    // -------------------------------
    // Hashtags
    // -------------------------------

    if (text.includes("hashtag")) {

        return "#viral #contentcreator #explore #creative #trending";

    }

    // -------------------------------
    // Video Ideas
    // -------------------------------

    if (
        text.includes("video idea") ||
        text.includes("content idea")
    ) {

        return (
            "Content Idea:\n\n" +
            "Show a surprising before-and-after transformation within the first 3 seconds to hook viewers."
        );

    }

    // -------------------------------
    // Coding
    // -------------------------------

    if (
        text.includes("javascript") ||
        text.includes("html") ||
        text.includes("css")
    ) {

        return "I can help you learn HTML, CSS and JavaScript. Tell me exactly what you're trying to build.";

    }

    // -------------------------------
    // Motivation
    // -------------------------------

    if (
        text.includes("motivate") ||
        text.includes("motivation")
    ) {

        return randomReply([

            "Every expert started as a beginner. Keep building.",

            "Small progress every day creates big results.",

            "Stay consistent. Great projects aren't built overnight."

        ]);

    }

    // -------------------------------
    // Thanks
    // -------------------------------

    if (
        text.includes("thank") ||
        text.includes("thanks")
    ) {

        return "You're welcome! 😊";

    }

    // -------------------------------
    // Goodbye
    // -------------------------------

    if (
        text.includes("bye") ||
        text.includes("goodbye")
    ) {

        return "Goodbye! I'll be here whenever you need me.";

    }

    // -------------------------------
    // Default
    // -------------------------------

    return defaultResponse(message);

}

// ===================================
// DEFAULT RESPONSE
// ===================================

function defaultResponse(message) {

    const replies = [

        "That's interesting. Tell me more.",

        "Can you explain that differently?",

        "I'm still learning offline, but I'll do my best to help.",

        "Let's solve that together.",

        "I understand your question. Could you provide a little more detail?"

    ];

    return randomReply(replies);

}

// ===================================
// NORMALIZE
// ===================================

function normalizeMessage(text) {

    return text
        .toLowerCase()
        .trim();

}

// ===================================
// RANDOM RESPONSE
// ===================================

function randomReply(list) {

    return list[
        Math.floor(
            Math.random() * list.length
        )
    ];

}

// ===================================
// WORD MATCH
// ===================================

function hasWords(text, words) {

    return words.some(word =>
        text.includes(word)
    );

}

// ===================================
// SIMPLE MATH
// ===================================

function solveMath(text) {

    const expression = text.match(/[0-9+\-*/(). ]+/);

    if (!expression) {

        return null;

    }

    try {

        const result = Function(
            "return " + expression[0]
        )();

        if (result === undefined) {

            return null;

        }

        if (isNaN(result)) {

            return null;

        }

        return result;

    }

    catch {

        return null;

    }

}

// ===================================
// EXPORT
// ===================================

window.offlineBrain = offlineBrain;
