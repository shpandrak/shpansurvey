package com.shpandrak.survey.rest;

import com.google.appengine.api.datastore.*;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * shpandrak made this on 12/5/14.
 */
@Path("/survey/{id}/results")
public class SurveyResultsResource {
    private static final DatastoreService dataStore = DatastoreServiceFactory.getDatastoreService();

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Map<String, Map<String, String>> getResultsSummary(@PathParam("id") String surveyId){

        Query q = new Query("SurveyResults", KeyFactory.createKey("Survey", Long.valueOf(surveyId)));
        PreparedQuery pq = dataStore.prepare(q);
        List<Entity> resultsEntity = pq.asList(FetchOptions.Builder.withDefaults());
        Map<String, Map<String, String>> resultsSummary = new HashMap<>(resultsEntity.size());
        for (Entity currResult : resultsEntity){

            Map<String, Object> properties = currResult.getProperties();
            Map<String, String> answerCountByAnswerId = new HashMap<>(properties.size());
            for (Map.Entry<String, Object> currProp : properties.entrySet()){
                answerCountByAnswerId.put(currProp.getKey(), currProp.getValue().toString());
            }
            resultsSummary.put(currResult.getKey().getName(), answerCountByAnswerId);
        }

        return resultsSummary;


    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response postResults(SurveyResults results, @PathParam("id") String surveyId){
        Transaction tx = dataStore.beginTransaction();
        try {

            // Use class Query to assemble a query
            Query q = new Query("SurveyResults", KeyFactory.createKey("Survey", Long.valueOf(surveyId)));

            // Use PreparedQuery interface to retrieve results
            PreparedQuery pq = dataStore.prepare(tx, q);
            List<Entity> resultsEntity = pq.asList(FetchOptions.Builder.withDefaults());

            Map<String, Entity> resultByQuestionId = new HashMap<>(resultsEntity.size());
            for (Entity currResult : resultsEntity){
                resultByQuestionId.put(currResult.getKey().getName(), currResult);
            }

            for (Map.Entry<String, String> currResult : results.getAnswers().entrySet()) {
                Entity resultEntity = resultByQuestionId.get(currResult.getKey());
                Object property = resultEntity.getProperty(currResult.getValue());
                long prop;
                if (property == null) {
                    prop = 0;
                }else {
                    prop = (long) property;
                }
                resultEntity.setProperty(currResult.getValue(), prop + 1);
            }
            dataStore.put(tx, resultsEntity);
            tx.commit();

        } finally {
            if (tx.isActive()) {
                tx.rollback();
            }
        }


        return Response.ok().build();

    }

}
