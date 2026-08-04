// =====================================
// ChatTBM V7.2
// Voice Engine
//
// Purpose:
// - Convert speech to text
// - Connect voice input to ChatTBM
// - Prepare future voice assistant features
// =====================================


const ChatTBM_Voice = {

    supported: false,

    listening: false,

    recognition: null

};



// =====================================
// INITIALIZE VOICE
// =====================================

function initializeVoiceEngine() {


    const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;



    if (!SpeechRecognition) {


        console.log(
            "🎤 Voice input not supported"
        );


        return false;

    }



    ChatTBM_Voice.supported = true;



    ChatTBM_Voice.recognition =
    new SpeechRecognition();



    ChatTBM_Voice.recognition.continuous = false;


    ChatTBM_Voice.recognition.interimResults = false;


    ChatTBM_Voice.recognition.lang = "en-US";



    ChatTBM_Voice.recognition.onstart = function(){


        ChatTBM_Voice.listening = true;


        console.log(
            "🎤 Listening..."
        );


    };



    ChatTBM_Voice.recognition.onend = function(){


        ChatTBM_Voice.listening = false;


    };



    ChatTBM_Voice.recognition.onresult =
    function(event){


        const text =
        event.results[0][0].transcript;



        console.log(
            "Voice:",
            text
        );



        const input =
        document.getElementById(
            "user-input"
        );



        if(input){

            input.value = text;

        }


    };



    return true;

}





// =====================================
// START LISTENING
// =====================================

function startVoiceInput(){


    if(
        ChatTBM_Voice.recognition
    ){

        ChatTBM_Voice.recognition.start();

    }


}





// =====================================
// STATUS
// =====================================

function getVoiceStatus(){


    return ChatTBM_Voice;

}





// =====================================
// GLOBAL ACCESS
// =====================================

window.ChatTBMVoice = {


    initializeVoiceEngine,

    startVoiceInput,

    getVoiceStatus


};





// =====================================
// STARTUP
// =====================================

initializeVoiceEngine();


console.log(
    "✅ ChatTBM Voice Engine Loaded"
);
