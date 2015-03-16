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

app.controller('SettingsModalCtrl', function ($scope, $ionicModal, $rootScope, store, ToastService) {
    $rootScope.toast = "SettingsModalCtrlMessage";
    $ionicModal.fromTemplateUrl('templates/modal-settings.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.settings = modal;
    });
//    $scope.changeValue = function () {
//        console.log('Click');
//        $rootScope.toast = "Deuxième message";
//    };
    $scope.openSettings = function () {
        $scope.settings.show();
    };
    $scope.closeSettings = function () {
        $scope.settings.hide();
    };
    $scope.$on('modal.shown', function () {
        $scope.values = {
            mapCenter: "Yverdon",
            homePage: "app.list",
            closeRange: 7
        };
    });
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.settings.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        console.log('Settings Closed');
        console.log($scope.values);
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });
});