var app = angular.module('cityzen.maps', ['cityzen.settings', 'cityzen.issues', 'angular-storage']);

app.controller('MapCtrl', function ($scope, mapboxMapId, mapboxTokenAccess, leafletData, SettingsService) {
    $scope.$root.enableLeft = true;
    var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
    mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxTokenAccess;
    $scope.mapDefaults = {
        tileLayer: mapboxTileLayer
    };
    var mapCenter = SettingsService.getMapCenter();
    $scope.mapCenter = {
        lat: mapCenter.lat,
        lng: mapCenter.lng,
        zoom: 12
    };
    $scope.mapMarkers = [{
            lat: mapCenter.lat,
            lng: mapCenter.lng,
            message: "<div ng-include=\"'templates/map-markers.html'\"></div>",
            draggable: true
        }];
    leafletData.getMap('map').then(function (map) {
        map.attributionControl.setPosition('bottomleft');
    });
});

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
            draggable: true
        }];
    var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
    mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxTokenAccess;
    $scope.mapDefaults = {
        tileLayer: mapboxTileLayer
    };
    leafletData.getMap('map').then(function (map) {
        map.attributionControl.setPosition('bottomleft');
    });
});