/*
 * Original code by mikkokam
 * Source : http://forum.ionicframework.com/t/toast-notification/1067/12
 */

var app = angular.module('UI', []);

app.service('ToastService', function ($http, $window, $q, $ionicLoading, $timeout) {

    this.toast = function (msg, duration, position) {
        if (!duration)
            duration = 700;
        if (!position)
            position = 'top';
        angular.element('<p>')
        $ionicLoading.show({
            template: msg,
            noBackdrop: true,
            duration: duration
        });
    };
});
