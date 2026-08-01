// =====================================
// ChatTBM V6.6.1
// Intelligence Core
//
// Purpose:
// - Central content analysis
// - Shared AI pattern detection
// - Reduce duplicate logic
// =====================================



// =====================================
// ANALYZE CONTENT
// =====================================

function analyzeContent(content){


    const text =

    String(content)

    .toLowerCase();



    const analysis = {


        hook: null,

        emotion: null,

        structure: null,

        trigger: null,

        category: null,

        signals: []

    };





    // ===============================
    // HOOK DETECTION
    // ===============================


    if(

        text.includes("nobody") ||

        text.includes("no one") ||

        text.includes("secret") ||

        text.includes("never")

    ){

        analysis.hook =

        "Curiosity Hook";


        analysis.signals.push(

            "Curiosity"

        );

    }



    else if(

        text.includes("fight") ||

        text.includes("battle") ||

        text.includes("challenge")

    ){

        analysis.hook =

        "Action Hook";


        analysis.signals.push(

            "Action"

        );

    }



    else if(

        text.includes("my journey") ||

        text.includes("struggle") ||

        text.includes("growth")

    ){

        analysis.hook =

        "Story Hook";


        analysis.signals.push(

            "Story"

        );

    }





    // ===============================
    // EMOTION DETECTION
    // ===============================


    if(

        text.includes("dream") ||

        text.includes("success") ||

        text.includes("growth") ||

        text.includes("struggle")

    ){

        analysis.emotion =

        "Inspiration";

    }



    else if(

        text.includes("funny") ||

        text.includes("laugh")

    ){

        analysis.emotion =

        "Entertainment";

    }



    else if(

        text.includes("shock") ||

        text.includes("surprise")

    ){

        analysis.emotion =

        "Surprise";

    }





    // ===============================
    // STRUCTURE DETECTION
    // ===============================


    if(

        text.includes("struggle") &&

        text.includes("growth")

    ){

        analysis.structure =

        "Struggle → Process → Growth";

    }



    else if(

        text.includes("before") &&

        text.includes("after")

    ){

        analysis.structure =

        "Before → After";

    }





    // ===============================
    // ENGAGEMENT TRIGGER
    // ===============================


    if(

        text.includes("follow") ||

        text.includes("comment") ||

        text.includes("share")

    ){

        analysis.trigger =

        "Audience Interaction";

    }





    // ===============================
    // CATEGORY
    // ===============================


    if(

        analysis.emotion === "Inspiration"

    ){

        analysis.category =

        "Motivation";

    }



    else if(

        analysis.emotion === "Entertainment"

    ){

        analysis.category =

        "Comedy";

    }



    else if(

        analysis.hook === "Action Hook"

    ){

        analysis.category =

        "Action";

    }



    else{

        analysis.category =

        "General";

    }





    return analysis;


}





// =====================================
// EXPORT
// =====================================

module.exports = {


    analyzeContent


};
