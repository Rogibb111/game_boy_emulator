class Key {
    _rows = [0x0F, 0x0F];
    _column = 0;

    reset() {
        this._rows = [0x0F, 0x0F];
        this._column = 0;
    }

    rb() {
        switch(this._column) {
            case 0x10:
                return this._rows[0];
            case 0x20:
                return this._rows[1];
            default:
                return 0;
        }
    }

    wb(val: number) {
        this._column = val & 0x30;
    }

    kdown(e: KeyboardEvent) {
        //Reset the appropriate bit
        switch(e.keyCode) {
            case 39:
                this._rows[1] &= 0xE;
                break;
            case 37:
                this._rows[1] &= 0xD;
                break;
            case 38:
                this._rows[1] &= 0xB;
                break;
            case 40:
                this._rows[1] &= 0x7;
                break;
            case 90:
                this._rows[0] &= 0xE;
                break;
            case 88:
                this._rows[0] &= 0xD;
                break;
            case 32:
                this._rows[0] &= 0xB;
                break;
            case 13:
                this._rows[0] &= 0x7;
                break;
        }
    }

    kup(e: KeyboardEvent) {
        //Set the appropriate bit 
        switch(e.keyCode) {
            case 39: 
                this._rows[1] |= 0x1;
                break;
            case 37:
                this._rows[1] |= 0x2;
                break;
            case 38:
                this._rows[1] |= 0x4;
                break;
            case 40:
                this._rows[1] |= 0x8;
                break;
            case 90:
                this._rows[0] |= 0x1;
                break;
            case 88:
                this._rows[0] |= 0x2;
                break;
            case 32: 
                this._rows[0] |= 0x4;
                break;
            case 13:
                this._rows[0] |= 0x8;
                break;
        }
    }
};

const instance: Key = new Key();

window.onkeydown = instance.kdown;
window.onkeyup = instance.kup;
