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
    var htmlSource = fs.readFileSync(sourceHTMLPath, "utf8");
    var window = new jsdom(htmlSource).window
    var $ = require('jquery')(window)
    $('.slide-number-a').css('font-size','40pt');
    $('.slide-number-b').css('font-size','40pt');
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
        ' <a data-target="slide-out" class="sidenav-trigger"  style="position:absolute;right:0;top:0" onclick="$(\'.sidenav\').sidenav();"><i class="material-icons" style="font-size: 2vw">menu</i></a> \n'+'' +
        ' <a id="disconnectButton" style="position:absolute;right:2vw;top:0;display: none" ><i class="material-icons" style="font-size: 2vw">offline_bolt</i></a> \n'+
        ' <a id="benchButton" style="position:absolute;right:4vw;top:0;display: none" ><i class="material-icons" style="font-size: 2vw">timer</i></a> \n'+
        '<container style="position:absolute;right:20vw;top:40vh;width:30vw;height:40vh"><canvas id="benchChartTC" style="display:none"></canvas></container>\n' +
        '<span id="laserDot" style="position:absolute;display: none;height: 25px;\n' +
        '    width: 25px;\n' +
        '    background-color: #008080;\n' +
        '    border-radius: 50%;\n' +
        '    display: inline-block;"></span>\n'+
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
    config              : {serverActorAddress : string, serverActorPort : number, masterLogin : string,masterPassword : string,tokenKey : string}
    avTCVals            : Array<number>
    avTLCVals           : Array<number>
    cTCVals             : Array<number>
    cTLCVals            : Array<number>

    constructor(){
        const config            = require('./exampleConfig.json')
        super(config.serverActorAddress,config.serverActorPort)
        this.clients            = []
        this.slideShow          = new SlideShow((token)=>{
            return new Promise((resolve,reject)=>{
                verify(token,this.config.tokenKey,(err)=>{
                    resolve(!err)
                })
            }) as Promise<boolean>
        });
        this.config             = config
        this.benching           = false
        this.slideShow.onChange(()=>{
            this.slideChange()
        });
        this.questionList       = new QuestionList();
        this.avTCVals           = []
        this.avTLCVals          = []
        this.cTCVals            = []
        this.cTLCVals           = [];
        (this.libs as any).serveApp("../client/private.html","../client/PrivateClient.js","privateBundle.js",9999,'/public','../public')
        console.log("Server listening on 9999 for private connection");
        (this.libs as any).serveApp("../client/public.html","../client/PublicClient.js","publicBundle.js",8888,'/public','../public')
        console.log("Server listening on 8888 for public connection");
    }

    registerClient(clientRef : FarRef<Client>){
        //TODO check if benchmarking
        this.clients.push(clientRef)
        this.changeSlideForClient(clientRef)
        this.sampleSizeChange()
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
        this.clients.forEach(this.changeSlideForClient.bind(this))
    }

    changeSlideForClient(client : FarRef<Client>){
        (this.slideShow.currentSlideH as any).then((h)=>{
            (this.slideShow.currentSlideV as any).then((v)=>{
                client.gotoSlide(h,v)
            })
        })
    }

    goOffline(token){
        return new Promise((resolve)=>{
            verify(token,this.config.tokenKey,(err)=>{
                if(!err){
                    delete this.slideShow.listeners
                    resolve(this.libs.thaw(this.slideShow as any))
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


    //TODO lock in sample size?
    benchPressed(){
        if(this.benching){

        }
        else{
            this.benchAvailable     = new BenchAvailable()
            this.benchConsistent    = new BenchConsistent((changeStart : number)=>{
                let tc = Date.now() - changeStart
                this.newBenchValue(CTC,tc)
            })
            this.clients.forEach((client : FarRef<Client>)=>{
                client.startBench(this.benchAvailable,this.benchConsistent)
            })
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

injectHTML("./privateBundle.js","../client/slides-onward-18-test.html","../client/private.html")
injectHTML("./publicBundle.js","../client/slides-onward-18-test.html","../client/public.html")
new OnwardServer()




