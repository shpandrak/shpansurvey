package com.shpandrak.survey.rest;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.appengine.api.datastore.*;

import javax.ws.rs.*;
import javax.ws.rs.core.*;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

/**
 * shpandrak made this on 12/5/14.
 */

@Path("/survey")
public class SurveyResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response list() {
        // Get the Datastore Service
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

        // Use class Query to assemble a query
        Query q = new Query("Survey");

        // Use PreparedQuery interface to retrieve results
        final PreparedQuery pq = datastore.prepare(q);

        return Response.ok(new StreamingOutput() {
            @Override
            public void write(OutputStream outputStream) throws IOException, WebApplicationException {
                try (PrintStream printStream = new PrintStream(outputStream)) {

                    printStream.print("[");

                    boolean first = true;
                    for (Entity result : pq.asIterable()) {
                        if (first) {
                            first = false;
                        } else {
                            printStream.print(",");
                        }

                        String body = ((Text) result.getProperty("body")).getValue();
                        printStream.print(body.replaceFirst("\\\"id\\\"\\s*\\:\\s*null", "\"id\":\"" + result.getKey().getId() + "\""));

                    }
                    printStream.print("]");
                }
            }
        }).build();
    }

    @Path("/{id}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Survey getById(@PathParam("id") long id) throws IOException {
        // Get the Datastore Service
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

        // Use class Query to assemble a query
        Query q = new Query("Survey", KeyFactory.createKey("Survey", id));

        // Use PreparedQuery interface to retrieve results
        PreparedQuery pq = datastore.prepare(q);
        Entity entity = pq.asSingleEntity();
        return MyObjectMapperProvider.defaultObjectMapper.reader(Survey.class).readValue(((Text) entity.getProperty("body")).getValue().replaceFirst("\\\"id\\\"\\s*\\:\\s*null", "\"id\":\"" + entity.getKey().getId() + "\""));
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Survey create(Survey survey) throws JsonProcessingException {
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

        Transaction tx = datastore.beginTransaction();
        try{
            Entity surveyEntity = new Entity("Survey");
            surveyEntity.setProperty("body", new Text(MyObjectMapperProvider.defaultObjectMapper.writeValueAsString(survey)));
            surveyEntity.setProperty("createdOn", new Date());
            Key surveyKey = datastore.put(tx, surveyEntity);
            List<Entity> surveyResults = new ArrayList<>(survey.getQuestions().size());
            for (SurveyQuestion currQuestion : survey.getQuestions()){
                Entity currResult = new Entity("SurveyResults", currQuestion.getId(), surveyKey);
                for (SurveyAnswer currAnswer : currQuestion.getAnswers()){
                    currResult.setProperty(currAnswer.getId(), 0L);
                    surveyResults.add(currResult);

                }
            }
            datastore.put(tx, surveyResults);
            tx.commit();
            survey.setId(String.valueOf(surveyKey.getId()));
            return survey;
        } finally {
            if (tx.isActive()) {
                tx.rollback();
            }
        }
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Survey update(Survey survey) throws JsonProcessingException {
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

        Transaction tx = datastore.beginTransaction();
        try{
            // Use class Query to assemble a query
            Query q = new Query("Survey", KeyFactory.createKey("Survey", Long.valueOf(survey.getId())));

            // Use PreparedQuery interface to retrieve results
            PreparedQuery pq = datastore.prepare(q);
            Entity surveyEntity = pq.asSingleEntity();

            surveyEntity.setProperty("body", new Text(MyObjectMapperProvider.defaultObjectMapper.writeValueAsString(survey)));
            surveyEntity.setProperty("updatedOn", new Date());
            Key surveyKey = datastore.put(tx, surveyEntity);
            List<Entity> surveyResults = new ArrayList<>(survey.getQuestions().size());
            for (SurveyQuestion currQuestion : survey.getQuestions()){
                Entity currResult = new Entity("SurveyResults", currQuestion.getId(), surveyKey);
                for (SurveyAnswer currAnswer : currQuestion.getAnswers()){
                    currResult.setProperty(currAnswer.getId(), 0L);
                    surveyResults.add(currResult);

                }
            }
            datastore.put(tx, surveyResults);
            tx.commit();
            return survey;
        } finally {
            if (tx.isActive()) {
                tx.rollback();
            }
        }
    }

/*
    @DELETE
    public void delete(String entityId) {
        doDelete(entityId);
    }
*/
}