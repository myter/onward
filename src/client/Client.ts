import {CAPplication, FarRef} from "spiders.captain";
import {OnwardServer} from "../server/server";
import {Question, QuestionList} from "../data/Questions";
import {SlideShow} from "../data/SlideShow";
import {AVTC, AVTLC, BenchAvailable, BenchConsistent, CTC, CTLC} from "../data/BenchData";
import {Chart} from "chart.js"

const reveal : RevealStatic = (window as any).Reveal;
reveal.configure({controls: false,keyboard : false,touch: false})
$(document).attr("title", "CAPtain in Action");

export class Client extends CAPplication{
    server          : FarRef<OnwardServer>
    questionList    : QuestionList
    slideShow       : SlideShow
    created         : number
    votes           : Array<string>
    config          : {serverActorAddress : string,serverActorPort : number, votesPerClient : number, questionsPerClient : number,benchSlideH : number,appSlideH : number,lastSlideH : number}
    tcChart         : Chart
    tlcChart        : Chart
    laserShown      : boolean
    thawed          : boolean

    constructor(){
        super()
        this.config     = require("../server/examplePublicConfig")
        this.votes      = []
        this.created    = 0
        this.server     = (this.libs as any).buffRemote(this.config.serverActorAddress,this.config.serverActorPort);
        this.laserShown = false;
        this.thawed     = false;
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

    installEndButton(){
        $("#disconnectButton").show()
        $("#disconnectButton").on('click',()=>{
            if(!this.thawed){
                this.server.audianceOffline().then((slides : SlideShow)=>{
                    this.thawed = true
                    slides.engageOffline()
                    slides.onChange(()=>{
                        reveal.slide(slides.currentSlide,0)
                    })
                    var check = false;
                    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||(window as any).opera);
                    if(check){
                        //Install listeners for mobile master (swipe detection from https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android)
                        document.addEventListener('touchstart', handleTouchStart, false);
                        document.addEventListener('touchmove', handleTouchMove, false);
                        var xDown = null;
                        var yDown = null;
                        var positionsAccum = 0
                        function getTouches(evt) {
                            return evt.touches ||             // browser API
                                evt.originalEvent.touches; // jQuery
                        }
                        function handleTouchStart(evt) {
                            xDown = getTouches(evt)[0].clientX;
                            yDown = getTouches(evt)[0].clientY;
                        };

                        function handleTouchMove(evt) {
                            evt.preventDefault()
                            if ( ! xDown || ! yDown ) {
                                return;
                            }
                            var xUp = evt.touches[0].clientX;
                            var yUp = evt.touches[0].clientY;
                            var xDiff = xDown - xUp;
                            var yDiff = yDown - yUp;
                            if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
                                if ( xDiff > 0 ) {
                                    /* left swipe */
                                    slides.decSlide(false)
                                } else {
                                    /* right swipe */
                                    slides.incSlide(false)
                                }
                            }
                            /* reset values */
                            xDown = null;
                            yDown = null;
                        }

                    }
                    else{
                        $(document).keydown(function(e) {
                            switch(e.which) {
                                case 37: //left
                                    slides.decSlide(false)
                                    break
                                case 39: //right
                                    slides.incSlide(false)
                                    break
                                default:
                                    return
                            }
                            e.preventDefault();
                        });
                    }
                })
            }
        })
    }

    installQuestionButton(){
        $("#questionsButton").show()
    }

    gotoSlide(slideH,slideV){
        if(!this.thawed){
            reveal.slide(slideH,slideV)
        }
        $('.slide-number-a').css('font-size','30pt');
        $('.slide-number-b').css('font-size','30pt');
        //Benchmark charts
        if(slideH == this.config.benchSlideH){
            $("#benchChartTC").show()
            $("#benchChartTLC").show()
        }
        else{
            $("#benchChartTC").hide()
            $("#benchChartTLC").hide()
        }
        //Questions button
        if(slideH >= this.config.appSlideH){
            this.installQuestionButton()
        }
        //Thaw button
        if(slideH == this.config.lastSlideH){
            this.installEndButton()
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
                let el = $('<li/>')
                let row = $('<div class="row"/>')
                let col = $('<div class="col s9"/>')
                let p   = $('<p class="flow-text"/>')
                el.append(row)
                row.append(col)
                col.append(p)
                p.text(q.text)
                row.append('<div class="col s2"><a class="btn-floating btn-large teal" id="'+q.id+'">'+q.votes+'</a></div>')
                $('#questions').append(el)
            }
            else{
                let el = $('<li/>')
                let row = $('<div class="row"/>')
                let col = $('<div class="col s9"/>')
                let p   = $('<p class="flow-text"/>')
                el.append(row)
                row.append(col)
                col.append(p)
                p.text(q.text)
                row.append('<div class="col s2"><a class="btn-floating btn-large teal lighten-5" id="'+q.id+'">'+q.votes+'</a></div>')
                $('#questions').append(el)
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
            this.server.changeCommitted(benchAvailable.value)
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
            this.server.availableChange(newVal,Date.now())
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

    slideReset(newSlides){
        this.slideShow = newSlides
    }
}