import {CAPplication, Consistent, Eventual, FarRef, mutating,SpiderActorMirror} from "spiders.captain";
import * as fs from "fs";
import {SlideShow} from "../data/SlideShow";
import {QuestionList} from "../data/Questions";
import {Client} from "../client/Client";
import {sign,verify} from 'jsonwebtoken'
import {AVTC, AVTLC, BenchAvailable, BenchConsistent, CTC, CTLC} from "../data/BenchData";
const Stats = require('fast-stats').Stats

function injectHTML(bundlePath,sourceHTMLPath,targetHTMLPath){
    var jsdom = require("jsdom").JSDOM
    var htmlSource = fs.readFileSync(sourceHTMLPath, "utf8")
    var window = new jsdom(htmlSource).window
    var $ = require('jquery')(window)
    $('.slide-number-a').css('font-size','40pt')
    $('.slide-number-b').css('font-size','40pt')
    $('body').append(
        '<div id="modal1" class="modal">\n' +
        '    <div class="modal-content">\n' +
        '      <h4>Type Your Question</h4>\n' +
        '      <div class="input-field col s12">\n' +
        '          <textarea id="questionText" class="materialize-textarea" autofocus></textarea>\n' +
        '          <label for="questionText">question</label>\n' +
        '      </div>\n'+
        '    </div>\n' +
        '    <div class="modal-footer">\n' +
        '      <button class="btn red" onclick="$(\'.modal\').modal()">Cancel</button>\n'+
        '      <button class="btn teal" onclick="$(\'.modal\').modal()" id="submitQuestion">Submit</button>\n' +
        '    </div>\n' +
        '  </div> \n'+
        '  <ul  id="slide-out" class="sidenav">\n' +
        '    <li><button style="margin-left: 30%;margin-top:2em" data-target="modal1" class="btn modal-trigger" onclick="$(\'.modal\').modal();">Add Question</button></li> \n'+
        '    <li><ul style="margin-left: 1em" id="questions"></ul></li> \n' +
        '  </ul>\n' +
        ' <a id="questionsButton" data-target="slide-out" class="sidenav-trigger"  style="position:absolute;right:0;top:0;display : none" onclick="$(\'.sidenav\').sidenav();"><i class="material-icons" style="font-size: 40px">question_answer</i></a> \n'+'' +
        ' <a id="disconnectButton" style="position:absolute;right:40px;top:0;display: none" ><i class="material-icons" style="font-size: 40px">offline_bolt</i></a> \n'+
        ' <a id="benchButton" style="position:absolute;right:80px;top:0;display: none" ><i class="material-icons" style="font-size: 40px">timer</i></a> \n'+
        '<container style="position:absolute;right:20vw;top:40vh;width:30vw;height:40vh"><canvas id="benchChartTC" style="display:none"></canvas></container>\n' +
        '<span id="laserDot" style="position:absolute;display: none;height: 25px;\n' +
        '    width: 25px;\n' +
        '    background-color: #008080;\n' +
        '    border-radius: 50%;\n' +
        '    z-index: 999;"></span>\n'+
        '<container style="position:absolute;left:20vw;top:40vh;width:30vw;height:40vh"><canvas id="benchChartTLC"  style="display:none"></canvas></container>\n')
    $('head').prepend('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0-beta/css/materialize.min.css">')
    $('head').prepend('<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">')
    $('head').prepend('<style>\n' +
        'body {overscroll-behavior: none;position: relative}\n' +
        'html, body {\n' +
        '  overflow-x: hidden;\n' +
        '}\n' +
        '</style>')
    $('body').append('<script src='+bundlePath+' />\n')
    $('body').append('<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>\n')
    $('head').append('\n' +
        '\n' +
        '<link rel="apple-touch-icon" sizes="180x180" href="public/apple-touch-icon.png">\n' +
        '<link rel="icon" type="image/png" sizes="32x32" href="public/favicon-32x32.png">\n' +
        '<link rel="icon" type="image/png" sizes="16x16" href="public/favicon-16x16.png">\n' +
        '<link rel="manifest" href="public/site.webmanifest">\n' +
        '<meta name="msapplication-TileColor" content="#da532c">\n' +
        '<meta name="theme-color" content="#ffffff">\n' +
        '\n')
    fs.writeFile(targetHTMLPath, window.document.documentElement.outerHTML,
        function (error){
            if (error) throw error;
        });
}

