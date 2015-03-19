var app = angular.module('cityzen.maps', ['cityzen.settings', 'cityzen.issues', 'angular-storage']);

app.controller('MapCtrl', function ($scope, mapboxMapId, mapboxTokenAccess, leafletData, $ionicLoading, geolocation, IssuesService) {
    console.log('MapCtrl loaded');
    $scope.showMap = false;
    $scope.$root.enableLeft = true;
    $scope.loadData = function (pos) {
        console.log('loading data');
        $scope.error = null;
        IssuesService
                .getViewData($scope.config.homeView, pos)
                .then(function (response) {
                    console.log("Response : ");
                    console.log(response.data);
                    if (response.data.length === 0) {
                        $scope.error = {msg: "Désolé, aucun résultat..."};
                    } else {
                        $scope.issues = response.data;
                        $scope.insertData($scope.issues);
                    }
                }, function (error) {
                    $scope.error = {
                        msg: "Impossible de charger des problèmes."
                    };
                });
        $ionicLoading.hide();
    };

    $scope.insertData = function (data) {
        for (var i = 0; i < data.length; i++) {
            var marker = {
                lat: data[i].lat,
                lng: data[i].lng,
                message: "<p ui-sref=\"app.details({issueId:'" + data[i].id + "'})\">" + data[i].description + "</p>"
            };
            $scope.mapMarkers.push(marker);
        }
        $scope.map.fitBounds($scope.mapMarkers);
    };

    // Load the map and show the leaflet directive
    $scope.loadMap = function () {
        console.log('loading map');
        var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
        mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxTokenAccess;
        $scope.mapDefaults = {
            tileLayer: mapboxTileLayer
        };
        $scope.mapCenter = {
            lat: $scope.config.mapCenter.lat,
            lng: $scope.config.mapCenter.lng,
            zoom: 12
        };
        $scope.mapMarkers = [{
                lat: $scope.config.mapCenter.lat,
                lng: $scope.config.mapCenter.lng,
                message: "<p>Mon emplacement</p>",
                draggable: true
            }];
        console.log('map loaded');
        leafletData.getMap('map').then(function (map) {
            $scope.map = map;
            console.log('Map dans le scope');
            map.attributionControl.setPosition('bottomleft');
        });
        $scope.showMap = true;
        console.log('map visible');
    };

    $scope.$on('$ionicView.enter', function () {
//        $ionicLoading.show({
//            template: 'Chargement...'
//        });
        geolocation.getLocation().then(function (data) {
            $scope.config.mapCenter.lat = data.coords.latitude;
            $scope.config.mapCenter.lng = data.coords.longitude;
            console.log('geolocated');
//            $scope.loadMap();
//            $scope.loadData(data);
        }, function (error) {
            console.log("Could not get location: " + error);
            $scope.loadMap();
            $scope.loadData(null);
        });
    });

    // Enregistrement des évènements
    $scope.$on('configChanged', function () {
        console.log('Oh ! The config has changed ?');
        $scope.mapMarkers = [];
        $scope.loadData();
//        // get markers depending of the view
//        $scope.mapMarkers = [];
//        $scope.mapMarkers.push({
//            lat: 50,
//            lng: 12,
//            message: "<p>Premier marqueur</p>"
//        }, {
//            lat: 10,
//            lng: 25,
//            message: "<p>Deuxième marqueur</p>"
//        });
//        $scope.map.fitBounds($scope.mapMarkers);
    });

    // Get user's position
});

// Controller that show a particular issue on its own map
app.controller('DetailsMapCtrl', function (store, $scope, mapboxMapId, mapboxTokenAccess, leafletData, IssuesService, $stateParams) {
    // Disable the swipe menu for this screen
    $scope.$root.enableLeft = false;
    // Re-enable the swipe menu for the adequates screens
    $scope.$on('$stateChangeStart', function () {
        store.remove('issue');
    });
    var issue = store.get('issue');
    $scope.mapCenter = {
        lat: issue.lat,
        lng: issue.lng,
        zoom: 17
    };
    $scope.mapMarkers = [{
            lat: issue.lat,
            lng: issue.lng,
            message: "<p>" + issue.description + "</p>",
            draggable: true}];
    var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
    mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxTokenAccess;
    $scope.mapDefaults = {
        tileLayer: mapboxTileLayer
    };
    leafletData.getMap('map-details').then(function (map) {
        map.attributionControl.setPosition('bottomleft');
    });
});