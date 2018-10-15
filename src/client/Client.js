Object.defineProperty(exports, "__esModule", { value: true });
const spiders_captain_1 = require("spiders.captain");
const Questions_1 = require("../data/Questions");
const reveal = window.Reveal;
reveal.configure({ controls: false, keyboard: false });
class Client extends spiders_captain_1.CAPplication {
    constructor() {
        super();
        let config = require("../server/exampleConfig");
        this.server = this.libs.buffRemote(config.serverActorAddress, config.serverActorPort);
        this.server.registerClient(this).then(([slideShow, questionList]) => {
            this.slideShow = slideShow;
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
exports.Client = Client;
//# sourceMappingURL=Client.js.map