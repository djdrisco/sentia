define(['jquery','underscore','backbone','d3','klay','klayjsd3','colorbrewer','shared/d3layouts/packNetwork','layoutmanager'], function ($, _, Backbone, d3, klay, klayjsd3, colorbrewer, packNetwork) {
    var treeMapView = Backbone.Layout.extend({
        tagName: 'div',
        template: 'hierarchychart/hierarchyChart',
        initialize: function (options) {
            this.regionList = options.regionList;
        },
        regionList: null,
        afterRender: function () {
            console.log('hierarchyChart afterRender');


            // load the data and render the element


            var partStringJson = JSON.stringify(this.regionList);
            var graph = JSON.parse(partStringJson);


            //d3.json("/sentia/public/apps/bb/components/hierarchychart/views/hierarchy.json", function(error, graph) {
            //});

            //pack layout

            //var url = 'https://gist.githubusercontent.com/d3byex/25129228aa50c30ef01f/raw/11fe9418fba81e254ad0f629b592f9e33c3241c6/sales_rollup.json';

            //treemap
            var url = "/sentia/public/apps/bb/components/hierarchychart/views/hierarchyForTreeMap.json"

            var margin = {top: 40, right: 10, bottom: 10, left: 10},
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            var orangeScaleCategory = function(){
                return d3.scale.ordinal().range(colorbrewer.YlOrBr[9])
            }


            //var color = d3.scale.category20c();

            var color = orangeScaleCategory();

            var treemap = d3.layout.treemap()
                .size([width, height])
                .sticky(true)
                .padding([15, 15, 15, 15])
                .value(function(d) { return d.size; });

            var div = d3.select("body").append("div")
                .style("position", "relative")
                .style("width", (width + margin.left + margin.right) + "px")
                .style("height", (height + margin.top + margin.bottom) + "px")
                .style("left", margin.left + "px")
                .style("top", margin.top + "px");

            d3.json(url, function (error, data) {

                if (error) throw error;
                //treemap


                var node = div.datum(data).selectAll(".nodeTreemap")
                    .data(treemap.nodes)
                    .enter().append("div")
                    .attr("class", "nodeTreemap")
                    .call(position)
                    .style("background", function(d) {
                        return d.children ? color(d.name) : null;
                    })
                    .text(function(d) { return d.children ? d.name : d.name; });

                d3.selectAll("input").on("change", function change() {
                    var value = this.value === "count"
                        ? function() { return 1; }
                        : function(d) { return d.size; };

                    node
                        .data(treemap.value(value).nodes)
                        .transition()
                        .duration(1500)
                        .call(position);
                });

                function position() {
                    this.style("left", function(d) { return d.x + "px"; })
                        .style("top", function(d) { return d.y + "px"; })
                        .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
                        .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
                }

            });






        }
    });


    return treeMapView;
});

