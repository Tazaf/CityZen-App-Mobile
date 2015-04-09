/**
 * This is a module responsible for the issues' data.
 */
var app = angular.module('cityzen.data-manager', ['cityzen.tags', 'cityzen.comments', 'cityzen.settings']);

/**
 * Defines the DataManager service that can order the issue data and filter them either by their type or their state.
 */
app.factory('DataManager', function (TagsService, CommentsService, Settings) {
    return {
        
        /**
         * Order an issue's data. First order its tags by alphabetical order. Then order its comments by their publication date.
         * The parameter must have at least a tags and a comments properties.
         * @param {Object} issue An issue to order
         * @returns {Object} The ordered issue
         */
        orderData: function (issue) {
            issue.tags = TagsService.orderTags(issue.tags);
            issue.comments = CommentsService.oderComments(issue.comments);
            return issue;
        },
        
        /**
         * Filter the given data according to the active typeFilters.
         * For each issue contained in the data and for each filter, check if this filter is active and if the issue match it.
         * If it's the case, add the issue to the response array.
         * @param {Array} data An Array of issues to filter
         * @returns {Array} An Array of issue matching the filters
         */
        filterIssueType: function (data) {
            var response = [];
            var filters = Settings.active.typeFilters;
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < filters.length; j++) {
                    if (filters[j].checked && data[i].issueType.name === filters[j].name) {
                        response.push(data[i]);
                    }
                }
            }
            return response;
        },
        
        /**
         * Filter the given data according to the active stateFilters.
         * For each issue contained in the data and for each filter, check if this filter is active and if the issue match it.
         * If it's the case, add the issue to the response array.
         * @param {Array} data An Array of issues to filter
         * @returns {Array} An Array of issue matching the filters
         */
        filterIssueState: function (data) {
            var response = [];
            var filters = Settings.active.stateFilters;
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < filters.length; j++) {
                    if (filters[j].checked && data[i].state === filters[j].name) {
                        response.push(data[i]);
                    }
                }
            }
            return response;
        }
    };
});