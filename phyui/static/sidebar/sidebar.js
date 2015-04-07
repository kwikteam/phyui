"use strict";


define(function(require) {

    var IPython = require('base/js/namespace');
    var $ = require('jquery');
    var kwiksession = require('nbextensions/phyui/notebook/js/session');

    //Initialise the popover
    var _wait_popover_htmlcontent =
        '<div><div id="filelist-chooser">' +
            '<i class="fa fa-4x fa-spinner fa-pulse"></i>' +
        '</div></div>';


    var resize_sidebar = function() {
        var sidebar = $('#cluster-sidebar');
        sidebar.css('top', (window.innerHeight - sidebar.height()) / 2 + 'px');
    };

    var _on_filelist_error = function(err) {
        var $formflist = $(
            '<div><div id="filelist-chooser">' +
                err +
            '</div></div>');
        var popover = $('#choosefilebtn').data('bs.popover');
        popover.options.content = $formflist.html();
        popover.show();
    }

    var _on_filelist = function(session) {

        //var data = msg.content.data['application/json'];
        //var current = data[0];
        //var flist = data[1];
        var current = session.get('current');
        var flist = session.get('files');
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
            kwiksession.session().done(function(session) {
                session.set('current', val);
                //sync to the backend
                session.save();
            });
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
            kwiksession.session().then(_on_filelist, _on_filelist_error);
        });

        var statusico = $('<i class=""></i>');

        var set_status = function(status) {
          if (status == "open") {
            statusico.attr("class", "fa fa-check");
          } else if (status == "opening") {
            statusico.attr("class", "fa fa-spinner fa-spin");
          } else if (status == "close") {
            statusico.attr("class", "fa fa-close");
          } else if (status == "error") {
            statusico.attr("class", "fa fa-exclamation");
          }
        }

        var set_error = function(err) {
          statusico.tooltip({ title: err});
          choosefile.tooltip({ title: err});
        }

        kwiksession.on_session().add(function(ses) {
          ses.on('change:status', function(model, value, opt) {set_status(value);});
          ses.on('change:status_desc', function(model, value, opt) {set_error(value);});
          set_status(ses.get("status"));
          set_error(ses.get("status_desc"));

        }, function(err) {
          set_status("error");
          set_error(err);
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
            var notebook_name = IPython.notebook.notebook_name;
            var notebook_path = IPython.notebook.notebook_path;
            window.open('/nbextensions/phyui/manual_clustering.html?notebook_name=' + notebook_name + '&notebook_path=' + notebook_path);
        });



        var sidebar = $('<div id="cluster-sidebar" style="float:left; position: fixed; z-index:1000">')
            .append(choosefile).append(statusico).append('<br>')
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
