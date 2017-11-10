# Frogeye

### Introduction

**Frogeye** is a lightweight JavaScript library for recognizing gestures on touch devices, such as mobile phones.  Unlike [Hammer.js](http://hammerjs.github.io/), it is very small but can recognize many common gestures. Besides Frogeye usage is similar to Hammer.js. 

The gestures supported are listed in the table below:

| Events                    | Description                              |
| ------------------------- | ---------------------------------------- |
| tap                       | triggered when user taps                 |
| singletap                 | tap once                                 |
| doubletap                 | continuously tap twice in a short time   |
| press                     | tap and press for a short time           |
| swipe                     | swipe top/bottom/left/right              |
| panstart, panmove, panend | similar to touchstart, touchmove, touched |
| pinch                     | multitouch event with two fingers, zoom(scale) |
| rotate                    | multitouch event with two fingers, rotate |

### Installation

```shell
npm install --save frogeye
```

### Usage

#### Pure JavaScript

Frogeye is exported as a CommonJS module (working with Webpack). If CommonJS is not available, it is exported on global `window.Frogeye` variable.

To use Frogeye in pure JavaScript, you can follow the steps below:

- **Step 1: Import Frogeye**

To import Frogeye, add the code below in your HTML file:

```html
<script src="path/to/frogeye.js"></script>
```

Or in your JavaScript file:

```javascript
var Frogeye = require("path/to/frogeye.js");
```

- **Step 2: Create a Frogeye instance**


```javascript
var element = document.getElementById("image"),
    frogeye = new Frogeye(element);
```

- **Step 3: Add event listeners**

```javascript
frogeye.on("tap", function (event) {
    console.log("tap: ", event);
}).on("swipe", function (event) {
    console.log("swipe: ", event);
});
```

To put it all together:

```javascript
var element = document.getElementById("image"),
    frogeye = new Frogeye(element);

frogeye.on("tap", function (event) {
    console.log("tap: ", event);
}).on("swipe", function (event) {
    console.log("swipe: ", event);
});
```

#### jQuery/Zepto

Frogeye provides jQueyr/Zepto plugin ('plugins/frogeye.jquery.js' file ) to make it easy to use with jQuery or Zepto. You can follow the steps below to use it:

- **Step 1: Import Frogeye and its jQuery/Zepto plugin**

Plugin `frogeye.jquery.js` serve as both jQuery and Zepto plugin and can be used in both libraries.

```html
<script src="path/to/jquery.js_or_zepto.js"></script>
<script src="path/to/frogeye.js"></script>
<script src="path/to/plugins/frogeye.jquery.js"></script>
```

Or you can import them in JavaScript code.

- **Step 2: Call `frogeye` method on jQuery/Zepto instances and add event listeners**

```javascript
$("#image").frogeye()
      .on("tap", function (event, frogeyeEvent) {
        console.log("tap: ", frogeyeEvent);
      })
      .on("swipe", function (event, frogeyeEvent) {
          console.log("swipe: ", frogeyeEvent);
      });
```

#### Vue

Frogeye also provides Vue.js plugin('frogeye.vue.js' file) to make Frogeye better to use in Vue. It works by providing `v-frogeye` directives.

Below are the steps on how to use the plugin.

- **Step 1: Import Frogeye and its Vue plugin**

```html
<script src="path/to/vue/dist/vue.js"></script>
<script src="path/to/frogeye.js"></script>
<script src="path/to/plugins/frogeye.vue.js"></script>
```

Or you can import them in JavaScript code.

- **Step 2: Add `v-frogeye` directives in Vue template**

```html
<div id="#app">
    <img id="image" src="http://example.com/example.png" v-frogeye:tap="ontap" v-frogeye:swipe="onswipe">
</div>
```

- **Step 3: Implement event listeners in JavaScript**

```javascript
Vue.use(FrogeyeVue, {Frogeye: Frogeye});

new Vue({
    el: "#app",
    data: {},
    methods: {
        ontap: function (event) {
            console.log("tap: ", event);
        },
        onswipe: function (event) {
            console.log("swipe: ", event);
        }
    }
});
```


### API

#### Frogeye

```javascript
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
    function Frogeye(element, options)
```

This is the constructor function which is exported as a CommonJS module or in `window.Frogeye` global variable.

**Parameters**

| name    | type        | required | description                              |
| ------- | ----------- | -------- | ---------------------------------------- |
| element | HTMLElement | true     | HTML element on which to recognize gestures |
| options | Object      | false    | options used to control Frogeye behavior. |

By default, `pinch` and `rotate` event are not recognized. To recognize them, make sure add 'pinch' and 'rotate' to `options.events`, for example, pass options.events = ["tap", "pinch", "rotate"].

**Returns**

Returns Frogeye instance.

**Example**

```javascript
var element = document.getElementById("image"),
    frogeye = new Frogeye(element, {
        onemit: function (event) { // callback function to call when a gesture is recognized and emitted the event
        },
        events: ["tap", "swipe"], // only need tap and swipe event
        config: { // settings for recognizing gestures
            swipe: {
                velocity: 0.35
            }
        }
    });
```


#### frogeye.on

Frogeye instance method to add event listener.

```javascript
/**
 * Add event listener
 * @param {String} event frogeye event
 * @param {Function} handler callback function to call when the event is triggered
 */
function on(event, handler)
```

**Parameters**

| name    | type     | required | description                              |
| ------- | -------- | -------- | ---------------------------------------- |
| event   | String   | true     | Frogeye event such as 'tap', 'swipe'     |
| handler | Function | true     | callback function to call when the event is triggered |


**Returns**

Returns Frogeye instance.

**Example**

```javascript
var frogeye = new Frogeye(document.getElementById("#image"));

frogeye.on("tap", function (event) {
    console.log("tap: ", event);
}).on("swipe", function (event) {
    console.log("swipe: ", event);
});
```

#### frogeye.off

Frogeye instance method to remove event listener.

```javascript
/**
 * Remove event listener
 * @param {String} event frogeye event
 * @param {Function} handler callback function to call when the event is triggered. If handler is omitted, remove all handlers of the event.
 * @returns {Frogeye} Frogeye instance
 */
function off(event, handler)
```

**Parameters**

| name | type | required | description                              |
| -------------- | -------------- | -------- | ---------------------------------------- |
| event          | String         | true     | Frogeye event such as 'tap', 'swipe'     |
| handler        | Function       | false    | callback function to call when the event is triggered |


**Returns**

Returns Frogeye instance.

**Example**

```javascript
var frogeye = new Frogeye(document.getElementById("#image"));

var ontap = function (event) {
    console.log("tap: ", event);
};
frogeye.on("tap", ontap);

frogeye.off("tap", ontap);
```

#### frogeye.destroy

Frogeye instance method to destroy itself by removeing event listeners.

```javascript
/**
 * Destroy frogeye instance by removing event listeners.
 */
function destroy()
```

**Example**

```javascript
var frogeye = new Frogeye(document.getElementById("#image"));

frogeye.on("tap", function (event) {
    console.log("tap: ", event);
});

frogeye.destroy();
```
