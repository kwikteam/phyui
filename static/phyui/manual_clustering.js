define(function (require) {
    "use strict";

    var IPython = require('base/js/namespace');
    var $ = require('jquery');
    //var events = require("base/js/events");
    var dockspawn = require('/nbextensions/phy/static/dock-spawn/dist/js/dockspawn.js');
    //var codecell = require('notebook/js/codecell');
    var dockId = 0;

    var hm = require('/nbextensions/phy/static/notebooksession.js');

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
        onShowDialog:function(self, dialog)                {localStorage.setItem(storeKey, dockManager.saveState());}
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

    var myhack = new hm.HackMe('proto_kwik.ipynb', 'proto/proto_kwik.ipynb');
    myhack.start();
    var events = require('base/js/events');

    events.on('kernel_connected.Kernel', function(){
        console.log('session done');
        myhack.create_result_cell('#placeholder1', "from phy.cluster.manual.interface import start_manual_clustering; session = start_manual_clustering('/home/ctaf/src/cortex/data/test_hybrid_120sec.kwik', backend='ipynb_webgl')");
        myhack.create_result_cell('#placeholder2', "import vispy; \
                                                    vispy.app.use_app('ipynb_webgl'); \
                                                    w = session.show_waveforms()");
        myhack.create_cell('#placeholder3', "from phy.cluster.manual.interface import start_manual_clustering; session = start_manual_clustering('/home/ctaf/src/cortex/data/test_hybrid_120sec.kwik', backend='ipynb_webgl')");
        myhack.create_cell('#placeholder4');
    });
});
