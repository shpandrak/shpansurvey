/**
 * Created by shpandrak on 1/17/15.
 */
'use strict';

/* App Module */

var shpanSurveyApp = angular.module('shpanSurveyApp', [
    'ngRoute',
    'shpanSurveyControllers',
    'shpanSurveyServices'
]);

shpanSurveyApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/survey', {
                templateUrl: 'partials/survey-list.html',
                controller: 'SurveyListCtrl'
            }).
            when('/survey/:surveyId', {
                templateUrl: 'partials/survey-edit.html',
                controller: 'SurveyDetailCtrl'
            }).
            when('/newSurvey', {
                templateUrl: 'partials/survey-edit.html',
                controller: 'NewSurveyCtrl'
            }).
            otherwise({
                redirectTo: '/survey'
            });
    }]);