Object.defineProperty(exports, "__esModule", { value: true });
const spiders_captain_1 = require("spiders.captain");
class SlideShow extends spiders_captain_1.Consistent {
    constructor(checkToken, maxslide, minslide) {
        super();
        this.currentSlide = 0;
        this.listeners = [];
        this.checkToken = checkToken;
        this.offlineMode = false;
        this.maxSlide = maxslide;
        this.minSlide = minslide;
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
                if (this.currentSlide < this.maxSlide) {
                    this.currentSlide += 1;
                    this.listeners.forEach((f) => {
                        f();
                    });
                }
            });
        }
        else {
            if (this.currentSlide < this.maxSlide) {
                this.currentSlide += 1;
                this.listeners.forEach((f) => {
                    f();
                });
            }
        }
    }
    decSlide(token) {
        if (!this.offlineMode) {
            this.checkToken(token).then((ok) => {
                if (this.currentSlide > this.minSlide) {
                    this.currentSlide -= 1;
                    this.listeners.forEach((f) => {
                        f();
                    });
                }
            });
        }
        else {
            if (this.currentSlide > this.minSlide) {
                this.currentSlide -= 1;
                this.listeners.forEach((f) => {
                    f();
                });
            }
        }
    }
    onChange(listener) {
        if (!this.listeners) {
            this.listeners = [];
        }
        this.listeners.push(listener);
    }
    emptyListeners() {
        this.listeners = [];
    }
}
exports.SlideShow = SlideShow;
//# sourceMappingURL=SlideShow.js.map