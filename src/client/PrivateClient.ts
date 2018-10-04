import {CAPplication, FarRef} from "spiders.captain";
import {OnwardServer} from "../server/server";
import {SlideShow} from "../data/SlideShow";

let reveal : RevealStatic = (window as any).Reveal;

export class PrivateClient extends CAPplication{
    server      : FarRef<OnwardServer>
    slideShow   : FarRef<SlideShow>

    constructor(){
        super()
        //TODO => put in config
        this.server = (this.libs as any).buffRemote("127.0.0.1",8000);
        (this.server.registerPrivateClient(this,"TODO") as any).then((ret)=>{
            let [slideShow ,questionList] = ret
            Reveal.addEventListener( 'slidechanged', function( event ) {
                slideShow.slideChange(event.indexh,event.indexv)
            })
        })
    }

    gotoSlide(slideH,slideV){
        reveal.slide(slideH,slideV)
    }
}

let client = new PrivateClient()

