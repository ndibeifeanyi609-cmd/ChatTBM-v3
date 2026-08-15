// =========================================
// ChatTBM V6.7.5
// Memory Retrieval Engine
//
// Purpose:
// - Retrieve relevant creator memories
// - Match memories to requests
// - Build response context
// =========================================



const {

    getCreatorMemory,

    getImportantMemories

} = require("./creatorMemoryEngine");







class MemoryRetrievalEngine {





    // =====================================
    // FIND RELEVANT MEMORIES
    // =====================================


    retrieve(

        userId,

        request

    ){


        const text =

        String(request || "")

        .toLowerCase();





        const memory =

        getCreatorMemory(

            userId

        );





        const important =

        getImportantMemories(

            userId

        );





        let results = [];







        important.forEach(item=>{


            const content =

            String(item.content)

            .toLowerCase();





            if(

                text.includes("caption") &&

                item.category === "content_style"

            ){

                results.push(item);

            }






            else if(

                text.includes("script") &&

                item.category === "creator_identity"

            ){

                results.push(item);

            }






            else if(

                text.includes("strategy") &&

                item.category === "preference"

            ){

                results.push(item);

            }






            else if(

                content.includes(text)

            ){

                results.push(item);

            }



        });








        return {


            userId,


            request,



            memories:results,



            total:results.length



        };


    }








    // =====================================
    // BUILD CONTEXT
    // =====================================


    buildContext(

        userId,

        request

    ){


        const result =

        this.retrieve(

            userId,

            request

        );






        return {


            memoryContext:

            result.memories.map(

                item => item.content

            ),



            count:

            result.total



        };


    }



}







module.exports = MemoryRetrievalEngine;
