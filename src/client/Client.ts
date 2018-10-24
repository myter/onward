import {CAPplication, FarRef} from "spiders.captain";
import {OnwardServer} from "../server/server";
import {Question, QuestionList} from "../data/Questions";
import {SlideShow} from "../data/SlideShow";
import {AVTC, AVTLC, BenchAvailable, BenchConsistent, CTC, CTLC} from "../data/BenchData";
import {Chart} from "chart.js"

const reveal : RevealStatic = (window as any).Reveal;
reveal.configure({controls: false,keyboard : false,touch: false})


export class Client extends CAPplication{
    server          : FarRef<OnwardServer>
    questionList    : QuestionList
    slideShow       : SlideShow
    created         : number
    votes           : Array<string>
    config          : {serverActorAddress : string,serverActorPort : number, votesPerClient : number, questionsPerClient : number,benchSlideH : number,benchSlideV: number}
    tcChart         : Chart
    tlcChart        : Chart
    laserShown      : boolean

    constructor(){
        super()
        this.config     = require("../server/exampleConfig")
        this.votes      = []
        this.created    = 0
        this.server     = (this.libs as any).buffRemote(this.config.serverActorAddress,this.config.serverActorPort);
        this.laserShown = false;
        (this.server.registerClient(this) as any).then(([slideShow,questionList])=>{
            this.slideShow    = slideShow
            this.questionList = questionList
            this.questionList.onCommit(this.showQuestions.bind(this))
            this.questionList.onTentative(this.showQuestions.bind(this))
            $("#submitQuestion").on('click',()=>{
                if(this.created < this.config.questionsPerClient){
                    let text        = $("#questionText").val()
                    let question    = new Question(text)
                    this.votes.push(question.id)
                    this.questionList.newQuestion(question)
                    $("#questionText").val('')
                    this.created++
                }

            })
            this.showQuestions()
        })
        this.renderCharts()
    }

    gotoSlide(slideH,slideV){
        reveal.slide(slideH,slideV)
        $('.slide-number-a').css('font-size','30pt');
        $('.slide-number-b').css('font-size','30pt');
        if(slideH == this.config.benchSlideH && slideV == this.config.benchSlideV){
            $("#benchChartTC").show()
            $("#benchChartTLC").show()
        }
        else{
            $("#benchChartTC").hide()
            $("#benchChartTLC").hide()
        }
    }

    updateSampleSize(newSampleSize : number){
        $("#sampleSize").text("Current Sample Size : " + newSampleSize)
    }

    showQuestions(){
        $("#questions").empty()
        let questions = Array.from(this.questionList.questions.values())
        questions.sort((q1,q2)=>{
            return q1.votes - q2.votes
        })
        questions.reverse()
        questions.forEach((q)=>{
            if((this.votes as any).includes(q.id)){
                $("#questions").append('<li><div class="row"><div class="col s9"><p class="flow-text">'+q.text+'</p></div><div class="col s2"><a class="btn-floating btn-large teal" id="'+q.id+'">'+q.votes+'</a></div></div></li>')
            }
            else{
                $("#questions").append('<li><div class="row"><div class="col s9"><p class="flow-text">'+q.text+'</p></div><div class="col s2"><a class="btn-floating btn-large teal lighten-5" id="'+q.id+'">'+q.votes+'</a></div></div></li>')
            }
            $("#questions").append('<li><div class="divider"></div></li>')
            $('#'+q.id).on('click',()=>{
                this.votes.push(q.id)
                if(this.votes.length > this.config.votesPerClient){
                    let toDecId = this.votes.shift()
                    this.questionList.questions.get(toDecId).decVote()
                }
                q.incVote()
            })
        })
    }

    startBench(benchAvailable : BenchAvailable,benchConsistent : BenchConsistent){
        //Perform Available operations
        let avOpTimes : Map<string,number> = new Map()
        benchAvailable.onCommit(()=>{
            if(avOpTimes.has(benchAvailable.value)){
                let timeToConsistency = Date.now() - avOpTimes.get(benchAvailable.value)
                this.server.newBenchValue(AVTC,timeToConsistency)
            }
        })
        benchAvailable.onTentative(()=>{
            let timeToLocalChange = Date.now() - avOpTimes.get(benchAvailable.value)
            this.server.newBenchValue(AVTLC,timeToLocalChange)
        })
        for(var i = 0;i < 10;i++){
            let newVal = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            })
            avOpTimes.set(newVal,Date.now())
            benchAvailable.change(newVal)
        }
        //Perform Consistent operations
        for(var i = 0;i < 10;i++){
            (benchConsistent.change(Date.now()) as any).then((startTime : number)=>{
                let timeToLocalChange = Date.now() - startTime
                this.server.newBenchValue(CTLC,timeToLocalChange)
            })
        }
    }

    newAverage(type : number,value : number, moe : number){
        switch(type){
            case AVTLC:
                this.tlcChart.data.datasets[0].data[0] = value
                this.tlcChart.update()
                break
            case AVTC:
                this.tcChart.data.datasets[0].data[0] = value
                this.tcChart.update()
                break
            case CTC:
                this.tcChart.data.datasets[0].data[1] = value
                this.tcChart.update()
                break
            case CTLC:
                this.tlcChart.data.datasets[0].data[1] = value
                this.tlcChart.update()
                break
        }
    }

    dotPosition(x,y){
        if(!this.laserShown){
            $("#laserDot").show()
            this.laserShown = true
        }
        console.log("DOT POSITION: " + x + " , " + y)
        $("#laserDot").css({top: y * window.innerHeight, left: x * window.innerWidth})
    }

    hideDot(){
        this.laserShown = false
        $("#laserDot").hide()
    }

    renderCharts(){
        Chart.defaults.global.legend.display = false;
        var ctx = (document.getElementById("benchChartTC") as any).getContext('2d');
        this.tcChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ["Available", "Consistent"],
                datasets: [{
                    data: [0,0],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                    ],
                    borderWidth: 1
                }]

            },
            options: {
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: 'Average Time to Consistency'
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'time (ms)'
                        },
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        });
        ctx = (document.getElementById("benchChartTLC") as any).getContext('2d');
        this.tlcChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ["Available", "Consistent"],
                datasets: [{
                    data: [0,0],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                    ],
                    borderWidth: 1
                }]

            },
            options: {
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: 'Average Time to Local Change'
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'time (ms)'
                        },
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        });
    }
}