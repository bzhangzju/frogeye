Vue.use(FrogeyeVue, {Frogeye: Frogeye});

new Vue({
    el: "#app",
    data: {
        visible: true
    },
    methods: {
        toggle: function () {
            this.visible = !this.visible;
        },
        ontap: function (event) {
            console.log("tap: ", event);
        },
        ondoubletap: function (event) {
            console.log("doubletap: ", event);
        },
        onswipe: function (event) {
            console.log("swipe: ", event);
        }
    }
});