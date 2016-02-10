define(['jquery','underscore','backbone','d3','klay','klayjsd3','colorbrewer','shared/d3layouts/packNetwork','layoutmanager'], function ($, _, Backbone, d3, klay, klayjsd3, colorbrewer, packNetwork) {
    var treeMapView = Backbone.Layout.extend({
        tagName: 'div',
        template: 'hierarchychart/hierarchyChart',
        initialize: function (options) {
            this.regionList = options.regionList;
            this.marginProperties = {top:0, right:0, bottom:0, left:0};
            var margin = this.margin(40,10,10,10);
            var width = this.width(960,margin.left,margin.right);
            var height = this.height(500,margin.top,margin.bottom);
            var color = this.orangeScaleCategory();

            this.treemap = d3.layout.treemap()
                .size([width, height])
                .sticky(true)
                .padding([15, 15, 15, 15])
                .value(function(d) { return d.size; });
            //TODO try this change event
            //this.regionList.on("change", this.render, this);
        },
        regionList: null,
        events: {
           'click input#newValue': 'updateViewData'
        },
        treemap: null,
        marginProperties: null,
        margin: function(top, right, bottom, left){
            this.marginProperties.top = top;
            this.marginProperties.right = right;
            this.marginProperties.bottom = bottom;
            this.marginProperties.left = left;
            return this.marginProperties;
        },
        width: function(totalViewPortWidth,marginLeft, marginRight){
            return totalViewPortWidth - marginLeft - marginRight;
        },
        height: function(totalViewPortHeight, marginTop, marginBottom){
            return totalViewPortHeight - marginTop - marginBottom
        },
        orangeScaleCategory: function(){
            return d3.scale.ordinal().range(colorbrewer.YlOrBr[9]);
        },
        position: function(){
            this.style("left", function(d) { return d.x + "px"; })
                .style("top", function(d) { return d.y + "px"; })
                .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
                .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
        },
        renderChart: function(jsonData){
            var color = this.orangeScaleCategory();

            //treemap - test data

            //that equals backbone.js "this"
            var that = this;

            //first remove old nodes if exists
            //d3.select("body").selectAll(".nodeTreemap").data(that.treemap.nodes).exit().remove();


            //second add new nodes (new data)
            var div = d3.select("body").append("div")
                    .style("position", "relative")
                    .style("width", (that.width() + that.marginProperties.left + that.marginProperties.right) + "px")
                    .style("height", (that.height() + that.marginProperties.top + that.marginProperties.bottom) + "px")
                    .style("left", that.marginProperties.left + "px")
                    .style("top", that.marginProperties.top + "px");

            var node = div.datum(jsonData).selectAll(".nodeTreemap")
                    .data(that.treemap.nodes)
                    .enter().append("div")
                    .attr("class", "nodeTreemap");

            div.selectAll(".nodeTreemap").data(that.treemap.nodes).exit().remove();

            node.transition()
                    .duration(1500)
                    .call(that.position)
                    .style("background", function(d) {
                        return d.children ? color(d.name) : null;
                    })
                    .text(function(d) { return d.children ? d.name : d.name; });


        },
        updateViewData: function(){
            var url = "/sentia/public/apps/bb/components/hierarchychart/views/hierarchyForTreeMap.json";
            //that equals backbone.js "this"
            var that = this;
            d3.json(url, function (error, data2) {
                if (error) throw error;
               that.renderChart(data2);
            });

        },
        afterRender: function () {
            console.log('hierarchyChart afterRender');
            // load the data and render the element
            var partStringJson = JSON.stringify(this.regionList);
            var data = JSON.parse(partStringJson);

            //old
            //var color = this.orangeScaleCategory();
            //var div = d3.select("body").append("div")
            //    .style("position", "relative")
            //    .style("width", (this.width() + this.marginProperties.left + this.marginProperties.right) + "px")
            //    .style("height", (this.height() + this.marginProperties.top + this.marginProperties.bottom) + "px")
            //    .style("left", this.marginProperties.left + "px")
            //    .style("top", this.marginProperties.top + "px");
            //
            //    var node = div.datum(data).selectAll(".nodeTreemap")
            //        .data(this.treemap.nodes)
            //        .enter().append("div")
            //        .attr("class", "nodeTreemap")
            //        .call(this.position)
            //        .style("background", function(d) {
            //            return d.children ? color(d.name) : null;
            //        })
            //        .text(function(d) { return d.children ? d.name : d.name; });

           //new
            this.renderChart(data);

        }
    });


    return treeMapView;
});

