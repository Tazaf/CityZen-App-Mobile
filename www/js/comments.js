/**
 * This is a module responsible for the comment management in the issue details screen.
 */
var app = angular.module('cityzen.comments', ['cityzen.issues', 'cityzen.data-manager']);

/**
 * Defines the CommentsService that can add a comment and order them by their publication date.
 */
app.service('CommentsService', function ($http, apiUrl, $filter) {
    return {
        
        /**
         * Adds a comment to the given issue.
         * @param {String} comment The comment to add
         * @param {String} issueId The issue's ID to which add the comment
         * @returns {Promise} The http promise of the action
         */
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
        
        /**
         * Order the comments by their postedOn property.
         * @param {Array} comments An array of comment Object to order
         * @returns {Array} A sorted Array of comment Object
         */
        oderComments: function (comments) {
            return $filter('orderBy')(comments, '-postedOn', true);
        }
    };
});

/**
 * The controller that manages the comment on the issue details screen.
 */
app.controller('CommentsCtrl', function ($rootScope, $scope, CommentsService, DataManager) {
    
    // Declare the comment variable in the scope that is bind to the view
    $scope.comment = null;
    
    /**
     * Add a comment by calling the addComment function from the CommentsService.
     * If the comment is successfully added, the comment variable is reset and the newComment event is fired to the parent scope.
     * If an error occured, a notification is showed to the user.
     */
    $scope.addComment = function () {
        CommentsService
                .addComment($scope.comment, $scope.issue.id)
                .success(function (data) {
                    $scope.comment = null;
                    $scope.$emit('newComment', DataManager.orderData(data));
                })
                .error(function () {
                    $rootScope.toast.show("Erreur lors de l'ajout du commentaire");
                });
    };
});