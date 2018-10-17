var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const spiders_captain_1 = require("spiders.captain");
exports.AVTC = 0;
exports.AVTLC = 1;
exports.CTC = 2;
exports.CTLC = 3;
class BenchAvailable extends spiders_captain_1.Eventual {
    constructor() {
        super();
    }
    change(aValue) {
        this.value = aValue;
    }
}
__decorate([
    spiders_captain_1.mutating
], BenchAvailable.prototype, "change", null);
exports.BenchAvailable = BenchAvailable;
class BenchConsistent extends spiders_captain_1.Consistent {
    constructor(listener) {
        super();
        this.listener = listener;
    }
    change(newVal) {
        this.value = newVal;
        this.listener(newVal);
        return newVal;
    }
}
exports.BenchConsistent = BenchConsistent;
//# sourceMappingURL=BenchData.js.map