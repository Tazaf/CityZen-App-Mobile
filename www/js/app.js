// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('cityzen',
        [
            'ionic',
            'leaflet-directive',
            'cityzen.auth',
            'cityzen.ctrls',
            'cityzen.constants',
            'cityzen.menus',
            'cityzen.directives',
            'cityzen.settings',
            'cityzen.comments',
            'cityzen.maps',
            'cityzen.tags',
            'cityzen.issues',
            'geolocation'
        ]);

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
            .state('app', {
                url: '/app',
                abstract: true,
                controller: 'MenuCtrl',
                templateUrl: 'templates/menu.html'
            })
            .state('app.map', {
                url: '/map',
                views: {
                    'menuContent': {
                        controller: 'MapCtrl',
                        templateUrl: "templates/map.html"
                    }
                }
            })
            .state('app.list', {
                url: '/list',
                views: {
                    'menuContent': {
                        controller: 'ListCtrl',
                        templateUrl: "templates/list.html"
                    }
                }
            })
            .state('app.details', {
                url: '/issue/:issueId',
                views: {
                    'menuContent': {
                        controller: 'DetailsCtrl',
                        templateUrl: 'templates/details.html'
                    }
                }
            })
            .state('app.details.map', {
                url: '/map',
                views: {
                    'menuContent@app': {
                        controller: 'DetailsMapCtrl',
                        templateUrl: 'templates/details-map.html'
                    }
                }
            })
            .state('app.new', {
                url: '/new',
                views: {
                    'menuContent': {
                        controller: 'NewCtrl',
                        templateUrl: 'templates/new.html'
                    }
                }
            })
            .state('login', {
                url: '/login',
                controller: 'LoginCtrl',
                templateUrl: 'templates/login.html'
            });
    $urlRouterProvider.otherwise(function ($injector) {
        var next_state = $injector.get('SettingsService').getHomePage();
        $injector.get('$state').go(next_state);
    });
});

app.config(function ($ionicConfigProvider) {
    $ionicConfigProvider.views.transition('none');
});