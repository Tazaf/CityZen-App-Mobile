/*
 * This module defines the default settings for the application. They are loaded on bootup if there are no settings stored on the LocalStorage.
 */
angular.module('cityzen.default_settings', [])
        .constant("default_settings", {
            mapCenter: {
                lat: 50,
                lng: 7
            },
            zoom: 12,
            homePage: "app.map",
            homeView: "all",
            closeRange: 850,
            stateFilters: [
                {text: 'Créé', name: 'created', checked: true},
                {text: 'Assigné', name: 'assigned', checked: true},
                {text: 'Reconnu', name: 'acknowledged', checked: true},
                {text: 'En cours', name: 'in_progress', checked: true},
                {text: 'Rejeté', name: 'rejected', checked: true},
                {text: 'Résolu', name: 'solved', checked: true}
            ]
        });