/**
 * Created by shpandrak on 11/28/14.
 */
/// <reference path="shpanbot.ts" />

interface SurveyResultsCallback{
    (responses:{ [s: string]: string; });
}


class SurveyAnswer{
    id:string;
    text: string;
    nextQuestionId:string; // optional
    afterQuestionText:string; //optional

    constructor(id:string, text: string,nextQuestionId:string = null, afterQuestionText:string = null){
        this.id = id;
        this.text = text;
        this.nextQuestionId = nextQuestionId;
        this.afterQuestionText = afterQuestionText;
    }
}

class SurveyQuestion{
    id:string;
    text:string;
    shpanText:string;
    answers: Array<SurveyAnswer>;

    constructor(id:string, text:string, answers: Array<SurveyAnswer>, shpantext:string = null){
        this.id = id;
        this.text = text;
        this.shpanText = shpantext;
        this.answers = answers;
    }
}

class Survey {
    name:string;
    creator:string;
    questions:Array<SurveyQuestion>;
    firstQuestionId:string;

    constructor(name:string, creator:string, questions:Array<SurveyQuestion>, firstQuestionId:string = null) {
        this.name = name;
        this.creator = creator;
        this.questions = questions;
        if (firstQuestionId == null) {
            this.firstQuestionId = questions[0].id;
        } else {
            this.firstQuestionId = firstQuestionId;
        }
    }
}

class SurveyManager {
    private survey:Survey;
    private runner:BotRunner;
    private responses:{ [s: string]: string; };
    private resultsCallback:SurveyResultsCallback;

    constructor(survey:Survey, titleElement:HTMLElement, consoleElement:HTMLElement, outputElement:HTMLElement, resultsCallback:SurveyResultsCallback) {
        this.survey = survey;
        this.responses = {};
        this.resultsCallback = resultsCallback;

        var botSteps:Array<BotStep> = new Array<BotStep>(survey.questions.length);
        var i = 0;

        survey.questions.forEach((currQuestion) => {
            var botOptions:Array<BotOption> = new Array<BotOption>(currQuestion.answers.length);
            currQuestion.answers.forEach((currAnswer)=> {
                var botActionOptions:{ [s: string]: string; } = {};
                var nextStepId:string = currAnswer.nextQuestionId;
                if (nextStepId == null) {
                    if (i != survey.questions.length - 1) {
                        nextStepId = survey.questions[(i + 1).toString()].id;
                    }
                }
                botActionOptions['stepId'] = nextStepId;

                if (currAnswer.afterQuestionText != null) {
                    botActionOptions['text'] = currAnswer.afterQuestionText;
                }

                if (i == survey.questions.length - 1) {
                    botActionOptions['alert'] = "Ok";
                    botOptions.push(new BotOption(currAnswer.id, currAnswer.text, new BotAction('surveyDone', botActionOptions)))
                } else {
                    botOptions.push(new BotOption(currAnswer.id, currAnswer.text, new BotAction('surveyStep', botActionOptions)))
                }
            });

            var shpanText:string = currQuestion.shpanText == null ? currQuestion.text : currQuestion.shpanText;
            botSteps.push(new BotStep(currQuestion.id, shpanText, botOptions));
            i++;
        });


        var bot:Bot = new Bot(survey.name, survey.creator, botSteps, survey.firstQuestionId);
        this.runner = new BotRunner(bot, titleElement, consoleElement, outputElement);

        var surveyStepBotActionPlugin:BotActionPlugin = (runner:BotRunner, option:BotOption, step:BotStep) => {
            this.responses[step.id] = option.id;
            runner.runStep(option.action.values['stepId']);
        };

        var surveyFinishBotActionPlugin:BotActionPlugin = (runner:BotRunner, option:BotOption, step:BotStep) => {
            this.responses[step.id] = option.id;
            resultsCallback(this.responses)
        };

        this.runner.addActionPlugin('surveyStep', surveyStepBotActionPlugin);
        this.runner.addActionPlugin('surveyDone', surveyFinishBotActionPlugin);
    }

    public run() {
        this.runner.run();
    }
}



class SurveySummary{
    responses:{ [s: string]: { [s: string]: string; }; };
    constructor(responses:{ [s: string]: { [s: string]: string; }; }){
        this.responses = responses;
    }
}
class SurveySummaryManager {
    private survey:Survey;
    private summary:SurveySummary;
    private summaryElement:HTMLElement;

    constructor(survey:Survey, summary:SurveySummary, summaryElement:HTMLElement){
        this.survey = survey;
        this.summary = summary;
        this.summaryElement = summaryElement;
    }

    public draw(){
        var s:string = '<ol>';
        this.survey.questions.forEach((currQuestion)=>{

            var stripped:string[] = currQuestion.text.split(/\$\[[^\]]*\]/);
            s += '<br/><li><h3>' + stripped.join(' ').replace('  ',' ') + '</h3>';
            s += '<ul><br/>';
            currQuestion.answers.forEach((currAnswer)=>{
                var answerCountStr:string = this.summary.responses[currQuestion.id][currAnswer.id];
                var answerCount:number = 0;
                if (answerCountStr != null){
                    answerCount = parseInt(answerCountStr);
                }
                s += '<li>' + currAnswer.text + '<b> ' + answerCount + '</b></li>';

            });
            s += '</ul></li><br/><hr/>';

        });
        this.summaryElement.innerHTML = s + '</ol>';
    }
}