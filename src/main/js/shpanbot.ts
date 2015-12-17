/**
 * Created by shpandrak on 11/21/14.
 */

/// <reference path="shpantext.ts" />

interface BotActionPlugin{
    (runner:BotRunner, option: BotOption, step:BotStep);
}


function doTheBot(titleElement:HTMLElement, consoleElement:HTMLElement, outputElement:HTMLElement, bot: Bot){
    var botRunner:BotRunner = new BotRunner(bot, titleElement, consoleElement, outputElement);
    botRunner.run();
}

function runSampleBot(titleElement:HTMLElement, consoleElement:HTMLElement, outputElement:HTMLElement){

    var stepRoot:BotStep = new BotStep(
        'root',
        'Hi.$[d,3,2000]I am the first bot.$[w,2000] Surrender now, or fight.',[
            new BotOption(
                '1',
                'Surrender',
                new BotAction('alert', {
                    text: 'Good thinking..'
                })
            ),
            new BotOption(
                '2',
                'Fight',
                new BotAction('step', {
                    stepId: 'fight'
                })
            ),
            new BotOption(
                '3',
                'Calm Down Bot',
                new BotAction('alert', {
                    text: 'Never!'
                })
            )
        ]);

    var stepFight:BotStep = new BotStep(
        'fight',
        'OK.. so this is how its going to be$[w,200].$[w,200].$[w,200].$[w,200].$[w,200].$[w,200].$[w,200].$[w,200].$[w,200].$[w,200].$[d,9] so how far are you willing to go?',[
            new BotOption(
                '1',
                'To The Death',
                new BotAction("alert", {
                    text: 'Luckily for you bot is still under construction...'
                })
            ),
            new BotOption(
                '2',
                'To The Pain',
                new BotAction("step", {
                    stepId: 'pain'
                })
            )
        ]);

    var stepPain:BotStep = new BotStep(
        'pain',
        'I\'ll explain$[da,1000]and I\'ll use small words so that you\'ll be sure to understand$[da,500]you warthog-faced buffoon.$[da,1000]' +
        '"To the pain" means$[w,100].$[w,100].$[w,100].$[da] the first thing you lose will be your feet$[w,1000] below the ankles$[da,1000]' +
        'then your hands$[w,1000] at the wrists$[da,1000]Next,$[w,400] your nose.',[
            new BotOption(
                '1',
                'aaaa',
                new BotAction("step", {
                    stepId: 'root'
                })
            ),
            new BotOption(
                '2',
                'bbbbb',
                new BotAction("step", {
                    stepId: 'root'
                })
            )
        ]);

    var bot:Bot = new Bot(
    "The First Bot!",
    "shpandrak@gmail.com",
        [
            stepRoot,
            stepFight,
            stepPain
        ],
        "root");

    doTheBot(titleElement, consoleElement, outputElement, bot);
}


class BotAction{
    type: string;
    values: { [s: string]: string; };

    constructor(type: string, values: { [s: string]: string; }){
        this.type = type;
        this.values = values;
    }
}

class BotOption{
    id:string;
    text: string;
    action: BotAction;

    constructor(id:string, text: string,action: BotAction){
        this.id = id;
        this.text = text;
        this.action = action;
    }
}

class BotStep{
    id:string;
    text: string;
    options: Array<BotOption>;

    constructor(id:string, text:string, options: Array<BotOption>){
        this.id = id;
        this.text = text;
        this.options = options;
    }
}

class Bot{
    name: string;
    creator: string;
    steps: Array<BotStep>;
    firstStepId: string;

    constructor(name: string, creator: string, steps: Array<BotStep>, firstStepId: string){
        this.name = name;
        this.creator = creator;
        this.steps = steps;
        this.firstStepId = firstStepId;
    }
}

class BotRunner{
    private shpanText:ShpanText;
    private titleElement:HTMLElement;
    private consoleElement:HTMLElement;
    private outputElement:HTMLElement;
    private bot:Bot;
    private botSteps: { [s: string]: BotStep; };

    // Initializing default action plugins
    private actionPlugins: { [s: string]: BotActionPlugin; } = {
        'step': function (runner:BotRunner, option: BotOption, step:BotStep){
                runner.runStep(option.action.values['stepId'])
        },
        'link': function (runner:BotRunner, option: BotOption, step:BotStep) {
            var href:string = option.action.values['href'];
            window.location.href = href;
        },

        'alert': function (runner:BotRunner, option: BotOption, step:BotStep) {
            alert(option.action.values['alert']);
        }
    };

    constructor(bot:Bot, titleElement:HTMLElement, consoleElement:HTMLElement, outputElement:HTMLElement){
        this.bot = bot;
        this.titleElement = titleElement;
        this.consoleElement = consoleElement;
        this.outputElement = outputElement;
        this.shpanText = new ShpanText(consoleElement);
        this.botSteps = {};
        bot.steps.forEach((currStep) =>{
            this.botSteps[currStep.id] = currStep;
        })
    }

    public run(){
        this.titleElement.innerHTML= this.bot.name;
        this.runStep(this.bot.firstStepId);
    }

    public addActionPlugin(actionId:string, actionPlugin:BotActionPlugin){
        this.actionPlugins[actionId] = actionPlugin;
    }

    public print(shpanText:string, callback:ShpanTextCallback = null){
        this.shpanText.printShpanText(shpanText, callback);
    }

    public runStep(stepId:string){
        var botStep:BotStep = this.botSteps[stepId];

        this.outputElement.innerHTML = '';
        this.consoleElement.innerHTML = '';
        this.shpanText.printShpanText(botStep.text, () => {
            this.displayBotStepOptions(botStep);
        });
    }

    private displayBotStepOptions(botStep) {
        var first:boolean = true;
        botStep.options.forEach((currOption) => {
            if (first) {
                first = false;
            } else {
                this.outputElement.appendChild(document.createTextNode(' | '));
            }
            var a:HTMLAnchorElement = document.createElement("a");
            a.textContent = currOption.text;
            a.href = "javascript:undefined";

            var actionPlugin:BotActionPlugin = this.actionPlugins[currOption.action.type];
            if (actionPlugin == null){
                console.error("invalid action plugin " + currOption.action.type);
                a.addEventListener("click", ()=> {
                    alert('Bonk!');
                });
            }else{
                a.addEventListener("click", (ev:MouseEvent)=> {
                    ev.preventDefault();

                    // Allowing something to say before redirecting
                    var textBeforeRedirect:string = currOption.action.values['text'];
                    if (textBeforeRedirect != null){
                        this.shpanText.printShpanText('$[da]' + textBeforeRedirect, ()=>{
                            actionPlugin(this, currOption, botStep);
                        });
                    }else{
                        actionPlugin(this, currOption, botStep);
                    }

                });

            }

            this.outputElement.appendChild(a);

        });
    }
}

