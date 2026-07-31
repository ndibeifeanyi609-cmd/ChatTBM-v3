// =====================================
// ChatTBM V6.5
// Viral Memory Intelligence Bridge
//
// Connects:
// - Viral Pattern Analysis
// - Content Performance Memory
//
// Purpose:
// - Learn viral formulas
// - Store creator patterns
// - Recall winning structures
// =====================================



const {

    saveWinningPattern,

    getWinningPatterns

} = require("./contentPerformanceEngine");






// =====================================
// ANALYZE VIRAL PATTERN
// =====================================


function analyzeViralPattern(

    content

){


    const text =

    String(content)

    .toLowerCase();





    const pattern = {


        hook:"",

        structure:"",

        emotion:"",

        trigger:"",

        formula:""


    };








    // ===============================
    // HOOK ANALYSIS
    // ===============================


    if(

        text.includes("nobody") ||

        text.includes("no one") ||

        text.includes("hidden")

    ){


        pattern.hook =

        "Curiosity Hook";


    }



    else if(

        text.includes("fight") ||

        text.includes("challenge") ||

        text.includes("battle")

    ){


        pattern.hook =

        "Action Hook";


    }



    else if(

        text.includes("struggle") ||

        text.includes("journey")

    ){


        pattern.hook =

        "Story Hook";


    }







    // ===============================
    // STORY STRUCTURE
    // ===============================


    if(

        text.includes("struggle") ||

        text.includes("process") ||

        text.includes("growth")

    ){


        pattern.structure =

        "Struggle → Process → Growth";


    }




    if(

        text.includes("surprise") ||

        text.includes("unexpected")

    ){


        pattern.structure =

        "Build Up → Surprise Ending";


    }








    // ===============================
    // EMOTION
    // ===============================


    if(

        text.includes("inspire") ||

        text.includes("dream") ||

        text.includes("growth")

    ){


        pattern.emotion =

        "Inspiration";


    }




    if(

        text.includes("funny") ||

        text.includes("laugh")

    ){


        pattern.emotion =

        "Entertainment";


    }




    if(

        text.includes("shock") ||

        text.includes("surprise")

    ){


        pattern.emotion =

        "Surprise";


    }








    // ===============================
    // ENGAGEMENT TRIGGER
    // ===============================


    if(

        text.includes("follow") ||

        text.includes("journey")

    ){


        pattern.trigger =

        "Community Building";


    }




    if(

        text.includes("comment") ||

        text.includes("share")

    ){


        pattern.trigger =

        "Audience Interaction";


    }








    // ===============================
    // FORMULA CREATION
    // ===============================


    const formula = [];


    if(pattern.hook)

        formula.push(pattern.hook);



    if(pattern.structure)

        formula.push(pattern.structure);



    if(pattern.emotion)

        formula.push(pattern.emotion);






    pattern.formula =

    formula.join(" + ");





    return pattern;


}









// =====================================
// LEARN VIRAL CONTENT
// =====================================


function learnViralPattern(

    userId,

    content

){


    const pattern =

    analyzeViralPattern(

        content

    );






    return saveWinningPattern(

        userId,

        pattern

    );


}









// =====================================
// GET CREATOR VIRAL MEMORY
// =====================================


function getCreatorViralMemory(

    userId

){


    return getWinningPatterns(

        userId

    );


}








// =====================================
// EXPORT
// =====================================


module.exports = {


    analyzeViralPattern,


    learnViralPattern,


    getCreatorViralMemory


};
