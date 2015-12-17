/**
 * Created by shpandrak on 11/14/14.
 *
 */
var ShpanText = (function () {
    function ShpanText(htmlElement) {
        this.delay = 40;
        this.text = null;
        this.pos = 0;
        this.printDoneCallback = null;
        // Active timer handle
        this.timerHandle = 0;
        // Initializing default plugins
        this.plugins = {
            // Wait - pauses for x millis
            'w': function (shpanText, params) {
                var charPause = parseInt(params[1]);
                shpanText.setTextAnimationTimeout(charPause, function () {
                    shpanText.nextCallback();
                });
            },
            /***
             * Delete       - deletes x characters
             * Parameters   1: [mandatory] number of characters to delete
             *              2: [optional] milliseconds to wait before deleting, default is 0
             */
            'd': function (shpanText, params) {
                var charactersToRemove = parseInt(params[1]);
                // Checking if timeToWait param supplied
                if (params.length > 2) {
                    var timeToWait = parseInt(params[2]);
                    shpanText.setTextAnimationTimeout(timeToWait, function () {
                        shpanText.deleteCharactersAndContinue(charactersToRemove);
                    });
                }
                else {
                    shpanText.deleteCharactersAndContinue(charactersToRemove);
                }
            },
            /***
             * Delete-All   Deletes all already typed characters
             * Parameters   1: [optional] milliseconds to wait before deleting, default is 0
             */
            'da': function (shpanText, params) {
                // Checking if timeToWait param supplied
                if (params.length > 1) {
                    var timeToWait = parseInt(params[1]);
                    shpanText.setTextAnimationTimeout(timeToWait, function () {
                        // Using pos as number of character since its the minimum
                        // When output text is empty deletion will finish anyway...
                        shpanText.deleteCharactersAndContinue(shpanText.pos);
                    });
                }
                else {
                    // Using pos as number of character since its the minimum
                    // When output text is empty deletion will finish anyway...
                    shpanText.deleteCharactersAndContinue(shpanText.pos);
                }
            }
        };
        this.htmlElement = htmlElement;
    }
    ShpanText.prototype.addExternalPlugin = function (pluginId, externalPlugin) {
        this.plugins[pluginId] = externalPlugin;
    };
    ShpanText.prototype.printShpanText = function (text, callback) {
        if (callback === void 0) { callback = null; }
        this.clearTimerHandle();
        this.printDoneCallback = null;
        this.text = text;
        this.pos = 0;
        this.htmlElement.innerHTML = '';
        if (callback != null) {
            this.printDoneCallback = callback;
        }
        this.nextCallback();
    };
    ShpanText.prototype.setTextAnimationTimeout = function (delay, handler) {
        this.clearTimerHandle();
        this.timerHandle = window.setTimeout(handler, delay);
    };
    ShpanText.prototype.clearTimerHandle = function () {
        if (this.timerHandle != 0) {
            window.clearTimeout(this.timerHandle);
            this.timerHandle = 0;
        }
    };
    ShpanText.prototype.prvPrint = function () {
        // Checking if done
        if (this.pos >= this.text.length) {
            // We are done cleaning timer if somehow set
            this.clearTimerHandle();
            // Calling "done" callback if set
            if (this.printDoneCallback != null) {
                this.printDoneCallback();
            }
        }
        else {
            var subStr = this.text.substr(this.pos);
            if (subStr.charAt(0) === '$' && subStr.charAt(1) === '[') {
                var paramsMatch = /\$\[(?:\w+)(?:,\w+)*\]/.exec(subStr);
                if (paramsMatch != null) {
                    var paramsStr = subStr.substr(2, paramsMatch[0].length - 3);
                    var paramsArr = paramsStr.split(',');
                    var pluginKey = paramsArr[0];
                    var plugin = this.plugins[pluginKey];
                    this.pos += paramsStr.length + 3;
                    if (plugin != null) {
                        //todo:else-warn
                        plugin(this, paramsArr);
                    }
                }
                // Finish execution, plugins will lead the next step
                return;
            }
            var nextChar = this.text.charAt(this.pos);
            this.htmlElement.textContent += nextChar;
            this.pos += 1;
            this.nextCallback();
        }
    };
    ShpanText.prototype.nextCallback = function () {
        var _this = this;
        this.setTextAnimationTimeout(this.delay, function () {
            _this.prvPrint();
        });
    };
    ShpanText.prototype.deleteCharactersAndContinue = function (numberOfCharactersToDelete) {
        var _this = this;
        this.setTextAnimationTimeout(this.delay, function () {
            _this.prvDelete(numberOfCharactersToDelete);
        });
    };
    ShpanText.prototype.prvDelete = function (numberOfCharactersToDelete) {
        if (numberOfCharactersToDelete > 0 && this.htmlElement.textContent.length > 0) {
            this.htmlElement.textContent = this.htmlElement.textContent.substr(0, this.htmlElement.textContent.length - 1);
            this.deleteCharactersAndContinue(numberOfCharactersToDelete - 1);
        }
        else if (this.text != null) {
            this.nextCallback();
        }
    };
    return ShpanText;
})();
/**
 * Created by shpandrak on 11/21/14.
 */
