// =====================================
// ChatTBM V6.6.1
// Content Score Engine
//
// Uses:
// - Intelligence Core
// =====================================


const {

    analyzeContent

} = require("./intelligenceCore");





function scoreContent(content){


    const analysis =

    analyzeContent(content);



    let score = 0;


    const strengths = [];

    const improvements = [];





    if(analysis.hook){

        score += 25;

        strengths.push(

            "Strong opening"

        );

    }

    else{

        improvements.push(

            "Create stronger hook"

        );

    }





    if(analysis.structure){

        score += 25;

        strengths.push(

            "Good storytelling flow"

        );

    }

    else{

        improvements.push(

            "Improve story structure"

        );

    }





    if(analysis.emotion){

        score += 25;

        strengths.push(

            "Emotional connection"

        );

    }

    else{

        improvements.push(

            "Add emotional elements"

        );

    }





    if(analysis.trigger){

        score += 25;

        strengths.push(

            "Good audience engagement"

        );

    }

    else{

        improvements.push(

            "Add audience interaction"

        );

    }





    return {


        score,

        strengths,

        improvements,

        analysis


    };


}





module.exports = {


    scoreContent


};
