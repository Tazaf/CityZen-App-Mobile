var app = angular.module('menu.ctrls', ['angular-storage']);

app.controller('IssueTypeCtrl', function ($scope, $http, apiUrl) {
    $scope.error = false;
    $http({
        method: 'GET',
        url: apiUrl + '/issueTypes'
    }).success(function (issue_types) {
        $scope.issue_types = issue_types;
        console.log('Success !');
    }).error(function () {
        $scope.error = true;
    });
});

app.controller('MenuTitleCtrl', function ($scope, store) {
    $scope.user = store.get('user');
});

app.controller('SelectIssueCtrl', function ($scope) {
});

app.controller('ConfigurationCtrl', function ($scope) {
});