export class OnwardServer extends CAPplication{
    clients             : Array<FarRef<Client>>
    slideShow           : SlideShow
    questionList        : QuestionList
    benchAvailable      : BenchAvailable
    benchConsistent     : BenchConsistent
    benching            : boolean
    config              : {serverActorAddress : string, serverActorPort : number, masterLogin : string,masterPassword : string,tokenKey : string,lastSlideH : number}
    avStartTimes        : Map<string,number>
    commits             : Map<string,number>
    lastCommit          : Map<string,number>
    avTCVals            : Array<number>
    avTLCVals           : Array<number>
    cTCVals             : Array<number>
    cTLCVals            : Array<number>
    endReached          : boolean

    constructor(){
        const config            = require('./examplePrivateConfig.json')
        super(config.serverActorAddress,config.serverActorPort)
        this.clients            = []
        var that                = this
        this.endReached         = false
        this.slideShow          = new SlideShow(function (token){
            return new Promise((resolve,reject)=>{
                verify(token,that.config.tokenKey,(err)=>{
                    resolve(!err)
                })
            }) as Promise<boolean>
        },config.lastSlideH,0);
        this.config             = config
        this.benching           = false
        this.slideShow.onChange(()=>{
            this.slideChange()
        });
        this.questionList       = new QuestionList();
        this.avTCVals           = []
        this.avTLCVals          = []
        this.cTCVals            = []
        this.cTLCVals           = []
        this.avStartTimes       = new Map()
        this.lastCommit         = new Map()
        this.commits            = new Map();
        (this.libs as any).serveApp("../client/private.html","../client/PrivateClient.js","privateBundle.js",9999,'/public','../public')
        console.log("Server listening on 9999 for private connection");
        (this.libs as any).serveApp("../client/public.html","../client/PublicClient.js","publicBundle.js",8888,'/public','../public')
        console.log("Server listening on 8888 for public connection");
    }

    registerClient(clientRef : FarRef<Client>){
        this.clients.push(clientRef)
        this.changeSlideForClient(clientRef)
        this.sampleSizeChange()
        if(this.benching){
            let avtc = new Stats()
            avtc.push(this.avTCVals)
            let avtlc = new Stats()
            avtlc.push(this.avTLCVals)
            let ctc = new Stats()
            ctc.push(this.cTCVals)
            let ctlc = new Stats()
            ctlc.push(this.cTLCVals)
            clientRef.newAverage(AVTC,avtc.median(),avtc.moe())
            clientRef.newAverage(AVTLC,avtlc.median(),avtlc.moe())
            clientRef.newAverage(CTC,ctc.median(),ctc.moe())
            clientRef.newAverage(CTLC,ctlc.median(),ctlc.moe())
        }
        if(this.endReached){
            clientRef.installEndButton()
            clientRef.installQuestionButton()
        }
        return [this.slideShow,this.questionList]
    }

    loginMaster(login : string, password : string){
        let expectedLogin       = this.config.masterLogin
        let expectedPassword    = this.config.masterPassword
        let tokenKey            = this.config.tokenKey
        if(expectedLogin == login && expectedPassword == password){
            console.log("Master logged in ")
            return sign({},tokenKey)
        }
        else{
            throw new Error("Invalid username/password")
        }
    }

    slideChange(){
        (this.slideShow.currentSlide as any).then((currentSlide)=>{
            if(currentSlide == this.config.lastSlideH){
                this.endReached = true
            }
        })
        this.clients.forEach(this.changeSlideForClient.bind(this))
    }

    changeSlideForClient(client : FarRef<Client>){
        (this.slideShow.currentSlide as any).then((current)=>{
            client.gotoSlide(current,0)
        })
    }

    goOffline(token){
        return new Promise((resolve)=>{
            verify(token,this.config.tokenKey,(err)=>{
                if(!err){
                    delete this.slideShow.listeners
                    delete this.slideShow.checkToken
                    resolve(this.libs.thaw(this.slideShow as any))
                }
            })
        })
    }

