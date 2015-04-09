/**
 * This moduls is responsible for the tag feature in the issue details screen.
 */
var app = angular.module('cityzen.tags', []);

/**
 * Defines the TagsService service that can remove, add or order the tags
 */
app.service('TagsService', function ($http, apiUrl, $filter) {
    return {
        /**
         * Removes the given tag for the given issue from the database.
         * @param {String} tag The tag to be removed
         * @param {String} issueId The issue's ID from which the tag should be removed
         * @returns {Promise} The http promise of the action
         */
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
        /**
         * Adds the given tag for the given issue in the database.
         * @param {String} tag The tag to be added
         * @param {String} issueId The issue's ID from which the tag should be added
         * @returns {Promise} The http promise of the action
         */
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
        /**
         * Orders the given tags array in an alphabetical order
         * @param {Array} tags The tags array to be ordered
         * @returns {Array} The ordered tags array
         */
        orderTags: function (tags) {
            return $filter('orderBy')(tags);
        }
    };
});

/**
 * The controller that manages the tags feature in the issue details view.
 */
app.controller('TagsCtrl', function ($scope, TagsService, $ionicPopup, $filter, $rootScope) {

    /**
     * Registers the showAddTagPopup in the scope.
     * This function shows the popup that can be used to add a tag to the issue.
     * @returns {undefined}
     */
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
    
    /**
     * Registers the addTag function in the scope.
     * This function adds the given tag to the current issue.
     * First, it removes all the whitespace in the given tag.
     * Then, it calls the addTag() function from the TagsService and shows the new tag on the view if the tag has been added.
     * @param {String} tag The tag value
     * @returns {void}
     */
    $scope.addTag = function (tag) {
        if (tag) {
            tag = tag.replace(/ /g, '');
            TagsService
                    .addTag(tag, $scope.issue.id)
                    .success(function () {
                        $scope.issue.tags.push(tag);
                        $scope.issue.tags = TagsService.orderTags($scope.issue.tags);
                    })
                    .error(function () {
                        $rootScope.toast.show("Erreur lors de l'ajout du tag");
                    });
        }
    };
    
    /**
     * Registers the removeTag function in the scope.
     * This function removes the given tag from the current issue.
     * It calls the removeTag() function from the TagsService and remove the tag from the view if the result is a success.
     * @param {String} tag The tag value to be removed.
     * @returns {void}
     */
    $scope.removeTag = function (tag) {
        TagsService
                .removeTag(tag, $scope.issue.id)
                .success(function () {
                    $scope.issue.tags = $filter('filter')($scope.issue.tags, function (value) {
                        return value !== tag;
                    });
                })
                .error(function () {
                    $rootScope.toast.show("Erreur lors de la suppression du tag");
                });
    };
});