/// <reference path="shpantext.ts" />
function doTheBot(titleElement, consoleElement, outputElement, bot) {
    var botRunner = new BotRunner(bot, titleElement, consoleElement, outputElement);
    botRunner.run();
}
function runSampleBot(titleElement, consoleElement, outputElement) {
    var stepRoot = new BotStep('root', 'Hi.$[d,3,2000]I am the first bot.$[w,2000] Surrender now, or fight.', [
        new BotOption('1', 'Surrender', new BotAction('alert', {
            text: 'Good thinking..'
        })),
        new BotOption('2', 'Fight', new BotAction('step', {
            stepId: 'fight'
        })),
        new BotOption('3', 'Calm Down Bot', new BotAction('alert', {
            text: 'Never!'
        }))
    ]);
    var stepFight = new BotStep('fight', 'OK.. so this is how its going to be$[w,200].$[w,200].$[w,200].$[w,200].$[w,200].$[w,200].$[w,200].$[w,200].$[w,200].$[w,200].$[d,9] so how far are you willing to go?', [
        new BotOption('1', 'To The Death', new BotAction("alert", {
            text: 'Luckily for you bot is still under construction...'
        })),
        new BotOption('2', 'To The Pain', new BotAction("step", {
            stepId: 'pain'
        }))
    ]);
    var stepPain = new BotStep('pain', 'I\'ll explain$[da,1000]and I\'ll use small words so that you\'ll be sure to understand$[da,500]you warthog-faced buffoon.$[da,1000]' + '"To the pain" means$[w,100].$[w,100].$[w,100].$[da] the first thing you lose will be your feet$[w,1000] below the ankles$[da,1000]' + 'then your hands$[w,1000] at the wrists$[da,1000]Next,$[w,400] your nose.', [
        new BotOption('1', 'aaaa', new BotAction("step", {
            stepId: 'root'
        })),
        new BotOption('2', 'bbbbb', new BotAction("step", {
            stepId: 'root'
        }))
    ]);
    var bot = new Bot("The First Bot!", "shpandrak@gmail.com", [
        stepRoot,
        stepFight,
        stepPain
    ], "root");
    doTheBot(titleElement, consoleElement, outputElement, bot);
}
var BotAction = (function () {
    function BotAction(type, values) {
        this.type = type;
        this.values = values;
    }
    return BotAction;
})();
var BotOption = (function () {
    function BotOption(id, text, action) {
        this.id = id;
        this.text = text;
        this.action = action;
    }
    return BotOption;
})();
var BotStep = (function () {
    function BotStep(id, text, options) {
        this.id = id;
        this.text = text;
        this.options = options;
    }
    return BotStep;
})();
var Bot = (function () {
    function Bot(name, creator, steps, firstStepId) {
        this.name = name;
        this.creator = creator;
        this.steps = steps;
        this.firstStepId = firstStepId;
    }
    return Bot;
})();
var BotRunner = (function () {
    function BotRunner(bot, titleElement, consoleElement, outputElement) {
        var _this = this;
        // Initializing default action plugins
        this.actionPlugins = {
            'step': function (runner, option, step) {
                runner.runStep(option.action.values['stepId']);
            },
            'link': function (runner, option, step) {
                var href = option.action.values['href'];
                window.location.href = href;
            },
            'alert': function (runner, option, step) {
                alert(option.action.values['alert']);
            }
        };
        this.bot = bot;
        this.titleElement = titleElement;
        this.consoleElement = consoleElement;
        this.outputElement = outputElement;
        this.shpanText = new ShpanText(consoleElement);
        this.botSteps = {};
        bot.steps.forEach(function (currStep) {
            _this.botSteps[currStep.id] = currStep;
        });
    }
    BotRunner.prototype.run = function () {
        this.titleElement.innerHTML = this.bot.name;
        this.runStep(this.bot.firstStepId);
    };
    BotRunner.prototype.addActionPlugin = function (actionId, actionPlugin) {
        this.actionPlugins[actionId] = actionPlugin;
    };
    BotRunner.prototype.print = function (shpanText, callback) {
        if (callback === void 0) { callback = null; }
        this.shpanText.printShpanText(shpanText, callback);
    };
    BotRunner.prototype.runStep = function (stepId) {
        var _this = this;
        var botStep = this.botSteps[stepId];
        this.outputElement.innerHTML = '';
        this.consoleElement.innerHTML = '';
        this.shpanText.printShpanText(botStep.text, function () {
            _this.displayBotStepOptions(botStep);
        });
    };
    BotRunner.prototype.displayBotStepOptions = function (botStep) {
        var _this = this;
        var first = true;
        botStep.options.forEach(function (currOption) {
            if (first) {
                first = false;
            }
            else {
                _this.outputElement.appendChild(document.createTextNode(' | '));
            }
            var a = document.createElement("a");
            a.textContent = currOption.text;
            a.href = "javascript:undefined";
            var actionPlugin = _this.actionPlugins[currOption.action.type];
            if (actionPlugin == null) {
                console.error("invalid action plugin " + currOption.action.type);
                a.addEventListener("click", function () {
                    alert('Bonk!');
                });
            }
            else {
                a.addEventListener("click", function (ev) {
                    ev.preventDefault();
                    // Allowing something to say before redirecting
                    var textBeforeRedirect = currOption.action.values['text'];
                    if (textBeforeRedirect != null) {
                        _this.shpanText.printShpanText('$[da]' + textBeforeRedirect, function () {
                            actionPlugin(_this, currOption, botStep);
                        });
                    }
                    else {
                        actionPlugin(_this, currOption, botStep);
                    }
                });
            }
            _this.outputElement.appendChild(a);
        });
    };
    return BotRunner;
})();
/**
 * Created by shpandrak on 11/28/14.
 */
