/* ===================================
   ChatTBM V6.0.2
   Creator Brain Engine

   Upgrade:
   - Creator Memory support
   - User Profile support
   - Personalized content generation
   - Cinematic writing style
   - Motivational writing style

   Features:
   - Captions
   - Hooks
   - Scripts
   - Hashtags
   - Ads
   - Content ideas
   - Content calendar
=================================== */





// ===================================
// MAIN CREATOR BRAIN
// ===================================


function creatorBrain(request){


    const text =
    request.toLowerCase().trim();





    // Learn memory


    if(

        window.creatorMemory &&

        typeof window.creatorMemory.learn === "function"

    ){

        window.creatorMemory.learn(
            request
        );

    }






    if(

        window.userProfileMemory &&

        typeof window.userProfileMemory.learn === "function"

    ){

        window.userProfileMemory.learn(
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

        "• Viral hooks\n" +

        "• Video scripts\n" +

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

    let profile = {};





    if(window.creatorMemory){


        memory =
        window.creatorMemory.get();


    }






    if(window.userProfileMemory){


        profile =
        window.userProfileMemory.get();


    }








    // Cinematic motivational


    if(

        memory.style === "cinematic" ||

        profile.style === "cinematic"

    ){

        return randomPick([


            "🎬🔥 The journey is not easy, but every step creates my legacy.",


            "🎬 Every struggle is a chapter. Every sacrifice is building the story.",


            "🔥 The road is difficult, but greatness is created through the process."


        ]);


    }








    // Motivational


    if(

        memory.tone === "motivational" ||

        profile.tone === "motivational"

    ){


        return randomPick([


            "🔥 Building my dream one step at a time.",


            "No shortcuts. Just consistency and hard work. 🚀",


            "Small actions. Big results.",


            "The journey is the story. Keep watching."


        ]);


    }







    return randomPick([


        "Creating today what people will remember tomorrow.",


        "The story is still being written.",


        "Keep building. Keep growing."


    ]);



}









// ===================================
// VIRAL HOOK
// ===================================


function generateHook(){


    return (

        "🔥 Viral Hook:\n\n" +

        randomPick([


            "Stop scrolling... you need to see this.",


            "Nobody talks about this part.",


            "The truth behind the journey is this.",


            "Watch until the end."


        ])

    );


}









// ===================================
// SCRIPT GENERATOR
// ===================================


function generateScript(){


    return (

        "🎬 Short Video Script\n\n" +

        "HOOK:\nGrab attention in the first 3 seconds.\n\n" +

        "STORY:\nShow the struggle, process and transformation.\n\n" +

        "ENDING:\nGive viewers a reason to follow."

    );


}









// ===================================
// HASHTAGS
// ===================================


function generateHashtags(){


    return (

        "#ContentCreator\n" +

        "#CinematicContent\n" +

        "#MyJourney\n" +

        "#ViralReels\n" +

        "#CreativeLife"

    );


}









// ===================================
// ADVERT
// ===================================


function generateAdvert(){


    return (

        "📢 Advert Idea\n\n" +

        "Create professional content faster with AI.\n\n" +

        "Turn your ideas into captions, scripts and viral posts."

    );


}









// ===================================
// CONTENT IDEAS
// ===================================


function generateIdeas(){


    return (

        "💡 Content Idea:\n\n" +

        randomPick([


            "Share your personal journey story.",


            "Show behind-the-scenes moments.",


            "Create a before and after transformation.",


            "Share lessons from your experience."


        ])

    );


}









// ===================================
// CONTENT CALENDAR
// ===================================


function generateContentPlan(){


    return (

        "📅 7-Day Content Plan\n\n" +

        "Day 1: Tell your story\n" +

        "Day 2: Behind the scenes\n" +

        "Day 3: Educational content\n" +

        "Day 4: Personal journey\n" +

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

            Math.random() * list.length

        )

    ];


}









// ===================================
// EXPORT
// ===================================


window.creatorBrain =
creatorBrain;
