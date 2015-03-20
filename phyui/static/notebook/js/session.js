// Where everything starts...
// Load a UISession and establish the connection between the frontend
// and the backend

// - the phyui.session.session() call initialise the backbone uimodel.
// - session and on_session both return the backbone UIModel corresponding
//   to the python class phyui.session.session().uimodel
//
// to use it:
// require('session').session()
//    .done(function(ses) { ses.get('current') })
//    .fail(function(err) { console.log(err) });
//

// Another method is provided to help initialising code that depends on
// on the session.
// require('session').on_session(function(ses) {
//   ses.on('change:myvalue', myvaluecallback)
//})

define(function(require) {
    "use strict";

    var IPython = require('base/js/namespace');
    var events = require('base/js/events');
    var $ = require('jquery');
    var icall = require('nbextensions/phyui/notebook/js/call');

    var prom_session = undefined;
    var on_session = $.Callbacks("memory");

    var _init_session = function() {
        if (prom_session)
          prom_session.reject("session has been reinitialised");
        //reinit for each new session
        prom_session = $.Deferred();

        // we close/reopen the model so it is reloaded in the frontend. otherwise
        // it's only loaded when the first notebook is loaded and reloading a notebook
        // do not works
        icall.ipython_call('import IPython.display; import phyui.session; phyui.session.session().uimodel.close(); phyui.session.session().uimodel.open(); IPython.display.JSON([phyui.session.session().uimodel._model_id])', function(msg) {
            var mid = msg.content.data['application/json'][0];
            console.log("SessionModel id:", mid);
            var prom = IPython.notebook.session.kernel.widget_manager.get_model(mid);
            if (prom) {
                prom.then(function(data) {
                    console.log("SessionModel found!!!!");
                    prom_session.resolve(data);
                    on_session.fire(data);
                });
            } else {
                console.log("cannot find the promise for the session controller.");
                prom_session.reject("no model found for the session");
            }
          }, function(msg) {
              prom_session.reject("error: " + msg.content.ename + ": " + msg.content.evalue, "\n", msg.content.traceback);
          });
    };

    //reinit the session on kernel reconnection
    events.on('kernel_connected.Kernel', function(){
      _init_session();
    });

    _init_session();

    //use a function to keep prom_session dynamic.
    //its reinit by _init_session when the kernel reload
    var _get_session = function() {
      return prom_session.promise();
    }

    return { 'session' : _get_session,  //fired only once, use when session is needed
             'on_session' : on_session, //fired for each session, use for setup
           };
});
