var app = angular.module('cityzen.modals', ['UI', 'angular-storage']);

app.controller('ProfileModalCtrl', function ($scope, $ionicModal, store, ToastService, $http, apiUrl) {
    $ionicModal.fromTemplateUrl('templates/modal-profile.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.profile = modal;
    });
    $scope.openProfile = function () {
        $scope.profile.show();
    };
    $scope.closeProfile = function () {
        $scope.profile.hide();
    };
    $scope.$on('modal.shown', function () {
        $scope.user = store.get('user');
        $http({
            method: 'GET',
            url: apiUrl + '/users/' + $scope.user.id
        }).success(function (user) {
            $scope.user = user;
            console.log($scope.user);
        }).error(function () {
            console.log('Erreur');
        });
    });
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.profile.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        console.log('Profile Closed');
        console.log($scope.user);
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });
});

app.controller('SettingsModalCtrl', function ($scope, $ionicModal, store) {
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
        var settings = store.get('settings');
        var default_settings = {
            mapCenter: "Yverdon",
            homePage: "app.list",
            closeRange: 7
        };
        $scope.values = settings ? settings : default_settings;
        console.log($scope.values);
    });
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.settings.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        store.set('settings', $scope.values);
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });
});