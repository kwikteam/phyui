/* Simple wrapper around IPython kernel call
**
** Example:
**   require('ipython_kernel_call').call("python code", success_cb, error_cb);
*/
define(function(require) {
    "use strict";

    var IPython = require('base/js/namespace');
    var $ = require('jquery');

    var dolog = function(name) {
        console.log(name + ":", arguments);
    }

    var _handle_reply = function(success_cb, error_cb, msg) {
      if (msg.msg_type != "execute_reply") {
        console.log("ipython.call unhandled message type:", msg.msg_type);
        return;
      }
      if (msg.content.status == "error") {
        if (error_cb)
          error_cb(msg);
        else
          console.log("ipython.call error:", msg.content.ename, ":", msg.content.evalue);
        }
      else if (msg.content.status == "ok") {
        if (success_cb)
          success_cb(msg);
        }
    }

    var _handle_reply_output = function(success_cb, error_cb, msg) {
        if (msg.msg_type == "error") {
            if (error_cb)
                error_cb(msg);
            else
                console.log("ipython.call error:", msg.content.ename, ":", msg.content.evalue);
        }
        else if (msg.msg_type == "execute_result") {
            if (success_cb)
                success_cb(msg);
        }
        else {
            console.log("ipython.call unhandled message type:", msg.msg_type);
        }
    }

    //success_cb and error_cb will be called with a msg argument
    //useful fields:
    //   success : msg.content.data
    //   error   : msg.content.{ename,evalue}
    // kernel is optional
    // special is to be use for % command. the return value is not given the same way.
    var ipython_call = function(code, success_cb, error_cb, kernel) {
        var cbs = {
            shell : {
                reply : _handle_reply.bind(undefined, success_cb, error_cb),
                payload : {
                    set_next_input : dolog.bind(undefined, 'set_next_input'),
                    page : dolog.bind(undefined, 'page'),
                }
            },
            iopub : {
                output : _handle_reply_output.bind(undefined, success_cb, error_cb),
                clear_output : dolog.bind(undefined, 'clear_output'),
            },
            //input : dolog.bind(undefined, 'input'),
        };

        //special case for special % function.
        //we use the reply status. (which do not contain the data)
        //no way to have the return value and the correct reply status...
        if (code.indexOf("%") == 0) {
          cbs.iopub.output = undefined;
        } else {
          cbs.shell.reply = undefined;
        }

        try {
          if (!kernel)
            kernel = IPython.notebook.session.kernel;
          kernel.execute(code, cbs, { silent: false } );
        } catch (err) {
          error_cb( { msg_type: "error",
                      content: {
                        ename: "KernelError",
                        evalue: err,
                        traceback: ""
                      }
                    });
        }
    };

    return { 'call' : ipython_call };

});
