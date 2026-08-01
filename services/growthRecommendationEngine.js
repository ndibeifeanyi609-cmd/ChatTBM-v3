// =====================================
// ChatTBM V6.6.1
// Growth Recommendation Engine
//
// Uses:
// - All Intelligence Systems
// =====================================


const {

    predictContent

} = require("./predictionEngine");


const {

    scoreHook

} = require("./hookScoringEngine");


const {

    scoreContent

} = require("./contentScoreEngine");


const {

    predictAudience

} = require("./audiencePredictionEngine");






function generateGrowthReport(content){


    const prediction =

    predictContent(content);



    const hook =

    scoreHook(content);



    const contentScore =

    scoreContent(content);



    const audience =

    predictAudience(content);



    const recommendations = [];





    if(prediction.score < 80){


        recommendations.push(

            "Improve viral signals"

        );


    }





    if(hook.score < 80){


        recommendations.push(

            "Create a stronger opening hook"

        );


    }





    if(contentScore.score < 80){


        recommendations.push(

            "Improve story structure and emotion"

        );


    }





    if(audience.confidence === "Low"){


        recommendations.push(

            "Target a clearer audience"

        );


    }





    return {


        prediction,


        hook,


        contentScore,


        audience,


        recommendations


    };


}





function generateSummary(report){


    return {


        viralScore:

        report.prediction.score,


        hookScore:

        report.hook.score,


        contentScore:

        report.contentScore.score,


        audience:

        report.audience.audience


    };


}





module.exports = {


    generateGrowthReport,


    generateSummary


};
