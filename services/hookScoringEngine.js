// =====================================
// ChatTBM V6.6.1
// Hook Scoring Engine
//
// Uses:
// - Intelligence Core
// =====================================


const {

    analyzeContent

} = require("./intelligenceCore");





function scoreHook(hook){


    const analysis =

    analyzeContent(hook);



    let score = 0;


    const strengths = [];

    const improvements = [];





    if(analysis.hook){


        score += 50;


        strengths.push(

            analysis.hook

        );


    }

    else{


        improvements.push(

            "Create a curiosity or action-based opening"

        );


    }





    if(analysis.emotion){


        score += 25;


        strengths.push(

            "Emotional connection detected"

        );


    }

    else{


        improvements.push(

            "Add emotional impact"

        );


    }





    if(analysis.trigger){


        score += 25;


        strengths.push(

            "Strong engagement trigger"

        );


    }

    else{


        improvements.push(

            "Give viewers a reason to continue"

        );


    }





    return {


        score,


        type:

        analysis.hook || "General",


        strengths,


        improvements,


        analysis


    };


}






function compareHooks(hooks=[]){


    return hooks

    .map(hook=>({


        hook,


        analysis:

        scoreHook(hook)


    }))

    .sort(

        (a,b)=>

        b.analysis.score -

        a.analysis.score

    );


}






module.exports = {


    scoreHook,


    compareHooks


};
