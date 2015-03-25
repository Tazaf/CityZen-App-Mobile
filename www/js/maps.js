var app = angular.module('cityzen.maps', ['cityzen.settings', 'cityzen.issues', 'angular-storage']);

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
                        var data = SettingsService.active.mapCenter;
                        dfd.resolve(data);
                    });
            return dfd.promise;
        }
    };
});


// A controller that displays information for the active view's issues
app.controller('MapCtrl', function (messages, $scope, mapboxMapId, mapboxTokenAccess, leafletData, Loading, IssuesService, $q, $rootScope, MapService, $ionicPlatform, SettingsService) {
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
    $rootScope.enableLeft = true;

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
    $scope.loadMap = function (pos) {
        Loading.show(messages.load_map);
        var dfd = $q.defer();
        // Load the map
        var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
        mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxTokenAccess;
        $scope.mapDefaults = {
            tileLayer: mapboxTileLayer
        };
        // Set the map's center
        $scope.mapCenter = {
            lat: pos.lat,
            lng: pos.lng,
            zoom: Number(SettingsService.active.zoom)
        };
        $scope.mapMarkers = [defaultMarker(pos)];
        leafletData.getMap('map').then(function (map) {
            $scope.map = map;
            map.attributionControl.setPosition('bottomleft');
            dfd.resolve(pos);
        }, function (error) {
            dfd.reject(error);
        });
        // Show the map on the template
        $scope.showMap = true;
        return dfd.promise;
    };

    // A function that loads the issues' data according to the active view
    $scope.loadData = function (pos) {
        Loading.show(messages.load_data);
        var dfd = $q.defer();
        $scope.error = null;
        IssuesService
                .getViewData($scope.config.activeView, pos)
                .then(function (response) {
                    if (response.data.length === 0) {
                        $scope.error = {msg: messages.no_result};
                        dfd.resolve([], pos);
                    } else {
                        $scope.issues = response.data;
                        $scope.init_issues = response.data;
                        $scope.pos = pos;
                        dfd.resolve($scope.issues);
                    }
                }, function (error) {
                    $scope.error = {msg: messages.error};
                    dfd.reject(error);
                    console.log('ERROR !');
                    console.log(error);
                });
        return dfd.promise;
    };

    // A function that inserts the issues' data on the map with markers
    $scope.insertData = function (data) {
        Loading.show(messages.create_markers);
        if ($scope.mapMarkers.length > 1) {
            $scope.mapMarkers = [defaultMarker($scope.pos)];
        }
        // If there is any loaded data, create a marker for each one of them and add it to the mapMarkers array
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                var marker = {
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
            $scope.map.setView([$scope.mapMarkers[0].lat, $scope.mapMarkers[0].lng], SettingsService.active.zoom);
        }
        Loading.hide();
    };

    // A function that handles the error occuring on the chain of function.
    // TODO : use this handle to display onscreen notification with a adequate message
    $scope.handleError = function (error) {
        console.log('Error Handled');
        console.log(error);
        Loading.hide();
    };

    // When first loading of this controller
    $ionicPlatform.ready(function () {
        MapService.locate()
                .then($scope.loadMap)
                .then($scope.loadData)
                .then($scope.insertData, $scope.handleError);
    });

    // When catching the viewChange event, reload the issues' data according to the new view
    $scope.$on('viewChange', function () {
        MapService.locate().then($scope.loadData).then($scope.insertData, $scope.handleError);
    });

    // Update the data when a config changes
    $scope.$on('issueTypeChange', function () {
        $scope.error = null;
        $scope.issues = IssuesService.filterIssueState($scope.init_issues, SettingsService.active.stateFilters);
        $scope.issues = IssuesService.filterIssueType($scope.issues, $scope.config.issueTypes);
        if ($scope.issues.length === 0) {
            $scope.error = {msg: messages.no_result};
        }
        $scope.insertData($scope.issues);
    });
    
    // Update the data when a config changes
    $scope.$on('issueStateChange', function () {
        $scope.error = null;
        $scope.issues = IssuesService.filterIssueType($scope.init_issues, $scope.config.issueTypes);
        $scope.issues = IssuesService.filterIssueState($scope.issues, SettingsService.active.stateFilters);
        if ($scope.issues.length === 0) {
            $scope.error = {msg: messages.no_result};
        }
        $scope.insertData($scope.issues);
    });
});

// Controller that show a particular issue on its own map
app.controller('DetailsMapCtrl', function ($rootScope, store, $scope, mapboxMapId, mapboxTokenAccess, leafletData, SettingsService) {

    // Disable the swipe menu for this screen
    $rootScope.enableLeft = false;

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
        zoom: Number(SettingsService.active.zoom)
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