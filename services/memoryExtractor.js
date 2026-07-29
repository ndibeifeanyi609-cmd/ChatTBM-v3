// =====================================
// ChatTBM V5.9.2
// Memory Intelligence Engine
// Part 1
// Smart Memory Extraction
// =====================================


class MemoryExtractor {


    constructor(){


        this.memory = {


            identity: [],

            projects: [],

            preferences: [],

            goals: [],

            skills: [],

            platforms: [],

            files: [],

            tasks: [],

            facts: []


        };


    }





    // =====================================
    // MAIN EXTRACTION
    // =====================================


    extract(event){


        if(!event || !event.message) return;



        const text =

        event.message.trim();



        this.extractName(text);


        this.extractProjects(text);


        this.extractPreferences(text);


        this.extractGoals(text);


        this.extractPlatforms(text);


        this.extractSkills(text);


        this.extractFiles(text);


        this.extractTasks(text);


        this.extractFacts(text);



    }





    // =====================================
    // NAME DETECTION
    // =====================================


    extractName(text){


        const match =

        text.match(

            /my name is (.+)|i am (.+)|i'm (.+)/i

        );



        if(match){


            const name =

            (

                match[1] ||

                match[2] ||

                match[3]

            ).trim();



            this.saveUnique(

                "identity",

                {

                    type:"name",

                    value:name,

                    importance:"HIGH"

                }

            );


        }


    }





    // =====================================
    // PROJECT DETECTION
    // =====================================


    extractProjects(text){


        const lower =

        text.toLowerCase();



        const keywords = [

            "build",

            "building",

            "develop",

            "developing",

            "project",

            "app",

            "website",

            "system",

            "chattbm"

        ];



        keywords.forEach(keyword=>{


            if(lower.includes(keyword)){



                this.saveUnique(

                    "projects",

                    {

                        type:"project",

                        value:text,

                        importance:"HIGH"

                    }

                );


            }


        });


    }





    // =====================================
    // USER PREFERENCES
    // =====================================


    extractPreferences(text){


        const lower =

        text.toLowerCase();



        const patterns = [


            "i like",

            "i love",

            "i prefer",

            "my favorite",

            "i enjoy"


        ];



        patterns.forEach(pattern=>{


            if(lower.includes(pattern)){



                this.saveUnique(

                    "preferences",

                    {

                        type:"preference",

                        value:text,

                        importance:"MEDIUM"

                    }

                );


            }


        });


    }





    // =====================================
    // GOAL DETECTION
    // =====================================


    extractGoals(text){


        const lower =

        text.toLowerCase();



        const goals = [


            "i want",

            "my goal",

            "i plan",

            "i hope",

            "i need to"


        ];



        goals.forEach(goal=>{


            if(lower.includes(goal)){



                this.saveUnique(

                    "goals",

                    {

                        type:"goal",

                        value:text,

                        importance:"HIGH"

                    }

                );


            }


        });


    }





    // =====================================
    // PLATFORM DETECTION
    // =====================================


    extractPlatforms(text){


        const platforms = [


            "facebook",

            "instagram",

            "youtube",

            "tiktok",

            "twitter",

            "linkedin"


        ];



        platforms.forEach(platform=>{


            if(

                text.toLowerCase()

                .includes(platform)

            ){


                this.saveUnique(

                    "platforms",

                    {

                        type:"platform",

                        value:platform,

                        importance:"MEDIUM"

                    }

                );


            }


        });


    }





    // =====================================
    // SKILL DETECTION
    // =====================================


    extractSkills(text){


        const skills = [


            "editing",

            "coding",

            "programming",

            "design",

            "marketing",

            "content creation",

            "video creation"


        ];



        skills.forEach(skill=>{


            if(

                text.toLowerCase()

                .includes(skill)

            ){



                this.saveUnique(

                    "skills",

                    {

                        type:"skill",

                        value:skill,

                        importance:"MEDIUM"

                    }

                );


            }


        });


    }





    // =====================================
    // FILE DETECTION
    // =====================================


    extractFiles(text){


        const files =

        text.match(

            /\b[\w-]+\.(js|json|html|css|env)\b/gi

        );



        if(files){


            files.forEach(file=>{


                this.saveUnique(

                    "files",

                    {

                        type:"file",

                        value:file,

                        importance:"MEDIUM"

                    }

                );


            });


        }


    }





    // =====================================
    // TASK DETECTION
    // =====================================


    extractTasks(text){


        const lower =

        text.toLowerCase();



        const tasks = [


            "next",

            "continue",

            "fix",

            "upgrade",

            "complete",

            "finish"


        ];



        tasks.forEach(task=>{


            if(lower.includes(task)){



                this.saveUnique(

                    "tasks",

                    {

                        type:"task",

                        value:text,

                        importance:"MEDIUM"

                    }

                );


            }


        });


    }





    // =====================================
    // GENERAL FACTS
    // =====================================


    extractFacts(text){


        if(text.length > 20){


            this.saveUnique(

                "facts",

                {

                    type:"fact",

                    value:text,

                    importance:"LOW"

                }

            );


        }


    }





    // =====================================
    // SAVE WITHOUT DUPLICATES
    // =====================================


    saveUnique(type,value){


        const exists =

        this.memory[type].some(item =>


            JSON.stringify(item) ===

            JSON.stringify(value)


        );



        if(!exists){


            this.memory[type].push(value);


        }


    }





    // =====================================
    // GET MEMORY
    // =====================================


    getMemory(){


        return this.memory;


    }





    // =====================================
    // CLEAR MEMORY
    // =====================================


    clear(){


        this.memory = {


            identity: [],

            projects: [],

            preferences: [],

            goals: [],

            skills: [],

            platforms: [],

            files: [],

            tasks: [],

            facts: []


        };


    }


}



module.exports = new MemoryExtractor();
