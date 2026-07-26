/* ===================================
   ChatTBM - Service Worker
   service-worker.js
=================================== */


const CACHE_NAME = "chattbm-cache-v1";


const FILES_TO_CACHE = [

    "/",
    "/index.html",
    "/style.css",
    "/script.js",
    "/manifest.json",

    "/assets/logo.png",
    "/assets/favicon.png"

];




// INSTALL SERVICE WORKER

self.addEventListener(
"install",
event => {


    event.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache => {

            return cache.addAll(FILES_TO_CACHE);

        })

    );


    self.skipWaiting();


});







// ACTIVATE SERVICE WORKER

self.addEventListener(
"activate",
event => {


    event.waitUntil(

        caches.keys()

        .then(cacheNames => {


            return Promise.all(

                cacheNames.map(cache => {


                    if(cache !== CACHE_NAME){

                        return caches.delete(cache);

                    }


                })

            );


        })

    );


    self.clients.claim();


});







// FETCH FILES

self.addEventListener(
"fetch",
event => {


    event.respondWith(


        caches.match(event.request)

        .then(response => {


            return response || fetch(event.request);


        })


    );


});
