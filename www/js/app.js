// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('cityzen', [
    'ionic',
    'cityzen.auth',
    'cityzen.constants',
    'cityzen.menus',
    'cityzen.settings',
    'cityzen.maps',
    'cityzen.issues',
    'cityzen.messages',
    'cityzen.new_issue'
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

/**
 * This run bloc is used to load the settings into the Settings service.
 * Both the stored settings (the ones defined by the user) and the active settings (the settings used at runtime) are loaded.
 */
app.run(function (Settings) {
    Settings.stored = Settings.getSettings();
    Settings.active.stateFilters = JSON.parse(JSON.stringify(Settings.getStateFilters()));
});

app.run(function (AuthService, $rootScope, $state) {

// Listen for the $stateChangeStart event of AngularUI Router.
// This event indicates that we are transitioning to a new state.
// We have the possibility to cancel the transition in the callback function.
    $rootScope.$on('$stateChangeStart', function (event, toState) {

// If the user is not logged in and is trying to access another state than "login"...
        if (!AuthService.currentUserId && toState.name !== 'login') {
            console.log('Activating login');

// ... then cancel the transition and go to the "login" state instead.
            event.preventDefault();
            $state.go('login');
        }
    });
});

/**
 * Thise is the router of the application, where the different states are declared and nested.
 */
app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
            .state('app', {
                url: '/app',
                abstract: true,
                resolve: {
                    // Indicates wether the platform is an android one or not. Used to select the adequate classes for certain icons in the UI.
                    android: function () {
                        return ionic.Platform.isAndroid();
                    },
                    // Get the logged in user. Used to display his or her name in the main menu.
                    user: function (store) {
                        return store.get('user');
                    },
                    // Defines the custom icon for the user's position on the maps.
                    pos_icon: function () {
                        return {
                            iconUrl: 'img/pos-marker.png',
                            shadowUrl: 'img/pos-marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            shadowSize: [41, 41],
                            shadowAnchor: [12, 41],
                            popupAnchor: [0, -36]
                        };
                    },
                    // Get the issueTypes from the server. Used to display them in the main menu and on the new issue screen.
                    issueTypes: function ($http, apiUrl) {
                        return $http({
                            method: 'GET',
                            url: apiUrl + '/issueTypes'
                        }).then(function (response) {
                            var issueTypes = [];
                            for (var i = 0; i < response.data.length; i++) {
                                issueTypes.push({
                                    id: response.data[i].id,
                                    name: response.data[i].name,
                                    checked: true
                                });
                            }
                            return issueTypes;
                        }, function (error) {
                            return null;
                        });
                    }
                },
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
                resolve: {
                    // Get the issue which information are displayed on the detail screen.
                    issue: function ($stateParams, IssuesService) {
                        return IssuesService.getIssueData($stateParams.issueId);
                    }
                },
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
                url: '/newIssue',
                views: {
                    'menuContent': {
                        controller: 'NewIssueCtrl',
                        templateUrl: 'templates/new_issue.html'
                    }
                }
            })
            .state('login', {
                url: '/login',
                controller: 'LoginCtrl',
                templateUrl: 'templates/login.html'
            });
    $urlRouterProvider.otherwise(function ($injector) {
        var next_state = $injector.get('Settings').getHomePage();
        $injector.get('$state').go(next_state);
    });
});

/**
 * Sets some special configuration for the application.
 * In this case, disable all the transition animations between the different views.
 */
app.config(function ($ionicConfigProvider) {
    $ionicConfigProvider.views.transition('none');
});

/**
 * Defines a global services used to show and hide specific loading screen throughout the application.
 */
app.factory('Loading', function ($ionicLoading) {
    return {
        
        /**
         * Shows a Loading screen displaying the text parameter's value
         * @param {String} text The text of the Loading screen
         * @returns {void}
         */
        show: function (text) {
            $ionicLoading.show({
                template: "<i class=\"fa fa-refresh fa-spin\"></i><h1>" + text + "</h1>"
            });
        },
        
        /**
         * Hide the active Loading screen.
         * @returns {void}
         */
        hide: function () {
            $ionicLoading.hide();
        }
    };
});