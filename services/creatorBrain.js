/* ===================================
   ChatTBM V5.9.7.1
   Creator Brain

   Upgrade:
   - Creator Style Memory connected
   - Learns user preferences
   - Personalized content generation

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



    // Learn creator style

    if(

        window.creatorMemory &&

        typeof window.creatorMemory.learn === "function"

    ){

        window.creatorMemory.learn(
            request
        );

    }







    if(text.includes("caption")){


        return generateCaption();


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





    if(text.includes("hashtag")){


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





    if(text.includes("idea")){


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



    let memory = null;



    if(

        window.creatorMemory &&

        typeof window.creatorMemory.get === "function"

    ){

        memory =
        window.creatorMemory.get();

    }






    const captions = [


        "🔥 Building my dream one step at a time.",


        "No shortcuts. Just consistency and hard work. 🚀",


        "The journey is the story. Keep watching.",


        "Creating today what people will remember tomorrow.",


        "Small actions. Big results."


    ];






    let caption =
    randomPick(captions);






    // Add creator style influence


    if(

        memory &&

        memory.tone === "motivational"

    ){


        caption =
        "🔥 " + caption;


    }






    return caption;


}









// ===================================
// VIRAL HOOK
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
// VIDEO SCRIPT
// ===================================


function generateScript(){


    return (

        "🎬 Short Video Script\n\n" +

        "HOOK:\nGrab attention in the first 3 seconds.\n\n" +

        "BODY:\nShow the process, story or transformation.\n\n" +

        "ENDING:\nGive viewers a reason to follow or comment."

    );


}









// ===================================
// HASHTAGS
// ===================================


function generateHashtags(){


    return (

        "#ContentCreator\n" +

        "#ViralContent\n" +

        "#CreativeIdeas\n" +

        "#VideoCreator\n" +

        "#TrendingNow"

    );


}









// ===================================
// ADVERT
// ===================================


function generateAdvert(){


    return (

        "📢 Advert Template\n\n" +

        "Create better content faster with AI assistance.\n\n" +

        "Start building your audience today."

    );


}









// ===================================
// IDEAS
// ===================================


function generateIdeas(){


    const ideas = [

        "Share your personal journey story.",

        "Show your behind-the-scenes process.",

        "Create a before and after transformation.",

        "Share lessons from your experience."

    ];



    return (

        "Content Idea:\n\n" +

        randomPick(ideas)

    );


}









// ===================================
// CALENDAR
// ===================================


function generateContentPlan(){


    return (

        "7-Day Content Plan:\n\n" +

        "Day 1: Your story\n" +

        "Day 2: Behind the scenes\n" +

        "Day 3: Educational content\n" +

        "Day 4: Personal experience\n" +

        "Day 5: Audience engagement\n" +

        "Day 6: Promotion\n" +

        "Day 7: Weekly recap"

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
