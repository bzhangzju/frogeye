; (function () {
    var element = document.getElementById("image"),
        frogeye = new Frogeye(element, {
            events: ["singletap", "doubletap", "swipe"],
            config: {
                tap: {
                    time: 100
                }
            }
        }),
        scale = 1,
        translateX = 0;

    frogeye.on("tap", function (event) {
        console.log("tap: ", event);

    }).on("press", function (event) {
        console.log("press:", event);

    }).on("doubletap", function (event) {
        scale = 1;
        translateX = 0;
        transform(this, scale, translateX);
        console.log("doubletap:", event);

    }).on("singletap", function (event) {
        scale = 1.3;
        transform(this, scale, translateX);
        console.log("singletap:", event);

    }).on("panstart", function (event) {
        console.log("panstart: ", event);
        // logger.log("panstart: touches#=" + event.srcEvent.touches.length + ", changedTouches=" + event.srcEvent.changedTouches.length);

    }).on("panmove", function (event) {
        console.log("panmove: ", event);
        // logger.log("panmove: touches#=" + event.srcEvent.touches.length + ", changedTouches=" + event.srcEvent.changedTouches.length);

    }).on("panend", function (event) {
        console.log("panend: ", event);
        // logger.log("panend: touches#=" + event.srcEvent.touches.length + ", changedTouches=" + event.srcEvent.changedTouches.length);

    }).on("swipe", function (event) {
        console.log("swipe: ", event);

        switch(event.direction) {
            case "left":
                translateX = -60;
                break;
            case "right":
                translateX = 60;
                break;
            default:
               return;
        }
        transform(this, scale, translateX);

    }).on("pinch", function (event) {
        console.log("pinch: ", event);
        logger.log("pinch: zoom=" + event.zoom);

    }).on("rotate", function (event) {
        console.log("rotate: ", event);
        logger.log("rotate: angle=" + event.angle);

    });

    function transform(element, scale, translateX) {
        element.style = "transform: scale(" + scale + ") translate(" + translateX + "px, 0)";
    }

    var logger = {
        _logElement: document.getElementById("log"),

        log: function (message) {
            var el = document.createElement("p");

            el.textContent = message;
            this._logElement.appendChild(el);
        },

        clear: function () {
            this._logElement.innerHTML = "";
        }
    };

    document.getElementById("clear").addEventListener("click", function () {
        logger.clear();
    }, false);

    window.logger = logger;
})();