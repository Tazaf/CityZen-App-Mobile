var app = angular.module('cityzen.comments', ['cityzen.issues']);

app.service('CommentsService', function ($http, apiUrl, $filter) {
    return {
        addComment: function (comment, issueId) {
            return $http({
                method: 'POST',
                data: {
                    type: "comment",
                    payload: {
                        text: comment
                    }
                },
                url: apiUrl + '/issues/' + issueId + '/actions'
            });
        },
        oderComments: function (comments) {
            return $filter('orderBy')(comments, '-postedOn', true);
        }
    };
});

app.controller('CommentsCtrl', function ($scope, CommentsService, IssuesService) {
    $scope.comment = null;
    // Add a new comment
    $scope.addComment = function () {
        CommentsService
                .addComment($scope.comment, $scope.issue.id)
                .success(function (data) {
                    $scope.comment = null;
                    $scope.$parent.issue = IssuesService.orderData(data);
                })
                .error(function () {
                    // TODO : ajouter une alert d'erreur
                    console.log('error');
                });
    };
});