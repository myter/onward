import {Consistent} from "spiders.captain";

export class SlideShow extends Consistent{
    currentSlideH : number
    currentSlideV : number
    listeners    : Array<Function>

    constructor(){
        super()
        this.currentSlideH      = 0
        this.currentSlideV      = 0
        this.listeners          = []
    }

    //TODO will need to be more complex than just nextslide
    slideChange(indexH,indexV){
        this.currentSlideH = indexH
        this.currentSlideV = indexV
        this.listeners.forEach((f)=>{
            f()
        })
    }

    onChange(listener : Function){
        this.listeners.push(listener)
    }
}