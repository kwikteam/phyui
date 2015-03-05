// ----------------------------------------------------------------------------
// Widgets
// ----------------------------------------------------------------------------

define(function(require) {
    widget = require('widgets/js/widget');
    manager = require('widgets/js/manager');
    clusterwidget = require('/nbextensions/phyui/d3clusterwidget.js');
    require('/nbextensions/phyui/utils.js');

    // Utility functions
    // ------------------------------------------------------------------------
    function _float_to_uint8(x) {
        // Convert a float in [0, 1] into a uint8 in [0, 255].
        return Math.floor(x * 255);
    }

    function _parse_color(color) {
        // Convert an array of float rgb values into a CSS string 'rgba(...)'.
        if (Array.isArray(color)) {
            var r = _float_to_uint8(color[0]).toString();
            var g = _float_to_uint8(color[1]).toString();
            var b = _float_to_uint8(color[2]).toString();
            return 'rgba({0}, {1}, {2}, 1)'.format(r, g, b);
        }
        return color;
    }

    // Cluster view
    // ------------------------------------------------------------------------
    var ClusterWidget = IPython.DOMWidgetView.extend({
        update_selection: function(selection) {
            console.log("update sel:", selection);
            this.model.set('value', selection, {updated_view: this});
            this.touch();
        },

        render: function(){
            var that = this;
            this.$el.addClass('cluster-container');
            this.mydiv = $("<div id='cv' style='width: 100%;'/>");
            this.mydiv.appendTo(this.$el);

            this.clusterd3 = new clusterwidget.D3ClusterWidget(this.mydiv[0], ['id', 'quality', 'nspikes']);
            this.clusterd3.onSelected = this.update_selection.bind(that); //we want this in update_selection to be ... that

            this.model.on('change:clusters',
                          this.clusters_changed, this);
            this.clusters_changed();
        },

        add_cluster: function(i) {
            this.clusterd3.redraw(this.model.get('clusters'));
        },

        clusters_changed: function() {
            this.clusterd3.redraw(this.model.get('clusters'));
        },
    });

    console.log("### registering the view");
    manager.WidgetManager.register_widget_view('ClusterWidget',
                                               ClusterWidget);

    return { 'ClusterWidget' : ClusterWidget };
});
