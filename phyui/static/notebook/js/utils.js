// ----------------------------------------------------------------------------
// Utility functions
// ----------------------------------------------------------------------------

define(function() {
    if (!String.prototype.format) {
        // String.format prototype.
        String.prototype.format = function() {
            var args = arguments;
                return this.replace(/{(\d+)}/g, function(match, number) {
                    return typeof args[number] != 'undefined'
                        ? args[number]
                        : match
                        ;
                });
        };
    }

    function load_css(url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    }

    return { load_css: load_css }

});
