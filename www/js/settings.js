var app = angular.module('cityzen.settings', ['angular-storage']);

app.service('SettingsService', function (store) {
    return {
        default: {
            mapCenter: {
                lat: 50,
                lng: 7
            },
            zoom: 12,
            homePage: "app.map",
            homeView: "all",
            closeRange: 850,
            stateFilter: [
                'created',
                'assigned',
                'acknowledged',
                'in_progress',
                'rejected',
                'solved'
            ]
        },
        /*
         * If there are settings stored, get and return them.
         * If there's not, get and return the default settings.
         */
        getSettings: function () {
            var settings = store.get('settings');
            if (!settings) {
                settings = this.default;
                store.set('settings', settings);
            }
            return settings;
        },
        /*
         * Return the value of the homePage setting
         */
        getHomePage: function () {
            return this.getSettings().homePage;
        },
        /*
         * Returns the value of the homeView setting
         */
        getHomeView: function () {
            return this.getSettings().homeView;
        },
        /*
         * Returns the value for the mapCenter setting
         */
        getMapCenter: function () {
            return this.getSettings().mapCenter;
        },
        /*
         * Returns the value for the closeRange setting
         */
        getCloseRange: function () {
            return this.getSettings().closeRange;
        },
        /*
         * Saves the settings on the storage
         */
        saveSettings: function (settings) {
            store.set('settings', settings);
            return null;
        }
    };
});

// A controller for the settings screen.
app.controller('SettingsModalCtrl', function ($scope, $ionicModal, SettingsService, mapboxMapId, mapboxTokenAccess, leafletData, $rootScope) {

    $scope.modals = [];

    // Load the settings template and store it in the scope
    $ionicModal.fromTemplateUrl('templates/modal-settings.html', {
        id: "settings",
        scope: $scope,
        animation: 'slide-in-up',
        backdropClickToClose: false
    }).then(function (modal) {
        console.log('settings chargé');
        $scope.modals['settings'] = modal;
    });

    // Load the map center template and store it in the scope
    $ionicModal.fromTemplateUrl('templates/modal-map-center.html', {
        id: "mapCenter",
        scope: $scope,
        animation: 'slide-in-up',
        backdropClickToClose: false
    }).then(function (modal) {
        console.log('mapCenter chargé');
        $scope.modals['mapCenter'] = modal;
    });

    // Set the settings.closeRange value to a particular value
    $scope.setCloseRange = function (value) {
        $scope.settings.closeRange = value;
    };

    // Set the settings.zoom value to a particular value
    $scope.setZoom = function (value) {
        $scope.settings.zoom = value;
    };

    // Open the settings modal
    $scope.openModal = function (modal_id) {
        console.log('id du modal appelé : ' + modal_id);
        $scope.modals[modal_id].show();
    };

    // Close the settings modal
    $scope.closeModal = function (modal_id) {
        $scope.modals[modal_id].hide();
    };

    $scope.saveNewPosition = function () {
        $scope.posMarker.position.lat = $scope.newPosMarker.new_position.lat;
        $scope.posMarker.position.lng = $scope.newPosMarker.new_position.lng;
        $scope.settings.mapCenter = $scope.posMarker.position;
        leafletData.getMap('map-center-thumbnail').then(function (map) {
            $scope.map = map;
            map.setView($scope.posMarker.position, 15);
            $scope.closeModal('mapCenter');
        });
    };

    // When the modal is shown, load the user's settings on the value attribute
    $scope.$on('modal.shown', function (event, modal) {
        var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
        mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxTokenAccess;
        if (modal.id === 'settings') {
            console.log('settings map');
            $scope.map = null;
            $scope.posMapDefaults = {
                tileLayer: mapboxTileLayer,
                attributionControl: false
            };
            $scope.posMarker = {
                position: {
                    lat: $scope.settings.mapCenter.lat,
                    lng: $scope.settings.mapCenter.lng,
                    icon: $scope.pos_icon
                }
            };
            $scope.newPosMarker = {};
            console.log($scope.posMarker);
            leafletData.getMap('map-center-thumbnail').then(function (map) {
                $scope.map = map;
                map.dragging.disable();
                map.touchZoom.disable();
                map.doubleClickZoom.disable();
                map.scrollWheelZoom.disable();
                map.setView($scope.posMarker.position, 15);
            });
        } else {
            console.log('map center map');
            $scope.posMapDefaults = {
                tileLayer: mapboxTileLayer
            };
            $scope.newPosMarker = {
                new_position: {
                    lat: $scope.posMarker.position.lat,
                    lng: $scope.posMarker.position.lng,
                    icon: $scope.pos_icon,
                    draggable: true
                }};
            leafletData.getMap('map-center-full').then(function (map) {
                $scope.map = map;
                $scope.map.on('click', function (event) {
                    $scope.newPosMarker.new_position.lat = event.latlng.lat;
                    $scope.newPosMarker.new_position.lng = event.latlng.lng;
                });
                map.setView($scope.newPosMarker.new_position, 15);
            });
        }
    });

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function (e, modal) {
        //$scope.settingsModal.remove();
    });

    // Execute action on hide modal
    $scope.$on('modal.hidden', function (e, modal) {
        if (modal.id === 'settings') {
            SettingsService.saveSettings($scope.settings);
            delete $scope.newPosMarker;
            delete $scope.posMarker;
        } else {
            delete $scope.newPosMarker.new_position;
            $rootScope.$broadcast('positionChange');
        }
    });

    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });
});