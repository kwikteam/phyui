// Where everything starts...
// Load a UISession and establish the connection between the frontend
// and the backend

// - the phyui.session() call initialise the backbone uimodel.
// - session and on_session both return the backbone UIModel corresponding
//   to the python class phyui.session().uimodel
//
// to use it:
// require('session').session()
//    .done(function(ses) { ses.get('current') })
//    .fail(function(err) { console.log(err) });
//

// Another method is provided to help initialising code that depends on
// on the session.
// require('session').on_session().add(function(ses) {
//   ses.on('change:myvalue', myvaluecallback)
//})

define(function(require) {
    "use strict";

    var IPython = require('base/js/namespace');
    var events = require('base/js/events');
    var $ = require('jquery');
    var icall = require('nbextensions/phyui/notebook/ipython_kernel_call');

    var prom_session = undefined;
    var on_session = $.Callbacks("memory");
    var _need_init = true;
    var _kernel = undefined;

    var _init_session = function() {
        if (!_need_init)
          return;
        _need_init = false;
        if (prom_session)
          prom_session.reject("session has been reinitialised");
        //reinit for each new session
        prom_session = $.Deferred();

        // create a new model for each session, or the backbone model in the frontend is not always initialised
        // currently this destroy the old one. (store in an array to avoid that behavior)
        icall.call('import IPython.display\n' +
                   'import phyui.ipython\n' +
                   'import phyui\n' +
                   'current_session_model = phyui.ipython.ClusteringSessionModel(phyui.session())\n' +
                   'IPython.display.JSON([current_session_model._model_id])\n'
        , function(msg) {
            var mid = msg.content.data['application/json'][0];
            console.log("SessionModel id:", mid);
            var prom = IPython.notebook.session.kernel.widget_manager.get_model(mid);
            if (prom) {
                prom.then(function(data) {
                    console.log("SessionModel found!!!!");
                    prom_session.resolve(data);
                    on_session.fire(data, undefined);
                });
            } else {
                console.log("cannot find the promise for the session controller.");
                prom_session.reject("no model found for the session");
                on_session.fire(undefined, "no model found for the session");
            }
          }, function(msg) {
              prom_session.reject("error: " + msg.content.ename + ": " + msg.content.evalue, "\n", msg.content.traceback);
              on_session.fire(undefined, "error: " + msg.content.ename + ": " + msg.content.evalue, "\n", msg.content.traceback);
          }, _kernel);
    };


    //reinit the session on kernel reconnection
    events.on('kernel_connected.Kernel', function(){
        _need_init = true;
        _init_session();
    });


    //use a function to keep prom_session dynamic.
    //its reinit by _init_session when the kernel reload
    var _get_session = function() {
      _init_session();
      return prom_session.promise();
    }

    //wrapper function not needed but used for coherency with _get_session
    var _get_on_session = function() {
      _init_session();
      return on_session;
    }

    var _set_kernel = function(kernel) {
      _kernel = kernel;
    }

    return { 'session' : _get_session,  //fired only once, use when session is needed
             'on_session' : _get_on_session, //fired for each session, use for setup
             'set_kernel' : _set_kernel,
           };
});
