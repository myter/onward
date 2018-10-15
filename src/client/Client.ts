import {CAPplication, FarRef} from "spiders.captain";
import {OnwardServer} from "../server/server";
import {Question, QuestionList} from "../data/Questions";
import {SlideShow} from "../data/SlideShow";

const reveal : RevealStatic = (window as any).Reveal;
reveal.configure({controls: false,keyboard : false})

export class Client extends CAPplication{
    server          : FarRef<OnwardServer>
    questionList    : QuestionList
    slideShow       : SlideShow

    constructor(){
        super()
        let config : {serverActorAddress : string,serverActorPort : number} = require("../server/exampleConfig")
        this.server = (this.libs as any).buffRemote(config.serverActorAddress,config.serverActorPort);
        (this.server.registerClient(this) as any).then(([slideShow,questionList])=>{
            this.slideShow    = slideShow
            this.questionList = questionList
            this.questionList.onCommit(this.showQuestions.bind(this))
            this.questionList.onTentative(this.showQuestions.bind(this))
            $("#submitQuestion").on('click',()=>{
                let text        = $("#questionText").val()
                let question    = new Question(text)
                this.questionList.newQuestion(question)
                $("#questionText").val('')
            })
            this.showQuestions()
        })
    }

    gotoSlide(slideH,slideV){
        reveal.slide(slideH,slideV)
    }

    showQuestions(){
        $("#questions").empty()
        let questions = Array.from(this.questionList.questions.values())
        questions.sort((q1,q2)=>{
            return q1.votes - q2.votes
        })
        questions.forEach((q)=>{
            $("#questions").append('<li><p class="flow-text">'+q.text+'</p></li>')
            $("#questions").append('<li><div class="divider"></div></li>')
        })
    }
}