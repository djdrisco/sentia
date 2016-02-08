define(["app", "backbone", "components/home/homeApp", "components/networkchart/networkChartApp","components/networkchart/networkChartNonVpcsApp",
        "components/hierarchychart/hierarchyChartApp"],
    function (app, Backbone, homeApp, networkChartApp, networkChartNonVpcsApp, hierarchyChartApp) {
        var router = Backbone.Router.extend({
            routes:
            {
                "": "home",
                "/": "home",
                "home": "home",
                "networkChart": "networkChart",
                "/networkChart": "networkChart",
                "networkChartNonVpcs" :"networkChartNonVpcs",
                "/networkChartNonVpcs" :"networkChartNonVpcs",
                "hierarchyChart": "hierarchyChart",
                "/hierarchyChart": "hierarchyChart"
            },
            home: function() {
               homeApp();
            },
            networkChart: function() {
                networkChartApp();
            },
            networkChartNonVpcs: function() {
                networkChartNonVpcsApp();
            },
            hierarchyChart: function(){
                hierarchyChartApp();
            },
            initialize: function() {
            },
            render_complete: function(el) {
            },
            navigate: function (page) {
                //variable that stores which page is active
                this.app_model.set("active", page);
            }
        });
        return router;
    }
);
