import {Consistent, mutating} from "spiders.captain";

export class SlideShow extends Consistent{
    currentSlide  : number
    listeners     : Array<Function>
    checkToken    : (string) => Promise<boolean>
    offlineMode   : boolean
    maxSlide      : number
    minSlide      : number

    constructor(checkToken : (string) => Promise<boolean>,maxslide : number,minslide : number){
        super()
        this.currentSlide       = 0
        this.listeners          = []
        this.checkToken         = checkToken
        this.offlineMode        = false
        this.maxSlide           = maxslide
        this.minSlide           = minslide
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
                if(this.currentSlide < this.maxSlide){
                    this.currentSlide += 1
                    this.listeners.forEach((f)=>{
                        f()
                    })
                }

            })
        }
        else{
            if(this.currentSlide < this.maxSlide){
                this.currentSlide += 1
                this.listeners.forEach((f)=>{
                    f()
                })
            }
        }
    }

    decSlide(token){
        if(!this.offlineMode){
            this.checkToken(token).then((ok)=>{
                if(this.currentSlide > this.minSlide){
                    this.currentSlide -= 1
                    this.listeners.forEach((f)=>{
                        f()
                    })
                }
            })
        }
        else{
            if(this.currentSlide > this.minSlide){
                this.currentSlide -= 1
                this.listeners.forEach((f)=>{
                    f()
                })
            }
        }
    }

    onChange(listener : Function){
        if(!this.listeners){
            this.listeners = []
        }
        this.listeners.push(listener)
    }

    emptyListeners(){
        this.listeners = []
    }
}