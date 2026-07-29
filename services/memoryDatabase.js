// =====================================
// ChatTBM V5.9.1
// Advanced Memory Database
// Part 1
// Core Storage Engine
// =====================================


// =====================================
// TEMPORARY LOCAL DATABASE
//
// Future upgrade:
// MongoDB / PostgreSQL / Firebase
// =====================================

const memoryDatabase = {};




// =====================================
// CREATE USER MEMORY SPACE
// =====================================

function createUserMemory(userId){


    if(!memoryDatabase[userId]){


        memoryDatabase[userId] = {


            userId,


            memories: [],


            created:

            new Date().toISOString(),


            updated:

            new Date().toISOString()


        };


    }


    return memoryDatabase[userId];


}




// =====================================
// CHECK USER EXISTS
// =====================================

function userExists(userId){


    return Boolean(

        memoryDatabase[userId]

    );


}




// =====================================
// UPDATE TIMESTAMP
// =====================================

function updateTimestamp(userId){


    if(memoryDatabase[userId]){


        memoryDatabase[userId].updated =

        new Date().toISOString();


    }


}

// =====================================
// SAVE MEMORY
// V5.9.1 Ranked Memory Storage
// =====================================


function saveMemory(

    userId,

    memoryData

){


    const userMemory =

    createUserMemory(userId);



    if(!memoryData){

        return {

            success:false,

            message:"No memory provided"

        };

    }



    const memory = {


        id:

        Date.now().toString() +

        Math.random()

        .toString(36)

        .slice(2,8),



        type:

        memoryData.type || "general",



        value:

        memoryData.value || "",



        score:

        memoryData.score || 0,



        level:

        memoryData.level || "TEMPORARY",



        metadata:

        memoryData.metadata || {},



        created:

        new Date().toISOString(),



        accessed:

        new Date().toISOString()


    };




    userMemory.memories.push(

        memory

    );



    updateTimestamp(userId);



    return {


        success:true,


        memory


    };


}





// =====================================
// GET USER MEMORIES
// =====================================


function getMemories(userId){


    const userMemory =

    createUserMemory(userId);



    return userMemory.memories;


}





// =====================================
// GET IMPORTANT MEMORIES
// =====================================


function getImportantMemories(

    userId,

    level

){


    const memories =

    getMemories(userId);



    return memories.filter(

        memory =>

        memory.level === level

    );


}

// =====================================
// SEARCH MEMORY
// V5.9.1 Memory Recall
// =====================================


function searchMemory(

    userId,

    query

){


    const memories =

    getMemories(userId);



    if(!query){

        return memories;

    }



    const text =

    query.toLowerCase();



    return memories.filter(memory => {


        const value =

        String(memory.value)

        .toLowerCase();



        const type =

        String(memory.type)

        .toLowerCase();



        return (

            value.includes(text)

            ||

            type.includes(text)

        );


    });


}





// =====================================
// GET BEST MEMORIES
// Based on importance score
// =====================================


function getBestMemories(

    userId,

    limit = 5

){


    const memories =

    getMemories(userId);



    return memories

    .sort(

        (a,b)=>

        b.score - a.score

    )

    .slice(

        0,

        limit

    );


}





// =====================================
// UPDATE MEMORY ACCESS TIME
// =====================================


function touchMemory(

    userId,

    memoryId

){


    const memories =

    getMemories(userId);



    const memory =

    memories.find(

        item =>

        item.id === memoryId

    );



    if(memory){


        memory.accessed =

        new Date().toISOString();



        updateTimestamp(userId);



        return true;


    }



    return false;


}





// =====================================
// MEMORY COUNT
// =====================================


function getMemoryCount(

    userId

){


    return getMemories(userId)

    .length;


}

// =====================================
// DELETE SINGLE MEMORY
// =====================================


function deleteMemory(

    userId,

    memoryId

){


    const userMemory =

    createUserMemory(userId);



    const before =

    userMemory.memories.length;



    userMemory.memories =

    userMemory.memories.filter(

        memory =>

        memory.id !== memoryId

    );



    updateTimestamp(userId);



    return {


        success:

        before !== userMemory.memories.length,


        message:

        before !== userMemory.memories.length

        ?

        "Memory deleted"

        :

        "Memory not found"


    };


}





// =====================================
// CLEAR ALL USER MEMORY
// =====================================


function clearUserMemory(

    userId

){


    if(memoryDatabase[userId]){


        memoryDatabase[userId].memories = [];

        updateTimestamp(userId);


    }



    return {


        success:true,


        message:

        "User memory cleared"


    };


}





// =====================================
// EXPORT USER MEMORY
// =====================================


function exportUserMemory(

    userId

){


    const userMemory =

    createUserMemory(userId);



    return userMemory;


}





// =====================================
// DATABASE STATISTICS
// =====================================


function getDatabaseStats(){


    const users =

    Object.keys(memoryDatabase);



    let totalMemories = 0;



    users.forEach(userId => {


        totalMemories +=

        memoryDatabase[userId]

        .memories.length;


    });



    return {


        totalUsers:

        users.length,


        totalMemories


    };


}





// =====================================
// FINAL EXPORT
// =====================================


module.exports = {


    createUserMemory,


    userExists,


    saveMemory,


    getMemories,


    getImportantMemories,


    searchMemory,


    getBestMemories,


    touchMemory,


    getMemoryCount,


    deleteMemory,


    clearUserMemory,


    exportUserMemory,


    getDatabaseStats


};
