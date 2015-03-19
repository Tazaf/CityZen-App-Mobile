var app = angular.module('cityzen.issues', ['angular-storage', 'cityzen.tags', 'cityzen.comments']);

app.service('IssuesService', function ($http, apiUrl, TagsService, CommentsService) {
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
        getCloseIssues: function (page, nb_item) {
            return $http({
                method: 'GET',
                headers: {
                    'x-pagination': page + ';' + nb_item,
                    'x-sort': 'updatedOn'
                },
                url: apiUrl + '/issues'
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
        }
    };
});

app.controller('ListCtrl', function ($scope, IssuesService, $state) {
    $scope.$root.enableLeft = true;
    $scope.goToDetails = function(issueId) {
        $state.go('app.details', {issueId: issueId});
    };
    IssuesService
            .getAllIssues(0, 50)
            .success(function (data) {
                if (data.length === 0) {
                    $scope.error = {msg: "Désolé, aucun résultat..."};
                } else {
                    $scope.$parent.issues = data;
                }
            })
            .error(function () {
                $scope.error = {
                    msg: "Impossible de charger des problèmes."
                };
            });
});

app.controller('DetailsCtrl', function ($scope, $state, $stateParams, IssuesService, store) {
    // Disable the swipe menu for this screen
    $scope.$root.enableLeft = false;
    // Re-enable the swipe menu for the adequates screens
    $scope.$on('$stateChangeStart', function () {
        $scope.$root.enableLeft = true;
    });
    $scope.showIssueOnMap = function () {
        store.set('issue', {
            lat: $scope.issue.lat,
            lng: $scope.issue.lng,
            description: $scope.issue.description
        });
        $state.go('app.details.map');
    };
    IssuesService
            .getOneIssue($stateParams.issueId)
            .success(function (data) {
                $scope.issue = IssuesService.orderData(data);
            });
});