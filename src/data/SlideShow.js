Object.defineProperty(exports, "__esModule", { value: true });
const spiders_captain_1 = require("spiders.captain");
class SlideShow extends spiders_captain_1.Consistent {
    constructor() {
        super();
        this.currentSlideH = 0;
        this.currentSlideV = 0;
        this.listeners = [];
    }
    //TODO will need to be more complex than just nextslide
    slideChange(indexH, indexV) {
        this.currentSlideH = indexH;
        this.currentSlideV = indexV;
        this.listeners.forEach((f) => {
            f();
        });
    }
    goUp() {
        if (this.currentSlideV > 0) {
            this.currentSlideV -= 1;
            this.listeners.forEach((f) => {
                f();
            });
        }
    }
    goDown() {
        this.currentSlideV = this.currentSlideV + 1;
        this.listeners.forEach((f) => {
            f();
        });
    }
    goLeft() {
        if (this.currentSlideH > 0) {
            this.currentSlideV = 0;
            this.currentSlideH -= 1;
            this.listeners.forEach((f) => {
                f();
            });
        }
    }
    goRight() {
        this.currentSlideV = 0;
        this.currentSlideH += 1;
        this.listeners.forEach((f) => {
            f();
        });
    }
    onChange(listener) {
        this.listeners.push(listener);
    }
}
exports.SlideShow = SlideShow;
//# sourceMappingURL=SlideShow.js.map