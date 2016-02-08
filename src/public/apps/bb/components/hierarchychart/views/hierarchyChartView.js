define(['jquery','underscore','backbone','d3','klay','klayjsd3','layoutmanager'], function ($, _, Backbone, d3, klay, klayjsd3) {
    var hierarchyChartView = Backbone.Layout.extend({
        tagName: 'div',
        template: 'hierarchychart/hierarchyChart',
        initialize: function (options) {
            this.regionList = options.regionList;
        },
        regionList: null,
        afterRender: function () {
            console.log('hierarchyChart afterRender');

            //add example logic here
            //helper functions
            function viewport() {
                var e = window,
                    a = 'inner';
                if (!('innerWidth' in window)) {
                    a = 'client';
                    e = document.documentElement || document.body;
                }
                return {
                    width: e[a + 'Width'],
                    height: e[a + 'Height']
                }
            }

            function redraw() {
                svg.attr("transform", "translate(" + d3.event.translate + ")"
                    + " scale(" + d3.event.scale + ")");
            }

            var width = viewport().width,
                height = viewport().height;
            var zoom = d3.behavior.zoom()
                .on("zoom", redraw);
            var idfun = function(d) { return d.id; };

            var svg = d3.select("body")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .call(zoom)
                .append("g");

            // group shizzle
            var root = svg.append("g");

            var debugKlay = klayjsd3;

            var layouter = klayjsd3.d3kgraph()
                .size([width, height])
                .transformGroup(root)
                .options({
                    direction: "DOWN",
                    edgeRouting: "ORTHOGONAL"
                });
           //TODO try changing aspectRatio: 0.7 to 1.6


            // load the data and render the element

            //var itemArrayJson = regionArea.toJSON();
            var partStringJson = JSON.stringify(this.regionList);
            var graph = JSON.parse(partStringJson);
            //var graph = this.regionList;
            //d3.json("/sentia/public/apps/bb/components/hierarchychart/views/hierarchy.json", function(error, graph) {

                layouter.on("finish", function(d) {

                    var nodes = layouter.nodes();
                    var links = layouter.links(nodes);

                    var linkData = root.selectAll(".link")
                        .data(links, idfun);
                    var link = linkData.enter()
                        .append("path")
                        .attr("class", "link")
                        .attr("d", "M0 0");

                    var nodeData = root.selectAll(".node")
                        .data(nodes, idfun);
                    var node = nodeData.enter()
                        .append("g")
                        .attr("class", function(d) {
                            if (d.children) return "node compound"; else return "node leaf";
                        });

                    var atoms = node.append("rect")
                        .attr("width", 10)
                        .attr("height", 10)
                        .attr("x", 0)
                        .attr("y", 0);

                    node.append("title")
                        .text(function(d) { return d.id; });

                    node.append("text")
                        .attr("font-size","4px")
                        .attr("font-weight","bold")
                        .text(function(d){
                            if(d.labels!== undefined) {
                                if (_.isArray(d.labels)) {
                                    if (d.labels.length > 0 && d.labels[0].text !== undefined) {
                                        return d.labels[0].text;
                                    }
                                    else {
                                        return "";
                                    }
                                }
                                else {
                                    return "";
                                }
                            }
                            else{
                                return "";
                            }
                        });


                    // apply edge route
                    link.transition().attr("d", function(d) {
                        var path = "";
                        path += "M" + d.sourcePoint.x + " " + d.sourcePoint.y + " ";
                        (d.bendPoints || []).forEach(function(bp, i) {
                            path += "L" + bp.x + " " + bp.y + " ";
                        });
                        path += "L" + d.targetPoint.x + " " + d.targetPoint.y + " ";
                        return path;
                    });

                    // apply node positions
                    node.transition()
                        .attr("transform", function(d) { return "translate(" + (d.x || 0) + " " + (d.y || 0) + ")"});

                    atoms.transition()
                        .attr("width", function(d) { return d.width; })
                        .attr("height", function(d) { return d.height; });
                });

                layouter.kgraph(graph);

            //});

        }
    });


    return hierarchyChartView;
});
