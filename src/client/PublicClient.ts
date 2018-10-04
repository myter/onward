import {OnwardServer} from "../server/server";
import {CAPplication, FarRef} from "spiders.captain";
import {QuestionList,Question} from "../data/Questions";

let reveal : RevealStatic = (window as any).Reveal;
reveal.configure({controls: false,keyboard : false})

export class PublicClient extends CAPplication{
    server          : FarRef<OnwardServer>
    questionList    : QuestionList

    constructor(){
        super()
        //TODO => put in config
        this.server = (this.libs as any).buffRemote("127.0.0.1",8000);
        (this.server.registerPublicClient(this) as any).then((questionList : QuestionList)=>{
            this.questionList = questionList
            this.questionList.onCommit(this.showQuestions.bind(this))
            this.questionList.onTentative(this.showQuestions.bind(this))
            $("#submitQuestion").on('click',()=>{
                let text        = $("#questionText").val()
                let question    = new Question(text)
                this.questionList.newQuestion(question)
            })
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

let client = new PublicClient()