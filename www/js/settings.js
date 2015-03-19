var app = angular.module('cityzen.settings', ['angular-storage']);
app.service('SettingsService', function (store) {
    return {
        defaultSettings: {
            mapCenter: {
                lat: 46.778571,
                lng: 6.640916,
                name: "Yverdon"
            },
            homePage: "app.map",
            homeView: "all",
            closeRange: 7,
            stateFilter: [
                'created',
                'assigned',
                'acknowledged',
                'in_progress',
                'rejected',
                'solved'
            ]
        },
        getSettings: function () {
            var settings = store.get('settings');
            if (!settings) {
                settings = this.defaultSettings;
                store.set('settings', settings);
            }
            return settings;
        },
        getHomePage: function () {
            return this.getSettings().homePage;
        },
        getMapCenter: function () {
            return this.getSettings().mapCenter;
        },
        getCloseRange: function () {
            return this.getSettings().closeRange;
        },
        saveSettings: function (settings) {
            store.set('settings', settings);
            return null;
        }
    };
});
app.controller('SettingsModalCtrl', function ($scope, $ionicModal, SettingsService) {
    $ionicModal.fromTemplateUrl('templates/modal-settings.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.settings = modal;
    });
    // Set the value.closeRange value to a particular value
    $scope.setCloseRange = function (value) {
        $scope.values.closeRange = value;
    };
    // Open the settings modal
    $scope.openSettings = function () {
        $scope.settings.show();
    };
    // Close the settings modal
    $scope.closeSettings = function () {
        $scope.settings.hide();
    };
    // When the modal is shown, load the user's settings on the value attribute
    $scope.$on('modal.shown', function () {
        $scope.values = SettingsService.getSettings();
        console.log($scope.values);
    });
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.settings.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        $scope.values = SettingsService.saveSettings($scope.values);
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });
});