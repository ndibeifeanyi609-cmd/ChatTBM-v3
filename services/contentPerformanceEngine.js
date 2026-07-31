// =====================================
// ChatTBM V6.4
// Content Performance Memory Engine
//
// Purpose:
// - Store successful content history
// - Remember what works
// - Track audience reactions
// - Store winning hooks
// - Support creator strategy
//
// Future upgrade:
// MongoDB / PostgreSQL / Firebase
// =====================================



// =====================================
// CONTENT PERFORMANCE DATABASE
// =====================================

const contentPerformanceDatabase = {};






// =====================================
// CREATE CREATOR PERFORMANCE SPACE
// =====================================


function createPerformanceProfile(userId){


    if(!contentPerformanceDatabase[userId]){


        contentPerformanceDatabase[userId] = {


            userId,


            contents: [],


            patterns: [],


            created:

            new Date().toISOString(),


            updated:

            new Date().toISOString()


        };


    }



    return contentPerformanceDatabase[userId];


}







// =====================================
// SAVE CONTENT PERFORMANCE
// =====================================


function saveContentPerformance(

    userId,

    data = {}

){


    const profile =

    createPerformanceProfile(

        userId

    );





    const content = {


        id:

        Date.now().toString(),



        title:

        data.title || "Untitled Content",




        category:

        data.category || "general",




        platform:

        data.platform || "unknown",




        result:

        data.result || "unknown",




        successReason:

        data.successReason || "",




        hook:

        data.hook || "",




        audienceReaction:

        data.audienceReaction || "",




        strategy:

        data.strategy || "",




        created:

        new Date().toISOString()


    };







    profile.contents.push(

        content

    );




    profile.updated =

    new Date().toISOString();





    return {


        success:true,


        content



    };


}







// =====================================
// GET ALL CONTENT MEMORY
// =====================================


function getContentPerformance(

    userId

){


    const profile =

    createPerformanceProfile(

        userId

    );



    return profile.contents;


}








// =====================================
// SAVE VIRAL PATTERN
// =====================================


function saveViralPattern(

    userId,

    pattern

){


    const profile =

    createPerformanceProfile(

        userId

    );




    profile.patterns.push({


        pattern,


        created:

        new Date().toISOString()


    });





    return {


        success:true,


        pattern



    };


}







// =====================================
// GET VIRAL PATTERNS
// =====================================


function getViralPatterns(

    userId

){


    const profile =

    createPerformanceProfile(

        userId

    );



    return profile.patterns;


}







// =====================================
// FIND BEST CONTENT
// =====================================


function getBestPerformingContent(

    userId

){


    const contents =

    getContentPerformance(

        userId

    );



    return contents.filter(

        item =>

        item.result === "viral" ||

        item.result === "high"

    );


}







// =====================================
// CONTENT STATISTICS
// =====================================


function getPerformanceStats(

    userId

){


    const contents =

    getContentPerformance(

        userId

    );



    return {


        total:

        contents.length,



        successful:

        contents.filter(

            item =>

            item.result === "viral" ||

            item.result === "high"

        ).length



    };


}







// =====================================
// EXPORT
// =====================================


module.exports = {


    createPerformanceProfile,


    saveContentPerformance,


    getContentPerformance,


    saveViralPattern,


    getViralPatterns,


    getBestPerformingContent,


    getPerformanceStats


};
