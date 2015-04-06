var app = angular.module('cityzen.new_issue', ['cityzen.camera']);
app.controller('NewIssueCtrl', function ($scope, Settings, Camera) {
    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.issueTypes = Settings.active.typeFilters;
        $scope.$root.enableLeft = false;
    });

//    data = {
//        "description": "Integer at metus vitae erat porta pellentesque.",
//        "lng": "6.651479812689227",
//        "lat": "46.77227088657382",
//        "imageUrl": "http://www.somewhere.localhost.localdomain",
//        "issueTypeId": "54d8ae183fd30364605c81b1"
//    }

    $scope.newIssue = {
        imageUrl: Camera.defaultImageUrl
    };
    $scope.userImg = false;
    $scope.register = function () {
        console.log($scope.newIssue);
    };

//    $scope.getPicture = function (options) {
//        Camera.getPicture(Camera[options]).then(Camera.uploadPicture).then(function (result) {
//            console.log('Result');
//            console.log(result.data.url);
//            $scope.newIssue.imageUrl = result.data.url;
//            console.log($scope.newIssue);
//        }, function (err) {
//            console.log('Error');
//            console.log(err.status);
//        });
//    };

    $scope.getPicture = function () {
        console.log('getPicture');
        $scope.newIssue.imageUrl = "https://warm-bastion-3094.herokuapp.com/images/f767a043-0818-4c17-ae95-67222c6c74a0.png";
        $scope.userImg = true;
    };
    
    $scope.removePicture = function() {
        $scope.newIssue.imageUrl = Camera.defaultImageUrl;
        $scope.userImg = false;
    };
});