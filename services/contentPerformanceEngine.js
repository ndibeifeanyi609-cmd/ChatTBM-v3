// =====================================
// ChatTBM V7.0
// Content Performance Intelligence Engine
//
// Purpose:
// - Remember creator content history
// - Learn winning patterns
// - Store viral formulas
// - Support growth intelligence
// - Support strategy generation
//
// Future:
// MongoDB / PostgreSQL / Firebase
// =====================================



// =====================================
// CONTENT MEMORY DATABASE
// =====================================

const contentMemoryDatabase = {};





// =====================================
// CREATE CREATOR PERFORMANCE SPACE
// =====================================

function createCreatorMemory(userId){


    if(!contentMemoryDatabase[userId]){


        contentMemoryDatabase[userId] = {


            userId,


            contentHistory:[],


            winningPatterns:[],


            viralPatterns:[],


            strategies:[],


            created:

            new Date().toISOString(),


            updated:

            new Date().toISOString()


        };


    }



    return contentMemoryDatabase[userId];


}







// =====================================
// SAVE CONTENT PERFORMANCE
// =====================================

function saveContentPerformance(

    userId,

    data = {}

){


    const memory =

    createCreatorMemory(

        userId

    );





    const content = {


        id:

        Date.now().toString(),



        title:

        data.title || "",



        category:

        data.category || "general",



        platform:

        data.platform || "",



        result:

        data.result || "unknown",



        hook:

        data.hook || "",



        formula:

        data.formula || "",



        successReason:

        data.successReason || "",



        audienceReaction:

        data.audienceReaction || "",



        created:

        new Date().toISOString()


    };







    memory.contentHistory.push(

        content

    );





    memory.updated =

    new Date().toISOString();








    return {


        success:true,


        content



    };


}







// =====================================
// SAVE WINNING PATTERN
// =====================================

function saveWinningPattern(

    userId,

    pattern = {}

){


    const memory =

    createCreatorMemory(

        userId

    );






    const savedPattern = {


        ...pattern,


        created:

        new Date().toISOString()


    };






    memory.winningPatterns.push(

        savedPattern

    );





    memory.updated =

    new Date().toISOString();







    return {


        success:true,


        pattern:savedPattern



    };


}







// =====================================
// SAVE VIRAL PATTERN
// =====================================

function saveViralPattern(

    userId,

    pattern = {}

){


    const memory =

    createCreatorMemory(

        userId

    );






    const viral = {


        ...pattern,


        created:

        new Date().toISOString()


    };






    memory.viralPatterns.push(

        viral

    );



    memory.winningPatterns.push(

        viral

    );





    memory.updated =

    new Date().toISOString();








    return {


        success:true,


        viralPattern:viral



    };


}







// =====================================
// GET CONTENT HISTORY
// =====================================

function getContentHistory(

    userId

){


    const memory =

    createCreatorMemory(

        userId

    );



    return memory.contentHistory;


}







// =====================================
// GET WINNING PATTERNS
// =====================================

function getWinningPatterns(

    userId

){


    const memory =

    createCreatorMemory(

        userId

    );



    return memory.winningPatterns;


}







// =====================================
// GET VIRAL PATTERNS
// =====================================

function getViralPatterns(

    userId

){


    const memory =

    createCreatorMemory(

        userId

    );



    return memory.viralPatterns;


}







// =====================================
// GET SUCCESSFUL CONTENT
// =====================================

function getSuccessfulContent(

    userId

){


    return getContentHistory(

        userId

    )

    .filter(content =>


        content.result === "viral" ||

        content.result === "high"


    );


}







// =====================================
// GET BEST PERFORMING CONTENT
// =====================================

function getBestPerformingContent(

    userId

){


    return getSuccessfulContent(

        userId

    );


}







// =====================================
// CONTENT STATISTICS
// =====================================

function getContentStats(

    userId

){


    const history =

    getContentHistory(

        userId

    );






    return {


        total:

        history.length,



        successful:

        history.filter(item =>


            item.result === "viral" ||

            item.result === "high"


        ).length



    };


}







// =====================================
// EXPORT
// =====================================

module.exports = {


    createCreatorMemory,


    saveContentPerformance,


    saveWinningPattern,


    saveViralPattern,


    getContentHistory,


    getWinningPatterns,


    getViralPatterns,


    getSuccessfulContent,


    getBestPerformingContent,


    getContentStats


};
