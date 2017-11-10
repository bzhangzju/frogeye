(function () {
    var win = window;

    var VERSION = "0.0.1";

    var _ = {
        isArray: function (value) {
            return Object.prototype.toString.call(value) === "[object Array]";
        },

        isObject: function (value) {
            return Object.prototype.toString.call(value) === "[object Object]";
        },


        /**
         * Extend target with source. It can have variable number of source params.
         * @param {Array|Object|boolean} target if target is boolean, target param served as `deep` param while the second param served as the target. Target param cannot be omitted.
         * @param {Array|Object} source
         * @returns {*}
         */
        extend: function (target, source) {
            var isArray,
                deep = false,
                args = Array.prototype.slice.call(arguments);

            if (typeof target === "boolean") { // if the first parameter is boolean type, it indicates whether perform deep copy or not
                deep = target;
                target = source;
                args.shift();
            }
            args.shift();

            _.each(args, function (source) {
                _.each(source, function (value, key) {
                    if (deep && ((isArray = _.isArray(value)) || _.isObject(value))){
                        target[key] = ((_.isArray(target[key]) && isArray) || (_.isObject(target[key]) && !isArray)) ? target[key] : (isArray ? [] : {});
                        _.extend(true, target[key], value);
                    } else {
                        target[key] = value;
                    }
                });
            });

            return target;
        },

        each: function (obj, callback) {
            var i,
                key;

            if (_.isArray(obj)) {
                for (i = 0; i < obj.length; i++) {
                    if (callback.call(obj[i], obj[i], i, obj) === false) {
                        break;
                    }
                }
            } else if (_.isObject(obj)) {
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        callback.call(obj[key], obj[key], key, obj);
                    }
                }
            }

        },

        bind: function (fn, context) {
            return function () {
                fn.apply(context, arguments);
            }
        },

        _getSwipeDirection: function (deltaX, deltaY) {
            var direction;

            if (Math.abs(deltaX) >= Math.abs(deltaY)) { // horizontal
                direction = deltaX > 0 ? "right" : "left";
            } else {
                direction = deltaY > 0 ? "bottom" : "top";
            }

            return direction;
        },

        /**
         * @param rs previous size's square
         */
        getPinchZoom: function (x, y, rs) {
            return rs > 0 ? Math.sqrt((x * x + y * y) / rs) : null;
        },

        /**
         *
         * Get rotate angle from vector (px, py) to vector (x, y).
         * @param rs square of magnitude of vector (px, py)
         */
        getRotateAngle: function (x, y, px, py, rs) {
            var result = Math.sqrt((x * x + y * y) * rs),
                dot = x * px + y * py,
                cross,
                cos,
                angle = null;

            if (result <= 0) {
                return angle;
            }

            cos = dot / result;
            cos = cos < -1 ? -1 : (cos > 1 ? 1 : cos);
            angle =  Math.acos(cos); // angle belongs to [0, PI]

            // Infer angle direction based on vector cross product. Angle from vector (px, py) to (x, y)
            cross = px * y - py * x;
            if (cross < 0) {
                angle = -angle; // angle is positive when rotate clockwise in left-handed coordinate system (anticlockwise in right-handed coordinate system)
            }

            return angle * 180 / Math.PI; // convert to degree, returned angle belongs to [-180, 180]
        }
    };

    var NATIVE_EVENT = { // native DOM events
        TOUCH_START: "touchstart",
        TOUCH_MOVE: "touchmove",
        TOUCH_END: "touchend"
    };

    var FROGEYE_EVENT = { // events recognized by frogeye
        TAP: "tap",
        PRESS: "press",
        SINGLE_TAP: "singletap",
        DOUBLE_TAP: "doubletap",
        PAN_START: "panstart",
        PAN_MOVE: "panmove",
        PAN_END: "panend",
        SWIPE: "swipe",
        PINCH: "pinch",
        ROTATE: "rotate"
    };

    /**
     *
     * @param {HTMLElement} element
     * @param {Object} options
     *        options = {
     *            onemit: Function, // callback when emit an event
     *            events: [], // list of events to recognize
     *            config: {}  // settings for recognizing gestures. It shares the same config as `Frogeye.defaultConfig.`
     *        }
     * @constructor
     */
    function Frogeye(element, options) {
        this._element = element;
        this._options = _.extend(true, {}, options);
        this._initEvents();
        this._config = _.extend(true, {}, Frogeye.defaultConfig, this._options.config || {});
        this._handlers = {};

        this._initData();

        this._handleTouchStart = _.bind(this._handleTouchStart, this);
        this._handleTouchMove = _.bind(this._handleTouchMove, this);
        this._handleTouchEnd = _.bind(this._handleTouchEnd, this);

        element.addEventListener(NATIVE_EVENT.TOUCH_START, this._handleTouchStart, false);
        element.addEventListener(NATIVE_EVENT.TOUCH_MOVE, this._handleTouchMove, false);
        element.addEventListener(NATIVE_EVENT.TOUCH_END, this._handleTouchEnd, false);
    }

    Frogeye.version = VERSION;

    // default events recognized
    Frogeye.defaultEvents = [FROGEYE_EVENT.TAP, FROGEYE_EVENT.PRESS, FROGEYE_EVENT.SINGLE_TAP, FROGEYE_EVENT.DOUBLE_TAP,
                             FROGEYE_EVENT.PAN_START, FROGEYE_EVENT.PAN_MOVE, FROGEYE_EVENT.PAN_END, FROGEYE_EVENT.SWIPE];

    // default settings for recognizing events
    Frogeye.defaultConfig = {
        tap: {
            distance: 2, // max distance in px for movement
            time: 250 // max press time in ms
        },
        press: {
            time: 251 // min press time in ms. Must greater than that of 'tap'
        },
        doubleTap: {
            interval: 300, // max time in ms between two taps
            distance: 10 // max distance in px between two taps
        },
        swipe: {
            distance: 10, // min distance in px
            velocity: 0.3 // min velocity in px/ms
        }
    };

    Frogeye.prototype = {
        constructor: Frogeye,

        /**
         * @param {Array} events
         * @private
         */
        _initEvents: function () {
            var events = this._options.events,
                eventsMap = {};

            events = events === undefined ? _.extend(true, [], Frogeye.defaultEvents) : events;
            _.each(events, function (event) {
               eventsMap[event] = true;
            });

            this._options.events = eventsMap;
        },

        _initData: function () {
            this._currentTap = null; // current tap

            this._tapped = false; //  tap event or not

            this._pressed = false; // press event or not
            this._pressTimer = null; // timer for press event

            this._singleTapped = false; // single tap event or not
            this._singleTapTimer = null; // timer for single tap event

            this._prevTap = null; // previous tap
            this._doubleTapped = false; // double tap event or not

            this._currentPinch = null; // start pinch

            this._currentRotate = null; // start rotate
        },

        /**
         * Destroy frogeye instance by removing event listeners.
         */
        destroy: function () {
            var element = this._element,
                handlers = this._handlers,
                event;

            element.removeEventListener(NATIVE_EVENT.TOUCH_START, this._handleTouchStart, false);
            element.removeEventListener(NATIVE_EVENT.TOUCH_MOVE, this._handleTouchMove, false);
            element.removeEventListener(NATIVE_EVENT.TOUCH_END, this._handleTouchEnd, false);

            for (event in handlers) {
                if (handlers.hasOwnProperty(event)) {
                    handlers[event] = null;
                    delete handlers[event];
                }
            }

            // TODO: cancel any pending event
        },

        _isInRange: function (x, y, time, tap, maxDistance, maxTime) {
            var result,
                elapsed;

            result = tap ? Math.abs(x - tap.x) <= maxDistance && Math.abs(y - tap.y) <= maxDistance : false;
            if (result && time !== undefined) {
                elapsed = time - tap.time;
                result = elapsed >= 0 && elapsed <= maxTime;
            }

            return result;
        },

        _isTap: function (x, y, time) {
            var config = this._config.tap;

            return this._isInRange(x, y, time, this._currentTap, config.distance, config.time);
        },

        _isDoubleTap: function (x, y, time) {
            var config = this._config.doubleTap;

            return this._isInRange(x, y, time, this._prevTap, config.distance, config.interval);
        },

        _isSwipe: function (x, y, time) {
            var config = this._config.swipe,
                tap = this._currentTap,
                dx = x - tap.x,
                dy = y - tap.y,
                dt,
                result;

            result = tap ? Math.abs(dx) >= config.distance || Math.abs(dy) >= config.distance: false;
            if (result) {
                dt = time - tap.time;
                result = dt > 0 && dx * dx + dy * dy >= dt * dt * config.velocity * config.velocity;
            }

            return result ? _._getSwipeDirection(dx, dy) : false;
        },


        _handleTouchStart: function (event) {
            var touches = event.touches, // event.changedTouches,
                x,
                y,
                now,
                dx,
                dy,
                rs;

            if (!touches.length) {
                return;
            }

            x = touches[0].pageX;
            y = touches[0].pageY;
            now = Date.now();

            if (touches.length > 1) { // multi point touch
                dx = touches[1].pageX - x;
                dy = touches[1].pageY - y;
                rs = dx * dx + dy * dy; // size square
                this._currentPinch = {
                    rs: rs
                };
                this._currentRotate = {
                    x: dx,
                    y: dy,
                    rs: rs
                }
            }

            this._tapped = true; // tap event may not have 'touchmove' process
            this._doubleTapped = false;

            if (this._prevTap) {
                this._doubleTapped = this._isDoubleTap(x, y, now);
            }

            this._currentTap = {
                x: x,
                y: y,
                time: now
            };

            if (this._options.events[FROGEYE_EVENT.PRESS]) {
                this._pressTimer = win.setTimeout(_.bind(this._detectPress, this), this._config.press.time);
            }

            this._emit(FROGEYE_EVENT.PAN_START, event);
        },

        _handleTouchMove: function (event) {
            var touches = event.touches, // event.changedTouches;
                x,
                y;

            if (!touches.length) {
                return;
            }

            if (touches.length > 1) {
                x = touches[1].pageX - touches[0].pageX;
                y = touches[1].pageY - touches[0].pageY;
                this._detectPinch(x, y, event);

                this._detectRotate(x, y);
            }

            this._tapped = this._tapped && this._isTap(touches[0].pageX, touches[0].pageY);

            this._emit(FROGEYE_EVENT.PAN_MOVE, event);
        },

        _handleTouchEnd: function (event) {
            var touches = event.changedTouches,
                now = Date.now(),
                x,
                y;

            if (!touches.length) {
                return;
            }

            x = touches[0].pageX;
            y = touches[0].pageY;

            // NOTE: '_detectTap' must be called before other '_check*' calls because the former sets '_tapped' needed by other calls.
            this._detectTap(x, y, now);

            if (!this._detectDoubleTap()) {
                this._detectSingleTap(now, event);
            }

            this._detectSwipe(x, y, now, event);

            this._emit(FROGEYE_EVENT.PAN_END, event);

            // reset
            this._tapped = false;
            this._doubleTapped = false;
            this._currentPinch = null;
        },

        /**
         *  TODO: Currently we do not prevent detecting `tap`, `singletap` or `doubletap` event, if we are asked not to recognize them.
         *        We just do not emit these events. Because detecting `singletap` or `doubletap` depends on `tap`, and `singletap` depends on `doubletap`.
         */
        _detectTap: function (x, y, time) {
            this._tapped = this._tapped && this._isTap(x, y, time);
            if (!this._tapped) {
                return;
            }

            this._emit(FROGEYE_EVENT.TAP, event);

            this._pressed = false;
            if (this._pressTimer) {
                win.clearTimeout(this._pressTimer);
                this._pressTimer = null;
            }
        },

        _detectPress: function () {
            this._pressed = this._tapped;
            if (this._pressed) {
                this._emit(FROGEYE_EVENT.PRESS);
                this._pressed = false;
                this._tapped = false; // prevent 'tap' like event
                this._pressTimer = null;
            }
        },

        /**
         *
         * @returns {boolean} doubletap event or not
         * @private
         */
        _detectDoubleTap: function () {
            if (this._prevTap && this._tapped && this._doubleTapped) {
                this._emit(FROGEYE_EVENT.DOUBLE_TAP);
                this._prevTap = null;

                if (this._singleTapTimer) {
                    win.clearTimeout(this._singleTapTimer);
                    this._singleTapTimer = null;
                }

                return true;
            }

            this._prevTap = this._tapped ? _.extend({}, this._currentTap) : null;

            return false;
        },

        _detectSingleTap: function (time, event) {
            var self = this,
                left;

            if (!this._options.events[FROGEYE_EVENT.SINGLE_TAP]) {
                return;
            }

            if (this._tapped) {
                left = this._config.doubleTap.interval + 1 - (time - this._currentTap.time); // time left
            }

            this._singleTapped = this._tapped && left >= 0;
            if (!this._singleTapped) {
                return;
            }

            this._singleTapTimer = win.setTimeout(function () {
                self._emit(FROGEYE_EVENT.SINGLE_TAP, event);
                self._singleTapTimer = null;
            }, left);
        },

        _detectSwipe: function (x, y, time, event) {
            var result;

            if (!this._options.events[FROGEYE_EVENT.SWIPE]) {
                return;
            }

            result = this._isSwipe(x, y, time);
            if (result !== false) {
                this._emit(FROGEYE_EVENT.SWIPE, event, {direction: result});
            }
        },

        _detectPinch: function (x, y, event) {
            var rs,
                zoom;

            if (!this._options.events[FROGEYE_EVENT.PINCH]) {
                return;
            }

            rs = this._currentPinch ? this._currentPinch.rs : 0;
            if (rs > 0) {
                zoom = _.getPinchZoom(x, y, rs);

                this._emit(FROGEYE_EVENT.PINCH, event, {zoom: zoom});
            }
        },

        _detectRotate: function (x, y, event) {
            var rotate = this._currentRotate,
                angle;

            if (!this._options.events[FROGEYE_EVENT.ROTATE]) {
                return;
            }

            if (rotate) {
                angle = _.getRotateAngle(x, y, rotate.x, rotate.y, rotate.rs);
                this._emit(FROGEYE_EVENT.ROTATE, event, {angle: angle});
            }
        },

        _emit: function (type, srcEvent, data) {
            var event,
                handlerList = this._handlers[type],
                callback = this._options.onemit;

            if (!this._options.events[type]) { // if no need to recognize the event
                return;
            }

            event = {
                type: type,
                srcEvent: srcEvent
            };
            if (data && typeof data === "object") {
                _.extend(event, data);
            }

            if (handlerList) {
                _.each(handlerList, function (handler) {
                    handler(event);
                });
            }

            callback && callback.call(this._element, event);
        },

        /**
         * Add event listener
         * @param {String} event frogeye event
         * @param {Function} handler callback function to call when the event is triggered
         * @returns {Frogeye} Frogeye instance
         */
        on: function (event, handler) {
            var handlerList = this._handlers[event];

            if (!handlerList) {
                handlerList = this._handlers[event] = [];
            }

            handlerList.push(handler);

            return this; // for call in chain
        },

        /**
         * Remove event listener
         * @param {String} event frogeye event
         * @param {Function} handler callback function to call when the event is triggered. If handler is omitted, remove all handlers of the event.
         * @returns {Frogeye} Frogeye instance
         */
        off: function (event, handler) {
            var handlerList = this._handlers[event],
                len = handlerList ? handlerList.length : 0,
                i;

            if (!len) {
                return this;
            }

            if (handler === undefined) { // remove all the handlers of this event
                this._handlers[event] = [];
                return this;
            }

            for (i = 0; i < len; ) {
                if (handlerList[i] === handler) {
                    handlerList.splice(i, 1);
                    len--;
                } else {
                    i++;
                }
            }

            return this; // for call in chain
        }
    };

    if (typeof module === "object" && typeof exports === "object") {
        module.exports = Frogeye;
    } else if (window.Frogeye === undefined) {
        window.Frogeye = Frogeye;
    }
})();


