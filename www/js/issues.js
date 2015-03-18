var app = angular.module('cityzen.issues', []);

app.service('IssuesService', function ($http, apiUrl) {
    return {
        getAllIssues: function (page, nb_item) {
            return $http({
                method: 'GET',
                url: apiUrl + '/issues',
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
        }
    };
});

app.service('TagsService', function ($http, apiUrl) {
    return {
        removeTag: function (tag, issueId) {
            return $http({
                method: 'POST',
                data: {
                    type: "removeTags",
                    payload: {
                        tags: [tag]
                    }
                },
                url: apiUrl + '/issues/' + issueId + '/actions'
            });
        },
        addTag: function (tag, issueId) {
            return $http({
                method: 'POST',
                data: {
                    type: "addTags",
                    payload: {
                        tags: [tag]
                    }
                },
                url: apiUrl + '/issues/' + issueId + '/actions'
            });
        }
    };
});

app.service('CommentsService', function ($http, apiUrl) {
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
        }
    };
});

app.controller('ListCtrl', function ($scope, IssuesService, $ionicLoading) {
    $scope.$root.enableLeft = true;
    IssuesService
            .getAllIssues(0, 15)
            .success(function (data) {
                $scope.issues = data;
            })
            .error(function () {
                $scope.error = {
                    msg: "Impossible de charger les problèmes"
                };
            });
});

app.controller('DetailsCtrl', function ($scope, $ionicPopup, $stateParams, IssuesService, CommentsService) {
    // Disable the swipe menu for this screen
    $scope.$root.enableLeft = false;
    // Re-enable the swipe menu for the adequates screens
    $scope.$on('$stateChangeStart', function () {
        $scope.$root.enableLeft = true;
    });
    // Show the add comment popup
    $scope.showAddCommentPopup = function () {
        $scope.comment = {};
        var myPopup = $ionicPopup.show({
            template: '<textarea class="comment" type="text" ng-model="comment.msg"></textarea>',
            title: 'Nouveau commentaire',
            scope: $scope,
            buttons: [
                {text: 'Annuler'},
                {
                    text: '<b>Sauver</b>',
                    type: 'button-royal',
                    onTap: function () {
                        return $scope.comment.msg;
                    }
                }
            ]
        });
        myPopup.then(function (comment) {
            $scope.addComment(comment);
        });
    };
// 
    // Add a new comment
    $scope.addComment = function (comment) {
        console.log(comment);
        if (comment) {
            CommentsService
                    .addComment(comment, $scope.issue.id)
                    .success(function (data) {
                        $scope.issue = data;
                    })
                    .error(function () {
                        // TODO : ajouter une alert d'erreur
                        console.log('error');
                    });
        }
    };
    IssuesService
            .getOneIssue($stateParams.issueId)
            .success(function (data) {
                $scope.issue = data;
                console.log($stateParams.issueId);
            });
});

app.controller('TagsCtrl', function ($scope, TagsService, $ionicPopup) {
    // Show the add tag popup
    $scope.showAddTagPopup = function () {
        $scope.tag = {};
        var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="tag.name">',
            title: 'Nouveau tag',
            scope: $scope,
            buttons: [
                {text: 'Annuler'},
                {
                    text: '<b>Sauver</b>',
                    type: 'button-royal',
                    onTap: function () {
                        return $scope.tag.name;
                    }
                }
            ]
        });
        myPopup.then(function (tag) {
            $scope.addTag(tag);
        });
    };
    // Add a new tag
    $scope.addTag = function (tag) {
        if (tag) {
            TagsService
                    .addTag(tag, $scope.issue.id)
                    .success(function () {
                        $scope.issue.tags.push(tag);
                    })
                    .error(function () {
                        // TODO : ajouter une alert d'erreur
                        console.log('error');
                    });
        }
    };
    // Remove a tag
    $scope.removeTag = function (tag) {
        console.log(tag);
        TagsService
                .removeTag(tag, $scope.issue.id)
                .success(function () {
                    console.log('success');
                })
                .error(function () {
                    console.log('error');
                });
    };
});