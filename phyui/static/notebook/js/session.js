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
    var icall = require('nbextensions/phyui/notebook/js/call');

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

        // we close/reopen the model so it is reloaded in the frontend. otherwise
        // it's only loaded when the first notebook is loaded and reloading a notebook
        // do not works
        //icall.ipython_call('import IPython.display; import phyui; phyui.session().uimodel.close(); phyui.session().uimodel.open(); IPython.display.JSON([phyui.session().uimodel._model_id])', function(msg) {
        icall.ipython_call('import IPython.display; import phyui; phyui.session().iwant(); IPython.display.JSON([phyui.session().uimodel._model_id])', function(msg) {
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
          }, _kernel);
    };


    //reinit the session on kernel reconnection
    events.on('kernel_connected.Kernel', function(){
        //_init_session();
        _need_init = true;
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
