var app = angular.module('cityzen.data-manager', ['cityzen.tags', 'cityzen.comments', 'cityzen.settings']);
app.factory('DataManager', function (TagsService, CommentsService, Settings) {
    return {
        orderData: function (data) {
            data.tags = TagsService.orderTags(data.tags);
            data.comments = CommentsService.oderComments(data.comments);
            return data;
        },
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