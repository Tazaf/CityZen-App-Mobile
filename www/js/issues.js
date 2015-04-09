/**
 * This module is used to manage the issues throughout the application.
 */
var app = angular.module('cityzen.issues', ['angular-storage', 'cityzen.tags', 'cityzen.comments', 'cityzen.maps', 'cityzen.data-manager']);

/**
 * Defines the IssuesService that manage all the action relative to the issues.
 * It can get all the issues, the user's issue, the closest issue to the user or one issue from the database.
 * It can add a single issue to the database.
 */
app.factory('IssuesService', function ($q, $http, apiUrl, Settings, MapService, DataManager) {
    return {
        /**
         * Returns all the issues contained in the database but filter the result with the page and nb_item attributes.
         * These attributes are not concretely used in the application because the way the backend handle the pagination would have required some workaround.
         * @param {Integer} page The desired page
         * @param {Integer} nb_item The number of item to show
         * @returns {Promise} The http promise of the action
         */
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
        /**
         * Returns the isssues from the database that were posted by the active user but filter the result with the page and nb_item attributes.
         * These attributes are not concretely used in the application because the way the backend handle the pagination would have required some workaround.
         * @param {Integer} page The desired page
         * @param {Integer} nb_item The number of item to show
         * @returns {Promise} The http promise of the action
         */
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
        /**
         * Returns the closest issues from the user from the database but filter the result with the page and nb_item attributes.
         * The closes issues are retrieved with the pos attribute (the user's position. must have at least a lat and a lng properties) and the range attribute (the range of the research).
         * These attributes are not concretely used in the application because the way the backend handle the pagination would have required some workaround.
         * @param {Integer} page The desired page
         * @param {Integer} nb_item The number of item to show
         * @param {Object} pos The user's position defined by it's latitude (lat) and longitude (lng)
         * @param {Integer} range The range of the research, in radius
         * @returns {Promise} The http promise of the action
         */
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
        /**
         * Insert an issue on the database.
         * The parameter must have at least the following properties.
         * <ul>
         * <li>String description The issue's description</li>
         * <li>Double lat The issue's latitude</li>
         * <li>Double lng The issue's longitude</li>
         * <li>String imageUrl The issue's image URL</li>
         * <li>String issueTypeId The issue's type ID</li>
         * </ul>
         * @param {Object} issue The issue to insert
         * @returns {Promise} The http promise of the action
         */
        addOneIssue: function (issue) {
            return $http({
                method: 'POST',
                url: apiUrl + '/issues',
                data: {
                    description: issue.description,
                    lat: issue.lat,
                    lng: issue.lng,
                    imageUrl: issue.imageUrl,
                    issueTypeId: issue.issueType.id
                }
            });
        },
        /**
         * This method get the correct data for the given view.
         * For the "all" view, calls the getAllIssues function.
         * For the "clos" view, calls the getCloseIssues function.
         * For the "mine" view, calls the getMyIssues function.
         * @param {String} view The view for which we want to retrieve the data. The value must be either "all", "close" or "mine"
         * @returns {Promise} The http promise of the action
         */
        getViewData: function (view) {
            var pos = Settings.active.pos;
            if (view === 'all') {
                return this.getAllIssues(0, '*');
            }
            if (view === 'close') {
                var _this = this;
                if (pos) {
                    var range = Settings.stored.closeRange / 1000 / 6378.1;
                    return _this.getCloseIssues(0, '*', pos, range);
                } else {
                    return MapService.locate().then(function (pos) {
                        var range = Settings.stored.closeRange / 100 / 6378.1;
                        return _this.getCloseIssues(0, '*', pos, range);
                    });
                }
            }
            if (view === 'mine') {
                return this.getMyIssues(0, '*');
            }
        },
        /**
         * Get the data for one issue, based on the given ID
         * @param {String} id The issue's ID for which we want to retrieve the data
         * @returns {Promise} The http promise of the action
         */
        getIssueData: function (id) {
            var dfd = $q.defer();
            $http({
                method: 'GET',
                url: apiUrl + '/issues/' + id
            }).success(function (data) {
                dfd.resolve(DataManager.orderData(data));
            }).error(function () {
                dfd.resolve(null);
            });
            return dfd.promise;
        }
    };
});

/**
 * The controller that manages the list display of the issues
 */
app.controller('ListCtrl', function ($rootScope, $scope, $ionicPopup, Loading) {

    // Enable the swipe menu for this view.
    $scope.$on('$ionicView.beforeEnter', function () {
        $rootScope.enableLeft = true;
    });

    // When catching the 'dataload' event, hide the Loading screen.
    $scope.$on('dataloaded', function () {
        Loading.hide();
    });

    /**
     * Register the showHelp function in the scope.
     * This function displays a informative popup about the issues' states legend.
     */
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

    /**
     * Register the showIssueOnMal function to the scope.
     * This function saves the localisation of the issue in the LocalStorage in order to pass them to the app.details.map view.
     */
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