/*
 * This module is used to manage the main menu of the application
 */
var app = angular.module('cityzen.menus', ['angular-storage', 'cityzen.settings', 'cityzen.maps', 'cityzen.issues', 'cityzen.data-manager', 'cityzen.auth']);

/**
 * The controller that's manages the menu view
 */
app.controller('MenuCtrl', function ($state, $rootScope, $q, $scope, android, user, pos_icon, issueTypes, Settings, MapService, messages, Loading, IssuesService, DataManager, AuthService) {

    /**
     * Registers the logout function in the scope.
     * This function calls the logout() function from the AuthService.
     */
    $scope.logout = function () {
        AuthService.logout();
    };

    /**
     * Registers the goToDetails function in the scope.
     * This function changes the view to 'app.details' and send the required issue's ID.
     * @param {String} issueId The issue's ID that will be displayed in the details screen.
     */
    $scope.goToDetails = function (issueId) {
        $state.go('app.details', {issueId: issueId});
    };

    /**
     * Loads the data from the database according to the active view.
     * @returns {Promise} The promise of the action
     */
    function loadData() {
        $scope.$broadcast('located');
        Loading.show(messages.load_data);
        $scope.error = null;
        var dfd = $q.defer();
        IssuesService
                .getViewData($scope.config.activeView)
                .then(function (response) {
                    if (response.data.length === 0) {
                        $scope.error = {msg: messages.no_result};
                        dfd.resolve([]);
                    } else {
                        dfd.resolve(response.data);
                    }
                }, function (error) {
                    dfd.reject({
                        msg: messages.error,
                        value: error
                    });
                });
        return dfd.promise;
    }

    /**
     * Handle any error that would occur from any function that returns a promise by showing a notification with the given error message.
     * @param {String} error The error message
     * @returns {void}
     */
    function handleError(error) {
        $rootScope.toast.show(error);
        Loading.hide();
    }

    /**
     * Defines the main process for menu.
     * First, locates, the user with the locate() function of the MapService service.
     * Then, loads the data with the loadData() function.
     * Finally, sets the init_issues in the scope with the received data and call the sort() function.
     * If an error occur anywhere in the process, calls the handleError() function.
     * @returns {void}
     */
    function main() {
        MapService.locate().then(loadData).then(function (data) {
            $scope.init_issues = data;
            sort();
        }, handleError);
    }

    /**
     * Applies the active filters on the issue's data.
     * Then, fire the 'dataload' event for the map to recreate the marker according to the sorted data.
     * @returns {void}
     */
    function sort() {
        $scope.error = null;
        $scope.issues = DataManager.filterIssueState(DataManager.filterIssueType($scope.init_issues));
        if ($scope.init_issues.length === 0) {
            $scope.error = {msg: messages.no_result};
        } else if ($scope.issues.length === 0) {
            $scope.error = {msg: messages.filter_fail};
        }
        $scope.$broadcast('dataloaded');
    }

    // When catching the 'reload' event, calls the main() function.
    $scope.$on('reload', function () {
        main();
    });

    // When catching the 'resort' event, calls the sort() function.
    $scope.$on('resort', function () {
        sort();
    });

    /**
     * Initiate the toast feature.
     * Set the toast variable in the rootScope for it to be available everywhere.
     * This could have been a separate service, but since the toast has an impact on the scope and it's not available on services, it's defined as a global variable.
     * The model defines the data of the toast, msg being the text of the toast and show handling wether or not it should be shown.
     */
    $rootScope.toast = {
        model: {
            msg: null,
            show: false
        },
        
        /**
         * Shows the toast on the screen with the adequate message.
         * The duration of the display is calculated based on the length of the message and the fact that a grown adult takes aproximately 100 milliseconds to read one character.
         * 1000 milliseconds are added to the result to give time for the different animations to process.
         * When the resulting duration has flown out, the toast is automatically reset and thus, hide.
         * @param {String} message The message that should be displayed in the toast.
         * @returns {void}
         */
        show: function (message) {
            var toast = this.model;
            var duration = message.length * 100 + 1000;
            toast.msg = message;
            toast.show = true;
            setTimeout(function () {
                toast.msg = null;
                toast.show = false;
                $rootScope.$apply();
            }, duration);
        }
    };

    // Initializes the scope variable from the resolve property of the state.
    $scope.isAndroid = android;
    $scope.user = user;
    $scope.config = {
        activeView: Settings.stored.homeView
    };
    Settings.active.typeFilters = issueTypes;
    $scope.pos_icon = pos_icon;
    
    // Calls the main() function when first loading the controller.
    main();
});

/**
 * The controller that's manages the active view list
 */
app.controller('ViewIssuesCtrl', function ($rootScope, $scope) {
    
    /**
     * Register the changeView function in the scope.
     * This function fires the 'reload' event from the rootScope to its childs.
     */
    $scope.changeView = function () {
        $rootScope.$broadcast('reload');
    };
});

/**
 * The controller that's manages the typeFilters view in the main menu
 */
app.controller('IssueTypeCtrl', function ($scope, $rootScope, Settings) {
    
    // Set the variable issueTypes with the ones in the active Settings for them to show in the view.
    $scope.issueTypes = Settings.active.typeFilters;
    
    /**
     * Registes the issueTypeFilter function in the scope.
     * This function fires the 'resort' event from the rootScope to its childs.
     */
    $scope.issueTypeFilter = function () {
        $rootScope.$broadcast('resort');
    };
});

/**
 * The controller that's manages the stateFilters view in the main menu
 */
app.controller('IssueStateCtrl', function ($scope, $rootScope, Settings) {

    // Set the variable stateFilters with the ones in the active Settings for them to show in the view.
    $scope.stateFilters = Settings.active.stateFilters;
    
    /**
     * Registes the issueStateFilter function in the scope.
     * This function fires the 'resort' event from the rootScope to its childs.
     */
    $scope.issueStateFilter = function () {
        $rootScope.$broadcast('resort');
    };
});
