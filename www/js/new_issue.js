var app = angular.module('cityzen.new_issue', []);

app.controller('NewCtrl', function ($scope) {
    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.$root.enableLeft = false;
    });
});