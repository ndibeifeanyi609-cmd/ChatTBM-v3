// =====================================
// ChatTBM V6.2
// Profile Context Engine
// Converts User Profile into AI Context
// =====================================


const {

    getProfile

} = require("./userProfileEngine");




// =====================================
// BUILD PROFILE CONTEXT
// =====================================

function buildUserProfileContext(

    userId

){


    const profile =

    getProfile(userId);



    let context = "";





    if(profile.creatorName){


        context +=

        `Creator name: ${profile.creatorName}\n`;


    }





    if(profile.niche){


        context +=

        `Creator niche: ${profile.niche}\n`;


    }





    if(profile.writingStyle){


        context +=

        `Writing style: ${profile.writingStyle}\n`;


    }





    if(profile.tone){


        context +=

        `Preferred tone: ${profile.tone}\n`;


    }





    if(profile.audience){


        context +=

        `Audience: ${profile.audience}\n`;


    }





    if(profile.responsePreference){


        context +=

        `Response preference: ${profile.responsePreference}\n`;


    }





    if(profile.interests.length){


        context +=

        `Interests: ${profile.interests.join(", ")}\n`;


    }





    return context;


}





// =====================================
// CREATE AI PROFILE PROMPT
// =====================================

function createProfilePrompt(

    userId

){


    const context =

    buildUserProfileContext(

        userId

    );



    if(!context){


        return "";

    }





    return `

Use this creator profile when responding:

${context}

Generate responses that match this creator's style.

`;

}





// =====================================
// EXPORT
// =====================================

module.exports = {


    buildUserProfileContext,

    createProfilePrompt


};
