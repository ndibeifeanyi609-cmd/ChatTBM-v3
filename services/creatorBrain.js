/* ===================================
   ChatTBM V6.1
   Creator Brain

   Upgrade:
   - Context aware captions
   - Cinematic writing style
   - Motivational tone
   - Creator Memory connection
   - Better content understanding

   Features:
   - Captions
   - Hooks
   - Scripts
   - Hashtags
   - Ads
   - Content Ideas
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

        text.includes("idea")

    ){

        return generateIdeas();

    }




    if(

        text.includes("calendar") ||

        text.includes("plan")

    ){

        return generateContentPlan();

    }





    return (

        "I can help you create:\n\n" +

        "✍️ Captions\n" +
        "🎬 Video Scripts\n" +
        "🔥 Viral Hooks\n" +
        "#️⃣ Hashtags\n" +
        "📢 Advert Ideas\n" +
        "💡 Content Plans"

    );


}









// ===================================
// SMART CAPTION GENERATOR
// ===================================


function generateCaption(request){


    let memory = {};



    if(

        window.creatorMemory &&

        typeof window.creatorMemory.get === "function"

    ){

        memory =
        window.creatorMemory.get();

    }






    const cinematic =

    request.includes("cinematic");



    const motivational =

    request.includes("motivational") ||

    memory.tone === "motivational";



    const journey =

    request.includes("journey") ||

    request.includes("story");







    // Cinematic + Motivational + Journey


    if(

        cinematic &&

        motivational &&

        journey

    ){

        return randomPick([


            "🎬🔥 The journey is not easy, but every challenge, every sacrifice, and every step forward is creating my legacy.",



            "🎬 Every struggle has a purpose. Every step has a meaning. This journey is becoming my story.",



            "🔥 The road is tough, but the vision is bigger. One step at a time, I am building my legacy."

        ]);

    }







    // Cinematic captions


    if(cinematic){


        return randomPick([


            "🎬 Every chapter, every battle, every moment is part of the story.",



            "A dream becomes a legacy through patience, discipline, and action."

        ]);


    }








    // Motivational captions


    if(motivational){


        return randomPick([


            "🔥 Building my dream one step at a time.",



            "No shortcuts. Just consistency, discipline, and hard work. 🚀",



            "Every big result starts with small actions."

        ]);


    }








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

        "🔥 Viral Hook:\n\n" +

        randomPick([


            "Nobody sees the struggle behind the success.",



            "This is the part nobody talks about.",



            "Watch the journey before judging the result."

        ])

    );


}









// ===================================
// VIDEO SCRIPT
// ===================================


function generateScript(){


    return (

        "🎬 Short Video Script\n\n" +

        "HOOK:\n" +

        "The world only sees the result, not the struggle.\n\n" +

        "BODY:\n" +

        "Show the process, challenges, and growth.\n\n" +

        "ENDING:\n" +

        "Follow the journey because the story is still being written."

    );


}









// ===================================
// HASHTAGS
// ===================================


function generateHashtags(){


    return (

        "#Journey\n" +

        "#Motivation\n" +

        "#ContentCreator\n" +

        "#CinematicStory\n" +

        "#KeepBuilding\n" +

        "#NeverGiveUp"

    );


}









// ===================================
// ADVERT
// ===================================


function generateAdvert(){


    return (

        "📢 Create better content with AI.\n\n" +

        "Turn your ideas into captions, scripts, " +

        "and viral content faster."

    );


}









// ===================================
// IDEAS
// ===================================


function generateIdeas(){


    return (

        "💡 Content Idea:\n\n" +

        randomPick([


            "Document your journey from the beginning.",



            "Show behind-the-scenes moments.",



            "Share lessons from your experience."

        ])

    );


}









// ===================================
// CONTENT PLAN
// ===================================


function generateContentPlan(){


    return (

        "📅 7-Day Creator Plan\n\n" +

        "Day 1: Tell your story\n" +

        "Day 2: Behind the scenes\n" +

        "Day 3: Share a lesson\n" +

        "Day 4: Show your process\n" +

        "Day 5: Audience connection\n" +

        "Day 6: Promote your work\n" +

        "Day 7: Weekly reflection"

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


window.creatorBrain = creatorBrain;
