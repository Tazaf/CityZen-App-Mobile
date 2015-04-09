/**
 * This is a module responsible for different maps view of the application
 */
var app = angular.module('cityzen.maps', ['cityzen.settings', 'cityzen.issues', 'angular-storage', 'leaflet-directive', 'ngCordova']);

/**
 * Defines the MapService service that is used when locating the user
 */
app.factory('MapService', function (messages, Settings, $q, $cordovaGeolocation, Loading) {
    return {
        /*
         * Locate the user if he allowed it.
         * If not, load the map center defined in the settings.
         * @returns {Promise} The http promise of the action
         */
        locate: function () {
            Loading.show(messages.locating);
            var dfd = $q.defer();
            var posOptions = {timeout: 5000, enableHighAccuracy: false};
            $cordovaGeolocation
                    .getCurrentPosition(posOptions)
                    .then(function (pos) {
                        Settings.active.pos = {
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude
                        };
                        dfd.resolve();
                    }, function () {
                        Settings.active.pos = Settings.stored.mapCenter;
                        dfd.resolve();
                    });
            return dfd.promise;
        }
    };
});


/**
 * The controller that manages the map display of the issues
 */
app.controller('MapCtrl', function ($ionicHistory, $state, $timeout, messages, $scope, mapboxMapId, mapboxTokenAccess, leafletData, Loading, $q, $rootScope, MapService, Settings) {

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

    /**
     * Loads the map into the view and register the events and their actions.
     * @returns {Promise} The promise of the action
     */
    function loadMap() {
        Loading.show(messages.load_map);
        var pos = Settings.active.pos;
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
            $scope.$on('leafletDirectiveMarker.click', function (e, args) {
                var clickedIssue = $scope.issues[args.leafletEvent.target.options.issueKey];
                if (args.markerName !== "0") {
                    $scope.activeMarker = $scope.activeMarker === clickedIssue ? null : clickedIssue;
                    $scope.map.setView(args.leafletEvent.latlng, $scope.map.zoom);
                    console.log($scope.activeMarker);
                    //$state.go('app.details', {issueId: $scope.activeMarker.id});
                }
            });
            $scope.map.on('dragstart', function () {
                $scope.activeMarker = null;
            });
            $scope.map.on('click', function () {
                $scope.activeMarker = null;
            });
            $scope.map.on('zoomstart', function () {
                $scope.activeMarker = null;
            });
            dfd.resolve(pos);
        }, function (error) {
            dfd.reject(error);
        });
        // Show the map on the template
        $scope.showMap = true;
        return dfd.promise;
    }

    /**
     * Insert the issues' data on the map with markers.
     * First reset the marker array by calling the defaultMarker function.
     * Then, for each issue, create and push a marker into the markers array. Each marker has the issue's latitude, longitude and the issue's key in the markers array, for further reference.
     * Finally, set the view for it to include all the marker in the markers array.
     * @returns {void}
     */
    function insertData() {
        Loading.show(messages.create_markers);
        var data = $scope.issues;
        $scope.mapMarkers = [defaultMarker(Settings.active.pos)];
        // If there is any loaded data, create a marker for each one of them and add it to the mapMarkers array
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                var marker = {
                    layer: 'issues',
                    lat: data[i].lat,
                    lng: data[i].lng,
                    issueKey: i
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

    // Disable the swipe menu for this view and fire the invalidateSize to prevent the unwanted map display.
    $scope.$on('$ionicView.beforeEnter', function () {
        $rootScope.enableLeft = true;
        $timeout(function () {
            $scope.$broadcast('invalidateSize');
        });
    });

    /**
     * When the state enter the view, check if it's the root view of the history stack or if its forward view is the list one.
     * If it is, calls loadMap() (if the map is not already loaded) and the insertData() function.
     */
    $scope.$on('$ionicView.enter', function () {
        if (!$ionicHistory.forwardView() || $ionicHistory.forwardView().stateId === 'app.list') {
            $scope.activeMarker = null;
            if (!$scope.showMap && $scope.issues) {
                loadMap().then(insertData);
            } else if ($scope.issues) {
                insertData();
            }
        }
    });

    /**
     * When catching the positionChange event, calls the locate() function of the MapService service and set the active position with the result.
     * Then reset the map's view.
     */
    $scope.$on('positionChange', function () {
        MapService.locate().then(function () {
            var pos = Settings.active.pos;
            $scope.mapMarkers[0].lat = pos.lat;
            $scope.mapMarkers[0].lng = pos.lng;
            $scope.map.fitBounds($scope.mapMarkers);
        }).then(Loading.hide);
    });

    // When catching the 'dataloaded' event, calls the insertData() function.
    $scope.$on('dataloaded', function () {
        insertData();
    });

    // When catching the 'located' event, if the map is not already loaded, calls the loadMap() function.
    $scope.$on('located', function () {
        if (!$scope.showMap) {
            loadMap();
        }
    });
});

/**
 * The controller that manages the map display of one issue.
 */
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
    
    // Get the leaflet map and moves the attributions to the left.
    leafletData.getMap('map-details').then(function (map) {
        map.attributionControl.setPosition('bottomleft');
    });
});