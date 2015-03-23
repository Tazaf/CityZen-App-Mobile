var app = angular.module('cityzen.menus', ['angular-storage', 'cityzen.settings']);

app.controller('MenuCtrl', function ($scope, android, user, settings, pos_icon) {
    console.log('Initialising config');
    $scope.isAndroid = android;
    $scope.user = user;
    $scope.settings = settings;
    $scope.config = {
        activeView: $scope.settings.homeView,
        issueTypes: []
    };
    $scope.pos_icon = pos_icon;
    console.log('Config loaded');
});

app.controller('ViewIssuesCtrl', function ($rootScope, $scope, SettingsService) {
    console.log('ViewIssuesCtrl loaded');
    $scope.changeView = function () {
        $rootScope.$broadcast('viewChange');
    };
});

app.controller('IssueTypeCtrl', function ($scope, $http, apiUrl, $rootScope) {

    $scope.error = false;
    $scope.loadIssueTypes = function () {
        $http({
            method: 'GET',
            url: apiUrl + '/issueTypes'
        }).success(function (issue_types) {
            console.log('issueTypes loaded');
            for (var i = 0; i < issue_types.length; i++) {
                $scope.config.issueTypes.push({
                    name: issue_types[i].name,
                    checked: true
                });
            }
        }).error(function () {
            console.log('issueTypes loaded');
            $scope.error.issueTypes = true;
        });
    };
    
    $scope.issueTypeFilter = function() {
        $rootScope.$broadcast('issueTypeChange');
    };
    
    $scope.loadIssueTypes();
});

app.controller('IssueStateCtrl', function($scope, $rootScope) {
    console.log('IssueStateCtrl loaded');
    console.log($scope.settings.stateFilters);
    $scope.issueStateFilter = function() {
        $rootScope.$broadcast('issueStateChange');
    };
});
