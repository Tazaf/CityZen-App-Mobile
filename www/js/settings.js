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
            stateFilters: [
                {text: 'Créé', name: 'created', checked: true},
                {text: 'Assigné', name: 'assigned', checked: true},
                {text: 'Reconnu', name: 'acknowledged', checked: true},
                {text: 'En cours', name: 'in_progress', checked: true},
                {text: 'Rejeté', name: 'rejected', checked: true},
                {text: 'Résolu', name: 'solved', checked: true}
            ]
        },
        stored: {},
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
         * Saves the settings on the storage
         */
        saveSettings: function () {
            store.set('settings', this.stored);
            return null;
        }
    };
});

// A controller for the settings screen.
app.controller('SettingsModalCtrl', function ($timeout, $scope, $ionicModal, SettingsService, mapboxMapId, mapboxTokenAccess, leafletData, $rootScope) {

    $scope.modals = [];

    // Load the settings template and store it in the scope
    $ionicModal.fromTemplateUrl('templates/modal-settings.html', {
        id: "settings",
        scope: $scope,
        animation: 'slide-in-up',
        backdropClickToClose: false
    }).then(function (modal) {
        $scope.modals['settings'] = modal;
    });

    // Load the map center template and store it in the scope
    $ionicModal.fromTemplateUrl('templates/modal-map-center.html', {
        id: "mapCenter",
        scope: $scope,
        animation: 'slide-in-up',
        backdropClickToClose: false
    }).then(function (modal) {
        $scope.modals['mapCenter'] = modal;
    });

    // Set the settings.closeRange value to a particular value
    $scope.setCloseRange = function (value) {
        SettingsService.stored.closeRange = value;
    };

    // Set the settings.zoom value to a particular value
    $scope.setZoom = function (value) {
        SettingsService.stored.zoom = value;
    };

    // Open the settings modal
    $scope.openModal = function (modal_id) {
        $scope.modals[modal_id].show();
    };

    // Close the settings modal
    $scope.closeModal = function (modal_id) {
        $scope.modals[modal_id].hide();
    };

    $scope.saveNewPosition = function () {
        SettingsService.stored.mapCenter = $scope.newPosMarker.new_position;
        $rootScope.$broadcast('positionChange');
        $scope.closeModal('mapCenter');
    };

    // When the modal is shown, load the user's settings on the value attribute
    $scope.$on('modal.shown', function (event, modal) {
        $scope.init_zoom = SettingsService.stored.zoom;
        $scope.init_range = SettingsService.stored.closeRange;
        var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
        mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxTokenAccess;
        if (modal.id === 'settings') {
            $scope.newPosMarker = {};
            $scope.settings = SettingsService.stored;
        } else {
            $scope.posMapDefaults = {
                tileLayer: mapboxTileLayer
            };
            $scope.newPosMarker = {
                new_position: {
                    lat: SettingsService.stored.mapCenter.lat,
                    lng: SettingsService.stored.mapCenter.lng,
                    icon: $scope.pos_icon,
                    draggable: true
                }};
            leafletData.getMap('map-center-full').then(function (map) {
                $scope.map = map;
                $scope.map.attributionControl.setPosition('bottomleft');
                $timeout(function () {
                    $scope.map.invalidateSize();
                    console.log('invalidateSize');
                });
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
    });

    // Execute action on hide modal
    $scope.$on('modal.hidden', function (e, modal) {
        if (modal.id === 'settings') {
            SettingsService.stored = $scope.settings;
            SettingsService.saveSettings();
            console.log(SettingsService.stored.closeRange !== $scope.init_range);
            if ((SettingsService.stored.zoom !== $scope.init_zoom && $scope.issues.length === 0) || (SettingsService.stored.closeRange !== $scope.init_range && $scope.config.activeView === 'close')) {
                $rootScope.$broadcast('reload');
            }
            delete $scope.newPosMarker;
            delete $scope.settings;
        } else {
            delete $scope.newPosMarker.new_position;
        }
    });

    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });
});