// =====================================
// ChatTBM V6.6
// Growth Recommendation Engine
//
// Purpose:
// - Combine all AI analysis
// - Recommend creator improvements
// - Generate growth advice
// =====================================

const {

    predictContent,

    recommendImprovements

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




// =====================================
// GENERATE GROWTH REPORT
// =====================================

function generateGrowthReport(content){

    const prediction =
    predictContent(content);

    const contentScore =
    scoreContent(content);

    const audience =
    predictAudience(content);

    const hook =
    scoreHook(content);

    const recommendations = [];



    recommendations.push(

        ...recommendImprovements(

            prediction

        )

    );



    recommendations.push(

        ...contentScore.improvements

    );



    if(hook.score < 70){

        recommendations.push(

            "Rewrite the opening hook to increase curiosity."

        );

    }



    if(audience.confidence === "Low"){

        recommendations.push(

            "Target a clearer audience."

        );

    }



    return{

        prediction,

        hook,

        contentScore,

        audience,

        recommendations:[

            ...new Set(

                recommendations

            )

        ]

    };

}





// =====================================
// QUICK SUMMARY
// =====================================

function generateSummary(report){

    return{

        viralScore:

        report.prediction.score,



        hookScore:

        report.hook.score,



        contentScore:

        report.contentScore.score,



        audience:

        report.audience.audience,



        confidence:

        report.audience.confidence

    };

}





// =====================================
// EXPORT
// =====================================

module.exports={

    generateGrowthReport,

    generateSummary

};
