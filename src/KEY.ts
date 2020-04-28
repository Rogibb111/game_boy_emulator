import Byte from './models/data_sizes/Byte.js';

class KEY {
    _rows: Byte[] = [new Byte(0x0F), new Byte(0x0F)];
    _column: Byte = new Byte(0);

    reset() {
        this._rows = [new Byte(0x0F), new Byte(0x0F)];
        this._column = new Byte(0);
    }

    rb(): Byte {
        switch(this._column.getVal()) {
            case 0x10:
                return this._rows[0];
            case 0x20:
                return this._rows[1];
            default:
                return new Byte(0);
        }
    }

    wb(val: Byte): void {
        this._column = val.AND(0x30);
    }

    kdown(e: KeyboardEvent) {
        //Reset the appropriate bit
        switch(e.keyCode) {
            case 39:
                this._rows[1] = this._rows[1].AND(0xE);
                break;
            case 37:
                this._rows[1] = this._rows[1].AND(0xD);
                break;
            case 38:
                this._rows[1] = this._rows[1].AND(0xB);
                break;
            case 40:
                this._rows[1] = this._rows[1].AND(0x7);
                break;
            case 90:
                this._rows[0] = this._rows[0].AND(0xE);
                break;
            case 88:
                this._rows[0] = this._rows[0].AND(0xD);
                break;
            case 32:
                this._rows[0] = this._rows[0].AND(0xB);
                break;
            case 13:
                this._rows[0] = this._rows[0].AND(0x7);
                break;
        }
    }

    kup(e: KeyboardEvent) {
        //Set the appropriate bit 
        switch(e.keyCode) {
            case 39: 
                this._rows[1] = this._rows[1].OR(0x1);
                break;
            case 37:
                this._rows[1] = this._rows[1].OR(0x2);
                break;
            case 38:
                this._rows[1] = this._rows[1].OR(0x4);
                break;
            case 40:
                this._rows[1] = this._rows[1].OR(0x8);
                break;
            case 90:
                this._rows[0] = this._rows[0].OR(0x1);
                break;
            case 88:
                this._rows[0] = this._rows[0].OR(0x2);
                break;
            case 32: 
                this._rows[0] = this._rows[0].OR(0x4);
                break;
            case 13:
                this._rows[0] = this._rows[0].OR(0x8);
                break;
        }
    }
};

const instance: KEY = new KEY();

window.onkeydown = instance.kdown;
window.onkeyup = instance.kup;

export default instance;
