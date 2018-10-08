Object.defineProperty(exports, "__esModule", { value: true });
const spiders_captain_1 = require("spiders.captain");
const Questions_1 = require("../data/Questions");
let reveal = window.Reveal;
reveal.configure({ controls: false, keyboard: false });
class PublicClient extends spiders_captain_1.CAPplication {
    constructor() {
        super();
        //TODO => put in config
        this.server = this.libs.buffRemote("134.184.43.156", 8000);
        //this.server = (this.libs as any).buffRemote("127.0.0.1",8000);
        this.server.registerPublicClient(this).then((questionList) => {
            this.questionList = questionList;
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
exports.PublicClient = PublicClient;
new PublicClient();
//# sourceMappingURL=PublicClient.js.map