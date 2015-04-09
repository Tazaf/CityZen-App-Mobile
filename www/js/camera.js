/**
 * This is the module responsible for handling camera interactions.
 */
var app = angular.module('cityzen.camera', []);

/**
 * Defines the Camera service that manages every action related to a new issue's picture.
 */
app.factory('Camera', function ($q, $http, qimgUrl, qimgToken, Loading, messages) {
    return {
        
        // This is the default URL used on the new issue form when no picture has been selected by the user.
        defaultImageUrl: "img/default_img.png",
        
        // Options used when the user wants to take a picture of the issue with his phone's camera.
        cameraOptions: {
            quality: 50,
            destinationType: navigator.camera.DestinationType.DATA_URL,
            allowEdit: true,
            targetWidth: 500,
            targetHeight: 500,
            correctOrientation: true,
            sourceType: navigator.camera.PictureSourceType.CAMERA
        },
        
        // Options used when the user wants to take a picture from his phone's galery.
        galleryOptions: {
            quality: 50,
            destinationType: navigator.camera.DestinationType.DATA_URL,
            allowEdit: true,
            targetWidth: 500,
            targetHeight: 500,
            correctOrientation: true,
            sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
        },
        
        /**
         * Tries to take a picture with the adequates options.
         * Returns a promise of this action that must be handle afterwards.
         * @param {Object} options An object containing the options to use
         * @returns {Promise} A promise of the action
         */
        getPicture: function (options) {
            var dfd = $q.defer();

            navigator.camera.getPicture(function (result) {
                dfd.resolve(result);
            }, function (err) {
                dfd.reject(err);
            }, options);

            return dfd.promise;
        },
        
        /**
         * Tries to upload the given image base64 data to the server.
         * @param {String} imageData The image base64 data
         * @returns {Promise} The http promise of the action
         */
        uploadPicture: function (imageData) {
            Loading.show(messages.load_picture);
            return $http({
                method: "POST",
                url: qimgUrl + "/images",
                headers: {
                    Authorization: "Bearer " + qimgToken
                },
                data: {
                    data: imageData
                }
            });
        }
    };
});