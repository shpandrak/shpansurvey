package com.shpandrak.survey.rest;

import java.util.List;

/**
 * shpandrak made this on 12/6/14.
 */
public class SurveyQuestion {
    private final String id;
    private final String text;
    private final String shpanText;
    private final List<SurveyAnswer> answers;

    public SurveyQuestion() {
        this(null, null, null, null);
    }

    public SurveyQuestion(String id, String text, String shpanText, List<SurveyAnswer> answers) {
        this.id = id;
        this.text = text;
        this.shpanText = shpanText;
        this.answers = answers;
    }

    public String getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public String getShpanText() {
        return shpanText;
    }

    public List<SurveyAnswer> getAnswers() {
        return answers;
    }
}
