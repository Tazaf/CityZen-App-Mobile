/**
 * This is a module responsible for the user authenticaton in the app.
 */
var app = angular.module('cityzen.auth', ['angular-storage', 'cityzen.settings']);

/**
 * Defines the AuthService service that can set or unset the user as well as keep his or her ID in memory
 */
app.service('AuthService', function (store) {

    var service = {
        currentUserId: store.get('user') ? store.get('user').id : null,
        /**
         * Set the current user with the user parameter. This parameter must have a valid id property.
         * The ID property is stored in the currentUserId property of the service, while the whole user object is saved in the LocalStorage with a 'user' key.
         * @param {Object} user The user to set.
         * @returns {void}
         */
        setUser: function (user) {
            service.currentUserId = user.id;
            store.set('user', user);
        },
        /**
         * Unset the current user.
         * Defines the currentUserId property of the service to null and remove the 'user' from the LocalStorage
         * @returns {void}
         */
        unsetUser: function () {
            service.currentUserId = null;
            store.remove('user');
        }
    };
    return service;
});

/**
 * The controller that managed the login view.
 */
app.controller('LoginCtrl', function ($window, $rootScope, apiUrl, AuthService, $http, $ionicHistory, Loading, $scope, $state, Settings) {

    $scope.$on('$ionicView.beforeEnter', function () {

        // Reset the user every time the view is displayed
        $scope.user = {};
    });

    /**
     * Add the register function to the scope.
     * This function tries to log the user by checking its credentials on the server.
     */
    $scope.register = function () {

        // Forget the previous error (if any).
        delete $scope.error;

        // Show a loading message if the request takes too long.
        Loading.show("Connexion...");

        // Make the request to retrieve or create the user.
        $http({
            method: 'POST',
            url: apiUrl + '/users/logister',
            data: $scope.user
        }).success(function (id) {
            $scope.user.id = id.userId;

            // If successful, give the user to the authentication service.
            AuthService.setUser($scope.user);

            // Hide the loading message.
            Loading.hide();

            // Set the next view as the root of the history.
            // Otherwise, the next screen will have a "back" arrow pointing back to the login screen.
            $ionicHistory.nextViewOptions({
                disableBack: true,
                historyRoot: true
            });

            // Go to homePage as defined in the Settings.
            var next_state = Settings.stored.homePage;
            $state.go(next_state);
        }).error(function (error) {

            // If an error occurs, hide the loading message and show an error message.
            Loading.hide();
            $rootScope.toast.show("Erreur lors de la tentative de connexion");
        });
    };

    /**
     * Add the logout function to the scope.
     * This function is responsible to logging out the user from the application.
     */
    $scope.logout = function () {
        AuthService.unsetUser();
        $window.location.reload(true);
        $state.go('login');
    };
});

/**
 * Defines an http interceptor that will add the authentication header to every http request.
 */
app.factory('AuthInterceptor', function (AuthService) {
    return {
        // The request function will be called before all requests.
        // In it, you can modify the request configuration object.
        request: function (config) {

            // If the user is logged in, add the X - User - Id header.
            if (AuthService.currentUserId) {
                config.headers['X-User-Id'] = AuthService.currentUserId;
            }
            return config;
        }
    };
});

/**
 * Registers the AuthInterceptor into the app's interceptors.
 */
app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
});