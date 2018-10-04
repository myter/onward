import {Eventual, mutating} from "spiders.captain";

export class Question extends Eventual{
    text    : string
    votes   : number
    id      : string

    constructor(text){
        super()
        this.text   = text
        this.votes  = 1
        this.id     = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        })
    }

    @mutating
    incVote(){
        this.votes += 1
    }
}

export class QuestionList extends Eventual{
    questions : Map<string,Question>

    constructor(){
        super()
        this.questions = new Map()
    }

    @mutating
    newQuestion(question : Question){
        this.questions.set(question.id,question)
    }
}