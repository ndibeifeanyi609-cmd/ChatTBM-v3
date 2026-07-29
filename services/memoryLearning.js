
// =====================================
// ChatTBM V5.4
// Memory Personalization Engine
// Part 4
// Learns user preferences
// =====================================


const {
    saveMemory
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



    // =====================================
    // DETECT PLATFORM
    // =====================================

    if(

        text.includes("instagram")

    ){

        saveMemory(

            userId,

            "platform",

            "Instagram"

        );

    }



    if(

        text.includes("facebook")

    ){

        saveMemory(

            userId,

            "platform",

            "Facebook"

        );

    }



    if(

        text.includes("tiktok")

    ){

        saveMemory(

            userId,

            "platform",

            "TikTok"

        );

    }



    if(

        text.includes("youtube")

    ){

        saveMemory(

            userId,

            "platform",

            "YouTube"

        );

    }




    // =====================================
    // DETECT CONTENT STYLE
    // =====================================

    if(

        text.includes("funny") ||

        text.includes("comedy")

    ){

        saveMemory(

            userId,

            "contentStyle",

            "Funny and entertaining"

        );

    }



    if(

        text.includes("professional")

    ){

        saveMemory(

            userId,

            "contentStyle",

            "Professional"

        );

    }



    if(

        text.includes("cinematic")

    ){

        saveMemory(

            userId,

            "contentStyle",

            "Cinematic"

        );

    }




    // =====================================
    // DETECT TONE
    // =====================================

    if(

        text.includes("serious")

    ){

        saveMemory(

            userId,

            "tone",

            "Serious"

        );

    }



    if(

        text.includes("casual")

    ){

        saveMemory(

            userId,

            "tone",

            "Casual"

        );

    }



    if(

        text.includes("viral")

    ){

        saveMemory(

            userId,

            "goal",

            "Create viral content"

        );

    }



    return {

        success:true,

        message:"Memory updated"

    };


}




module.exports = {

    learnFromMessage

};
