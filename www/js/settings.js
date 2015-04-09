/**
 * This module is used to manage application settings.
 */
var app = angular.module('cityzen.settings', ['angular-storage', 'cityzen.default_settings']);

/**
 * Defines the Settings service that will manages the Settings throughout the application
 */
app.service('Settings', function (store, default_settings) {
    return {
        /**
         * Contains in run-time the user's settings as defined by himself.
         * These settings are retrieved from the LocalStorage.
         */
        stored: {},
        /**
         * Contains in run-time the run-time settings as defined while using the application.
         * These settings are, for example, the current view, the current selected filters, etc.
         */
        active: {},
        /**
         * Returns the entire set of Settings.
         * If there is not 'settings' key in the LocalStorage, returns the default settings.
         * If there is, loads these settings and returns them.
         * @returns {Object} An object containing the stored settings.
         */
        getSettings: function () {
            var settings = store.get('settings');
            if (!settings) {
                settings = default_settings;
                store.set('settings', settings);
            }
            return settings;
        },
        /**
         * Returns the name of the state that has been defined as the homePage of the application.
         * @returns {String} The homePage.
         */
        getHomePage: function () {
            return this.getSettings().homePage;
        },
        /**
         * Returns an array that contains all the state filters in the state they've been defined.
         * @returns {Array} An array containing the state filters.
         */
        getStateFilters: function () {
            return this.getSettings().stateFilters;
        },
        /**
         * Saves the user defined settings on the LocalStorage.
         * @returns {void}
         */
        saveSettings: function () {
            store.set('settings', this.stored);
        }
    };
});

/**
 * This controller id managing the settings modals
 */
app.controller('SettingsModalCtrl', function ($timeout, $scope, $ionicModal, Settings, mapboxMapId, mapboxTokenAccess, leafletData, $rootScope) {

    // Initiates an empty array that will receive the settings modals.
    $scope.modals = [];

    // Defines the center of the map used to set the user's default position
    $scope.mapCenter = {
        lat: Settings.stored.mapCenter.lat,
        lng: Settings.stored.mapCenter.lng,
        zoom: Number(Settings.stored.zoom)
    };

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
        $scope.modalTitle = "Ma Position";
    });

    /**
     * Registers the setCloseRange function in the scope.
     * This function sets the closeRange property to the given value.
     * @param {Integer} value The range to set
     * @returns {void}
     */
    $scope.setCloseRange = function (value) {
        Settings.stored.closeRange = value;
    };

    /**
     * Registers the setZoom function in the scope.
     * This function sets the zoom property to the given value. 
     * @param {Integer} value The zoom level to set
     * @returns {undefined}
     */
    $scope.setZoom = function (value) {
        Settings.stored.zoom = value;
    };


    /**
     * Registers the openModal function in the scope.
     * This function will show the modal based on the modal_id passed as parameter.
     * The modal will be get from the $scope.modals array.
     * @param {String} modal_id The ID of the desired modal
     * @returns {void}
     */
    $scope.openModal = function (modal_id) {
        $scope.modals[modal_id].show();
    };

    /**
     * Registers the closeModal function in the scope.
     * This function will hide the modal based on the modal_id passed as parameter.
     * The modal will be get from the $scope.modals array.
     * @param {String} modal_id The ID of the desired modal
     * @returns {void}
     */
    $scope.closeModal = function (modal_id) {
        $scope.modals[modal_id].hide();
    };

    /**
     * Registers the savePosition function in the scope.
     * This function will set the mapCenter coordinates to the marker's ones and indicates that the position has been changed.
     * The 'positionChange' event is then fired and the modal is closed.
     * @returns {void}
     */
    $scope.savePosition = function () {
        Settings.stored.mapCenter = $scope.newPosMarker.new_position;
        $scope.positionChanged = true;
        $rootScope.$broadcast('positionChange');
        $scope.closeModal('mapCenter');
    };

    /**
     * When catching the 'modal.shown' event, if the modal's id is settings, set the required variables.
     * If the modal's id is the map modal one, load the map and registers the adequate events and their effects.
     */
    $scope.$on('modal.shown', function (e, modal) {
        $scope.init_range = Settings.stored.closeRange;
        var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
        mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxTokenAccess;
        if (modal.id === 'settings') {
            $scope.newPosMarker = {};
            $scope.settings = Settings.stored;
        } else {
            $scope.posMapDefaults = {
                tileLayer: mapboxTileLayer
            };
            $scope.newPosMarker = {
                new_position: {
                    lat: Settings.stored.mapCenter.lat,
                    lng: Settings.stored.mapCenter.lng,
                    icon: $scope.pos_icon,
                    draggable: true
                }};
            leafletData.getMap('map-center-full').then(function (map) {
                $scope.map = map;
                $scope.map.attributionControl.setPosition('bottomleft');
                $timeout(function () {
                    $scope.map.invalidateSize();
                });
                $scope.map.on('click', function (event) {
                    $scope.newPosMarker.new_position.lat = event.latlng.lat;
                    $scope.newPosMarker.new_position.lng = event.latlng.lng;
                });
                map.setView($scope.newPosMarker.new_position, 15);
            });
        }
    });

    /**
     * When catching the 'modal.hidden' event, if the modal's id is the map modal's one, delete the scope variable that handled the position marker.
     * If the modal's id is settings, save the settings and show a message to the user.
     * If the range or the position have been changed, fire the reload event for the data to reload.
     * Finally delete the scope variables handling the position marker and the settings.
     */
    $scope.$on('modal.hidden', function (e, modal) {
        if (modal.id === 'settings') {
            Settings.stored = $scope.settings;
            Settings.saveSettings();
            $rootScope.toast.show("Préférences enregistrées");
            if ((Settings.stored.closeRange !== $scope.init_range || $scope.positionChanged) && $scope.config.activeView === 'close') {
                $rootScope.$broadcast('reload');
            }
            delete $scope.newPosMarker;
            delete $scope.settings;
        } else {
            delete $scope.newPosMarker.new_position;
        }
    });
});