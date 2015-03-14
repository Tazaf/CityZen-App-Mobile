var app = angular.module('cityzen.ctrls', []);

app.controller('ListCtrl', function ($scope, $state, $ionicHistory) {
    console.log($ionicHistory.viewHistory());
});

app.controller('MapCtrl', function ($scope, $state, $ionicHistory) {
    console.log($ionicHistory.viewHistory());
});

app.controller('MenuCtrl', function ($scope) {
});

app.controller('DetailsCtrl', function ($scope, $state, $ionicHistory, $ionicScrollDelegate, $location) {
    console.log($ionicHistory.viewHistory());
    $scope.showDetails = function () {
        $state.go('details');
    };
    
    $scope.goToAnchor = function(anchor) {
        $location.hash(anchor);
        $ionicScrollDelegate.anchorScroll(true);
    };
});

app.controller('NewCtrl', function ($scope, $state, $ionicHistory) {
    console.log($ionicHistory.viewHistory());
    $scope.showNewForm = function () {
        $state.go('app.new');
    };
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