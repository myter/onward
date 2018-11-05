Object.defineProperty(exports, "__esModule", { value: true });
const spiders_captain_1 = require("spiders.captain");
class SlideShow extends spiders_captain_1.Consistent {
    constructor(checkToken) {
        super();
        this.currentSlide = 0;
        this.listeners = [];
        this.checkToken = checkToken;
        this.offlineMode = false;
    }
    engageOffline() {
        this.offlineMode = true;
    }
    disengageOffline() {
        this.offlineMode = false;
    }
    incSlide(token) {
        if (!this.offlineMode) {
            this.checkToken(token).then((ok) => {
                this.currentSlide += 1;
                this.listeners.forEach((f) => {
                    f();
                });
            });
        }
        else {
            this.currentSlide += 1;
            this.listeners.forEach((f) => {
                f();
            });
        }
    }
    decSlide(token) {
        if (!this.offlineMode) {
            this.checkToken(token).then((ok) => {
                this.currentSlide -= 1;
                this.listeners.forEach((f) => {
                    f();
                });
            });
        }
        else {
            this.currentSlide -= 1;
            this.listeners.forEach((f) => {
                f();
            });
        }
    }
    onChange(listener) {
        if (!this.listeners) {
            this.listeners = [];
        }
        this.listeners.push(listener);
    }
}
exports.SlideShow = SlideShow;
//# sourceMappingURL=SlideShow.js.map