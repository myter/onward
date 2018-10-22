Object.defineProperty(exports, "__esModule", { value: true });
const Client_1 = require("./Client");
const SlideShow_1 = require("../data/SlideShow");
class MasterClient extends Client_1.Client {
    constructor() {
        super();
        let disconnectButton = $("#disconnectButton");
        let benchButton = $("#benchButton");
        disconnectButton.on('click', () => {
            this.server.goOffline(this.token).then((slideShow) => {
                this.slideShow = slideShow;
                this.slideShow.onChange(() => {
                    this.gotoSlide(this.slideShow.currentSlideH, this.slideShow.currentSlideV);
                });
            });
        });
        benchButton.on('click', () => {
            this.server.benchPressed();
        });
        disconnectButton.show();
        benchButton.show();
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
function installDesktopListener() {
}
//This script might be called multiple times by browser, ensure that only a single client actor is created
if (!(window.clientInit)) {
    window.clientInit = true;
    let client = new MasterClient();
    //Ideally this would be an html page on its own
    client.login();
    //Install listeners for desktop master
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
    //Install listeners for mobile master (swipe detection from https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android)
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);
    var xDown = null;
    var yDown = null;
    function getTouches(evt) {
        return evt.touches || // browser API
            evt.originalEvent.touches; // jQuery
    }
    function handleTouchStart(evt) {
        xDown = getTouches(evt)[0].clientX;
        yDown = getTouches(evt)[0].clientY;
    }
    ;
    function handleTouchMove(evt) {
        if (!xDown || !yDown) {
            return;
        }
        var xUp = evt.touches[0].clientX;
        var yUp = evt.touches[0].clientY;
        var xDiff = xDown - xUp;
        var yDiff = yDown - yUp;
        if (Math.abs(xDiff) > Math.abs(yDiff)) { /*most significant*/
            if (xDiff > 0) {
                /* left swipe */
                client.changeSlide(SlideShow_1.SlideShow.DIRECTION_RIGHT);
            }
            else {
                /* right swipe */
                client.changeSlide(SlideShow_1.SlideShow.DIRECTION_LEFT);
            }
        }
        else {
            if (yDiff > 0) {
                /* up swipe */
                client.changeSlide(SlideShow_1.SlideShow.DIRECTION_DOWN);
            }
            else {
                /* down swipe */
                client.changeSlide(SlideShow_1.SlideShow.DIRECTION_UP);
            }
        }
        /* reset values */
        xDown = null;
        yDown = null;
    }
    ;
}
//# sourceMappingURL=PrivateClient.js.map