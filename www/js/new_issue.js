/*
 * This module is used to manage the new issue view
 */
var app = angular.module('cityzen.new_issue', ['cityzen.camera', 'cityzen.maps', 'cityzen.issues']);

/**
 * The controller for the new issue view.
 */
app.controller('NewIssueCtrl', function ($ionicHistory, $scope, Settings, Camera, $ionicModal, mapboxMapId, mapboxTokenAccess, leafletData, MapService, $timeout, Loading, messages, $rootScope, IssuesService) {

    // Disables the menu swipe for this view
    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.$root.enableLeft = false;
    });

    // Gets the issueTypes from the settings for them to populate the dropdown list in the form
    $scope.issueTypes = Settings.active.typeFilters;

    // Initiates the newIssue variable
    $scope.newIssue = {
        imageUrl: Camera.defaultImageUrl,
        issueType: $scope.issueTypes[0]
    };

    // Indicate that the image showned is not an image choosed by the user. This constraints the display of the remove image button.
    $scope.userImg = false;

    // Sets the mapCenter for the issue's location map
    $scope.mapCenter = {
        lat: Settings.stored.mapCenter.lat,
        lng: Settings.stored.mapCenter.lng,
        zoom: Number(Settings.stored.zoom)
    };

    // Loads the map center template and store it in the scope as a modal
    $ionicModal.fromTemplateUrl('templates/modal-map-center.html', {
        id: "issueLocation",
        scope: $scope,
        animation: 'slide-in-up',
        backdropClickToClose: false
    }).then(function (modal) {
        $scope.issueLocationModal = modal;
        $scope.modalTitle = "Emplacement";
    });

    /**
     * Registers the validateNewIssue in the scope.
     * This function is responsible for validating the completion of the new issue form.
     * For it to be valide, the imageUrl should be different than the default image URL, the lat, lng and description properties must be set and the issue type id must be different than 0.
     * @returns {Boolean} Indicate wether the form is valide (true) or not (false).
     */
    $scope.validateNewIssue = function () {
        var issue = $scope.newIssue;
        var result = false;
        if (issue.imageUrl !== Camera.defaultImageUrl && issue.lat && issue.lng && issue.description && issue.issueType.id !== 0) {
            result = true;
        }
        return result;
    };

    /**
     * Registers the register function in the scope.
     * This function is responsible for registering the new issue in the database.
     * It first validates the form and then, tries to call the addOneIssue() from the IssuesService.
     * If this call succeeds, the reload event is fired and a goBack() is called to return to either the list view or the map view.
     * @returns {void}
     */
    $scope.register = function () {
        if ($scope.validateNewIssue()) {
            IssuesService.addOneIssue($scope.newIssue).then(function () {
                $scope.newIssue = {
                    imageUrl: Camera.defaultImageUrl
                };
                $scope.userImg = false;
                $rootScope.$broadcast('reload');
                $rootScope.toast.show("Le nouveau problème est enregistré");
                $ionicHistory.goBack();
            }, function (error) {
                $rootScope.toast.show(error);
            });
        } else {
            $rootScope.toast.show("Le formulaire est incomplet");
        }
    };

    /**
     * Registers the getPicture function in the scope.
     * This function gets a picture either from the phone's galery or the phone's camera depending of the option name given as parameters.
     * @param {String} opt_name The name of the Camera service's property that should be used as options
     * @returns {void}
     */
    $scope.getPicture = function (opt_name) {
        Camera.getPicture(Camera[opt_name]).then(Camera.uploadPicture).then(function (result) {
            Loading.hide();
            $scope.newIssue.imageUrl = result.data.url;
            $scope.userImg = true;
        }, function () {
            Loading.hide();
            $rootScope.toast.show("Une erreur est survenue lors de l'acquisition de l'image");
        });
    };

    /**
     * Registers the removePicture in the scope.
     * This function reset the imageUrl to the default image URL.
     * @returns {void}
     */
    $scope.removePicture = function () {
        $scope.newIssue.imageUrl = Camera.defaultImageUrl;
        $scope.userImg = false;
    };

    /**
     * Registers the showIssueLocationModal in the scope.
     * This function shows the modal displaying a map that can be used to indicate the location of the issue.
     * @returns {void}
     */
    $scope.showIssueLocationModal = function () {
        $scope.issueLocationModal.show();
    };

    /**
     * Registers the closeModel function in the scope.
     * This function closes the previsouly shown modal.
     * @returns {void}
     */
    $scope.closeModal = function () {
        $scope.issueLocationModal.hide();
    };

    /**
     * Registers the savePosition function in the scope.
     * This function set the newIssue coordinates to the marker's ones.
     * Then, the closeModal() function is called.
     * @returns {void}
     */
    $scope.savePosition = function () {
        $scope.newIssue.lat = $scope.newPosMarker.new_position.lat;
        $scope.newIssue.lng = $scope.newPosMarker.new_position.lng;
        $scope.closeModal();
    };

    // When catching the 'modal.shown' event, load the map in the modal and registers the events and their effects.
    $scope.$on('modal.shown', function () {
        var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
        mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxTokenAccess;
        
        // Tries to locate the user and use his position as marker.
        MapService.locate().then(function () {
            if (!$scope.newPosMarker) {
                var pos = Settings.active.pos;
            } else {
                var pos = $scope.newPosMarker.new_position;
            }
            Loading.show(messages.load_map);
            $scope.posMapDefaults = {
                tileLayer: mapboxTileLayer
            };
            $scope.newPosMarker = {
                new_position: {
                    lat: pos.lat,
                    lng: pos.lng,
                    draggable: true
                }};
            leafletData.getMap('map-center-full').then(function (map) {
                $scope.map = map;
                $scope.map.attributionControl.setPosition('bottomleft');
                $timeout(function () {
                    $scope.map.invalidateSize();
                });
                
                // Register a click effect that allows the user to move the marker by clicking on the map.
                $scope.map.on('click', function (event) {
                    $scope.newPosMarker.new_position.lat = event.latlng.lat;
                    $scope.newPosMarker.new_position.lng = event.latlng.lng;
                });
                map.setView($scope.newPosMarker.new_position, 15);
            });
            Loading.hide();
        }, function (err) {
            $rootScope.toast.show(err);
            Loading.hide();
        });
    });
});