var app = angular.module('cityzen.modals', ['UI']);

app.controller('SettingsModalCtrl', function ($scope, $ionicModal, ToastService) {
    $scope.toast = "Premier message";
    $ionicModal.fromTemplateUrl('templates/modal-settings.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $scope.changeValue = function() {
        console.log('Click');
        $scope.toast = "Deuxième message";
    };
    $scope.openSettings = function () {
        $scope.modal.show();
    };
    $scope.closeSettings = function () {
        $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        $scope.toast = "Ceci est un message";
        console.log($scope.toast);
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });
});

app.controller('ProfileModalCtrl', function ($scope, $ionicModal) {
    $ionicModal.fromTemplateUrl('templates/modal-profile.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $scope.openProfile = function () {
        $scope.modal.show();
    };
    $scope.closeProfile = function () {
        $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });
});