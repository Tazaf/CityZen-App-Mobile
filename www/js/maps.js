var app = angular.module('cityzen.maps', ['cityzen.settings', 'cityzen.issues', 'angular-storage', 'cityzen.data-manager']);

app.factory('MapService', function (messages, SettingsService, $q, $cordovaGeolocation, Loading) {
    return {
        /*
         * Locate the user if he allowed it.
         * If not, load the map center defined in the settings.
         */
        locate: function () {
            Loading.show(messages.locating);
            var dfd = $q.defer();
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            $cordovaGeolocation
                    .getCurrentPosition(posOptions)
                    .then(function (pos) {
                        var data = {
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude
                        };
                        dfd.resolve(data);
                    }, function (error) {
                        console.log(error.message);
                        var data = SettingsService.stored.mapCenter;
                        dfd.resolve(data);
                    });
            return dfd.promise;
        }
    };
});


// A controller that displays information for the active view's issues
app.controller('MapCtrl', function ($timeout, messages, $scope, mapboxMapId, mapboxTokenAccess, leafletData, Loading, $q, $rootScope, MapService, SettingsService) {
    console.log('MapCtrl loaded');

    // Default user position marker
    function defaultMarker(pos) {
        return {
            lat: pos.lat,
            lng: pos.lng,
            message: "<p>Ma position</p>",
            icon: $scope.pos_icon
        };
    }

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

    // Hide the leaflet directive from the template while loading the data
    $scope.showMap = false;

    // When catching the positionChange event, if the geolocation failed or is not active, replace the position marker
    $scope.$on('positionChange', function () {
        MapService.locate().then(function (pos) {
            console.log(pos);
            $scope.mapMarkers[0].lat = pos.lat;
            $scope.mapMarkers[0].lng = pos.lng;
            $scope.map.fitBounds($scope.mapMarkers);
        }).then(Loading.hide);
    });

    // A function that loads the map in the template
    function loadMap() {
        Loading.show(messages.load_map);
        var pos = $scope.pos === undefined ? SettingsService.stored.mapCenter : $scope.pos;
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
            zoom: Number(SettingsService.stored.zoom)
        };
        $scope.mapMarkers = [defaultMarker(pos)];
        leafletData.getMap('map').then(function (map) {
            $scope.map = map;
            $scope.map.attributionControl.setPosition('bottomleft');
            dfd.resolve(pos);
        }, function (error) {
            dfd.reject(error);
        });
//         Show the map on the template
        $scope.showMap = true;
        return dfd.promise;
    }

    // A function that inserts the issues' data on the map with markers
    function insertData() {
        Loading.show(messages.create_markers);
        var data = $scope.issues;
        if ($scope.mapMarkers.length > 1) {
            $scope.mapMarkers = [defaultMarker($scope.pos)];
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
            $scope.map.setView([$scope.mapMarkers[0].lat, $scope.mapMarkers[0].lng], SettingsService.stored.zoom);
        }
        Loading.hide();
    }

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
app.controller('DetailsMapCtrl', function ($rootScope, store, $scope, mapboxMapId, mapboxTokenAccess, leafletData, SettingsService) {

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
        zoom: Number(SettingsService.stored.zoom)
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