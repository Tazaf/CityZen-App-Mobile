var app = angular.module('cityzen.ctrls', ['cityzen.auth']);

app.controller('ListCtrl', function ($rootScope) {
    $rootScope.toggledrag = false;
});

app.controller('MapCtrl', function ($scope) {
});

app.controller('MenuCtrl', function ($scope) {
});

app.controller('DetailsCtrl', function ($scope, $state, $ionicHistory, $ionicScrollDelegate, $location) {
    $scope.showDetails = function () {
        $state.go('app.details');
    };

    $scope.goToAnchor = function (anchor) {
        $location.hash(anchor);
        $ionicScrollDelegate.anchorScroll(true);
    };
});

app.controller('NewModalCtrl', function ($scope, $ionicModal) {
    $ionicModal.fromTemplateUrl('templates/modal-new.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function () {
        $scope.modal.show();
    };
    $scope.closeModal = function () {
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

app.controller('NewCtrl', function ($scope) {

});

app.controller('MyNavCtrl', function ($scope, $state, $ionicHistory) {
    $scope.platform = ionic.Platform;
    $scope.myGoBack = function () {
        var backView = $ionicHistory.backView();
        if (backView) {
            $state.go(backView.stateId);
        }
    };
});