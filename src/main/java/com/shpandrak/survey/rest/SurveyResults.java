package com.shpandrak.survey.rest;

import java.util.Map;

/**
 * shpandrak made this on 12/5/14.
 */
public class SurveyResults {
    private final Map<String, String> answers;

    public SurveyResults() {
        this(null);
    }

    public SurveyResults(Map<String, String> answers) {
        this.answers = answers;
    }

    public Map<String, String> getAnswers() {
        return answers;
    }
}
