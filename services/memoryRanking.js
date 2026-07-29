// =====================================
// ChatTBM V5.5
// Memory Ranking System
// Part 3
// Scores memory importance
// =====================================



// =====================================
// RANK MEMORIES
// =====================================

function rankMemories(

    memories = {},

    message = ""

){

    const text =
    message.toLowerCase();


    const ranked = [];



    Object.keys(memories).forEach(

        key => {


            let score = 0;


            const value =
            memories[key];



            // =====================================
            // BASE IMPORTANCE
            // =====================================

            score += 1;



            // =====================================
            // MESSAGE MATCHING
            // =====================================

            if(

                text.includes(
                    String(value).toLowerCase()
                )

            ){

                score += 5;

            }



            if(

                text.includes(key.toLowerCase())

            ){

                score += 3;

            }




            // =====================================
            // IMPORTANT MEMORY TYPES
            // =====================================

            if(

                key === "platform" ||

                key === "contentStyle" ||

                key === "tone" ||

                key === "goal"

            ){

                score += 2;

            }




            ranked.push({

                key,

                value,

                score

            });


        }

    );



    // =====================================
    // SORT BY SCORE
    // =====================================

    ranked.sort(

        (a,b) =>
        b.score - a.score

    );



    return ranked;


}




module.exports = {

    rankMemories

};
