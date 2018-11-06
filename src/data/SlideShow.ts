import {Consistent, mutating} from "spiders.captain";

export class SlideShow extends Consistent{
    currentSlide  : number
    listeners     : Array<Function>
    checkToken    : (string) => Promise<boolean>
    offlineMode   : boolean

    constructor(checkToken : (string) => Promise<boolean>){
        super()
        this.currentSlide       = 0
        this.listeners          = []
        this.checkToken         = checkToken
        this.offlineMode        = false
    }

    engageOffline(){
        this.offlineMode = true
    }

    disengageOffline(){
        this.offlineMode = false
    }

    incSlide(token){
        if(!this.offlineMode){
            this.checkToken(token).then((ok)=>{
                this.currentSlide += 1
                this.listeners.forEach((f)=>{
                    f()
                })
            })
        }
        else{
            this.currentSlide += 1
            this.listeners.forEach((f)=>{
                f()
            })
        }
    }

    decSlide(token){
        if(!this.offlineMode){
            this.checkToken(token).then((ok)=>{
                this.currentSlide -= 1
                this.listeners.forEach((f)=>{
                    f()
                })
            })
        }
        else{
            this.currentSlide -= 1
            this.listeners.forEach((f)=>{
                f()
            })
        }
    }

    onChange(listener : Function){
        if(!this.listeners){
            this.listeners = []
        }
        this.listeners.push(listener)
    }
}