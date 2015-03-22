var app = angular.module('cityzen.issues', ['angular-storage', 'cityzen.tags', 'cityzen.comments', 'cityzen.maps']);
app.factory('IssuesService', function ($q, $http, apiUrl, TagsService, CommentsService, geolocation, SettingsService, MapService) {
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
        /*
         * 
         */
        getCloseIssues: function (page, nb_item, pos, range) {
            console.log('Getting the closest issues');
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
                    console.log(range);
                    return _this.getCloseIssues(0, '*', pos, range);
                } else {
                    return MapService.locate().then(function (pos) {
                        var range = SettingsService.getCloseRange();
                        console.log(range);
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
                        console.log('Load an Issue Error : ' + error);
                        dfd.resolve(null);
                    });
            return dfd.promise;
        }
    };
});

app.controller('ListCtrl', function ($rootScope, $scope, IssuesService, $state, $ionicPopup, Loading, MapService) {
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
        Loading.show($scope, "Chargement...");
        $scope.error = null;
        console.log("Active View : " + $scope.activeView);
        IssuesService
                .getViewData($scope.config.activeView, pos)
                .then(function (response) {
                    console.log("Response : ");
                    console.log(response.data);
                    if (response.data.length === 0) {
                        $scope.error = {msg: "Désolé, aucun résultat..."};
                    } else {
                        $scope.issues = response.data;

                    }
                }, function (error) {
                    $scope.error = {msg: "Impossible de charger les problèmes."};
                    console.log(error);
                })
                .then(function () {
                    Loading.hide();
                });
    };
    
    $scope.handleError = function(error) {
        console.log('Error !');
        console.log(error);
    };

    MapService.locate().then($scope.loadData, $scope.handleError());

    // Update the data when a config changes
    $scope.$on('viewChange', function () {
        $scope.issues = [];
        $scope.loadData();
    });
});
app.controller('DetailsCtrl', function ($rootScope, $scope, $state, $stateParams, issue, store, Loading) {
    
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

    Loading.show($scope, "Chargement...");
    if (issue) {
        $scope.issue = issue;
        Loading.hide();
    } else {
        $scope.error = {msg: "Impossible de charger le problème."};
        Loading.hide();
    }
});