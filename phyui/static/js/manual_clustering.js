define(function (require) {
    "use strict";

    function GetURLParameter(sParam)
    {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++)
        {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam)
            {
                return sParameterName[1];
            }
        }
    }

    var notebook_name = GetURLParameter('notebook_name');
    var notebook_path = GetURLParameter('notebook_path');
    var kernel = GetURLParameter('kernel') || 'python2';
    var filename = GetURLParameter('filename');

    console.log('Connecting to name:', notebook_name, ' path:', notebook_path, ' kernel:', kernel, ' filename:', filename);



    var IPython = require('base/js/namespace');
    var $ = require('jquery');
    //var events = require("base/js/events");
    var dockspawn = require('/nbextensions/phyui/lib/dock-spawn/dist/js/dockspawn.js');
    //var codecell = require('notebook/js/codecell');
    var dockId = 0;

    var hm = require('/nbextensions/phyui/notebook/js/notebooksession.js');
    var kind = require('/nbextensions/phyui/notebook/js/kernel_indicator.js');

    var storeKey = 'manual_clustering_dockspawn_layout_state';

    // Convert a div to the dock manager. Panels can then be docked on to it
    //var divDockManager = document.getElementById('ipython-main-app');
    var divDockManager = document.getElementById('dockspawn-main');
    var dockManager = new dockspawn.DockManager(divDockManager);
    dockManager.initialize();


    var lastState = localStorage.getItem(storeKey);
    //lastState = undefined;
    if (lastState) {
        dockManager.loadState(lastState);
    }

    // Let the dock manager element fill in the entire screen
    window.onresize = function () {
        dockManager.resize(
            window.innerWidth - (divDockManager.clientLeft + divDockManager.offsetLeft),
            window.innerHeight - (divDockManager.clientTop + divDockManager.offsetTop)
        );
    };
    window.onresize();

    dockManager.addLayoutListener({
        onDock: function(self, dockNode)                   {localStorage.setItem(storeKey, dockManager.saveState());},
        onUndock:function(self, dockNode)                  {localStorage.setItem(storeKey, dockManager.saveState());},
        onCreateDialog:function(self, dialog)              {localStorage.setItem(storeKey, dockManager.saveState());},
        onChangeDialogPosition:function(self, dialog, x, y){localStorage.setItem(storeKey, dockManager.saveState());},
        onResumeLayout:function(self)                      {localStorage.setItem(storeKey, dockManager.saveState());},
        onClosePanel:function(self, panel)                 {localStorage.setItem(storeKey, dockManager.saveState());},
        onHideDialog:function(self, dialog)                {localStorage.setItem(storeKey, dockManager.saveState());},
        onShowDialog:function(self, dialog)                {localStorage.setItem(storeKey, dockManager.saveState());},
        onTabsReorder:function(self, dockNone)             {localStorage.setItem(storeKey, dockManager.saveState());}
    });

    if (!lastState) {
        var ph1 = new dockspawn.PanelContainer(document.getElementById("placeholder1"), dockManager);
        var ph2 = new dockspawn.PanelContainer(document.getElementById("placeholder2"), dockManager);
        var ph3 = new dockspawn.PanelContainer(document.getElementById("placeholder3"), dockManager);
        var ph4 = new dockspawn.PanelContainer(document.getElementById("placeholder4"), dockManager);

        var documentNode = dockManager.context.model.documentManagerNode;
        dockManager.dockFill(documentNode, ph1);
        var rr = dockManager.dockRight(documentNode, ph2, 0.20);
        dockManager.dockDown(rr, ph3, 0.30);
        dockManager.dockDown(rr, ph4, 0.30);
    }

    var panels = dockManager.getPanels();
    var navbar_win = $('#navbar_windows');
    panels.forEach(function(p) {
        $('<li><a href="#">' + p.title + '</a></li>')
            .prependTo(navbar_win)
            .on('click', function(c) {
                console.log("Panel", p.title, " clicked");
                if (dockManager.getVisiblePanels().indexOf(p) != -1) {
                    console.log("Panel", p.title, " already visible");
                } else {
                    dockManager.floatDialog(p, 100, 100);
                }
            });
    });



    $('#windows_refresh').on('click', function(c) {
        localStorage.setItem(storeKey, '');
        location.reload();
    });

    //
    var myhack = new hm.HackMe(notebook_name, notebook_path, kernel);
    myhack.start();
    $('#restart_kernel').on('click', function(c) {
        myhack.session.kernel.restart();
    });


    var events = require('base/js/events');


    events.on('kernel_connected.Kernel', function(){

        $('#placeholder1').children().remove();
        $('#placeholder2').children().remove();
        $('#placeholder3').children().remove();
        $('#placeholder4').children().remove();

        console.log('session done');
        myhack.create_result_cell('#placeholder1', "import phyui; phyui.session().show_clusters();");
        var cc = myhack.create_result_cell('#placeholder2', "import phyui; phyui.session().show_waveforms();");

        //bind the dockspawn resizeHandler event to vispy
        $('#placeholder2')[0].resizeHandler = function(x, y) {
                //console.log("resize handler create_cell", x, "x", y);
            // cc.element.find('.widget-subarea').find("canvas").css('height', y - 20);
            try {
                cc.element.find('.widget-subarea div')[0].resizeHandler(x - 10, y - 10);
            } catch(err) {
                //the element is not always defined..
                //console.log("resizeHandler placeholder2 err:", err);
            }
        }


        myhack.create_cell('#placeholder3');
        myhack.create_cell('#placeholder4');
    });
    kind.initKernelIndicator();
});
