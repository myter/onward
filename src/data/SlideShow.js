Object.defineProperty(exports, "__esModule", { value: true });
const spiders_captain_1 = require("spiders.captain");
class SlideShow extends spiders_captain_1.Consistent {
    constructor(checkToken) {
        super();
        this.currentSlideH = 0;
        this.currentSlideV = 0;
        this.listeners = [];
        this.checkToken = checkToken;
    }
    go(direction, token) {
        this.checkToken(token).then((ok) => {
            if (ok) {
                switch (direction) {
                    case SlideShow.DIRECTION_UP:
                        this.goUp();
                        break;
                    case SlideShow.DIRECTION_DOWN:
                        this.goDown();
                        break;
                    case SlideShow.DIRECTION_RIGHT:
                        this.goRight();
                        break;
                    case SlideShow.DIRECTION_LEFT:
                        this.goLeft();
                        break;
                    default:
                        throw new Error("Unknown Slide direction change: " + direction);
                }
            }
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
        this.currentSlideV += 1;
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
        if (!this.listeners) {
            this.listeners = [];
        }
        this.listeners.push(listener);
    }
}
SlideShow.DIRECTION_UP = "up";
SlideShow.DIRECTION_DOWN = "down";
SlideShow.DIRECTION_LEFT = "left";
SlideShow.DIRECTION_RIGHT = "right";
exports.SlideShow = SlideShow;
//# sourceMappingURL=SlideShow.js.map