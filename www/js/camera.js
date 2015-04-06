var app = angular.module('cityzen.camera', []);
app.factory('Camera', function ($q, $http, qimgUrl, qimgToken) {
    return {
        defaultImageUrl: "img/default_img.png",
//        defaultImageUrl: "https://fbexternal-a.akamaihd.net/safe_image.php?d=AQDd1XVqJ-4fpMs_&w=470&h=246&url=http%3A%2F%2Fassets.noisey.com%2Fcontent-images%2Farticle%2Fdalek-video-interview%2FBc1kC1BhEx-8mjh4iDrtKmjNNrswrGyn5QRgVQF-MjM_vice_970x435.jpg&cfs=1&upscale=1&sx=62&sy=0&sw=831&sh=435",
        options: {
//            quality: 50,
//            destinationType: navigator.camera.DestinationType.DATA_URL,
//            allowEdit: true,
//            targetWidth: 500,
//            targetHeight: 500,
//            correctOrientation: true
        },
        cameraOptions: function() {
            var opt = this.options;
            opt.sourceType = navigator.camera.PictureSourceType.CAMERA;
            return opt;
        },
        galleryOptions: function() {
            var opt = this.options;
            opt.sourceType = navigator.camera.PictureSourceType.PHOTOLIBRARY;
            return opt;
        },
        getPicture: function (options) {
            console.log('getPictures');
            var dfd = $q.defer();

            navigator.camera.getPicture(function (result) {
                dfd.resolve(result);
            }, function (err) {
                dfd.reject(err);
            }, options);

            return dfd.promise;
        },
        uploadPicture: function(imageData) {
            console.log(imageData);
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