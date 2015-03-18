

define(function(require) {
    "use strict";

    var IPython = require('base/js/namespace');
    var $ = require('jquery');
    var icall = require('nbextensions/phyui/notebook/js/call');

    var prom_session = $.Deferred();

    //where everything starts...
    // - the phyui.session.session() call initialise the backbone uimodel.
    // - the uimodel is returned through prom_session
    //
    // to use it:
    // require('session').session
    //    .done(function(ses) { ses.get('current') })
    //    .fail(function(err) { console.log(err) });
    //
    var _init_session = function() {

        icall.ipython_call('import IPython.display; import phyui.session; IPython.display.JSON([phyui.session.session().uimodel._model_id])', function(msg) {
            var mid = msg.content.data['application/json'][0];
            console.log("SessionModel id:", mid);
            var prom = IPython.notebook.session.kernel.widget_manager.get_model(mid);
            if (prom) {
                prom.then(function(data) {
                    console.log("SessionModel found!!!!");
                    prom_session.resolve(data);
                });
            } else {
                console.log("cannot find the promise for the session controller.");
                prom_session.reject("no model found for the session");
            }
          }, function(msg) {
              prom_session.reject("error: " + msg.content.ename + ": " + msg.content.evalue, "\n", msg.content.traceback);
          });
    };

    _init_session();

    return { 'session' : prom_session };
});
