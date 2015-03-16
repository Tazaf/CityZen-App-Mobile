var app = angular.module('cityzen.ctrls', ['cityzen.auth']);

app.controller('ListCtrl', function ($scope) {
    $scope.$root.enableLeft = true;
});

app.controller('MapCtrl', function ($scope, mapboxMapId, mapboxTokenAccess) {
    var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
    mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxTokenAccess;
    $scope.mapDefaults = {
        tileLayer: mapboxTileLayer
    };
    $scope.mapCenter = {
        lat: 51.48,
        lng: 0,
        zoom: 14
    };
    $scope.mapMarkers = [];
    $scope.$root.enableLeft = true;
});

app.controller('MenuCtrl', function ($scope, AuthService) {
    $scope.logout = function () {
        AuthService.logout();
    };
});

app.controller('DetailsCtrl', function ($scope, $state, $ionicHistory, $ionicScrollDelegate, $location) {
    $scope.$root.enableLeft = false;
    $scope.$on('$stateChangeStart', function () {
        $scope.$root.enableLeft = true;
    });
    $scope.goToAnchor = function (anchor) {
        $location.hash(anchor);
        $ionicScrollDelegate.anchorScroll(true);
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