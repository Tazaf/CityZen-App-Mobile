var app = angular.module('cityzen.ctrls', []);

app.controller('ListCtrl', function ($scope, $state,$ionicHistory) {
    $scope.goToMap = function () {
        $state.go('app.map');
    };
});

app.controller('MapCtrl', function ($scope, $state, $ionicHistory) {
    $scope.goToList = function () {
        $state.go('app.list');
    };
});

app.controller('MenuCtrl', function ($scope) {
    $scope.toggleMenu = function () {
        console.log('Menu toggeled');
    };
});

app.controller('DetailsCtrl', function ($scope, $state, $ionicHistory) {
    console.log('details');

    $scope.showDetails = function () {
        $state.go('details');
    };
});

app.controller('NewCtrl', function ($scope) {
    
});