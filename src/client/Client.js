Object.defineProperty(exports, "__esModule", { value: true });
const spiders_captain_1 = require("spiders.captain");
const Questions_1 = require("../data/Questions");
const BenchData_1 = require("../data/BenchData");
const chart_js_1 = require("chart.js");
const reveal = window.Reveal;
reveal.configure({ controls: false, keyboard: false, touch: false });
$(document).attr("title", "CAPtain in Action");
class Client extends spiders_captain_1.CAPplication {
    constructor() {
        super();
        this.config = require("../server/exampleConfig");
        this.votes = [];
        this.created = 0;
        this.server = this.libs.buffRemote(this.config.serverActorAddress, this.config.serverActorPort);
        this.laserShown = false;
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
        this.renderCharts();
    }
    gotoSlide(slideH, slideV) {
        reveal.slide(slideH, slideV);
        $('.slide-number-a').css('font-size', '30pt');
        $('.slide-number-b').css('font-size', '30pt');
        //Benchmark charts
        if (slideH == this.config.benchSlideH) {
            $("#benchChartTC").show();
            $("#benchChartTLC").show();
        }
        else {
            $("#benchChartTC").hide();
            $("#benchChartTLC").hide();
        }
        //Questions button
        if (slideH >= this.config.appSlideH) {
            $("#questionsButton").show();
        }
        //Thaw button
        if (slideH == this.config.lastSlideH && slideV) {
            $("#disconnectButton").show();
            //TODO client thawing mechanism
        }
    }
    updateSampleSize(newSampleSize) {
        $("#sampleSize").text("Current Sample Size : " + newSampleSize);
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
                let el = $('<li/>');
                let row = $('<div class="row"/>');
                let col = $('<div class="col s9"/>');
                let p = $('<p class="flow-text"/>');
                el.append(row);
                row.append(col);
                col.append(p);
                p.text(q.text);
                row.append('<div class="col s2"><a class="btn-floating btn-large teal" id="' + q.id + '">' + q.votes + '</a></div>');
                $('#questions').append(el);
            }
            else {
                let el = $('<li/>');
                let row = $('<div class="row"/>');
                let col = $('<div class="col s9"/>');
                let p = $('<p class="flow-text"/>');
                el.append(row);
                row.append(col);
                col.append(p);
                p.text(q.text);
                row.append('<div class="col s2"><a class="btn-floating btn-large teal lighten-5" id="' + q.id + '">' + q.votes + '</a></div>');
                $('#questions').append(el);
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
    startBench(benchAvailable, benchConsistent) {
        //Perform Available operations
        let avOpTimes = new Map();
        benchAvailable.onCommit(() => {
            this.server.changeCommitted(benchAvailable.value);
        });
        benchAvailable.onTentative(() => {
            let timeToLocalChange = Date.now() - avOpTimes.get(benchAvailable.value);
            this.server.newBenchValue(BenchData_1.AVTLC, timeToLocalChange);
        });
        for (var i = 0; i < 10; i++) {
            let newVal = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            avOpTimes.set(newVal, Date.now());
            benchAvailable.change(newVal);
            this.server.availableChange(newVal, Date.now());
        }
        //Perform Consistent operations
        for (var i = 0; i < 10; i++) {
            benchConsistent.change(Date.now()).then((startTime) => {
                let timeToLocalChange = Date.now() - startTime;
                this.server.newBenchValue(BenchData_1.CTLC, timeToLocalChange);
            });
        }
    }
    newAverage(type, value, moe) {
        switch (type) {
            case BenchData_1.AVTLC:
                this.tlcChart.data.datasets[0].data[0] = value;
                this.tlcChart.update();
                break;
            case BenchData_1.AVTC:
                this.tcChart.data.datasets[0].data[0] = value;
                this.tcChart.update();
                break;
            case BenchData_1.CTC:
                this.tcChart.data.datasets[0].data[1] = value;
                this.tcChart.update();
                break;
            case BenchData_1.CTLC:
                this.tlcChart.data.datasets[0].data[1] = value;
                this.tlcChart.update();
                break;
        }
    }
    dotPosition(x, y) {
        if (!this.laserShown) {
            $("#laserDot").show();
            this.laserShown = true;
        }
        console.log("DOT POSITION: " + x + " , " + y);
        $("#laserDot").css({ top: y * window.innerHeight, left: x * window.innerWidth });
    }
    hideDot() {
        this.laserShown = false;
        $("#laserDot").hide();
    }
    renderCharts() {
        chart_js_1.Chart.defaults.global.legend.display = false;
        var ctx = document.getElementById("benchChartTC").getContext('2d');
        this.tcChart = new chart_js_1.Chart(ctx, {
            type: 'bar',
            data: {
                labels: ["Available", "Consistent"],
                datasets: [{
                        data: [0, 0],
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
                                beginAtZero: true
                            }
                        }]
                }
            }
        });
        ctx = document.getElementById("benchChartTLC").getContext('2d');
        this.tlcChart = new chart_js_1.Chart(ctx, {
            type: 'bar',
            data: {
                labels: ["Available", "Consistent"],
                datasets: [{
                        data: [0, 0],
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
                                beginAtZero: true
                            }
                        }]
                }
            }
        });
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map