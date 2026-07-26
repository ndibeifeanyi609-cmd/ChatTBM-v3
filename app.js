// =====================================
// ChatTBM V4.5
// Part 6 - Professional App Behaviour
// =====================================



// =============================
// APP STARTUP
// =============================

window.addEventListener(
"load",
()=>{


    console.log(
        "🚀 ChatTBM Application Started"
    );


    checkConnection();


});







// =============================
// CONNECTION CHECK
// =============================

function checkConnection(){


    const online =
    navigator.onLine;



    if(online){


        console.log(
            "🌐 Internet Connected ✅"
        );


    }

    else{


        showAppNotice(
            "⚠️ Offline Mode"
        );


    }


}







// =============================
// ONLINE EVENT
// =============================

window.addEventListener(
"online",
()=>{


    showAppNotice(
        "🌐 Connection Restored ✅"
    );


});







// =============================
// OFFLINE EVENT
// =============================

window.addEventListener(
"offline",
()=>{


    showAppNotice(
        "⚠️ You are offline"
    );


});







// =============================
// APP NOTICE
// =============================

function showAppNotice(message){



    const notice =
    document.createElement("div");



    notice.innerText =
    message;



    notice.style.position =
    "fixed";



    notice.style.top =
    "20px";



    notice.style.left =
    "50%";



    notice.style.transform =
    "translateX(-50%)";



    notice.style.background =
    "#222";



    notice.style.color =
    "white";



    notice.style.padding =
    "12px 20px";



    notice.style.borderRadius =
    "999px";



    notice.style.zIndex =
    "9999";



    document.body.appendChild(
        notice
    );



    setTimeout(()=>{


        notice.remove();


    },2500);



}







// =============================
// GLOBAL ERROR HANDLER
// =============================

window.onerror =
function(
message,
source,
line
){



    console.error(

        "ChatTBM Error:",

        message,

        "Line:",

        line

    );



};







// =============================
// MOBILE APP FEEL
// =============================

document.body.style.webkitTapHighlightColor =
"transparent";





console.log(
"✅ ChatTBM V4.5 App Behaviour Loaded"
);
