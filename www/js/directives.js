var app = angular.module('cityzen.directives', ['cityzen.ctrls']);

app.directive('swipeTo', function ($ionicGesture, $state, $ionicHistory) {
    return {
        restrict: 'A',
        scope: {
            target: '='
        },
        link: function (scope, elem, attrs) {
            $ionicGesture.on('swipeleft', function (event) {
                console.log('Got swiped!');
                attrs.$observe('target', function (value) {
                    if (value) {
                        $ionicHistory.nextViewOptions({disableAnimate: true});
                        $state.go(value);
                    }
                });
            }, elem);
        }
    };
});