"use strict";


define(function(require) {

    var IPython = require('base/js/namespace');
    var $ = require('jquery');
    var kwiksession = require('nbextensions/phyui/notebook/js/session');

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
        var current = session.get('current');
        var flist = session.get('files');
        console.log('current:', current, 'filelists:', flist);

        $("#kwik-filelist-spinner").hide();
        $("#kwik-filelist-chooser").show();

        var $formflist = $('#kwik-form-filelist');
        $formflist.find('option').remove();
        var $sel = $formflist.find('select');
        for (var i = 0; i < flist.length; i++) {
            if (flist[i] == current)
                $sel.append('<option selected>' + flist[i] + '</option>');
            else
                $sel.append('<option>' + flist[i] + '</option>');
        }
    };

    var init_sidebar = function() {

        //Popover is tricky, we want to update it. so we manually trigger it, and show it again when we receive new data
        var choosefile  = $('<i id="choosefilebtn" class="fa fa-2x fa-folder-open"></i>');
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

        kwiksession.on_session().add(function(ses, err) {
          if (err) {
            set_status("error");
            set_error(err);
            console.error("session error:", err);
            return;
          }
          ses.on('change:status', function(model, value, opt) {set_status(value);});
          ses.on('change:status_desc', function(model, value, opt) {set_error(value);});
          ses.on('change:files', function(model, value, opt) { _on_filelist(ses); });
          set_status(ses.get("status"));
          set_error(ses.get("status_desc"));
          _on_filelist(ses);
        });


        var _wait_popover_htmlcontent =
            '<div id="kwik-open-dialog" title="Kwik Experiment">' +
            '  <div id="kwik-current-file">Current experiment: <span>None</span> <i id="kwik-filelist-close-file" class="fa fa-times-circle"></i></div>' +
            '  <div id="kwik-filelist-spinner"><i class="fa fa-4x fa-spinner fa-pulse"></i></div>' +
            '  <div id="kwik-filelist-chooser" style="display: none">' +
            '    <form id="kwik-form-filelist">' +
            '    <select style="width: 100%;" multiple></select>' +
            '  </div>' +
            '</div>';
        $(_wait_popover_htmlcontent).appendTo("body")

        $("#kwik-filelist-close-file").on('click', function(e) {
          $('#kwik-open-dialog').dialog('close');
          kwiksession.session().done(function(session) {
            session.send({event: 'close'});
          });
        });

        $('#kwik-open-dialog').dialog({ autoOpen: false,
                                        modal: true,
                                        minWidth: 640,
                                        show: { effect: "explode", duration: 500 },
                                        close: function( event, ui ) {},
                                        buttons: [{
                                            text: "Cancel",
                                            click: function() {
                                                $( this ).dialog( "close" );
                                            }
                                        },{
                                            text: "Open",
                                            click: function() {
                                                $( this ).dialog( "close" );
                                                var val = $('#kwik-open-dialog').find('option:selected').text();
                                                kwiksession.session().done(function(session) {
                                                  session.send({event: 'open', filename: val});
                                                });
                                            }
                                        }]
                                      });
        // $sel.change(function() {
        //     var val = $sel.find('option:selected').text();
        //     kwiksession.session().done(function(session) {
        //         session.set('current', val);
        //         //sync to the backend
        //         session.save();
        //     });
        // });

        choosefile.on("click", function(e) {
            $('#kwik-open-dialog').dialog("open");
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