/// <reference path="shpanbot.ts" />
var SurveyAnswer = (function () {
    function SurveyAnswer(id, text, nextQuestionId, afterQuestionText) {
        if (nextQuestionId === void 0) { nextQuestionId = null; }
        if (afterQuestionText === void 0) { afterQuestionText = null; }
        this.id = id;
        this.text = text;
        this.nextQuestionId = nextQuestionId;
        this.afterQuestionText = afterQuestionText;
    }
    return SurveyAnswer;
})();
var SurveyQuestion = (function () {
    function SurveyQuestion(id, text, answers, shpantext) {
        if (shpantext === void 0) { shpantext = null; }
        this.id = id;
        this.text = text;
        this.shpanText = shpantext;
        this.answers = answers;
    }
    return SurveyQuestion;
})();
var Survey = (function () {
    function Survey(name, creator, questions, firstQuestionId) {
        if (firstQuestionId === void 0) { firstQuestionId = null; }
        this.name = name;
        this.creator = creator;
        this.questions = questions;
        if (firstQuestionId == null) {
            this.firstQuestionId = questions[0].id;
        }
        else {
            this.firstQuestionId = firstQuestionId;
        }
    }
    return Survey;
})();
var SurveyManager = (function () {
    function SurveyManager(survey, titleElement, consoleElement, outputElement, resultsCallback) {
        var _this = this;
        this.survey = survey;
        this.responses = {};
        this.resultsCallback = resultsCallback;
        var botSteps = new Array(survey.questions.length);
        var i = 0;
        survey.questions.forEach(function (currQuestion) {
            var botOptions = new Array(currQuestion.answers.length);
            currQuestion.answers.forEach(function (currAnswer) {
                var botActionOptions = {};
                var nextStepId = currAnswer.nextQuestionId;
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
                    botOptions.push(new BotOption(currAnswer.id, currAnswer.text, new BotAction('surveyDone', botActionOptions)));
                }
                else {
                    botOptions.push(new BotOption(currAnswer.id, currAnswer.text, new BotAction('surveyStep', botActionOptions)));
                }
            });
            var shpanText = currQuestion.shpanText == null ? currQuestion.text : currQuestion.shpanText;
            botSteps.push(new BotStep(currQuestion.id, shpanText, botOptions));
            i++;
        });
        var bot = new Bot(survey.name, survey.creator, botSteps, survey.firstQuestionId);
        this.runner = new BotRunner(bot, titleElement, consoleElement, outputElement);
        var surveyStepBotActionPlugin = function (runner, option, step) {
            _this.responses[step.id] = option.id;
            runner.runStep(option.action.values['stepId']);
        };
        var surveyFinishBotActionPlugin = function (runner, option, step) {
            _this.responses[step.id] = option.id;
            resultsCallback(_this.responses);
        };
        this.runner.addActionPlugin('surveyStep', surveyStepBotActionPlugin);
        this.runner.addActionPlugin('surveyDone', surveyFinishBotActionPlugin);
    }
    SurveyManager.prototype.run = function () {
        this.runner.run();
    };
    return SurveyManager;
})();
var SurveySummary = (function () {
    function SurveySummary(responses) {
        this.responses = responses;
    }
    return SurveySummary;
})();
var SurveySummaryManager = (function () {
    function SurveySummaryManager(survey, summary, summaryElement) {
        this.survey = survey;
        this.summary = summary;
        this.summaryElement = summaryElement;
    }
    SurveySummaryManager.prototype.draw = function () {
        var _this = this;
        var s = '<ol>';
        this.survey.questions.forEach(function (currQuestion) {
            var stripped = currQuestion.text.split(/\$\[[^\]]*\]/);
            s += '<br/><li><h3>' + stripped.join(' ').replace('  ', ' ') + '</h3>';
            s += '<ul><br/>';
            currQuestion.answers.forEach(function (currAnswer) {
                var answerCountStr = _this.summary.responses[currQuestion.id][currAnswer.id];
                var answerCount = 0;
                if (answerCountStr != null) {
                    answerCount = parseInt(answerCountStr);
                }
                s += '<li>' + currAnswer.text + '<b> ' + answerCount + '</b></li>';
            });
            s += '</ul></li><br/><hr/>';
        });
        this.summaryElement.innerHTML = s + '</ol>';
    };
    return SurveySummaryManager;
})();
