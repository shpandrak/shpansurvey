'use strict';

/* Controllers */

var shpanSurveyControllers = angular.module('shpanSurveyControllers', []);

shpanSurveyControllers.controller('SurveyListCtrl', ['$scope', 'Survey',
  function($scope, Survey) {
    $scope.surveys = Survey.query();
    $scope.orderProp = 'name';

  }]);


shpanSurveyControllers.controller('SurveyDetailCtrl', ['$scope', '$routeParams', 'Survey',
  function($scope, $routeParams, Survey) {
    $scope.survey = Survey.get({surveyId: $routeParams.surveyId});
    $scope.saveSurvey = function() {
      $scope.survey.$update(function(u, putResponseHeaders){
        window.location.replace( '/' );
      });
    };


/*
    $scope.survey = Survey.get({surveyId: $routeParams.surveyId}, function(survey) {
      $scope.name = survey.name;
    });
*/
  }]);

shpanSurveyControllers.controller('NewSurveyCtrl', ['$scope', '$routeParams', 'Survey',
  function($scope, $routeParams, Survey) {

    //todo: use the typescript def
    $scope.survey = new Survey();
    $scope.survey.name = "My Survey";
    $scope.survey.creator = "shpandrak@gmail.com";
    $scope.survey.questions = [
      {
        "id": "1",
        "text": "First Question",
        "answers": []
      }];
    $scope.survey.firstQuestionId = "1";
    $scope.saveSurvey = function() {
      $scope.survey.$save(function(u, putResponseHeaders){
        window.location.replace( '/' );
      });
    }

  }]);
