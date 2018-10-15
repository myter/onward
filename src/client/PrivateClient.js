Object.defineProperty(exports, "__esModule", { value: true });
const Client_1 = require("./Client");
const SlideShow_1 = require("../data/SlideShow");
class MasterClient extends Client_1.Client {
    constructor() {
        super();
        $("#disconnectButton").on('click', () => {
            this.server.goOffline(this.token).then((slideShow) => {
                this.slideShow = slideShow;
                this.slideShow.onChange(() => {
                    this.gotoSlide(this.slideShow.currentSlideH, this.slideShow.currentSlideV);
                });
            });
        });
    }
    promptForCred() {
        const login = window.prompt("Login");
        const password = window.prompt("Password");
        return [login, password];
    }
    login() {
        const [login, password] = this.promptForCred();
        this.server.loginMaster(login, password).then((token) => {
            this.token = token;
        }).catch(() => {
            window.alert("Wrong login or password");
            this.login();
        });
    }
    changeSlide(direction) {
        this.slideShow.go(direction, this.token);
    }
}
exports.MasterClient = MasterClient;
//This script might be called multiple times by browser, ensure that only a single client actor is created
if (!(window.clientInit)) {
    window.clientInit = true;
    let client = new MasterClient();
    //Ideally this would be an html page on its own
    client.login();
    $(document).keydown(function (e) {
        switch (e.which) {
            case 37: //left
                client.changeSlide(SlideShow_1.SlideShow.DIRECTION_LEFT);
                break;
            case 38: //up
                client.changeSlide(SlideShow_1.SlideShow.DIRECTION_UP);
                break;
            case 39: //right
                client.changeSlide(SlideShow_1.SlideShow.DIRECTION_RIGHT);
                break;
            case 40: //down
                client.changeSlide(SlideShow_1.SlideShow.DIRECTION_DOWN);
                break;
            default:
                return;
        }
        e.preventDefault();
    });
}
//# sourceMappingURL=PrivateClient.js.map