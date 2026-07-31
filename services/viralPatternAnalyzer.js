// =====================================
// ChatTBM V6.4
// Viral Pattern Analyzer
//
// Purpose:
// - Detect viral content formulas
// - Analyze hooks
// - Identify emotional triggers
// - Discover storytelling patterns
// - Help creator strategy
// =====================================




// =====================================
// ANALYZE VIRAL CONTENT
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








    // =====================================
    // HOOK DETECTION
    // =====================================


    if(

        text.includes("nobody") ||

        text.includes("no one") ||

        text.includes("you won't believe")

    ){


        pattern.hook =

        "Curiosity hook";


    }





    else if(

        text.includes("fight") ||

        text.includes("action") ||

        text.includes("challenge")

    ){


        pattern.hook =

        "Action hook";


    }





    else if(

        text.includes("story") ||

        text.includes("journey") ||

        text.includes("struggle")

    ){


        pattern.hook =

        "Journey hook";


    }








    // =====================================
    // STORY STRUCTURE
    // =====================================


    if(

        text.includes("struggle") ||

        text.includes("process") ||

        text.includes("growth")

    ){


        pattern.structure =

        "Struggle → Process → Growth";


    }





    if(

        text.includes("before") ||

        text.includes("after")

    ){


        pattern.structure =

        "Before → After transformation";


    }





    if(

        text.includes("ending") ||

        text.includes("surprise")

    ){


        pattern.structure =

        "Build up → Surprise ending";


    }








    // =====================================
    // EMOTION DETECTION
    // =====================================


    if(

        text.includes("struggle") ||

        text.includes("hard") ||

        text.includes("challenge")

    ){


        pattern.emotion =

        "Inspiration";


    }





    if(

        text.includes("funny") ||

        text.includes("laugh") ||

        text.includes("comedy")

    ){


        pattern.emotion =

        "Entertainment";


    }





    if(

        text.includes("fear") ||

        text.includes("shock") ||

        text.includes("surprise")

    ){


        pattern.emotion =

        "Surprise";


    }








    // =====================================
    // ENGAGEMENT TRIGGER
    // =====================================


    if(

        text.includes("follow") ||

        text.includes("journey")

    ){


        pattern.trigger =

        "Audience connection";


    }





    if(

        text.includes("share") ||

        text.includes("comment")

    ){


        pattern.trigger =

        "Social interaction";


    }








    // =====================================
    // FORMULA CREATION
    // =====================================


    const parts = [];



    if(pattern.hook)

        parts.push(pattern.hook);



    if(pattern.structure)

        parts.push(pattern.structure);



    if(pattern.emotion)

        parts.push(pattern.emotion);



    if(parts.length > 0){


        pattern.formula =

        parts.join(" + ");


    }



    return pattern;


}








// =====================================
// COMPARE PATTERNS
// =====================================


function comparePatterns(

    patterns=[]

){


    const result = {};



    patterns.forEach(pattern=>{


        if(pattern.hook){


            result[pattern.hook] =

            (result[pattern.hook] || 0) + 1;


        }


    });



    return result;


}








// =====================================
// EXPORT
// =====================================


module.exports = {


    analyzeViralPattern,


    comparePatterns


};
