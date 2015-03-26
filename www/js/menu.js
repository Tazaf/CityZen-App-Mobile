var app = angular.module('cityzen.menus', ['angular-storage', 'cityzen.settings']);

app.controller('MenuCtrl', function ($scope, android, user, pos_icon, issueTypes, SettingsService) {
    console.log('Initialising config');
    $scope.isAndroid = android;
    $scope.user = user;
    $scope.config = {
        activeView: SettingsService.active.homeView,
        issueTypes: issueTypes
    };
    $scope.pos_icon = pos_icon;
    $scope.stateFilters = SettingsService.active.stateFilters;
    console.log('Config loaded');
});

app.controller('ViewIssuesCtrl', function ($rootScope, $scope, SettingsService) {
    $scope.changeView = function () {
        $rootScope.$broadcast('viewChange');
    };
});

app.controller('IssueTypeCtrl', function ($scope, $rootScope) {
    $scope.issueTypeFilter = function() {
        $rootScope.$broadcast('issueTypeChange');
    };
});

app.controller('IssueStateCtrl', function($scope, $rootScope, SettingsService) {
    $scope.stateFilters = SettingsService.active.stateFilters;
    $scope.issueStateFilter = function() {
        $rootScope.$broadcast('issueStateChange');
    };
});
