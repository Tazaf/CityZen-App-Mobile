var app = angular.module('cityzen.data-manager', ['cityzen.tags', 'cityzen.comments', 'cityzen.settings']);
app.factory('DataManager', function (TagsService, CommentsService, SettingsService) {
    return {
        orderData: function (data) {
            data.tags = TagsService.orderTags(data.tags);
            data.comments = CommentsService.oderComments(data.comments);
            return data;
        },
        filterIssueType: function (data, filters) {
            var response = [];
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < filters.length; j++) {
                    var condition = type === "state" ? data[i].state === filters[j].name : data[i].issueType.name === filters[j].name;
                    if (filters[j].checked && condition) {
                        response.push(data[i]);
                    }
                }
            }
            return response;
        },
        filterIssueState: function (data, filters) {
            var response = [];
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < filters.length; j++) {
                    if (filters[j].checked && data[i].state === filters[j].name) {
                        response.push(data[i]);
                    }
                }
            }
            return response;
        },
        filterIssues: function (data, filters, type) {
            function filter() {
                var response = [];
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < filters.length; j++) {
                        var condition = type === "state" ? data[i].state === filters[j].name : data[i].issueType.name === filters[j].name;
                        if (filters[j].checked && condition) {
                            response.push(data[i]);
                        }
                    }
                }
                return response;
            }
            var temp_filtered_results;
            var filtered_results;
            if (type === "state") {
                temp_filtered_results = this.filterIssueType(data, filters);
                filtered_results = this.filterIssueState(temp_filtered_results, SettingsService.active.stateFilters);
            } else if (type === "type") {
                temp_filtered_results = this.filterIssueState()
            }

//            $scope.error = null;
//            var temp_filtered_results = IssuesService.filterIssueType($scope.init_issues, $scope.config.issueTypes);
//            $scope.issues = IssuesService.filterIssueState(temp_filtered_results, SettingsService.active.stateFilters);
//            if ($scope.issues.length === 0) {
//                $scope.error = {msg: messages.no_result};
//            }

        }

    };
});