var app = angular.module('cityzen.menus', ['angular-storage', 'cityzen.settings', 'cityzen.maps', 'cityzen.issues', 'cityzen.data-manager', 'cityzen.auth']);

app.controller('MenuCtrl', function ($q, $scope, android, user, pos_icon, issueTypes, SettingsService, MapService, messages, Loading, IssuesService, DataManager, AuthService) {
    $scope.logout = function () {
        AuthService.logout();
    };

    function loadData() {
        $scope.$broadcast('located');
        Loading.show(messages.load_data);
        $scope.error = null;
        var dfd = $q.defer();
        IssuesService
                .getViewData($scope.config.activeView)
                .then(function (response) {
                    if (response.data.length === 0) {
                        $scope.error = {msg: messages.no_result};
                        dfd.resolve([]);
                    } else {
                        dfd.resolve(response.data);
                    }
                }, function (error) {
                    dfd.reject({
                        msg: messages.error,
                        value: error
                    });
                });
        return dfd.promise;
    }

    function handleError(error) {
        $scope.error = error;
        console.log("ERROR :");
        console.log(error);
    }

    function main() {
        MapService.locate().then(loadData).then(function (data) {
            $scope.init_issues = data;
            sort();
        }, handleError);
    }

    function sort() {
        $scope.error = null;
        $scope.issues = DataManager.filterIssueState(DataManager.filterIssueType($scope.init_issues));
        if ($scope.init_issues.length === 0) {
            $scope.error = {msg: messages.no_result};
        } else if ($scope.issues.length === 0) {
            $scope.error = {msg: messages.filter_fail};
        }
        $scope.$broadcast('dataloaded');
    }

    $scope.$on('viewChange', function () {
        main();
    });

    // Update the data when a config changes
    $scope.$on('filterChange', function () {
        sort();
    });

    $scope.$on('rangeChange', function () {
        main();
    });

    $scope.isAndroid = android;
    $scope.user = user;
    $scope.config = {
        activeView: SettingsService.stored.homeView
    };
    SettingsService.active.typeFilters = issueTypes;
    $scope.pos_icon = pos_icon;

    main();
});

app.controller('ViewIssuesCtrl', function ($rootScope, $scope) {
    $scope.changeView = function () {
        $rootScope.$broadcast('viewChange');
    };
});

app.controller('IssueTypeCtrl', function ($scope, $rootScope, SettingsService) {
    $scope.issueTypes = SettingsService.active.typeFilters;
    $scope.issueTypeFilter = function () {
        $rootScope.$broadcast('filterChange');
    };
});

app.controller('IssueStateCtrl', function ($scope, $rootScope, SettingsService, store) {
    $scope.stateFilters = SettingsService.active.stateFilters;
    $scope.issueStateFilter = function () {
        $rootScope.$broadcast('filterChange');
    };
});
