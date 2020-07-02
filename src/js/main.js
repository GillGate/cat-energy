(function (){
    let TABLET_WIDTH = 768;
    let DESKTOP_WIDTH = 1300;
    let SMALL_PIN = {width: 62, height: 53};
    let BIG_PIN = {width: 124, height: 106};

    function debounce(f, ms) {
        let timer = null;

        return function (cb) {
        
        let onComplete = function () {
            f.apply(this, cb);
            timer = null;
        };
        if (timer) {
            clearTimeout(timer);
        }
            timer = setTimeout(onComplete, ms);
        };
    }

    window.initialize = function() {
        let viewport = document.documentElement.clientWidth || window.innerWidth;
        let mapCenter = viewport < DESKTOP_WIDTH ? {lat: 59.938882, lng: 30.32323} : {lat: 59.939065, lng: 30.319335};
        let pinCenter = viewport < TABLET_WIDTH ? {lat: 59.93871, lng: 30.32323} : {lat: 59.93871, lng: 30.32299};
        let pinSize = viewport < TABLET_WIDTH ? SMALL_PIN : BIG_PIN;


        let map = new google.maps.Map(document.getElementById('map'), {
            zoom: 17,
            center: mapCenter
        });

        let image = {
            url: "img/common/map-mark.png",
            scaledSize: pinSize
        };

        let beachMarker = new google.maps.Marker({
            position: pinCenter,
            map: map,
            optimized: true,
            icon: image
        });
    };

    window.addEventListener("resize", debounce(initialize, 1000));

    let nav = document.querySelector('.nav');
    let navToggle = document.querySelector('.nav__toggle');

    nav.classList.remove('nav--noJS');

    navToggle.addEventListener('click', function() {
        if (nav.classList.contains('nav--closed')) {
            nav.classList.remove('nav--closed');
            nav.classList.add('nav--opened');
        } else {
            nav.classList.add('nav--closed');
            nav.classList.remove('nav--opened');
        }
    });
})();
