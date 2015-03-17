"use strict";


define(function(require) {

    var IPython = require('base/js/namespace');
    var $ = require('jquery');
    var icall = require('nbextensions/phyui/notebook/js/call');


    var resize_sidebar = function() {
        var sidebar = $('#cluster-sidebar');
        console.log("top:", (window.innerHeight - sidebar.height()) / 2);
        sidebar.css('top', (window.innerHeight - sidebar.height()) / 2 + 'px');
    };

    var _on_filelist = function(msg) {
        var flist = msg.content.data['application/json'];
        console.log('filelists:', flist);

        var $formflist = $('#filelist-chooser');


        $formflist.find('option').remove();
        var $sel = $formflist.find('select');
        for (var i = 0; i < flist.length; i++) {
            $sel.append('<option>' + flist[i] + '</option>').on('click', function() {
                icall.ipython_call('phyui.session.session().set_filename("' + flist[i] + '")');
                $('#choosefilebtn').popover('hide');
            });
        }

        $formflist.find('form').show();
        $formflist.find('i').hide();
        $('#choosefilebtn').popover();


        //RADIO button instead
        // $formflist
        //     .append('<div class="radio"><label><input type="radio" name="optradio">Option 1</label></div>')

    };

    var init_sidebar = function() {
        var choosefile  = $('<i id="choosefilebtn" class="fa fa-2x fa-folder-open"></i>').on("show.bs.popover", function(e) {
            console.log("choose file");

            var $formflist = $('#filelist-chooser');
            $formflist.find('form').hide();
            $formflist.find('i').show();

            icall.ipython_call('import phyui.session; phyui.session.session().list_kwik_files()', _on_filelist);
        });
        var traceview = $('<i class="fa fa-2x fa-eye"></i>').on("click", function(e) {
            console.log("traceview");
            icall.ipython_call('1 + 2');
        });
        var manualcluster = $('<i class="fa fa-2x fa-tasks"></i>').on("click", function(e) {
            icall.ipython_call('1 + 2ss');

            console.log("manual clustering");
        });
        var autocluster = $('<i id="autoclusterbtn" class="fa fa-2x fa-child"></i>').on("click", function(e) {


            // var htmlcontent = $(
            // '<div>' +
            //   '<i class="fa fa-4x fa-spinner fa-pulse"></i>' +
            //   '<form id="form-filelist" class="hidden">' +
            //     '<select class="selectpicker show-tick">' +
            //       '<option>Mustard</option>' +
            //       '<option>Ketchup</option>' +
            //       '<option>Relish</option>' +
            //     '</select>' +
            //   '</form>' +
            //   '<i class="fa fa-4x fa-spinner fa-pulse"></i>' +
            // '</div>');

            // // //$('#autoclusterbtn').popover('destroy');
            // // if (!$('#choosefilebtn').attr('aria-describedby')) {
            // $('#autoclusterbtn').popover({
            //     content: htmlcontent.html(),
            //     html: true,
            // });
            // }
            //$('#autoclusterbtn').popover('show');
            //     console.log('nooooo');
            //     $('#choosefilebtn').popover('show');
            // }

            //$('#autoclusterbtn').popover('toggle');


            console.log("autoclustering");
        });



        var sidebar = $('<div id="cluster-sidebar" style="float:left; position: fixed; z-index:1000">')
            .append(choosefile).append('<br>')
            .append(traceview).append('<br>')
            .append(manualcluster).append('<br>')
            .append(autocluster).append('<br>');

        $('body').append(sidebar);

        //Initialise the popover
        var htmlcontent = $(
            '<div><div id="filelist-chooser">' +
              '<form id="form-filelist">' +
                '<select class="selectpicker show-tick">' +
                  '<option>Mustard</option>' +
                  '<option>Ketchup</option>' +
                  '<option>Relish</option>' +
                '</select>' +
              '</form>' +
              '<i class="fa fa-4x fa-spinner fa-pulse"></i>' +
            '</div></div>');
        $('#choosefilebtn').popover({
            content: htmlcontent.html(),
            container: '#autoclusterbtn',
            //selector: '#autoclusterbtn',
            html: true,
        });

        $(window).resize(resize_sidebar);
        resize_sidebar();
        return sidebar;
    };

    init_sidebar();
});
