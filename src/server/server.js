Object.defineProperty(exports, "__esModule", { value: true });
const spiders_captain_1 = require("spiders.captain");
const fs = require("fs");
const SlideShow_1 = require("../data/SlideShow");
const Questions_1 = require("../data/Questions");
const jsonwebtoken_1 = require("jsonwebtoken");
function injectHTML(bundlePath, sourceHTMLPath, targetHTMLPath) {
    var jsdom = require("jsdom").JSDOM;
    var htmlSource = fs.readFileSync(sourceHTMLPath, "utf8");
    var window = new jsdom(htmlSource).window;
    var $ = require('jquery')(window);
    $('body').append('<div id="modal1" class="modal">\n' +
        '    <div class="modal-content">\n' +
        '      <h4>Type Your Question</h4>\n' +
        '      <div class="input-field col s12">\n' +
        '          <textarea id="questionText" class="materialize-textarea" autofocus></textarea>\n' +
        '          <label for="questionText">question</label>\n' +
        '      </div>\n' +
        '    </div>\n' +
        '    <div class="modal-footer">\n' +
        '      <button class="btn red" onclick="$(\'.modal\').modal()">Cancel</button>\n' +
        '      <button class="btn teal" onclick="$(\'.modal\').modal()" id="submitQuestion">Submit</button>\n' +
        '    </div>\n' +
        '  </div> \n' +
        '  <ul  id="slide-out" class="sidenav">\n' +
        '    <li><button style="margin-left: 30%;margin-top:2em" data-target="modal1" class="btn modal-trigger" onclick="$(\'.modal\').modal();">Add Question</button></li> \n' +
        '    <li><ul style="margin-left: 1em" id="questions"></ul></li> \n' +
        '  </ul>\n' +
        ' <button data-target="slide-out" class="sidenav-trigger"  style="position:absolute;right:0;top:0" onclick="$(\'.sidenav\').sidenav();"><i class="material-icons">menu</i></button> \n' + '' +
        ' <button id="disconnectButton" style="position:absolute;right:2em;top:0" ><i class="material-icons">offline_bolt</i></button> \n');
    $('head').prepend('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0-beta/css/materialize.min.css">');
    $('head').prepend('<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">');
    $('body').append('<script src=' + bundlePath + ' />\n');
    $('body').append('<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>\n');
    $('head').append('\n' +
        '\n' +
        '<link rel="apple-touch-icon" sizes="180x180" href="public/apple-touch-icon.png">\n' +
        '<link rel="icon" type="image/png" sizes="32x32" href="public/favicon-32x32.png">\n' +
        '<link rel="icon" type="image/png" sizes="16x16" href="public/favicon-16x16.png">\n' +
        '<link rel="manifest" href="public/site.webmanifest">\n' +
        '<meta name="msapplication-TileColor" content="#da532c">\n' +
        '<meta name="theme-color" content="#ffffff">\n' +
        '\n');
    fs.writeFile(targetHTMLPath, window.document.documentElement.outerHTML, function (error) {
        if (error)
            throw error;
    });
}
class OnwardServer extends spiders_captain_1.CAPplication {
    constructor() {
        const config = require('./exampleConfig.json');
        super(config.serverActorAddress, config.serverActorPort);
        this.clients = [];
        this.slideShow = new SlideShow_1.SlideShow((token) => {
            return new Promise((resolve, reject) => {
                jsonwebtoken_1.verify(token, this.config.tokenKey, (err) => {
                    resolve(!err);
                });
            });
        });
        this.config = config;
        this.slideShow.onChange(() => {
            this.slideChange();
        });
        this.questionList = new Questions_1.QuestionList();
        this.libs.serveApp("../client/private.html", "../client/PrivateClient.js", "privateBundle.js", 9999, '/public', '../public');
        console.log("Server listening on 9999 for private connection");
        this.libs.serveApp("../client/public.html", "../client/PublicClient.js", "publicBundle.js", 8888, '/public', '../public');
        console.log("Server listening on 8888 for public connection");
    }
    registerClient(clientRef) {
        this.clients.push(clientRef);
        this.changeSlideForClient(clientRef);
        return [this.slideShow, this.questionList];
    }
    loginMaster(login, password) {
        let expectedLogin = this.config.masterLogin;
        let expectedPassword = this.config.masterPassword;
        let tokenKey = this.config.tokenKey;
        if (expectedLogin == login && expectedPassword == password) {
            console.log("Master logged in ");
            return jsonwebtoken_1.sign({}, tokenKey);
        }
        else {
            throw new Error("Invalid username/password");
        }
    }
    slideChange() {
        this.clients.forEach(this.changeSlideForClient.bind(this));
    }
    changeSlideForClient(client) {
        this.slideShow.currentSlideH.then((h) => {
            this.slideShow.currentSlideV.then((v) => {
                client.gotoSlide(h, v);
            });
        });
    }
    goOffline(token) {
        return new Promise((resolve) => {
            jsonwebtoken_1.verify(token, this.config.tokenKey, (err) => {
                if (!err) {
                    delete this.slideShow.listeners;
                    resolve(this.libs.thaw(this.slideShow));
                }
            });
        });
    }
}
exports.OnwardServer = OnwardServer;
injectHTML("./privateBundle.js", "../client/slides-onward-18-test.html", "../client/private.html");
injectHTML("./publicBundle.js", "../client/slides-onward-18-test.html", "../client/public.html");
new OnwardServer();
//# sourceMappingURL=server.js.map