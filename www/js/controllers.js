var app = angular.module('cityzen.ctrls', ['cityzen.auth', 'cityzen.settings']);

app.controller('MapCtrl', function ($scope, mapboxMapId, mapboxTokenAccess, leafletData, SettingsService) {
    var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
    mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxTokenAccess;
    $scope.mapDefaults = {
        tileLayer: mapboxTileLayer
    };
    var mapCenter = SettingsService.getMapCenter();
    $scope.mapCenter = {
        lat: mapCenter.lat,
        lng: mapCenter.lng,
        zoom: 12,
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
    $scope.$root.enableLeft = true;
});

app.controller('MenuCtrl', function ($scope, AuthService) {
    $scope.logout = function () {
        AuthService.logout();
    };
});

app.controller('NewCtrl', function ($scope) {
    $scope.$root.enableLeft = false;
    $scope.$on('$stateChangeStart', function () {
        $scope.$root.enableLeft = true;
    });
});

app.controller('MyNavCtrl', function ($scope, $state, $ionicHistory) {
    $scope.platform = ionic.Platform;
    $scope.myGoBack = function () {
        var backView = $ionicHistory.backView();
        if (backView) {
            $state.go(backView.stateId);
        }
    };
});