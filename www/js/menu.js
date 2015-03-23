var app = angular.module('cityzen.menus', ['angular-storage', 'cityzen.settings']);

app.controller('IssueTypeCtrl', function ($scope, $http, apiUrl) {
    $scope.error = false;
    $http({
        method: 'GET',
        url: apiUrl + '/issueTypes'
    }).success(function (issue_types) {
        console.log('issueTypes : succès');
        $scope.issue_types = issue_types;
    }).error(function () {
        console.log('issueTypes : error');
        $scope.error = true;
    });
});

app.controller('MenuCtrl', function ($scope, android, user, settings, pos_icon) {
    console.log('Initialising config');
    $scope.isAndroid = android;
    $scope.user = user;
    $scope.settings = settings;
    $scope.config = {
        activeView: $scope.settings.homeView
    };
    $scope.pos_icon = pos_icon;
    console.log('Config loaded');
});

app.controller('SelectIssueCtrl', function ($rootScope, $scope, SettingsService) {
    console.log('SelectIssueCtrl loaded');
    $scope.changeView = function() {
        console.log("active view : " + $scope.config.activeView);
        console.log("home view : " + $scope.settings.homeView);
        $rootScope.$broadcast('viewChange');
    };
});