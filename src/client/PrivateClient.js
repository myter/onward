Object.defineProperty(exports, "__esModule", { value: true });
const spiders_captain_1 = require("spiders.captain");
const Questions_1 = require("../data/Questions");
class PrivateClient extends spiders_captain_1.CAPplication {
    constructor() {
        super();
        //TODO => put in config
        this.server = this.libs.buffRemote("saliva.soft.vub.ac.be", 8000);
        this.server.registerPrivateClient(this, "TODO").then((ret) => {
            let [slideShow, questionList] = ret;
            this.questionList = questionList;
            Reveal.addEventListener('slidechanged', function (event) {
                slideShow.slideChange(event.indexh, event.indexv);
            });
            this.questionList.onCommit(this.showQuestions.bind(this));
            this.questionList.onTentative(this.showQuestions.bind(this));
            $("#submitQuestion").on('click', () => {
                let text = $("#questionText").val();
                let question = new Questions_1.Question(text);
                this.questionList.newQuestion(question);
                $("#questionText").val('');
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
    new PrivateClient();
}
//# sourceMappingURL=PrivateClient.js.map