// =====================================
// ChatTBM V6.4
// Viral Memory Bridge
//
// Connects:
// - Viral Pattern Analyzer
// - Content Performance Memory
//
// Purpose:
// - Store viral formulas
// - Recall successful patterns
// - Build creator strategy
// =====================================



const {

    analyzeViralPattern

} = require("./viralPatternAnalyzer");



const {

    saveViralPattern,

    getViralPatterns

} = require("./contentPerformanceEngine");







// =====================================
// LEARN VIRAL CONTENT PATTERN
// =====================================


function learnViralPattern(

    userId,

    content

){


    const pattern =

    analyzeViralPattern(

        content

    );





    const saved =

    saveViralPattern(

        userId,

        pattern

    );





    return {


        success:true,


        pattern,


        saved



    };


}







// =====================================
// GET CREATOR VIRAL MEMORY
// =====================================


function getCreatorViralMemory(

    userId

){


    return getViralPatterns(

        userId

    );


}








// =====================================
// FIND COMMON FORMULAS
// =====================================


function findCommonPatterns(

    userId

){


    const patterns =

    getViralPatterns(

        userId

    );



    const formulas = {};





    patterns.forEach(item=>{


        if(item.formula){


            formulas[item.formula] =

            (formulas[item.formula] || 0) + 1;


        }


    });





    return formulas;


}








// =====================================
// EXPORT
// =====================================


module.exports = {


    learnViralPattern,


    getCreatorViralMemory,


    findCommonPatterns


};
