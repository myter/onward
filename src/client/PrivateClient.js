Object.defineProperty(exports, "__esModule", { value: true });
const spiders_captain_1 = require("spiders.captain");
const Questions_1 = require("../data/Questions");
let reveal = window.Reveal;
reveal.configure({ controls: false, keyboard: false });
class PrivateClient extends spiders_captain_1.CAPplication {
    constructor() {
        super();
        //TODO => put in config
        this.server = this.libs.buffRemote("134.184.43.156", 8000);
        //this.server = (this.libs as any).buffRemote("127.0.0.1",8000);
        this.server.registerPrivateClient(this, "TODO").then((ret) => {
            let [slideShow, questionList] = ret;
            this.slideShow = slideShow;
            this.questionList = questionList;
            /*Reveal.addEventListener( 'slidechanged', function( event ) {
                slideShow.slideChange(event.indexh,event.indexv)
            })*/
            this.questionList.onCommit(this.showQuestions.bind(this));
            this.questionList.onTentative(this.showQuestions.bind(this));
            $("#submitQuestion").on('click', () => {
                let text = $("#questionText").val();
                let question = new Questions_1.Question(text);
                this.questionList.newQuestion(question);
                $("#questionText").val('');
            });
            $("#disconnectButton").on('click', () => {
                console.log("Requesting from server");
                this.server.goOffline().then((slideShow) => {
                    console.log("Got back available version of slideshow");
                    this.slideShow = slideShow;
                    this.slideShow.onChange(() => {
                        console.log("CAPTURED LOCAL CHANGE YO !!!");
                        this.gotoSlide(this.slideShow.currentSlideH, this.slideShow.currentSlideV);
                    });
                });
            });
            this.showQuestions();
        });
    }
    gotoSlide(slideH, slideV) {
        let reveal = window.Reveal;
        reveal.slide(slideH, slideV);
    }
    showQuestions() {
        $("#questions").empty();
        let questions = Array.from(this.questionList.questions.values());
        questions.sort((q1, q2) => {
            return q1.votes - q2.votes;
        });
        questions.forEach((q) => {
            $("#questions").append('<li><p class="flow-text">' + q.text + '</p></li>');
            $("#questions").append('<li><div class="divider"></div></li>');
        });
    }
}
exports.PrivateClient = PrivateClient;
;
//TODO for some reason this private client code can be called twice by browser somtimes ?
if (!(window.clientInit)) {
    window.clientInit = true;
    let client = new PrivateClient();
    $(document).keydown(function (e) {
        switch (e.which) {
            case 37: // left
                client.slideShow.goLeft();
                break;
            case 38: // up
                client.slideShow.goUp();
                break;
            case 39: // right
                client.slideShow.goRight();
                break;
            case 40: // down
                client.slideShow.goDown();
                break;
            default: return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
}
//# sourceMappingURL=PrivateClient.js.map