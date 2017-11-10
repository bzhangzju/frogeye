; (function ($) {
    var FROGEYE_KEY = "_frogeye_" + Date.now() + "_";

    /**
     * Frogeye jQuery/Zepto plugin
     */
    $.fn.frogeye = function (options) {
        var Frogeye = options && options.Frogeye || window.Frogeye; // Frogeye core


        function onemit(event) {
            $(this).triggerHandler(event.type, event);
        }

        this.each(function () {
            var $element = $(this),
                frogeye = $element.data(FROGEYE_KEY);

            if (!frogeye) {
                frogeye = new Frogeye(this, {onemit: onemit});
                $element.data(FROGEYE_KEY, frogeye);
            }
        });

        return this;
    };
})(window.jQuery || window.Zepto);