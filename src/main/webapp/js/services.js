'use strict';

/* Services */

var phonecatServices = angular.module('shpanSurveyServices', ['ngResource']);

phonecatServices.factory('Survey', ['$resource',
  function($resource){
    return $resource('rest/survey/:surveyId', {}, {
      query: {method:'GET', params:{surveyId:null}, isArray:true},
      update: { method:'PUT' }
    });
  }]);
