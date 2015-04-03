var app = angular.module('cityzen.tags', []);

app.service('TagsService', function ($http, apiUrl, $filter) {
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
        },
        orderTags: function (tags) {
            return $filter('orderBy')(tags);
        }
    };
});

app.controller('TagsCtrl', function ($scope, TagsService, $ionicPopup, $filter) {
    // Show the add tag popup
    $scope.showAddTagPopup = function () {
        $scope.tag = {};
        var myPopup = $ionicPopup.show({
            templateUrl: 'templates/popup-tag.html',
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
                        $scope.issue.tags = TagsService.orderTags($scope.issue.tags)
                    })
                    .error(function () {
                        // TODO : ajouter une alert d'erreur
                    });
        }
    };
    // Remove a tag
    $scope.removeTag = function (tag) {
        TagsService
                .removeTag(tag, $scope.issue.id)
                .success(function () {
                    $scope.issue.tags = $filter('filter')($scope.issue.tags, function (value) {
                        return value !== tag;
                    });
                })
                .error(function () {
                    // TODO : ajouter une alerte d'erreur
                });
    };
});