var app = angular.module('cityzen.issues', ['angular-storage', 'cityzen.tags', 'cityzen.comments', 'cityzen.maps']);
app.factory('IssuesService', function ($q, $http, apiUrl, TagsService, CommentsService, SettingsService, MapService) {
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
        orderData: function (data) {
            data.tags = TagsService.orderTags(data.tags);
            data.comments = CommentsService.oderComments(data.comments);
            return data;
        },
        getViewData: function (view, pos) {
            if (view === 'all') {
                return this.getAllIssues(0, '*');
            }
            if (view === 'close') {
                var _this = this;
                if (pos) {
                    var range = SettingsService.getCloseRange() / 1000 / 6378.1;
                    return _this.getCloseIssues(0, '*', pos, range);
                } else {
                    return MapService.locate().then(function (pos) {
                        var range = SettingsService.getCloseRange() / 100 / 6378.1;
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
            var _this = this;
            _this
                    .getOneIssue(id)
                    .success(function (data) {
                        dfd.resolve(_this.orderData(data));
                    })
                    .error(function (error) {
                        dfd.resolve(null);
                    });
            return dfd.promise;
        },
        filterIssueType: function (data, filters) {
            var response = [];
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < filters.length; j++) {
                    if (filters[j].checked && data[i].issueType.name === filters[j].name) {
                        response.push(data[i]);
                    }
                }
            }
            return response;
        },
        filterIssueState: function (data, filters) {
            var response = [];
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < filters.length; j++) {
                    if (filters[j].checked && data[i].state === filters[j].name) {
                        response.push(data[i]);
                    }
                }
            }
            return response;
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
        MapService) {
    console.log('ListCtrl loaded');
    $rootScope.enableLeft = true;
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
        Loading.show("Chargement des données");
        $scope.error = null;
        console.log("Active View : " + $scope.config.activeView);
        IssuesService
                .getViewData($scope.config.activeView, pos)
                .then(function (response) {
                    console.log("Response : ");
                    console.log(response.data);
                    if (response.data.length === 0) {
                        $scope.error = {msg: "Désolé, aucun résultat..."};
                    } else {
                        $scope.issues = response.data;
                        $scope.init_issues = response.data;
                    }
                }, function (error) {
                    $scope.error = {msg: "Impossible de charger les problèmes."};
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
    MapService.locate().then($scope.loadData, $scope.handleError());
    // Update the data when a config changes
    $scope.$on('viewChange', function () {
        $scope.issues = [];
        MapService.locate().then($scope.loadData, $scope.handleError());
    });
    // Update the data when a config changes
    $scope.$on('issueTypeChange', function () {
        $scope.error = null;
        $scope.issues = IssuesService.filterIssueState($scope.init_issues, $scope.settings.stateFilters);
        $scope.issues = IssuesService.filterIssueType($scope.issues, $scope.config.issueTypes);
        if ($scope.issues.length === 0) {
            $scope.error = {msg: "Désolé, aucun résultat..."};
        }
    });
    // Update the data when a config changes
    $scope.$on('issueStateChange', function () {
        $scope.error = null;
        $scope.issues = IssuesService.filterIssueType($scope.init_issues, $scope.config.issueTypes);
        $scope.issues = IssuesService.filterIssueState($scope.issues, $scope.settings.stateFilters);
        if ($scope.issues.length === 0) {
            $scope.error = {msg: "Désolé, aucun résultat..."};
        }
    });
});
app.controller('DetailsCtrl', function ($rootScope, $scope, $state, issue, store, Loading) {

    $rootScope.enableLeft = false;
    // Re-enable the swipe menu for the adequates screens
    $scope.$on('$stateChangeStart', function () {
        $rootScope.enableLeft = true;
    });
    $scope.$on('newComment', function (e, data) {
        $scope.issue = data;
    });
    $scope.showIssueOnMap = function () {
        store.set('issue', {
            lat: $scope.issue.lat,
            lng: $scope.issue.lng,
            description: $scope.issue.description
        });
        $state.go('app.details.map');
    };
    Loading.show("Chargement...");
    if (issue) {
        $scope.issue = issue;
        Loading.hide();
    } else {
        $scope.error = {msg: "Impossible de charger le problème."};
        Loading.hide();
    }
});