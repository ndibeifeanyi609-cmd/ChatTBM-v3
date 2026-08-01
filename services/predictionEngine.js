// =====================================
// ChatTBM V6.6.1
// Prediction Engine
//
// Uses:
// - Intelligence Core
// =====================================


const {

    analyzeContent

} = require("./intelligenceCore");




// =====================================
// PREDICT CONTENT
// =====================================

function predictContent(content){


    const analysis =

    analyzeContent(content);



    let score = 50;


    const reasons = [];





    if(analysis.hook){

        score += 15;

        reasons.push(

            "Strong hook detected"

        );

    }




    if(analysis.structure){

        score += 15;

        reasons.push(

            "Clear content structure"

        );

    }




    if(analysis.emotion){

        score += 10;

        reasons.push(

            "Emotional connection"

        );

    }




    if(analysis.trigger){

        score += 10;

        reasons.push(

            "Audience engagement trigger"

        );

    }




    if(score > 100){

        score = 100;

    }




    let level = "Low";



    if(score >= 80){

        level = "High";

    }

    else if(score >= 60){

        level = "Medium";

    }




    return {

        score,

        level,

        reasons,

        analysis

    };


}




// =====================================
// IMPROVEMENTS
// =====================================

function recommendImprovements(result){


    const tips = [];



    if(!result.analysis.hook){

        tips.push(

            "Improve the opening hook"

        );

    }



    if(!result.analysis.structure){

        tips.push(

            "Add a clearer story structure"

        );

    }



    if(!result.analysis.emotion){

        tips.push(

            "Add more emotion"

        );

    }



    if(!result.analysis.trigger){

        tips.push(

            "Add a call to action"

        );

    }



    return tips;


}





module.exports = {


    predictContent,

    recommendImprovements


};
