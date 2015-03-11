/** This code is taken from notebook/js/notificationarea.js.
 *  it has been cleanup to remove everything not needed.
 */

define(function(require) {
    "use strict";

    var events = require('base/js/events'),
        notification_area = require('base/js/notificationarea');

    var MyNotificationArea = function(selector, options) {
        notification_area.NotificationArea.apply(this, [selector, options]);
    }

    MyNotificationArea.prototype = Object.create(notification_area.NotificationArea.prototype);

    function initKernelIndicator() {
        var $kernel_ind_icon = $("#kernel_indicator_icon");

        var mna = new MyNotificationArea("#notification_area", { events: events});
        var knw = mna.new_notification_widget('kernel');
        // Kernel events

        // this can be either kernel_created.Kernel or kernel_created.Session
        events.on('kernel_created.Kernel kernel_created.Session', function () {
            knw.info("Kernel Created", 500);
        });

        events.on('kernel_reconnecting.Kernel', function () {
            knw.warning("Connecting to kernel");
        });

        events.on('kernel_connection_dead.Kernel', function (evt, info) {
            knw.danger("Not Connected", undefined, function () {
                // schedule reconnect a short time in the future, don't reconnect immediately
                setTimeout($.proxy(info.kernel.reconnect, info.kernel), 500);
            }, {title: 'click to reconnect'});
        });

        events.on('kernel_connected.Kernel', function () {
            knw.info("Connected", 500);
        });

        events.on('kernel_restarting.Kernel', function () {
            knw.set_message("Restarting kernel", 2000);
        });

        events.on('kernel_autorestarting.Kernel', function (evt, info) {
            knw.danger("Dead kernel");
            $kernel_ind_icon.attr('class','kernel_dead_icon').attr('title','Kernel Dead');
        });

        events.on('kernel_interrupting.Kernel', function () {
            knw.set_message("Interrupting kernel", 2000);
        });

        events.on('kernel_disconnected.Kernel', function () {
            $kernel_ind_icon
                .attr('class', 'kernel_disconnected_icon')
                .attr('title', 'No Connection to Kernel');
        });

        events.on('kernel_connection_failed.Kernel', function (evt, info) {
        });

        events.on('kernel_killed.Kernel kernel_killed.Session', function () {
            knw.warning("No kernel");
            $kernel_ind_icon.attr('class','kernel_busy_icon').attr('title','Kernel is not running');
        });

        events.on('kernel_dead.Kernel', function () {
            knw.danger("Dead kernel", undefined, showMsg);
            $kernel_ind_icon.attr('class','kernel_dead_icon').attr('title','Kernel Dead');
        });

        events.on("no_kernel.Kernel", function (evt, data) {
            $("#kernel_indicator").find('.kernel_indicator_name').text("No Kernel");
        });

        events.on('kernel_dead.Session', function (evt, info) {
            $kernel_ind_icon.attr('class','kernel_dead_icon').attr('title','Kernel Dead');
            knw.danger(short, undefined, showMsg);
        });

        events.on('kernel_starting.Kernel kernel_created.Session', function () {
            $kernel_ind_icon.attr('class','kernel_busy_icon').attr('title','Kernel Busy');
            knw.set_message("Kernel starting, please wait...");
        });

        events.on('kernel_ready.Kernel', function () {
            $kernel_ind_icon.attr('class','kernel_idle_icon').attr('title','Kernel Idle');
            knw.info("Kernel ready", 500);
        });

        events.on('kernel_idle.Kernel', function () {
            $kernel_ind_icon.attr('class','kernel_idle_icon').attr('title','Kernel Idle');
        });

        events.on('kernel_busy.Kernel', function () {
            $kernel_ind_icon.attr('class','kernel_busy_icon').attr('title','Kernel Busy');
        });


        // Start the kernel indicator in the busy state, and send a kernel_info request.
        // When the kernel_info reply arrives, the kernel is idle.
        $kernel_ind_icon.attr('class','kernel_busy_icon').attr('title','Kernel Busy');
        console.log("kernel notification setup");
    };

    return { initKernelIndicator: initKernelIndicator };
});
