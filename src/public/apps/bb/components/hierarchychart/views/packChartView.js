define(['jquery','underscore','backbone','d3','klay','klayjsd3','colorbrewer','shared/d3layouts/packNetwork','layoutmanager'], function ($, _, Backbone, d3, klay, klayjsd3, colorbrewer, packNetwork) {
    var packChartView = Backbone.Layout.extend({
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
            //function viewport() {
            //    var e = window,
            //        a = 'inner';
            //    if (!('innerWidth' in window)) {
            //        a = 'client';
            //        e = document.documentElement || document.body;
            //    }
            //    return {
            //        width: e[a + 'Width'],
            //        height: e[a + 'Height']
            //    }
            //}
            //
            //function redraw() {
            //    svg.attr("transform", "translate(" + d3.event.translate + ")"
            //        + " scale(" + d3.event.scale + ")");
            //}
            //
            //var width = viewport().width,
            //    height = viewport().height;
            //
            //var zoom = d3.behavior.zoom()
            //    .on("zoom", redraw);
            //var idfun = function(d) { return d.id; };




            // load the data and render the element


            var partStringJson = JSON.stringify(this.regionList);
            var graph = JSON.parse(partStringJson);


            //d3.json("/sentia/public/apps/bb/components/hierarchychart/views/hierarchy.json", function(error, graph) {
            //});

            //pack layout

            //var url = 'https://gist.githubusercontent.com/d3byex/25129228aa50c30ef01f/raw/11fe9418fba81e254ad0f629b592f9e33c3241c6/sales_rollup.json';

            //treemap
            var url = "/sentia/public/apps/bb/components/hierarchychart/views/flareTreeMap.json"

            var margin = {top: 40, right: 10, bottom: 10, left: 10},
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            //colorbrewer example
           // d3.scale.category10 = function() {
           //     return d3.scale.ordinal().range(d3_category10);
            //};

            //var o = d3.scale.ordinal()
            //    .domain(["foo", "bar", "baz"])
            //    .range(colorbrewer.RdBu[9]);

            var orangeScaleCategory = function(){
                return d3.scale.ordinal().range(colorbrewer.YlOrBr[9])
            }

            var colorTest = colorbrewer.RdBu[9];

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
                    .text(function(d) { return d.children ? null : d.name; });

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



                //custom packnetwork layout
                //var diameter = 500;
                //
                //var svg = d3.select('body')
                //    .append('svg')
                //    .attr({
                //        width: diameter,
                //        height: diameter
                //    });
                //var pack = d3.layout.packnetwork()
                //    .size([diameter, diameter])
                //    .value(function (d) { return d.value; });
                //
                //var nodes = svg.datum(data)
                //    .selectAll('g')
                //    .data(pack.nodes)
                //    .enter()
                //    .append('g')
                //    .attr('transform', function (d) {
                //        return 'translate(' + d.x + ',' + d.y + ')';
                //    });



                //nodes.append('circle')
                //    .each(function (d) {
                //        d3.select(this)
                //            .attr({
                //                r: d.r,
                //                fill: d.children ? 'rgb(31, 119, 180)' : '#ff7f0e',
                //                'fill-opacity': d.children ? 0.25 : 1.0,
                //                stroke: d.children ? 'rgb(31, 119, 180)' : 'none'
                //            });
                //    });

                //example rect
                //nodes.append('rect')
                //    .each(function (d) {
                //        var width = d.r * 2;
                //        var height = d.r *2;
                //        d3.select(this)
                //            .attr({
                //                width: width,
                //                height: height,
                //                fill: d.children ? 'rgb(31, 119, 180)' : '#ff7f0e',
                //                'fill-opacity': d.children ? 0.25 : 1.0,
                //                stroke: d.children ? 'rgb(31, 119, 180)' : 'none'
                //            });
                //    });
                //
                //nodes.filter(function (d) {
                //    return !d.children;
                //})
                //    .append('text')
                //    .attr('dy', '.3em')
                //    .style({
                //        'text-anchor': 'middle',
                //        'font': '8px sans-serif'
                //    })
                //    .text(function (d) {
                //        return d.name.substring(0, d.r / 3);
                //    });
            });


            //tree layout
            //var url = 'https://gist.githubusercontent.com/d3byex/25129228aa50c30ef01f/raw/c1c3ad9fa745c42c5410fba29cefccac47cd0ec7/familytree.json';
            //d3.json(url, function (error, data) {
            //    var width = 960, height = 500,
            //        nodeRadius = 10,
            //        margin = {
            //            left: 50, top: 10,
            //            bottom: 10, right: 40
            //        };
            //
            //    var svg = d3.select('body')
            //        .append('svg')
            //        .attr({
            //            width: width,
            //            height: height
            //        });
            //
            //    var mainGroup = svg.append('g')
            //        .attr('transform', 'translate(' + margin.left + ',' +
            //        margin.top + ')');
            //
            //    var tree = d3.layout.tree()
            //        .size([
            //            height - (margin.bottom + margin.top),
            //            width - (margin.left + margin.right),
            //        ]);
            //
            //    var nodes = tree.nodes(data);
            //    var links = tree.links(nodes);
            //
            //    var diagonal = d3.svg.diagonal()
            //        .projection(function (d) {
            //            return [d.y, d.x];
            //        });
            //
            //    mainGroup.selectAll('path')
            //        .data(links)
            //        .enter()
            //        .append('path', 'g')
            //        .attr({
            //            'd': diagonal,
            //            fill: 'none',
            //            stroke: '#ccc',
            //            'stroke-width': 2
            //        });
            //
            //    var circleGroups = mainGroup.selectAll('g')
            //        .data(nodes)
            //        .enter()
            //        .append('g')
            //        .attr('transform', function (d) {
            //            return 'translate(' + d.y + ',' + d.x + ')';
            //        });
            //
            //    circleGroups.append('circle')
            //        .attr({
            //            r: nodeRadius,
            //            fill: '#fff',
            //            stroke: 'steelblue',
            //            'stroke-width': 3
            //        });
            //
            //    circleGroups.append('text')
            //        .text(function (d) {
            //            return d.name;
            //        })
            //        .attr('y', function (d) {
            //            return d.children || d._children ?
            //            -nodeRadius * 2 : nodeRadius * 2;
            //        })
            //        .attr({
            //            dy: '.35em',
            //            'text-anchor': 'middle',
            //            'fill-opacity': 1
            //        })
            //        .style('font', '12px sans-serif');
            //});

            //test custom layout

        //    url = 'https://gist.githubusercontent.com/d3byex/25129228aa50c30ef01f/raw/11fe9418fba81e254ad0f629b592f9e33c3241c6/sales_rollup.json';
        //    d3.json(url, function (error, data) {
        //        var diameter = 500;
        //
        //        var svg = d3.select('body')
        //            .append('svg')
        //            .attr({
        //                width: diameter,
        //                height: diameter
        //            });
        //
        //        var pack = packNetwork()
        //            .size([diameter, diameter])
        //            .value(function (d) { return d.value; });
        //
        //        var nodes = svg.datum(data)
        //            .selectAll('g')
        //            .data(pack.nodes)
        //            .enter()
        //            .append('g')
        //            .attr('transform', function (d) {
        //                return 'translate(' + d.x + ',' + d.y + ')';
        //            });
        //
        //        nodes.append('circle')
        //            .each(function (d) {
        //                d3.select(this)
        //                    .attr({
        //                        r: d.r,
        //                        fill: d.children ? 'rgb(31, 119, 180)' : '#ff7f0e',
        //                        'fill-opacity': d.children ? 0.25 : 1.0,
        //                        stroke: d.children ? 'rgb(31, 119, 180)' : 'none'
        //                    });
        //            });
        //
        //        nodes.filter(function (d) {
        //            return !d.children;
        //        })
        //            .append('text')
        //            .attr('dy', '.3em')
        //            .style({
        //                'text-anchor': 'middle',
        //                'font': '8px sans-serif'
        //            })
        //            .text(function (d) {
        //                return d.name.substring(0, d.r / 3);
        //            });
        //    });
        //
        //
        //


        }
    });


    return packChartView;
});
