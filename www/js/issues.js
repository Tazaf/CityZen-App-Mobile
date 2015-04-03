var app = angular.module('cityzen.issues', ['angular-storage', 'cityzen.tags', 'cityzen.comments', 'cityzen.maps', 'cityzen.data-manager']);
app.factory('IssuesService', function ($q, $http, apiUrl, TagsService, CommentsService, SettingsService, MapService, DataManager) {
    return {
        getAllIssues: function (page, nb_item) {
            return $http({
                method: 'POST',
                url: apiUrl + '/issues/search',
                data: {},
                headers: {
                    'x-pagination': page + ';' + nb_item,
                    'x-sort': 'updatedOn'
                }
            });
        },
        getMyIssues: function (page, nb_item) {
            return $http({
                method: 'GET',
                url: apiUrl + '/me/issues',
                headers: {
                    'x-pagination': page + ';' + nb_item,
                    'x-sort': 'updatedOn'
                }
            });
        },
        getCloseIssues: function (page, nb_item, pos, range) {
            return $http({
                method: 'POST',
                data: {
                    loc: {
                        $geoWithin: {
                            $centerSphere: [
                                [pos.lng, pos.lat],
                                range
                            ]
                        }
                    }
                },
                headers: {
                    'x-pagination': page + ';' + nb_item,
                    'x-sort': 'updatedOn'
                },
                url: apiUrl + '/issues/search'
            });
        },
        getOneIssue: function (id) {
            return $http({
                method: 'GET',
                url: apiUrl + '/issues/' + id
            });
        },
        getViewData: function (view, pos) {
            if (view === 'all') {
                return this.getAllIssues(0, '*');
            }
            if (view === 'close') {
                var _this = this;
                if (pos) {
                    var range = SettingsService.active.closeRange / 1000 / 6378.1;
                    return _this.getCloseIssues(0, '*', pos, range);
                } else {
                    return MapService.locate().then(function (pos) {
                        var range = SettingsService.active.closeRange / 100 / 6378.1;
                        return _this.getCloseIssues(0, '*', pos, range);
                    });
                }
            }
            if (view === 'mine') {
                return this.getMyIssues(0, '*');
            }
        },
        getIssueData: function (id) {
            var dfd = $q.defer();
            this
                    .getOneIssue(id)
                    .success(function (data) {
                        dfd.resolve(DataManager.orderData(data));
                    })
                    .error(function (error) {
                        dfd.resolve(null);
                    });
            return dfd.promise;
        }
    };
});
app.controller('ListCtrl', function (
        $rootScope,
        $scope,
        IssuesService,
        $state,
        $ionicPopup,
        Loading,
        MapService,
        messages,
        $ionicPlatform,
        SettingsService) {
    console.log('ListCtrl loaded');

    $scope.$on('$ionicView.beforeEnter', function () {
        $rootScope.enableLeft = true;
    });

    $scope.goToDetails = function (issueId) {
        $state.go('app.details', {issueId: issueId});
    };
    $scope.showHelp = function () {
        $ionicPopup.alert({
            title: 'Légende des statuts',
            buttons: [{
                    text: 'OK',
                    type: 'button-royal'
                }],
            templateUrl: 'templates/popup-info-states.html'
        });
    };
    $scope.loadData = function (pos) {
        Loading.show(messages.load_data);
        $scope.error = null;
        console.log("Active View : " + $scope.config.activeView);
        IssuesService
                .getViewData($scope.config.activeView, pos)
                .then(function (response) {
                    console.log("Response : ");
                    console.log(response.data);
                    if (response.data.length === 0) {
                        $scope.error = {msg: messages.no_result};
                    } else {
                        $scope.issues = response.data;
                        $scope.init_issues = response.data;
                        console.log('Des résultats');
                        console.log(response.data.length);
                    }
                }, function (error) {
                    $scope.error = {msg: messages.error};
                    console.log(error);
                })
                .then(function () {
                    Loading.hide();
                });
    };
    $scope.handleError = function (error) {
        console.log('Error !');
        console.log(error);
    };

    $ionicPlatform.ready(function () {
        MapService.locate().then($scope.loadData, $scope.handleError);
    });

    // Update the data when a config changes
    $scope.$on('viewChange', function () {
        $scope.issues = [];
        MapService.locate().then($scope.loadData, $scope.handleError);
    });

    // Update the data when a filter changes
    $scope.$on('issueTypeChange', function () {
        $scope.error = null;
        $scope.issues = IssuesService.filterIssueState($scope.init_issues, SettingsService.active.stateFilters);
        $scope.issues = IssuesService.filterIssueType($scope.issues, $scope.config.issueTypes);
        if ($scope.issues.length === 0) {
            $scope.error = {msg: messages.no_result};
        }
        console.log($scope.issues.length);
    });

    // Update the data when a filter changes
    $scope.$on('issueStateChange', function () {
        $scope.error = null;
        var temp_filtered_results = IssuesService.filterIssueType($scope.init_issues, $scope.config.issueTypes);
        $scope.issues = IssuesService.filterIssueState(temp_filtered_results, SettingsService.active.stateFilters);
        if ($scope.issues.length === 0) {
            $scope.error = {msg: messages.no_result};
        }
        console.log($scope.issues.length);
    });
});

/**
 * This controller is used to manage a single issue data and show them to the user.
 */
app.controller('DetailsCtrl', function (messages, $rootScope, $scope, $state, issue, store, Loading) {

    // Disable the swipe menu for this view.
    $scope.$on('$ionicView.beforeEnter', function () {
        $rootScope.enableLeft = false;
    });

    // Reload the data when a new comment is posted.
    $scope.$on('newComment', function (e, data) {
        $scope.issue = data;
    });
    
    // This function saves the localisation of the issue in order to pass them to the app.details.map view.
    $scope.showIssueOnMap = function () {
        store.set('issue', {
            lat: $scope.issue.lat,
            lng: $scope.issue.lng,
            description: $scope.issue.description
        });
        $state.go('app.details.map');
    };
    
    // Loads the issue's data in the view or show an error message if this fails.
    Loading.show(messages.loading);
    if (issue) {
        $scope.issue = issue;
        Loading.hide();
    } else {
        $scope.error = {msg: messages.error_issue};
        Loading.hide();
    }
});