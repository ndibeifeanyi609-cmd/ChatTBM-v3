// =====================================
// ChatTBM V6.5
// Content Performance Memory Engine
//
// Purpose:
// - Remember creator content history
// - Learn what performs well
// - Store winning formulas
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
// CREATE CREATOR SPACE
// =====================================


function createCreatorMemory(userId){


    if(!contentMemoryDatabase[userId]){


        contentMemoryDatabase[userId] = {


            userId,


            contentHistory: [],


            winningPatterns: [],


            strategies: [],


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

    pattern

){


    const memory =

    createCreatorMemory(

        userId

    );





    memory.winningPatterns.push({


        ...pattern,


        created:

        new Date().toISOString()


    });





    return {


        success:true,


        pattern



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


    getContentHistory,


    getWinningPatterns,


    getSuccessfulContent,


    getContentStats


};
