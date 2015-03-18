"use strict";


define(function(require) {

    var IPython = require('base/js/namespace');
    var $ = require('jquery');
    var icall = require('nbextensions/phyui/notebook/js/call');


            //Initialise the popover
    var _wait_popover_htmlcontent =
        '<div><div id="filelist-chooser">' +
            '<i class="fa fa-4x fa-spinner fa-pulse"></i>' +
        '</div></div>';


    var resize_sidebar = function() {
        var sidebar = $('#cluster-sidebar');
        console.log("top:", (window.innerHeight - sidebar.height()) / 2);
        sidebar.css('top', (window.innerHeight - sidebar.height()) / 2 + 'px');
    };

    var _on_filelist_error = function(msg) {
        var $formflist = $(
            '<div><div id="filelist-chooser">' +
                msg.content.ename + ':' + msg.content.evalue +
            '</div></div>');
        var popover = $('#choosefilebtn').data('bs.popover');
        popover.options.content = $formflist.html();
        popover.show();
    }

    var _on_filelist = function(msg) {
        var data = msg.content.data['application/json'];
        var current = data[0];
        var flist = data[1];
        console.log('current:', current, 'filelists:', flist);

        var popover = $('#choosefilebtn').data('bs.popover');

        var $formflist = $(
            '<div><div id="filelist-chooser">' +
              '<form id="form-filelist">' +
                '<select class="selectpicker show-tick">' +
                  '<option>Mustard</option>' +
                  '<option>Ketchup</option>' +
                  '<option>Relish</option>' +
                '</select>' +
              '</form>' +
              // '<i class="fa fa-4x fa-spinner fa-pulse"></i>' +
            '</div></div>');

        $formflist.find('option').remove();
        var $sel = $formflist.find('select');
        for (var i = 0; i < flist.length; i++) {
            if (flist[i] == current)
                $sel.append('<option selected>' + flist[i] + '</option>');
            else
                $sel.append('<option>' + flist[i] + '</option>');
        }
        $sel.change(function() {
            var val = $sel.find('option:selected').text();
            icall.ipython_call('phyui.session.session().open("' + val + '")');
            popover.hide();
        });

        popover.options.content = $formflist;
        popover.show();
    };

    var init_sidebar = function() {

        //Popover is tricky, we want to update it. so we manually trigger it, and show it again when we receive new data
        var choosefile  = $('<i id="choosefilebtn" class="fa fa-2x fa-folder-open"></i>').on("click", function(e) {
            console.log("choose file");
            var popover = $('#choosefilebtn').data('bs.popover');
            if (popover.tip().hasClass('in')) { //shown. condition comes from popover.js: toggle()
                console.log("popover hide");
                popover.hide();
                return;
            }
            console.log("popover show");
            popover.options.content = _wait_popover_htmlcontent;
            popover.show();
            icall.ipython_call('import phyui.session; phyui.session.session().list_kwik_files()', _on_filelist, _on_filelist_error);
        });
        //initialise the popover
        choosefile.popover({
            content: _wait_popover_htmlcontent,
            trigger: 'manual',
            html: true,
        });

        var traceview = $('<i class="fa fa-2x fa-eye"></i>').on("click", function(e) {
            console.log("traceview");
            //icall.ipython_call('1 + 2');
        });
        var autocluster = $('<i class="fa fa-2x fa-tasks"></i>').on("click", function(e) {
            //icall.ipython_call('1 + 2ss');
            console.log("auto clustering");
        });
        var manualcluster = $('<i id="autoclusterbtn" class="fa fa-2x fa-child"></i>').on("click", function(e) {
            console.log("manual clustering");
        });



        var sidebar = $('<div id="cluster-sidebar" style="float:left; position: fixed; z-index:1000">')
            .append(choosefile).append('<br>')
            .append(traceview).append('<br>')
            .append(autocluster).append('<br>')
            .append(manualcluster).append('<br>')
        ;

        $('body').append(sidebar);


        $(window).resize(resize_sidebar);
        resize_sidebar();
        return sidebar;
    };

    init_sidebar();
});
