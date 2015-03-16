

define([
    'base/js/namespace',
    'jquery',
], function(IPython, $) {
    "use strict";

    var resize_sidebar = function() {
        var sidebar = $('#cluster-sidebar');
        console.log("top:", (window.innerHeight - sidebar.height()) / 2);
        sidebar.css('top', (window.innerHeight - sidebar.height()) / 2 + 'px');
    }

    var init_sidebar = function() {
        var choosefile  = $('<i class="fa fa-2x fa-folder-open"></i>');
        var autocluster = $('<i class="fa fa-2x fa-mars-double"></i>');

        var sidebar = $('<div id="cluster-sidebar" style="float:left; position: fixed; top: 100px; width:100px; z-index:1000">')
            .append(choosefile).append('<br>')
            .append(autocluster).append('<br>');

        choosefile.on("click", function(e) {
            console.log("choose file");
        });

        autocluster.on("click", function(e) {
            console.log("manual clustering");
        });

        $('body').append(sidebar);

        $(window).resize(resize_sidebar);
        resize_sidebar();
        return sidebar;
    }

    init_sidebar();
});
