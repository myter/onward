Object.defineProperty(exports, "__esModule", { value: true });
const spiders_captain_1 = require("spiders.captain");
const Questions_1 = require("../data/Questions");
const reveal = window.Reveal;
reveal.configure({ controls: false, keyboard: false });
class Client extends spiders_captain_1.CAPplication {
    constructor() {
        super();
        this.config = require("../server/exampleConfig");
        this.votes = [];
        this.created = 0;
        this.server = this.libs.buffRemote(this.config.serverActorAddress, this.config.serverActorPort);
        this.server.registerClient(this).then(([slideShow, questionList]) => {
            this.slideShow = slideShow;
            this.questionList = questionList;
            this.questionList.onCommit(this.showQuestions.bind(this));
            this.questionList.onTentative(this.showQuestions.bind(this));
            $("#submitQuestion").on('click', () => {
                if (this.created < this.config.questionsPerClient) {
                    let text = $("#questionText").val();
                    let question = new Questions_1.Question(text);
                    this.votes.push(question.id);
                    this.questionList.newQuestion(question);
                    $("#questionText").val('');
                    this.created++;
                }
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
        questions.reverse();
        questions.forEach((q) => {
            if (this.votes.includes(q.id)) {
                $("#questions").append('<li><div class="row"><div class="col s9"><p class="flow-text">' + q.text + '</p></div><div class="col s2"><a class="btn-floating btn-large teal" id="' + q.id + '">' + q.votes + '</a></div></div></li>');
            }
            else {
                $("#questions").append('<li><div class="row"><div class="col s9"><p class="flow-text">' + q.text + '</p></div><div class="col s2"><a class="btn-floating btn-large teal lighten-5" id="' + q.id + '">' + q.votes + '</a></div></div></li>');
            }
            $("#questions").append('<li><div class="divider"></div></li>');
            $('#' + q.id).on('click', () => {
                this.votes.push(q.id);
                if (this.votes.length > this.config.votesPerClient) {
                    let toDecId = this.votes.shift();
                    this.questionList.questions.get(toDecId).decVote();
                }
                q.incVote();
            });
        });
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map