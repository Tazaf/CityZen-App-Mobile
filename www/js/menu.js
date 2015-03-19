var app = angular.module('cityzen.menus', ['angular-storage', 'cityzen.settings']);

app.controller('IssueTypeCtrl', function ($scope, $http, apiUrl) {
    $scope.error = false;
    $http({
        method: 'GET',
        url: apiUrl + '/issueTypes'
    }).success(function (issue_types) {
        $scope.issue_types = issue_types;
    }).error(function () {
        $scope.error = true;
    });
});

app.controller('MenuCtrl', function ($rootScope, $scope, SettingsService, store) {
    $scope.user = store.get('user');
    $scope.config = SettingsService.getSettings();
    console.log('Config loaded');
    $scope.saveConfig = function() {
        console.log('Saving Config');
        SettingsService.saveSettings($scope.config);
        console.log('Config Saved');
        $rootScope.$broadcast('configChanged', 'arg1', 'arg2');
    };
});

app.controller('SelectIssueCtrl', function ($scope) {
    console.log('Configuration ' + $scope.config);
});

app.controller('ConfigurationCtrl', function ($scope) {
});