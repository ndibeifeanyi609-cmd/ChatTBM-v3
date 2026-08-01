// =====================================
// ChatTBM V6.6.1
// Audience Prediction Engine
//
// Uses:
// - Intelligence Core
// =====================================


const {

    analyzeContent

} = require("./intelligenceCore");





function predictAudience(content){


    const analysis =

    analyzeContent(content);



    let audience = "General";

    let confidence = "Low";

    const reasons = [];





    if(analysis.category){


        audience =

        analysis.category;


        confidence =

        "Medium";


        reasons.push(

            "Content signals detected"

        );


    }





    if(

        analysis.hook === "Action Hook"

    ){


        audience = "Action";


        confidence = "High";


        reasons.push(

            "Action content pattern"

        );


    }





    if(

        analysis.emotion === "Inspiration"

    ){


        audience = "Motivation";


        confidence = "High";


        reasons.push(

            "Inspirational pattern"

        );


    }





    return {


        audience,


        confidence,


        reasons,


        analysis


    };


}






module.exports = {


    predictAudience


};
