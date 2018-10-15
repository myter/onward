import {Consistent} from "spiders.captain";

export class SlideShow extends Consistent{
    static DIRECTION_UP     = "up"
    static DIRECTION_DOWN   = "down"
    static DIRECTION_LEFT   = "left"
    static DIRECTION_RIGHT  = "right"
    currentSlideH : number
    currentSlideV : number
    listeners     : Array<Function>
    checkToken    : (string) => Promise<boolean>

    constructor(checkToken : (string) => Promise<boolean>){
        super()
        this.currentSlideH      = 0
        this.currentSlideV      = 0
        this.listeners          = []
        this.checkToken         = checkToken
    }

    slideChange(indexH,indexV){
        this.currentSlideH = indexH
        this.currentSlideV = indexV
        this.listeners.forEach((f)=>{
            f()
        })
    }

    go(direction : string,token){
        this.checkToken(token).then((ok)=>{
            if(ok){
                switch(direction){
                    case SlideShow.DIRECTION_UP:
                        this.goUp()
                        break
                    case SlideShow.DIRECTION_DOWN:
                        this.goDown()
                        break
                    case SlideShow.DIRECTION_RIGHT:
                        this.goRight()
                        break
                    case SlideShow.DIRECTION_LEFT:
                        this.goLeft()
                        break
                    default :
                        throw new Error("Unknown Slide direction change: " + direction)
                }
            }
        })
    }

    private goUp() {
        if(this.currentSlideV > 0){
            this.currentSlideV -= 1
            this.listeners.forEach((f)=>{
                f()
            })
        }
    }

    private goDown(){
        this.currentSlideV = this.currentSlideV + 1
        this.listeners.forEach((f)=>{
            f()
        })
    }

    private goLeft(){
        if(this.currentSlideH > 0){
            this.currentSlideV = 0
            this.currentSlideH -= 1
            this.listeners.forEach((f)=>{
                f()
            })
        }
    }

    private goRight(){
        this.currentSlideV = 0
        this.currentSlideH += 1
        this.listeners.forEach((f)=>{
            f()
        })
    }

    onChange(listener : Function){
        if(!this.listeners){
            this.listeners = []
        }
        this.listeners.push(listener)
    }
}