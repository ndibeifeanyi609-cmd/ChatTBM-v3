/* ===================================
   ChatTBM V6.0.3
   Creator Brain

   Upgrade:
   - Personalization Engine connected
   - Creator Memory support
   - User Profile support
   - Automatic style application

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



    // Learn creator style

    if(

        window.creatorMemory &&

        typeof window.creatorMemory.learn === "function"

    ){

        window.creatorMemory.learn(request);

    }






    let response = "";





    if(text.includes("caption")){


        response =
        generateCaption();


    }




    else if(

        text.includes("hook") ||

        text.includes("viral")

    ){


        response =
        generateHook();


    }




    else if(

        text.includes("script") ||

        text.includes("video")

    ){


        response =
        generateScript();


    }




    else if(text.includes("hashtag")){


        response =
        generateHashtags();


    }




    else if(

        text.includes("advert") ||

        text.includes("ad")

    ){


        response =
        generateAdvert();


    }




    else if(

        text.includes("calendar") ||

        text.includes("plan")

    ){


        response =
        generateContentPlan();


    }




    else if(text.includes("idea")){


        response =
        generateIdeas();


    }




    else {


        response =

        "I can help you create:\n\n" +

        "• Captions\n" +
        "• Video hooks\n" +
        "• Scripts\n" +
        "• Hashtags\n" +
        "• Advert ideas\n" +
        "• Content plans";


    }






    // ===================================
    // APPLY PERSONAL AI STYLE
    // ===================================


    if(

        window.personalizationEngine &&

        typeof window.personalizationEngine.apply === "function"

    ){


        response =

        window.personalizationEngine.apply(

            response

        );


    }






    return response;


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






    if(

        memory.style === "cinematic" &&

        memory.tone === "motivational"

    ){


        return randomPick([


            "No shortcuts. Just consistency and hard work. 🚀 A story built through struggle, growth, and determination.",


            "Every challenge becomes part of the legacy I am creating. 🎬🔥",


            "The journey is not easy, but every step creates my story."


        ]);


    }







    return randomPick([


        "🔥 Building my dream one step at a time.",


        "No shortcuts. Just consistency and hard work. 🚀",


        "Every big result starts with small actions."


    ]);



}









function generateHook(){


    return (

        "Viral Hook:\n\n" +

        randomPick([

            "Nobody sees the struggle behind the success.",

            "This is what consistency looks like.",

            "The journey nobody talks about."

        ])

    );


}









function generateScript(){


    return (

        "🎬 Video Script\n\n" +

        "HOOK:\nNobody sees the beginning.\n\n" +

        "BODY:\nShow the struggle, process and growth.\n\n" +

        "ENDING:\nInvite people to follow the journey."

    );


}









function generateHashtags(){


    return (

        "#ContentCreator\n" +

        "#CinematicStory\n" +

        "#MotivationDaily\n" +

        "#CreatorJourney\n" +

        "#ViralContent"

    );


}









function generateAdvert(){


    return (

        "📢 Create better content faster.\n\n" +

        "ChatTBM helps creators build captions, " +

        "scripts and viral ideas with AI."

    );


}









function generateIdeas(){


    return (

        "💡 Content Idea:\n\n" +

        randomPick([

            "Document your journey from zero to success.",

            "Show behind-the-scenes moments.",

            "Turn challenges into storytelling content."

        ])

    );


}









function generateContentPlan(){


    return (

        "📅 7 Day Creator Plan\n\n" +

        "Day 1: Personal story\n" +

        "Day 2: Behind the scenes\n" +

        "Day 3: Lesson learned\n" +

        "Day 4: Transformation\n" +

        "Day 5: Audience question\n" +

        "Day 6: Promotion\n" +

        "Day 7: Weekly recap"

    );


}









function randomPick(list){


    return list[

        Math.floor(

            Math.random()*list.length

        )

    ];


}









window.creatorBrain = creatorBrain;
