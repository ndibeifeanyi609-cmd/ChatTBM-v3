// =========================================
// ChatTBM V6.7.4
// Memory Intelligence Engine
//
// Purpose:
// - Understand creator memories
// - Rank memory importance
// - Organize creator knowledge
// - Prepare intelligent retrieval
// =========================================



class MemoryIntelligenceEngine {



    constructor(){

        this.memoryStore = {};

    }







    // =====================================
    // ANALYZE MEMORY IMPORTANCE
    // =====================================


    analyzeMemory(content){


        const text =

        String(content || "")

        .toLowerCase();





        let score = 1;


        let category = "general";






        if(

            text.includes("my style") ||

            text.includes("my brand") ||

            text.includes("i create")

        ){

            score += 5;

            category = "creator_identity";

        }






        if(

            text.includes("audience") ||

            text.includes("followers") ||

            text.includes("viewers")

        ){

            score += 4;

            category = "audience";

        }






        if(

            text.includes("cinematic") ||

            text.includes("realistic") ||

            text.includes("action")

        ){

            score += 4;

            category = "content_style";

        }






        if(

            text.includes("always") ||

            text.includes("never") ||

            text.includes("prefer")

        ){

            score += 3;

            category = "preference";

        }







        return {


            content,


            score,


            category,


            createdAt:new Date()


        };


    }









    // =====================================
    // SAVE INTELLIGENT MEMORY
    // =====================================


    remember(userId, content){


        const memory =

        this.analyzeMemory(

            content

        );






        if(!this.memoryStore[userId]){


            this.memoryStore[userId] = [];


        }






        this.memoryStore[userId].push(

            memory

        );





        return memory;


    }









    // =====================================
    // GET IMPORTANT MEMORIES
    // =====================================


    getImportantMemories(userId){


        const memories =

        this.memoryStore[userId] || [];






        return memories.sort(

            (a,b)=>

            b.score - a.score

        );


    }



}







module.exports = MemoryIntelligenceEngine;
