var app = angular.module('cityzen.maps', ['cityzen.settings', 'cityzen.issues', 'angular-storage', 'leaflet-directive', 'ngCordova']);

app.factory('MapService', function (messages, Settings, $q, $cordovaGeolocation, Loading) {
    return {
        /*
         * Locate the user if he allowed it.
         * If not, load the map center defined in the settings.
         */
        locate: function () {
            Loading.show(messages.locating);
            var dfd = $q.defer();
            Settings.active.pos = Settings.stored.mapCenter;
            dfd.resolve();
//            var posOptions = {timeout: 10000, enableHighAccuracy: false};
//            $cordovaGeolocation
//                    .getCurrentPosition(posOptions)
//                    .then(function (pos) {
//                        Settings.active.pos = {
//                            lat: pos.coords.latitude,
//                            lng: pos.coords.longitude
//                        };
//                        dfd.resolve();
//                    }, function (error) {
//                        Settings.active.pos = Settings.stored.mapCenter;
//                        dfd.resolve();
//                    });
            return dfd.promise;
        }
    };
});


// A controller that displays information for the active view's issues
app.controller('MapCtrl', function ($timeout, messages, $scope, mapboxMapId, mapboxTokenAccess, leafletData, Loading, $q, $rootScope, MapService, Settings) {

    /**
     * Returns a marker Object indicating the user's position based on the pos parameter.
     * This parameter must be an object with at least a lat and a lng properties which value must be a number.
     * The returned object will have :
     * <ul>
     * <li>A lat property equal to the parameter's lat property.</li>
     * <li>A lng property equal to the parameter's lng property</li>
     * <li>A message property equal to "Ma position"</li>
     * <li>An icon property equal to the scope pos_icon property</li>
     * </ul>
     * @param {Object} pos An object with lat and lng properties.
     * @returns {Object} An object that can be use as it is to create a Leaflet marker.
     */
    function defaultMarker(pos) {
        return {
            lat: pos.lat,
            lng: pos.lng,
            message: "<p>Ma position</p>",
            icon: $scope.pos_icon
        };
    }

    // A function that loads the map in the template
    function loadMap() {
        Loading.show(messages.load_map);
        var pos = Settings.active.pos;
        console.log(Settings.active.pos);
        var dfd = $q.defer();
        // Load the map
        $scope.layers = {
            baselayers: {
                base_map: {
                    name: 'Base Map',
                    url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                    type: 'xyz',
                    layerOptions: {
                        apikey: mapboxTokenAccess,
                        mapid: mapboxMapId
                    }
                }
            },
            overlays: {
                issues: {
                    name: "Issues",
                    type: "markercluster",
                    visible: true
                }
            }
        };
        // Set the map's center
        $scope.mapCenter = {
            lat: pos.lat,
            lng: pos.lng,
            zoom: Number(Settings.stored.zoom)
        };
        $scope.mapMarkers = [defaultMarker(pos)];
        leafletData.getMap('map').then(function (map) {
            $scope.map = map;
            $scope.map.attributionControl.setPosition('bottomleft');
            dfd.resolve(pos);
        }, function (error) {
            dfd.reject(error);
        });
        // Show the map on the template
        $scope.showMap = true;
        return dfd.promise;
    }

    // A function that inserts the issues' data on the map with markers
    function insertData() {
        Loading.show(messages.create_markers);
        var data = $scope.issues;
        if ($scope.mapMarkers.length > 1) {
            $scope.mapMarkers = [defaultMarker(Settings.active.pos)];
        }
        // If there is any loaded data, create a marker for each one of them and add it to the mapMarkers array
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                var marker = {
                    layer: 'issues',
                    lat: data[i].lat,
                    lng: data[i].lng,
                    message: "<p ui-sref=\"app.details({issueId:'" + data[i].id + "'})\">" + data[i].description + "</p>"
                };
                $scope.mapMarkers.push(marker);
            }
            // Set the view to encompase all the markers
            $scope.map.fitBounds($scope.mapMarkers);
        } else {
            // Set the view to display only the position marker with the desired zoom
            $scope.map.setView([$scope.mapMarkers[0].lat, $scope.mapMarkers[0].lng], Settings.stored.zoom);
        }
        Loading.hide();
    }

    // Hide the leaflet directive from the template while loading the data
    $scope.showMap = false;

    // Disable the swipe menu for this view
    $scope.$on('$ionicView.beforeEnter', function () {
        $rootScope.enableLeft = true;
        $timeout(function () {
            $scope.$broadcast('invalidateSize');
        });
    });

    $scope.$on('$ionicView.enter', function () {
        if (!$scope.showMap && $scope.issues) {
            loadMap().then(insertData);
        } else if ($scope.issues) {
            insertData();
        }
    });

    // When catching the positionChange event, if the geolocation failed or is not active, replace the position marker
    $scope.$on('positionChange', function () {
        MapService.locate().then(function () {
            var pos = Settings.active.pos;
            $scope.mapMarkers[0].lat = pos.lat;
            $scope.mapMarkers[0].lng = pos.lng;
            $scope.map.fitBounds($scope.mapMarkers);
        }).then(Loading.hide);
    });

    $scope.$on('dataloaded', function () {
        insertData();
    });

    $scope.$on('located', function () {
        if (!$scope.showMap) {
            loadMap();
        }
    });
});

// Controller that show a particular issue on its own map
app.controller('DetailsMapCtrl', function ($rootScope, store, $scope, mapboxMapId, mapboxTokenAccess, leafletData, Settings) {

    // Disable the swipe menu for this screen
    $scope.$on('$ionicView.beforeEnter', function () {
        $rootScope.enableLeft = false;
    });

    // Get the issue's data from the storage
    var issue = store.get('issue');

    // Load the map
    var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
    mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxTokenAccess;
    $scope.mapDefaults = {
        tileLayer: mapboxTileLayer
    };

    // Set the map's center to the issue's location
    $scope.mapCenter = {
        lat: issue.lat,
        lng: issue.lng,
        zoom: Number(Settings.stored.zoom)
    };

    // Create a marker with the issue's information
    $scope.mapMarkers = [{
            lat: issue.lat,
            lng: issue.lng,
            message: "<p>" + issue.description + "</p>",
        }
    ];
    leafletData.getMap('map-details').then(function (map) {
        map.attributionControl.setPosition('bottomleft');
    });
});