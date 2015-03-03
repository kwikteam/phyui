// main entry point for loading a session

define(function(require) {
    "use strict";

    var IPython = require('base/js/namespace');
    var session = require('services/sessions/session');
    var $ = require('jquery');
    var events = require('base/js/events');
    var manager = require('widgets/js/manager');
    var codecell = require('notebook/js/codecell');
    var configmod = require('services/config');
    var actions = require('notebook/js/actions');
    var keyboardmanager = require('notebook/js/keyboardmanager');

    var acts = new actions.init();
    var keyboard_manager = new keyboardmanager.KeyboardManager({
        pager: undefined, //is that needed?
        events: events,
        actions: acts });

    console.log("loading ... in progress");

    //fake notebook because session API rely on notebook
    //TODO: remove the need to rely on Notebook in session
    var FakeNotebook = function() {
        this.events = events;              //session ctor
        this.keyboard_manager = keyboard_manager; //widget_manager ctor

        //needed to display widget
        FakeNotebook.prototype.get_msg_cell = function (msg_id) {
            return codecell.CodeCell.msg_cells[msg_id] || null;
        };

        //needed to display widget
        FakeNotebook.prototype.find_cell_index = function () {
            return 42;
        };
    };

    var HackMe = function(nbname, nbpath) {
        this.notebook_name = nbname;
        this.notebook_path = nbpath;
        this.base_url = '/';
        this.ws_url = location.protocol.replace('http', 'ws') + "//" + location.host; //undefined should works once https://github.com/ipython/ipython/pull/7763 is merged
        this.events = events;


        // #Needed for codecell.config... or it crash on autohighlight
        var common_options = {
            base_url: this.base_url,
            ws_url: this.ws_url,
            notebook_path: this.notebook_path,
            notebook_name: this.notebook_name,
        };
        this.config_section = new configmod.ConfigSection('notebook', common_options);
        this.config_section.load();
        // #!

        function genlog(msg) {
            return function logme() {
                console.log(msg, " (args:", arguments, ")");
            };
        }

        HackMe.prototype.start = function () {
            var that = this;
            this.notebook = new FakeNotebook();

            var options = {
                base_url: this.base_url,
                ws_url: this.ws_url,
                notebook_path: this.notebook_path,
                notebook_name: this.notebook_name,
                kernel_name: 'python3',
                notebook: this.notebook //TODO: remove
            };


            var prom = $.Deferred();
            this.session = new session.Session(options);
            this.session.start(function() {
                that.widget_manager = that.session.kernel.widget_manager;
                prom.resolve();
            }, prom.reject);

            return prom;
        };

        HackMe.prototype.create_cell = function(placeholder, codetorun) {
            var options = {
                events: this.events,
                config: this.config_section,
                keyboard_manager: keyboard_manager,
                notebook: this.notebook,
                tooltip: undefined
            };

            var cc = new codecell.CodeCell(this.session.kernel, options);
            cc.set_text(codetorun || '');
            var btn = $('<input type="button" id="field" value="Execute"/>');
            btn.on("click", function() {
                console.log('clicked');
                cc.execute();
            });
            $(placeholder).append(btn);
            $(placeholder).append(cc.element);
            return cc;
        };

        HackMe.prototype.create_result_cell = function(placeholder, codetorun) {
            var options = {
                events: this.events,
                config: this.config_section,
                keyboard_manager: keyboard_manager,
                notebook: this.notebook,
                tooltip: undefined
            };

            var cc = new codecell.CodeCell(this.session.kernel, options);
            cc.set_text(codetorun || '');
            // var btn = $('<input type="button" id="field" value="Execute"/>');
            // btn.on("click", function() {
            //     console.log('clicked');
            //     cc.execute();
            // });
            // $(placeholder).append(btn);
            cc.element.find('.input').hide();
            cc.element.find('.prompt').hide();
            //$(placeholder).append(cc.output_area.element);
            $(placeholder).append(cc.element);
            //cc.output_area.prompt_overlay.hide();
            cc.execute();
            return cc;
        };

    }; //end class
    console.log("loading ... done");

    return { 'HackMe' : HackMe };
});
