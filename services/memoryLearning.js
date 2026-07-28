
// =====================================
// ChatTBM V5.1
// Memory Learning Engine
// Detects useful user information
// =====================================


const {
    saveMemory,
    addMemoryNote
} = require("./memoryEngine");




// =====================================
// LEARN FROM USER MESSAGE
// =====================================

function learnFromMessage(
    userId,
    message
){


    const text =
    message.toLowerCase();




    // ===============================
    // CREATOR TYPE
    // ===============================


    if(
        text.includes("creator") ||
        text.includes("i make videos") ||
        text.includes("i create videos")
    ){

        saveMemory(
            userId,
            "profile",
            "creatorType",
            "content creator"
        );

    }




    // ===============================
    // PLATFORM DETECTION
    // ===============================


    if(
        text.includes("tiktok")
    ){

        saveMemory(
            userId,
            "profile",
            "platform",
            "TikTok"
        );

    }


    if(
        text.includes("youtube")
    ){

        saveMemory(
            userId,
            "profile",
            "platform",
            "YouTube"
        );

    }


    if(
        text.includes("instagram")
    ){

        saveMemory(
            userId,
            "profile",
            "platform",
            "Instagram"
        );

    }




    // ===============================
    // CONTENT STYLE
    // ===============================


    if(
        text.includes("funny") ||
        text.includes("comedy")
    ){

        saveMemory(
            userId,
            "profile",
            "contentStyle",
            "funny comedy style"
        );

    }



    if(
        text.includes("cinematic")
    ){

        saveMemory(
            userId,
            "profile",
            "contentStyle",
            "cinematic style"
        );

    }





    // ===============================
    // SAVE IMPORTANT NOTES
    // ===============================


    if(
        text.includes("i am") ||
        text.includes("i like") ||
        text.includes("i make")
    ){

        addMemoryNote(
            userId,
            message
        );

    }



    return {

        success:true,

        message:
        "Memory learning completed"

    };


}




module.exports = {

    learnFromMessage

};
