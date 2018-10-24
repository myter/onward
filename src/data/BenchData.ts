import {Eventual, Consistent, mutating} from "spiders.captain"

export var AVTC     = 0
export var AVTLC    = 1
export var CTC      = 2
export var CTLC     = 3

export class BenchAvailable extends Eventual{
    value : string

    constructor(){
        super()
    }

    @mutating
    change(aValue){
        this.value = aValue
    }

}

export class BenchConsistent extends Consistent{
    value : number
    listener : (number) => any

    constructor(listener : (number) => any){
        super()
        this.listener = listener
    }

    change(newVal){
        this.value = newVal
        this.listener(newVal)
        return newVal
    }
}