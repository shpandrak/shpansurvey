package com.shpandrak.survey.rest;

import java.util.List;

/**
 * shpandrak made this on 12/6/14.
 */
public class Survey {
    private String id;
    private final String name;
    private final String creator;
    private final String firstQuestionId;
    private final List<SurveyQuestion> questions;

    private Survey() {
        this(null, null, null, null, null);
    }

    public Survey(String id, String name, String creator, String firstQuestionId, List<SurveyQuestion> questions) {
        this.id = id;
        this.name = name;
        this.creator = creator;
        this.firstQuestionId = firstQuestionId;
        this.questions = questions;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCreator() {
        return creator;
    }

    public String getFirstQuestionId() {
        return firstQuestionId;
    }

    public List<SurveyQuestion> getQuestions() {
        return questions;
    }
}
