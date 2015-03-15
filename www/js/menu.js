var app = angular.module('menu.ctrls', ['angular-storage']);

app.controller('IssueTypeCtrl', function ($scope) {
    $scope.issue_types = [
        {
            "id": "5502ab6cdaf3ee0e0049e3b2",
            "name": "graffiti"
        }, {
            "id": "5502ab6cdaf3ee0e0049e3b0",
            "name": "broken streetlight"
        }, {
            "id": "5502ab6cdaf3ee0e0049e3b1",
            "name": "dangerous crossroad"
        }
    ];
});

app.controller('MenuTitleCtrl', function ($scope, store) {
    $scope.user = store.get('user');
});

app.controller('SelectIssueCtrl', function ($scope) {
});

app.controller('ConfigurationCtrl', function ($scope) {
});