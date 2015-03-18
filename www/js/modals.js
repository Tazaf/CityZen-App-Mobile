var app = angular.module('cityzen.modals', ['UI', 'angular-storage']);

app.controller('ProfileModalCtrl', function ($scope, $ionicModal, store, $http, apiUrl) {
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

