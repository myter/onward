var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const spiders_captain_1 = require("spiders.captain");
class Question extends spiders_captain_1.Eventual {
    constructor(text) {
        super();
        this.text = text;
        this.votes = 1;
        this.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    incVote() {
        this.votes += 1;
    }
    decVote() {
        this.votes -= 1;
    }
}
__decorate([
    spiders_captain_1.mutating
], Question.prototype, "incVote", null);
__decorate([
    spiders_captain_1.mutating
], Question.prototype, "decVote", null);
exports.Question = Question;
class QuestionList extends spiders_captain_1.Eventual {
    constructor() {
        super();
        this.questions = new Map();
    }
    newQuestion(question) {
        this.questions.set(question.id, question);
    }
}
__decorate([
    spiders_captain_1.mutating
], QuestionList.prototype, "newQuestion", null);
exports.QuestionList = QuestionList;
//# sourceMappingURL=Questions.js.map