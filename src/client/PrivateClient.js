Object.defineProperty(exports, "__esModule", { value: true });
const spiders_captain_1 = require("spiders.captain");
let reveal = window.Reveal;
class PrivateClient extends spiders_captain_1.CAPplication {
    constructor() {
        super();
        //TODO => put in config
        this.server = this.libs.buffRemote("127.0.0.1", 8000);
        this.server.registerPrivateClient(this, "TODO").then((ret) => {
            let [slideShow, questionList] = ret;
            Reveal.addEventListener('slidechanged', function (event) {
                slideShow.slideChange(event.indexh, event.indexv);
            });
        });
    }
    gotoSlide(slideH, slideV) {
        reveal.slide(slideH, slideV);
    }
}
exports.PrivateClient = PrivateClient;
let client = new PrivateClient();
//# sourceMappingURL=PrivateClient.js.map