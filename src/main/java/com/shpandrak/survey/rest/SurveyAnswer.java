package com.shpandrak.survey.rest;

/**
 * shpandrak made this on 12/6/14.
 */
public class SurveyAnswer {
    private final String id;
    private final String text;

    public SurveyAnswer() {
        this(null, null);
    }

    public SurveyAnswer(String id, String text) {
        this.id = id;
        this.text = text;
    }

    public String getId() {
        return id;
    }

    public String getText() {
        return text;
    }
}