    audianceOffline(){
        return new Promise((resolve)=>{
            (this.slideShow.listeners as any).then((lists)=>{
                //delete this.slideShow.listeners;
                (this.slideShow.emptyListeners() as any).then(()=>{
                    (this.libs.thaw(this.slideShow as any)).then((availableSlides)=>{
                        this.slideShow.listeners = lists
                        resolve(availableSlides)
                    })
                })
            })
        })
    }


    goOnline(token,availableSlides,currentSlide){
        return new Promise((resolve)=>{
            verify(token,this.config.tokenKey,(err)=>{
                if(!err){
                    let consistentSlides = this.libs.freeze(availableSlides)
                    consistentSlides.currentSlide = currentSlide
                    this.slideShow = consistentSlides
                    var that       = this
                    this.slideShow.checkToken = function (token){
                        return new Promise((resolve,reject)=>{
                            verify(token,that.config.tokenKey,(err)=>{
                                resolve(!err)
                            })
                        }) as Promise<boolean>
                    }
                    this.slideShow.disengageOffline()
                    this.slideShow.onChange(()=>{
                        this.slideChange()
                    });
                    this.clients.forEach((client : FarRef<Client>)=>{
                        client.slideReset(this.slideShow);
                        (this.slideShow.currentSlide as any).then((current)=>{
                            client.gotoSlide(current,0)
                        })
                    })
                }
            })
        })
    }

    sampleSizeChange(){
        this.clients.forEach(((client : FarRef<Client>)=>{
            client.updateSampleSize(this.clients.length)
        }))
    }

    moveDot(x,y){
        this.clients.forEach((client : FarRef<Client>)=>{
            client.dotPosition(x,y)
        })
    }

    removeDot(){
        this.clients.forEach((client : FarRef<Client>)=>{
            client.hideDot()
        })
    }

    temp(msg){
        console.log(msg)
    }

    benchPressed(){
        this.benching           = true
        this.benchAvailable     = new BenchAvailable()
        this.benchConsistent    = new BenchConsistent((changeStart : number)=>{
            let tc = Date.now() - changeStart
            this.newBenchValue(CTC,tc)
        })
        this.clients.forEach((client : FarRef<Client>)=>{
            client.startBench(this.benchAvailable,this.benchConsistent)
        })
    }

    availableChange(forValue : string,startTime : number){
        this.avStartTimes.set(forValue,startTime)
    }

    changeCommitted(forValue : string){
        if(!this.commits.has(forValue)){
            this.commits.set(forValue,0)
        }
        this.commits.set(forValue,this.commits.get(forValue)+1)
        this.lastCommit.set(forValue,Date.now())
        //Initiate approximation countdown (e.g. a client disconnects while benchmarks are running, don't wait forever for client to reconnect)
        if(this.commits.get(forValue) == 1){
            setTimeout(()=>{
                if(this.commits.get(forValue) < this.clients.length){
                    this.newBenchValue(AVTC,this.lastCommit.get(forValue) - this.avStartTimes.get(forValue))
                }
            },6000)
        }
        if(this.commits.get(forValue) == this.clients.length){
            this.newBenchValue(AVTC,Date.now() - this.avStartTimes.get(forValue))
        }
    }

    newBenchValue(type : number,value : number){
        let s  = new Stats()
        switch(type){
            case AVTC:
                this.avTCVals.push(value)
                s.push(this.avTCVals)
                break
            case AVTLC:
                this.avTLCVals.push(value)
                s.push(this.avTLCVals)
                break
            case CTC:
                this.cTCVals.push(value)
                s.push(this.cTCVals)
                break
            case CTLC:
                this.cTLCVals.push(value)
                s.push(this.cTLCVals)
                break
        }
        this.clients.forEach((client : FarRef<Client>)=>{
            client.newAverage(type,s.median(),0)
        })
    }
}
if (fs.existsSync("../client/public.html")) {
    console.log("STARTING SERVER")
    new OnwardServer()
}
else{
    console.log("CREATING HTML & STARTING SERVER")
    injectHTML("./privateBundle.js","../client/slides-onward-18-test.html","../client/private.html")
    injectHTML("./publicBundle.js","../client/slides-onward-18-test.html","../client/public.html")
    new OnwardServer()
}





