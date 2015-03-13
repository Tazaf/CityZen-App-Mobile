// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('cityzen', ['ionic', 'cityzen.auth']);

app.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});

app.run(function (AuthService, $rootScope, $state) {

    // Listen for the $stateChangeStart event of AngularUI Router.
    // This event indicates that we are transitioning to a new state.
    // We have the possibility to cancel the transition in the callback function.
    $rootScope.$on('$stateChangeStart', function (event, toState) {

        // If the user is not logged in and is trying to access another state than "login"...
        if (!AuthService.currentUserId && toState.name != 'login') {

            // ... then cancel the transition and go to the "login" state instead.
            event.preventDefault();
            $state.go('login');
        }
    });
});

app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
            .state('map', {
                url: '/map',
                controller: 'MapCtrl',
                templateUrl: 'templates/map.html'
            })
            .state('list', {
                url: '/list',
                controller: 'ListCtrl',
                templateUrl: 'templates/list.html'
            })
            .state('login', {
                url: '/login',
                controller: 'LoginCtrl',
                templateUrl: 'templates/login.html'
            });
    $urlRouterProvider.otherwise(function($injector) {
        var next_state = 'map';
        $injector.get('$state').go(next_state);        
    });
});

app.controller('ListCtrl', function ($scope, $state) {
    $scope.goToMap = function() {
        $state.go('map');
    };
});

app.controller('MapCtrl', function ($scope, $state) {
    $scope.goToList = function() {
        $state.go('list');
    };
});