
define(function(require) {
    var widget = require("widgets/js/widget");
    var manager = require("widgets/js/manager");

    var SessionController = widget.WidgetView.extend({

        render: function(){
            console.log("render");
            window.bim = this;
            // var that = this;
            // this.$input = $('<input />');
            // this.$el.append(this.$input);
            // this.$spinner = this.$input.spinner({
            //     change: function( event, ui ) {
            //         that.handle_spin();
            //     },
            //     spin: function( event, ui ) {
            //         that.handle_spin();
            //     }
            // });

            // this.value_changed();
            // this.model.on('change:value', this.value_changed, this);
        },

        value_changed: function() {
            this.$spinner.spinner('value', this.model.get('value'));
        },

        handle_spin: function() {
            this.model.set('value', this.$spinner.spinner('value'));
            this.touch();
        },
    });

    return { 'SessionController' : SessionController };
});
