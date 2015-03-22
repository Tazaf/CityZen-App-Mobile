var app = angular.module('cityzen.auth', ['angular-storage', 'cityzen.settings']);

app.service('AuthService', function (store) {

    var service = {
        currentUserId: store.get('user') ? store.get('user').id : null,
        setUser: function (user) {
            service.currentUserId = user.id;
            store.set('user', user);
        },
        unsetUser: function () {
            service.currentUserId = null;
            store.remove('user');
        }
    };
    return service;
});

app.controller('LoginCtrl', function (apiUrl, AuthService, $http, $ionicHistory, $ionicLoading, $scope, $state, SettingsService) {

// The $ionicView.beforeEnter event happens every time the screen is displayed.
    $scope.$on('$ionicView.beforeEnter', function () {
// Re-initialize the user object every time the screen is displayed.
// The first name and last name will be automatically filled from the form thanks to AngularJS's two-way binding.
        $scope.user = {};
    });
    // Add the register function to the scope.
    $scope.register = function () {

        // Forget the previous error (if any).
        delete $scope.error;
        // Show a loading message if the request takes too long.
        $scope.loading = {text: "Connexion..."};
        $ionicLoading.show({
            scope: $scope,
            templateUrl: 'templates/loading.html'
        });
        console.log($scope.user);
        // Make the request to retrieve or create the user.
//        $http({
//            method: 'POST',
//            url: apiUrl + '/users/logister',
//            data: $scope.user
//        }).success(function (id) {
//            $scope.user.id = id.userId;
//
//            // If successful, give the user to the authentication service.
//            AuthService.setUser($scope.user);
//
//            // Hide the loading message.
//            $ionicLoading.hide();
//
//            // Set the next view as the root of the history.
//            // Otherwise, the next screen will have a "back" arrow pointing back to the login screen.
//            $ionicHistory.nextViewOptions({
//                disableBack: true,
//                historyRoot: true
//            });
//
//            // Go to the defined first screen.
//            var next_state = SettingsService.getHomePage();
//            $state.go(next_state);
//
//        }).error(function (error) {
//
//            // If an error occurs, hide the loading message and show an error message.
//            $ionicLoading.hide();
//            $scope.error = error;
//        });
        console.log('URL utilisée...');
        console.log(apiUrl);

        var request =
                $http({
                    method: 'POST',
                    url: apiUrl + '/users/logister',
                    data: $scope.user
                });
        request.then(function (response) {
            console.log('success');
            console.log(response.data);
            console.log(response.status);
            console.log(response.statusText);
        }, function(error) {
            console.log('error');
            console.log(error.data);
            console.log(error.status);
            console.log(error.statusText);
        });

    };
});
app.controller('LogoutCtrl', function (AuthService, $scope, $state, $window) {
    $scope.logout = function () {
        AuthService.unsetUser();
        $window.location.reload(true);
        $state.go('login');
    };
});
app.factory('AuthInterceptor', function (AuthService) {
    return {
        // The request function will be called before all requests.
        // In it, you can modify the request configuration object.
        request: function (config) {

            // If the user is logged in, add the X-User-Id header.
            if (AuthService.currentUserId) {
                config.headers['X-User-Id'] = AuthService.currentUserId;
            }
            return config;
        }
    };
});
app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
});