Object.defineProperty(exports, "__esModule", { value: true });
const spiders_captain_1 = require("spiders.captain");
const fs = require("fs");
const SlideShow_1 = require("../data/SlideShow");
const Questions_1 = require("../data/Questions");
function injectHTML(bundlePath, sourceHTMLPath, targetHTMLPath) {
    var jsdom = require("jsdom").JSDOM;
    var htmlSource = fs.readFileSync(sourceHTMLPath, "utf8");
    var window = new jsdom(htmlSource).window;
    var $ = require('jquery')(window);
    $('body').append('<div id="modal1" class="modal">\n' +
        '    <div class="modal-content">\n' +
        '      <h4>Type Your Question</h4>\n' +
        '      <div class="input-field col s12">\n' +
        '          <textarea id="questionText" class="materialize-textarea"></textarea>\n' +
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
        ' <button data-target="slide-out" class="sidenav-trigger"  style="position:absolute;right:0;top:0" onclick="$(\'.sidenav\').sidenav();"><i class="material-icons">menu</i></button> \n');
    $('head').prepend('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0-beta/css/materialize.min.css">');
    $('head').prepend('<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">');
    $('body').append('<script src=' + bundlePath + '></script>');
    $('body').append('<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>');
    fs.writeFile(targetHTMLPath, window.document.documentElement.outerHTML, function (error) {
        if (error)
            throw error;
    });
}
//TODO massive overlap between private and public client, probably some smarter way to deal with it then the way it is now
class OnwardServer extends spiders_captain_1.CAPplication {
    constructor() {
        super();
        this.publicClients = [];
        this.privateClients = [];
        this.slideShow = new SlideShow_1.SlideShow();
        this.slideShow.onChange(() => {
            this.slideChange();
        });
        this.questionList = new Questions_1.QuestionList();
        this.libs.serveApp("../client/public.html", "../client/PublicClient.js", "publicBundle.js", 8888);
        console.log("Server listening on 8888 for public connection");
        this.libs.serveApp("../client/private.html", "../client/PrivateClient.js", "privateBundle.js", 9999);
        console.log("Server listening on 9999 for private connection");
    }
    //TODO check browser fingerprint to ensure no spamming ?
    registerPublicClient(clientRef) {
        console.log("Public client registered");
        this.publicClients.push(clientRef);
        return this.questionList;
    }
    //TODO check credentials
    registerPrivateClient(clientRef, credential) {
        console.log("Private client registered");
        this.privateClients.push(clientRef);
        return [this.slideShow, this.questionList];
    }
    slideChange() {
        this.publicClients.forEach((client) => {
            this.slideShow.currentSlideH.then((h) => {
                this.slideShow.currentSlideV.then((v) => {
                    client.gotoSlide(h, v);
                });
            });
        });
    }
}
exports.OnwardServer = OnwardServer;
injectHTML("./publicBundle.js", "../client/slides-onward-18-test.html", "../client/public.html");
injectHTML("./privateBundle.js", "../client/slides-onward-18-test.html", "../client/private.html");
let server = new OnwardServer();
//# sourceMappingURL=server.js.map