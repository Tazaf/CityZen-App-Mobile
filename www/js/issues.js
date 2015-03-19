var app = angular.module('cityzen.issues', ['angular-storage', 'cityzen.tags', 'cityzen.comments']);
app.factory('IssuesService', function ($http, apiUrl, TagsService, CommentsService, geolocation, SettingsService) {
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
        getCloseIssues: function (page, nb_item, range, pos) {
            console.log('Getting the closest issues');
            return $http({
                method: 'POST',
                data: {
                    loc: {
                        $geoWithin: {
                            $centerSphere: [
                                pos,
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
                console.log(view);
                console.log('All Issues');
                return this.getAllIssues(0, '*');
            }
            if (view === 'close') {
                console.log(view);
                console.log('Close Issues');
                var getData = this.getCloseIssues;
                if (pos) {
                    var range = SettingsService.getCloseRange();
                    return getData(0, '*', pos, range);
                } else {
                    return geolocation.getLocation().then(function (data) {
                        var range = SettingsService.getCloseRange();
                        var pos = [data.coords.latitude, data.coords.longitude];
                        return getData(0, '*', pos, range);
                    }, function (error) {
                        console.log('Error : ' + error);
                        return error;
                    });
                }
            }
            if (view === 'mine') {
                console.log(view);
                console.log('My Issues');
                return this.getMyIssues(0, '*');
            }
        }
    };
});

app.controller('ListCtrl', function ($scope, IssuesService, $state, $ionicPopup, $ionicLoading) {
    console.log('ListCtrl loaded');
    // Définition Variables, Fonctions et Events
    $scope.$root.enableLeft = true;
    $scope.goToDetails = function (issueId) {
        $state.go('app.details', {issueId: issueId});
    };
    $scope.showHelp = function () {
        var alertPopup = $ionicPopup.alert({
            title: 'Légende des statuts',
            buttons: [{
                    text: 'OK',
                    type: 'button-royal'
                }],
            templateUrl: 'templates/popup-info-states.html'
        });
    };
    $scope.loadData = function () {
        $scope.error = null;
        IssuesService
                .getViewData($scope.config.homeView)
                .then(function (response) {
                    console.log(response.data);
                    if (response.data.length === 0) {
                        $scope.error = {msg: "Désolé, aucun résultat..."};
                    } else {
                        $scope.issues = response.data;
                    }
                }, function (error) {
                    $scope.error = {
                        msg: "Impossible de charger des problèmes."
                    };
                });
        $ionicLoading.hide();
    };
    $scope.$on('$ionicView.enter', function () {
        $ionicLoading.show({
            template: 'Chargement...'
        });
        $scope.loadData();
    });

    $scope.$on('configChanged', function () {
        $scope.issues = [];
        $scope.loadData();
    });
});
app.controller('DetailsCtrl', function ($scope, $state, $stateParams, IssuesService, store, $ionicLoading) {
    // Disable the swipe menu for this screen
    $scope.$root.enableLeft = false;
    // Re-enable the swipe menu for the adequates screens
    $scope.$on('$stateChangeStart', function () {
        $scope.$root.enableLeft = true;
    });
    $scope.$on('$ionicView.enter', function () {
        $ionicLoading.show({
            template: 'Chargement...'
        });
        $scope.loadData();
    });
    $scope.showIssueOnMap = function () {
        store.set('issue', {
            lat: $scope.issue.lat,
            lng: $scope.issue.lng,
            description: $scope.issue.description
        });
        $state.go('app.details.map');
    };
    $scope.loadData = function () {
        IssuesService
                .getOneIssue($stateParams.issueId)
                .success(function (data) {
                    $scope.issue = IssuesService.orderData(data);
                })
                .error(function (error) {
                    $scope.error = {
                        msg: "Impossible de charger les données..."
                    };
                });
        $ionicLoading.hide();
    };
});