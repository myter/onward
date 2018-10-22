import {Client} from "./Client";
import {SlideShow} from "../data/SlideShow";

export class MasterClient extends Client{
    token

    constructor(){
        super()
        let disconnectButton    = $("#disconnectButton")
        let benchButton         = $("#benchButton")
        disconnectButton.on('click',()=>{
            this.server.goOffline(this.token).then((slideShow : SlideShow)=>{
                this.slideShow = slideShow
                this.slideShow.onChange(()=>{
                    this.gotoSlide(this.slideShow.currentSlideH,this.slideShow.currentSlideV)
                })
            })
        })
        benchButton.on('click',()=>{
            this.server.benchPressed()
        })
        disconnectButton.show()
        benchButton.show()
    }

    promptForCred(){
        const login = window.prompt("Login")
        const password = window.prompt("Password")
        return [login,password]
    }

    login(){
        const [login,password] = this.promptForCred()
        this.server.loginMaster(login,password).then((token)=>{
            this.token = token
        }).catch(()=>{
            window.alert("Wrong login or password")
            this.login()
        })
    }

    changeSlide(direction : string){
        this.slideShow.go(direction,this.token)
    }
}

function installDesktopListener(){

}

//This script might be called multiple times by browser, ensure that only a single client actor is created
if(!((window as any).clientInit)){
    (window as any).clientInit = true
    let client = new MasterClient();
    //Ideally this would be an html page on its own
    client.login()

    //Install listeners for desktop master
    $(document).keydown(function(e) {
        switch(e.which) {
            case 37: //left
                client.changeSlide(SlideShow.DIRECTION_LEFT)
                break

            case 38: //up
                client.changeSlide(SlideShow.DIRECTION_UP)
                break

            case 39: //right
                client.changeSlide(SlideShow.DIRECTION_RIGHT)
                break

            case 40: //down
                client.changeSlide(SlideShow.DIRECTION_DOWN)
                break

            default:
                return
        }
        e.preventDefault();
    });

    //Install listeners for mobile master (swipe detection from https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android)
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);

    var xDown = null;
    var yDown = null;

    function getTouches(evt) {
        return evt.touches ||             // browser API
            evt.originalEvent.touches; // jQuery
    }

    function handleTouchStart(evt) {
        xDown = getTouches(evt)[0].clientX;
        yDown = getTouches(evt)[0].clientY;
    };

    function handleTouchMove(evt) {
        if ( ! xDown || ! yDown ) {
            return;
        }

        var xUp = evt.touches[0].clientX;
        var yUp = evt.touches[0].clientY;

        var xDiff = xDown - xUp;
        var yDiff = yDown - yUp;

        if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
            if ( xDiff > 0 ) {
                /* left swipe */
                client.changeSlide(SlideShow.DIRECTION_RIGHT)
            } else {
                /* right swipe */
                client.changeSlide(SlideShow.DIRECTION_LEFT)
            }
        } else {
            if ( yDiff > 0 ) {
                /* up swipe */
                client.changeSlide(SlideShow.DIRECTION_DOWN)
            } else {
                /* down swipe */
                client.changeSlide(SlideShow.DIRECTION_UP)
            }
        }
        /* reset values */
        xDown = null;
        yDown = null;
    };
}


