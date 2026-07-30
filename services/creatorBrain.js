/* ===================================
   ChatTBM V5.9.3
   Creator Brain V1

   Offline Content Creation Engine

   Features:
   - Captions
   - Hooks
   - Scripts
   - Hashtags
   - Ads
   - Content ideas
=================================== */



// ===================================
// MAIN CREATOR BRAIN
// ===================================


function creatorBrain(request){


    const text =
    request.toLowerCase().trim();



    if(text.includes("caption")){


        return generateCaption(text);


    }



    if(
        text.includes("hook") ||
        text.includes("viral")
    ){


        return generateHook();


    }



    if(
        text.includes("script") ||
        text.includes("video")
    ){


        return generateScript();


    }



    if(
        text.includes("hashtag")
    ){


        return generateHashtags();


    }



    if(
        text.includes("advert") ||
        text.includes("ad")
    ){


        return generateAdvert();


    }



    if(
        text.includes("calendar") ||
        text.includes("plan")
    ){


        return generateContentPlan();


    }



    if(
        text.includes("idea")
    ){


        return generateIdeas();


    }



    return (

        "I can help you create:\n\n" +

        "• Captions\n" +
        "• Video hooks\n" +
        "• Scripts\n" +
        "• Hashtags\n" +
        "• Advert ideas\n" +
        "• Content plans"

    );


}







// ===================================
// CAPTION GENERATOR
// ===================================


function generateCaption(){


    const captions = [

        "🔥 Building my dream one step at a time.",

        "No shortcuts. Just consistency and hard work. 🚀",

        "The journey is the story. Keep watching.",

        "Creating today what people will remember tomorrow.",

        "Small actions. Big results."

    ];



    return randomPick(captions);


}







// ===================================
// VIRAL HOOK GENERATOR
// ===================================


function generateHook(){


    const hooks = [

        "Stop scrolling... you need to see this.",

        "Nobody talks about this part.",

        "I tried this and the result surprised me.",

        "Watch until the end because this changes everything.",

        "The biggest mistake people make is this."

    ];



    return (

        "Viral Hook:\n\n" +

        randomPick(hooks)

    );


}







// ===================================
// VIDEO SCRIPT GENERATOR
// ===================================


function generateScript(){


    return (

        "🎬 Short Video Script\n\n" +

        "HOOK:\n" +

        "Grab attention in the first 3 seconds.\n\n" +

        "BODY:\n" +

        "Show the process, story or transformation.\n\n" +

        "ENDING:\n" +

        "Give viewers a reason to follow or comment."

    );


}







// ===================================
// HASHTAG GENERATOR
// ===================================


function generateHashtags(){


    return (

        "#ContentCreator\n" +

        "#ViralContent\n" +

        "#CreativeIdeas\n" +

        "#VideoCreator\n" +

        "#TrendingNow\n" +

        "#SocialMediaGrowth"

    );


}







// ===================================
// ADVERT GENERATOR
// ===================================


function generateAdvert(){


    return (

        "📢 Advert Template\n\n" +

        "Need better content?\n\n" +

        "Create professional posts, videos and ideas faster with AI assistance.\n\n" +

        "Start creating today."

    );


}







// ===================================
// CONTENT IDEA GENERATOR
// ===================================


function generateIdeas(){


    const ideas = [

        "Behind-the-scenes video showing your process.",

        "Before and after transformation content.",

        "Share 3 mistakes beginners make.",

        "Tell your personal journey story.",

        "Create a challenge for your audience."

    ];



    return (

        "Content Idea:\n\n" +

        randomPick(ideas)

    );


}







// ===================================
// CONTENT CALENDAR
// ===================================


function generateContentPlan(){


    return (

        "7-Day Content Plan:\n\n" +

        "Day 1: Introduction post\n" +

        "Day 2: Educational video\n" +

        "Day 3: Behind the scenes\n" +

        "Day 4: Personal story\n" +

        "Day 5: Audience question\n" +

        "Day 6: Product/service promotion\n" +

        "Day 7: Best moments recap"

    );


}







// ===================================
// HELPER
// ===================================


function randomPick(list){


    return list[

        Math.floor(
            Math.random()*list.length
        )

    ];


}







// ===================================
// EXPORT
// ===================================


window.creatorBrain = creatorBrain;
