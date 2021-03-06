/*
 * This module defines the messages and their value that can be showned to the user while using the application.
 */
angular.module('cityzen.messages', [])
        .constant("messages", {
            no_result: "Désolé, aucun résultat...",
            connecting: "Connexion...",
            error: "Impossible de charger les problème.",
            error_issue: "Impossible de charger le problèmes.",
            loading: "Chargement...",
            locating: "Localisation",
            load_map: "Chargement de la carte",
            load_picture: "Chargement de la photo",
            load_data: "Chargement des données",
            create_markers: "Création des marqueurs",
            filter_fail: "Aucun résultat pour ces critères"
        });