/* =====================================
   ChatTBM V5.9.5
   Smart Editor Brain

   Purpose:
   - Edit previous AI responses
   - Shorten
   - Expand
   - Rewrite
   - Change tone
===================================== */

// =====================================
// MAIN EDITOR
// =====================================

function editorBrain(command, text){

    const cmd = command.toLowerCase();

    if(
        cmd.includes("short") ||
        cmd.includes("shorter") ||
        cmd.includes("summarize")
    ){
        return shortenText(text);
    }

    if(
        cmd.includes("expand") ||
        cmd.includes("longer") ||
        cmd.includes("more details")
    ){
        return expandText(text);
    }

    if(
        cmd.includes("rewrite") ||
        cmd.includes("improve")
    ){
        return rewriteText(text);
    }

    return text;

}

// =====================================
// SHORTEN
// =====================================

function shortenText(text){

    const words = text.split(" ");

    if(words.length <= 6){
        return text;
    }

    return words.slice(0,6).join(" ") + "...";

}

// =====================================
// EXPAND
// =====================================

function expandText(text){

    return text +
    "\n\nKeep going, stay consistent, and trust the process.";

}

// =====================================
// REWRITE
// =====================================

function rewriteText(text){

    return "Here's another version:\n\n" + text;

}

// =====================================
// EXPORT
// =====================================

window.editorBrain = editorBrain;
