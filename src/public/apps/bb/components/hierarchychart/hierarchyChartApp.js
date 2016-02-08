define(['../../app', 'backbone', 'd3','q','components/networkchart/collections/regionList', 'components/networkchart/collections/availabilityZoneList',
        'components/networkchart/collections/vpcList'
        ,'components/networkchart/collections/subnetList',
        'components/networkchart/collections/instanceList',
        'components/hierarchychart/views/hierarchyChartView','components/hierarchychart/views/treeMapView','components/networkchart/models/region',
        'components/networkchart/models/vpc' ],
    function(app, Backbone, d3, q, RegionList, AvailabilityZoneList, VpcList, SubnetList, InstanceList, HierarchyChartView, TreeMapView,Region, Vpc) {
        "use strict";

        var hierarchyChartApp = function() {
            //get data
            //var regionNode = {};
            //example
            //regionNode.id = "US-East-1";
            //regionNode.labels = [{"text":"Region US-East-1"}];
            //regionNode.children = [];
            var regionList = new RegionList();
            var availabilityZoneList = new AvailabilityZoneList();
            var vpcList = new VpcList();
            var subnetList = new SubnetList();
            var instanceList = new InstanceList();

            window.json_Callback = function (data) {
                //console.log("json_Callback called");
            };

            //Edda looks for specific parameter of in url to _callback signify CORS request
            $.ajaxSetup({
                jsonp: "_callback",
                jsonpCallback: "json_Callback"
            });


            var fetchAvailabilityZones = function (fetchUrl) {
                availabilityZoneList.url = fetchUrl;
                var deferred = q.defer();
                availabilityZoneList.fetch({
                    type: "GET",
                    cache: true,
                    reset: true,
                    remove: false,
                    silent: false,
                    success: function (data, rtnData) {
                        //console.log("availZone fetch successful, rtnData: " + JSON.stringify(rtnData))
                        deferred.resolve(rtnData);
                    },
                    error: function (data, response) {
                        var error = new Error('error in fetchAvailabilityZones');
                        deferred.reject(error);
                    }
                });

                return deferred.promise;
            }

            var fetchInstances = function (fetchUrl) {
                instanceList.url = fetchUrl;
                var deferred = q.defer();

                instanceList.fetch({
                    type: "GET",
                    cache: true,
                    reset: true,
                    remove: false,
                    silent: false,
                    success: function (data, rtnData) {
                        //console.log("instances fetch successful, rtnData: " + JSON.stringify(rtnData))
                        deferred.resolve(rtnData);
                    },
                    error: function (data, response) {
                        var error = new Error('error in fetchInstances');
                        //error.textStatus = textStatus;
                        //error.errorThrown = errorThrown;
                        deferred.reject(error);
                    }
                });

                return deferred.promise;
            }

            var fetchVpcs = function (fetchUrl) {
                vpcList.url = fetchUrl;
                var deferred = q.defer();
                vpcList.fetch({
                    type: "GET",
                    cache: true,
                    reset: true,
                    remove: false,
                    silent: false,
                    success: function (data, rtnData) {
                        //console.log("vpc fetch successful, rtnData: " + JSON.stringify(rtnData));
                        //console.log("vpc fetch successful");
                        deferred.resolve(rtnData);
                    },
                    error: function (data, response) {
                        var error = new Error('error in fetchVpcs');
                        //error.textStatus = textStatus;
                        //error.errorThrown = errorThrown;
                        deferred.reject(error);
                    }
                });
                return deferred.promise;
            };

            var fetchSubnets = function (fetchUrl){

                subnetList.url = fetchUrl;
                var deferred = q.defer();
                subnetList.fetch({
                    type: "GET",
                    cache: true,
                    reset: true,
                    remove: false,
                    silent: false,
                    success: function (data, rtnData){
                        //console.log("subnetList fetch successful, rtnData: " + JSON.stringify(rtnData))
                        deferred.resolve(rtnData);
                    },
                    error: function (data, response) {
                       var error = new Error('error in fetchSubnets');
                       deferred.reject(error);
                }
                });
                return deferred.promise;
            };

            var populateRegions = function () {
                var deferred = q.defer();
                //console.log("availZone fetch successful, settledData: " + JSON.stringify(settledData))
                availabilityZoneList.forEach(function (item) {
                    var exists = regionList.findWhere({name: item.get("regionName")});
                    if (!exists) {
                        var region = new Region({
                            name: item.get("regionName")
                        });
                        console.log("added region: " + JSON.stringify(region));
                        regionList.add(region);
                    }
                });

                deferred.resolve(regionList);
                return deferred.promise;
            }

            var calculateInstancesPerAvailZone = function () {
                var deferred = q.defer();
                availabilityZoneList.forEach(function (availZone, index, array) {
                    var numberOfInstances = 0;
                    instanceList.forEach(function (instance, instanceIndex, instances) {
                        var placement = instance.get("placement");
                        if (placement.availabilityZone === availZone.get("zoneName")) {
                            //set VpcId in which availZone is within
                            availZone.set("vpcId", instance.get("vpcId"));
                            numberOfInstances++;
                        }
                    });
                    availZone.set("numberOfInstances", numberOfInstances);
                });
                deferred.resolve(instanceList);
                return deferred.promise;
            }

            var calculateInstancesPerRegion = function () {
                var deferred = q.defer();
                //calculate number of instances per Region
                var vpcsInRegion = new VpcList();
                regionList.forEach(function (region) {
                    var numberOfInstancesInRegion = 0;
                    //get avail. zones associated with region
                    var availZonesFiltered = availabilityZoneList.filter(function(availZone){
                        return availZone.get("regionName") === region.get("name");
                    });

                    //get vpcs associated with avail. zone
                    availZonesFiltered.forEach(function(availZone){
                       numberOfInstancesInRegion = numberOfInstancesInRegion + availZone.get("numberOfInstances");
                       var vpcMatching = vpcList.findWhere({vpcId: availZone.get("vpcId")});
                       var vpcExists = vpcsInRegion.findWhere({vpcId: availZone.get("vpcId")})
                        if((vpcMatching!==undefined) && (vpcExists===undefined)){
                            vpcsInRegion.add(vpcMatching);
                        }

                    });


                    region.set("vpcCollection", vpcsInRegion);
                    region.set("numberOfInstances", numberOfInstancesInRegion);
                });
                deferred.resolve(regionList);
                return deferred.promise;
            };

            var calculateInstancesPerVpc = function (){
                var deferred = q.defer();
                 //calculate # of instances per vpc
                 vpcList.forEach(function (vpc) {
                  var numberOfInstancesInVpc = 0;
                  instanceList.forEach(function (instance) {
                    if (instance.get("vpcId") === vpc.get("vpcId")) {
                        numberOfInstancesInVpc++;
                    }
                  });
                  vpc.set("numberOfInstances", numberOfInstancesInVpc);
                  deferred.resolve(instanceList);
                  return deferred.promise;
            });
            }

            var updateRegionsVpcInfo = function (){
                //update regionList with vpc Info
                var deferred = q.defer();
                regionList.forEach(function(region){
                    var vpcsAssociated = region.get("vpcCollection");
                    vpcsAssociated.forEach(function(assocVpc){
                        var vpcData = vpcList.findWhere({vpcId: assocVpc.get("vpcId")})
                        if(vpcData!==undefined){
                            //update region's Vpc Collection
                            assocVpc.set("name",vpcData.get("name"));
                            assocVpc.set("numberOfInstances",vpcData.get("numberOfInstances"))
                        }
                    });
                });
                deferred.resolve(regionList);
                return deferred.promise;
            }

            var calculateInstancesPerSubnet = function(){
                var deferred = q.defer();
                subnetList.forEach(function(subnet){
                    var numberOfInstancesInSubnet = 0;
                    instanceList.forEach(function(instance){
                        if(instance.get("subnetId") === subnet.get("subnetId")){
                            numberOfInstancesInSubnet++;
                        }
                    });
                    subnet.set("numberOfInstances",numberOfInstancesInSubnet);
                });
                deferred.resolve(subnetList);
                return deferred.promise;
            }

            var createHierarchy = function(){

                //example
                //regionNode.id = "US-East-1";
                //regionNode.labels = [{"text":"Region US-East-1"}];
                //regionNode.children = [];

                var deferred = q.defer();

                var topNode = {};
                topNode.id = "Root Node";
                topNode.labels = [{"text": "Root Node"}];
                var topNodeChildren = [];
                regionList.forEach(function (regionItem){
                    var regionNode = {};
                    regionNode.id = regionItem.get("name");
                    regionNode.labels = [{"text":regionItem.get("name")}];

                    //children are vpcs
                    var regionChildren = [];
                    var vpcCollection = regionItem.get("vpcCollection");
                    vpcCollection.forEach(function (vpc) {
                        var vpcChild = {};
                        vpcChild.id = vpc.get("name");
                        vpcChild.labels = [{"text":vpc.get("name")}];

                        var subnetListFiltered = subnetList.filter(function(subnet){
                            return subnet.get("vpcId") === vpc.get("vpcId");
                        });
                        var vpcChildren = [];
                        subnetListFiltered.forEach(function (subnet, index, array) {
                            var subnetChild = {};
                            subnetChild.id = subnet.get("name");
                            subnetChild.labels = [{"text":subnet.get("name")}];
                            var instanceListFiltered = instanceList.filter(function(instance){
                                return instance.get("subnetId") === subnet.get("subnetId");
                            });
                            var subnetChildren = [];
                            instanceListFiltered.forEach(function(instance, index, array){
                               var instanceChild = {};
                                instanceChild.id = instance.get("name");
                                instanceChild.labels = [{"text": instance.get("name")}];
                                subnetChildren.push(instanceChild);
                            });
                            subnetChild.children = subnetChildren;

                            vpcChildren.push(subnetChild);
                        });
                        vpcChild.children = vpcChildren;

                        regionChildren.push(vpcChild);
                    });

                    regionNode.children = regionChildren;
                    topNodeChildren.push(regionNode);
                });

                topNode.children = topNodeChildren;

                deferred.resolve(topNode);
                return deferred.promise;
            }

            var promises = [];
            promises.push(fetchAvailabilityZones(app.api.availabilityZonesUrl));
            q.allSettled(promises).then(function(settledData) {
                populateRegions().then(function(data){
                    var promisesArray = [];
                    promisesArray.push(fetchInstances(app.api.instancesUrl));
                    q.allSettled(promisesArray);


                    calculateInstancesPerAvailZone().then(function(someData){
                        promisesArray =[];
                        promisesArray.push(fetchVpcs(app.api.vpcsUrl));
                        q.allSettled(promisesArray).then(calculateInstancesPerRegion).then(calculateInstancesPerVpc);

                        promisesArray =[];
                        promisesArray.push(updateRegionsVpcInfo);
                        q.allSettled(promisesArray);

                        promisesArray = [];
                        promisesArray.push(fetchSubnets(app.api.subnetsUrl));
                        q.allSettled(promisesArray).then(calculateInstancesPerSubnet).then(createHierarchy).then(function(data){
                            console.log("topNode json: " + JSON.stringify(data));

                            //HierArchyView (prod)
                            //var hierarchyView = new HierarchyChartView({ manage: true, regionList: data});
                            //var layoutHome = app.useLayout('main', { view: { '#containerOne' : hierarchyView } });
                            //layoutHome.render();

                            //D3 treemap test
                            var treeView = new TreeMapView({manage: true, regionList: data});
                            var layoutHome = app.useLayout('main', { view: { '#containerOne' : treeView } });
                            layoutHome.render();

                        });
                    });


                });
            });


        };

        return hierarchyChartApp;
    });
