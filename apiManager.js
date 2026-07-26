// =====================================
// ChatTBM V4.6
// API Manager
// =====================================

const APIManager = {

    mode: "demo", // demo | backend

    backendURL: "",

    async sendMessage(message){

        // Demo mode
        if(this.mode === "demo"){

            return demoAIResponse(message);

        }

        // Backend mode
        try{

            const response = await fetch(

                this.backendURL + "/api/chat",

                {

                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify({

                        message:message

                    })

                }

            );

            if(!response.ok){

                throw new Error("Server Error");

            }

            const data = await response.json();

            return data.reply;

        }

        catch(error){

            console.error(error);

            return "❌ Unable to contact ChatTBM AI server.";

        }

    }

};

console.log("✅ API Manager Loaded");
