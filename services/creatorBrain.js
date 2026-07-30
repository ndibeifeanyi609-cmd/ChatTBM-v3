/* ===================================
   ChatTBM V6.0.1
   Creator Brain

   Upgrade:
   - Creator Memory connected
   - Personalized generation
   - Cinematic style support
   - Motivational style support
   - Creator identity awareness

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



    // Learn user style

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
// CAPTION GENERATOR
// ===================================


function generateCaption(){



    let memory = {};



    if(

        window.creatorMemory &&

        typeof window.creatorMemory.get === "function"

    ){

        memory =
        window.creatorMemory.get();

    }







    // CINEMATIC MOTIVATIONAL STYLE


    if(

        memory.tone === "motivational" &&

        memory.style === "cinematic"

    ){


        return randomPick([


            "🎬🔥 Every struggle becomes a chapter in my story.",


            "The journey is not easy, but every step creates my legacy.",


            "🎬 Built through challenges. Powered by consistency."

        ]);


    }








    // MOTIVATIONAL STYLE


    if(

        memory.tone === "motivational"

    ){


        return randomPick([


            "🔥 Building my dream one step at a time.",


            "No shortcuts. Just consistency and hard work. 🚀",


            "Every big result starts with small actions."

        ]);


    }








    // DEFAULT


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

        "BODY:\nShow the process, struggle, and transformation.\n\n" +

        "ENDING:\nGive viewers a reason to follow your journey."

    );


}









// ===================================
// HASHTAGS
// ===================================


function generateHashtags(){


    return (

        "#ContentCreator\n" +

        "#ViralContent\n" +

        "#CreatorJourney\n" +

        "#VideoCreator\n" +

        "#Motivation"

    );


}









// ===================================
// ADVERT
// ===================================


function generateAdvert(){


    return (

        "📢 Advert Template\n\n" +

        "Turn your ideas into powerful content faster with AI assistance.\n\n" +

        "Start creating today."

    );


}









// ===================================
// CONTENT IDEAS
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

        "Day 1: Share your story\n" +

        "Day 2: Behind the scenes\n" +

        "Day 3: Teach something useful\n" +

        "Day 4: Share your experience\n" +

        "Day 5: Engage your audience\n" +

        "Day 6: Promote your work\n" +

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
