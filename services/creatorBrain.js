/* ===================================
   ChatTBM V6.0.1
   Creator Brain

   Upgrade:
   - Creator Memory connected
   - Personalized captions
   - Cinematic style support
   - Motivational style support

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



    // Learn creator preference

    if(

        window.creatorMemory &&

        typeof window.creatorMemory.learn === "function"

    ){

        window.creatorMemory.learn(request);

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
// CAPTION GENERATOR V6.0.1
// MEMORY AWARE
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






    // Cinematic + Motivational

    if(

        memory &&

        memory.style === "cinematic" &&

        memory.tone === "motivational"

    ){

        return randomPick([


            "🎬🔥 Every struggle, every lesson, every step is becoming part of my story.",


            "🔥 Behind the dream is a journey filled with discipline, growth and determination.",


            "🎬 The road is not easy, but every challenge is creating the story."

        ]);


    }






    // Motivational style

    if(

        memory &&

        memory.tone === "motivational"

    ){

        return randomPick([


            "🔥 Building my dream one step at a time.",


            "No shortcuts. Just consistency and hard work. 🚀",


            "Every big result starts with small actions."

        ]);

    }







    // Default captions


    return randomPick([


        "The journey is the story. Keep watching.",


        "Creating today what people will remember tomorrow.",


        "Small actions. Big results."

    ]);


}









// ===================================
// VIRAL HOOK
// ===================================


function generateHook(){


    return (

        "Viral Hook:\n\n" +

        randomPick([

            "Stop scrolling... you need to see this.",

            "Nobody talks about this part.",

            "Watch until the end because this changes everything.",

            "The biggest mistake people make is this."

        ])

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


    return (

        "Content Idea:\n\n" +

        randomPick([

            "Share your personal journey story.",

            "Show your behind-the-scenes process.",

            "Create a transformation video.",

            "Share lessons from your experience."

        ])

    );


}









// ===================================
// CONTENT PLAN
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
