; (function () {
    var FROGEYE_KEY = "_frogeye_" + Date.now() + "_";

    /**
     * Frogeye Vue plugin
     */
    var FrogeyeVue = {
        install: function (Vue, options) {
            var Frogeye = options.Frogeye || window.Frogeye; // Frogeye core

            function getFrogeye(element) {
                return element[FROGEYE_KEY];
            }

            function getOrCreateFrogeye (element) {
                var frogeye = element[FROGEYE_KEY];

                if (frogeye === undefined) {
                    frogeye = element[FROGEYE_KEY] = new Frogeye(element);
                }

                return frogeye;
            }

            function bind(element, binding) {
                var event = binding.arg,
                    handler = binding.value,
                    oldHandler = binding.oldValue,
                    frogeye = getOrCreateFrogeye(element);

                if (oldHandler) {
                    frogeye.off(event, oldHandler);
                }

                frogeye.on(event, handler);
            }

            Vue.directive("frogeye", {
                bind: bind,

                update: bind,

                unbind: function (element, binding) {
                    var event = binding.arg,
                        handler = binding.value,
                        frogeye = getFrogeye(element);

                    if (frogeye) {
                        frogeye.off(event, handler);
                    }
                    // TODO: decide when to destroy frogeye
                }
            });
        }
    };

    if (typeof module === "object" && typeof exports === "object") {
        module.exports = FrogeyeVue;
    } else if (window.FrogeyeVue === undefined) {
        window.FrogeyeVue = FrogeyeVue;
    }
})();

