import {CAPplication, FarRef} from "spiders.captain";
import {OnwardServer} from "../server/server";
import {SlideShow} from "../data/SlideShow";
import {Question, QuestionList} from "../data/Questions";

let reveal : RevealStatic = (window as any).Reveal;
reveal.configure({controls: false,keyboard : false})

export class PrivateClient extends CAPplication{
    server      : FarRef<OnwardServer>
    slideShow   : FarRef<SlideShow>
    questionList : QuestionList

    constructor(){
        super()
        //TODO => put in config
        this.server = (this.libs as any).buffRemote("134.184.43.156",8000);
        //this.server = (this.libs as any).buffRemote("127.0.0.1",8000);
        (this.server.registerPrivateClient(this,"TODO") as any).then((ret)=>{
            let [slideShow ,questionList] = ret
            this.slideShow  = slideShow
            this.questionList = questionList
            /*Reveal.addEventListener( 'slidechanged', function( event ) {
                slideShow.slideChange(event.indexh,event.indexv)
            })*/
            this.questionList.onCommit(this.showQuestions.bind(this))
            this.questionList.onTentative(this.showQuestions.bind(this))
            $("#submitQuestion").on('click',()=>{
                let text        = $("#questionText").val()
                let question    = new Question(text)
                this.questionList.newQuestion(question)
                $("#questionText").val('')
            })
            $("#disconnectButton").on('click',()=>{
                console.log("Requesting from server")
                this.server.goOffline().then((slideShow : SlideShow)=>{
                    console.log("Got back available version of slideshow")
                    this.slideShow = slideShow
                    this.slideShow.onChange(()=>{
                        console.log("CAPTURED LOCAL CHANGE YO !!!")
                        this.gotoSlide(this.slideShow.currentSlideH,this.slideShow.currentSlideV)
                    })
                })
            })
            this.showQuestions()
        })
    }

    gotoSlide(slideH,slideV){
        let reveal : RevealStatic = (window as any).Reveal;
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
};

//TODO for some reason this private client code can be called twice by browser somtimes ?
if(!((window as any).clientInit)){
    (window as any).clientInit = true
    let client = new PrivateClient();
    $(document).keydown(function(e) {
        switch(e.which) {
            case 37: // left
                client.slideShow.goLeft()
                break;

            case 38: // up
                client.slideShow.goUp()
                break;

            case 39: // right
                client.slideShow.goRight()
                break;

            case 40: // down
                client.slideShow.goDown()
                break;

            default: return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
}


