// =====================================
// ChatTBM V6.7.7
// Adaptive Identity Bridge
//
// Purpose:
// - Connect Adaptive Response Engine
// - Connect Creator Identity Engine
// - Provide compatible creator profile access
// =====================================



const {

    getCreatorIdentity

} = require("./creatorIdentityEngine");








class AdaptiveIdentityBridge {





    // =====================================
    // GET CREATOR PROFILE
    // =====================================


    getProfile(userId){


        const profile =

        getCreatorIdentity(

            userId

        );





        return {


            favoritePlatform:

            profile.platform || "Unknown",



            favoriteCategory:

            profile.niche || "Creator Content",



            tone:

            profile.tone || "Natural",



            writingStyle:

            profile.contentStyle || "Creative",



            language:

            profile.language || "English",





            creatorName:

            profile.creatorName || "",



            audience:

            profile.audience || "",



            personality:

            profile.personality || ""



        };


    }





}







module.exports = AdaptiveIdentityBridge;
