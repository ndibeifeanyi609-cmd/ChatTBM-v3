// =====================================
// ChatTBM V7.0
// Creator Growth Intelligence Engine
//
// Connected:
// - Content Performance Memory
// - Performance Learning
// - Creator Strategy
// - Growth Recommendations
//
// Purpose:
// - Learn creator growth patterns
// - Analyze winning content
// - Recommend better decisions
// =====================================



const {

    getSuccessfulContent,

    getWinningPatterns

} = require("./contentPerformanceEngine");





const growthProfiles = {};









// =====================================
// CREATE GROWTH PROFILE
// =====================================


function createGrowthProfile(userId){


    if(!growthProfiles[userId]){


        growthProfiles[userId] = {


            userId,


            contentHistory:[],


            successfulContent:[],


            winningPatterns:[],


            growthSignals:[],


            recommendations:[],


            audienceWins:[],


            strategyDirection:"",


            createdAt:new Date(),


            lastUpdated:new Date()



        };


    }



    return growthProfiles[userId];


}









// =====================================
// ANALYZE CONTENT PERFORMANCE
// =====================================


function analyzeContentPerformance(

    userId,

    data={}

){


    const profile =

    createGrowthProfile(

        userId

    );





    const contentData = {


        content:

        data.content || "",


        result:

        data.result || "unknown",


        category:

        data.category || "general",


        feedback:

        data.feedback || "",


        created:

        new Date()



    };





    profile.contentHistory.push(

        contentData

    );








    if(

        contentData.result === "viral" ||

        contentData.result === "high"

    ){


        profile.successfulContent.push(

            contentData

        );



        profile.growthSignals.push(

            "Successful content pattern detected"

        );


    }

    else{


        profile.growthSignals.push(

            "Content improvement opportunity detected"

        );


    }







    profile.lastUpdated =

    new Date();





    return profile;


}









// =====================================
// SYNC PERFORMANCE MEMORY
// =====================================


function syncPerformanceMemory(userId){


    const profile =

    createGrowthProfile(

        userId

    );





    profile.successfulContent =

    getSuccessfulContent(

        userId

    );





    profile.winningPatterns =

    getWinningPatterns(

        userId

    );





    profile.lastUpdated =

    new Date();



    return profile;


}









// =====================================
// GENERATE GROWTH RECOMMENDATIONS
// =====================================


function generateGrowthRecommendations(userId){


    const profile =

    syncPerformanceMemory(

        userId

    );





    const recommendations = [];








    if(

        profile.winningPatterns.length > 0

    ){


        recommendations.push(

            "Repeat patterns from your highest performing content."

        );


    }








    if(

        profile.successfulContent.length > 0

    ){


        recommendations.push(

            "Create more content using your proven creator style."

        );


    }








    if(

        profile.contentHistory.length < 5

    ){


        recommendations.push(

            "Publish more content to improve prediction accuracy."

        );


    }








    recommendations.push(

        "Keep your creator identity consistent while testing new ideas."

    );








    profile.recommendations =

    recommendations;



    profile.lastUpdated =

    new Date();



    return recommendations;


}









// =====================================
// BUILD GROWTH STRATEGY
// =====================================


function buildGrowthStrategy(userId){


    const profile =

    syncPerformanceMemory(

        userId

    );





    return {


        creator:userId,


        strengths:

        profile.growthSignals,



        winningPatterns:

        profile.winningPatterns,



        nextActions:

        profile.recommendations



    };


}









// =====================================
// GET PROFILE
// =====================================


function getGrowthProfile(userId){


    return createGrowthProfile(

        userId

    );


}









// =====================================
// EXPORT
// =====================================


module.exports = {


    createGrowthProfile,


    analyzeContentPerformance,


    generateGrowthRecommendations,


    buildGrowthStrategy,


    getGrowthProfile


};
