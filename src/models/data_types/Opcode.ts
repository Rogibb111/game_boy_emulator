import Byte from "../data_sizes/Byte.js";

export default class Opcode extends Byte {

    constructor(val: number | Byte) {
        if(val instanceof Byte) {
            super(val.getVal());
        } else {
            super(val);
        }
    }
}
