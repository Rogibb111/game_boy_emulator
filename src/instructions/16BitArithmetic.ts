import { InstructionMetaData } from "./InstructionMetaData.js";
import Address from "../models/data_types/Address.js";

export const INC_NW = {
    m: 2,
    t: 8,
    action: ({ _r, opcode1 }) => {
        const [upper, lower] = this.map[opcode1.getVal() >> 4];
        const address: Address = new Address(_r[upper], _r[lower]);
        const newAddress: Address = address.ADD(1);

        _r[upper] = newAddress.getFirstByte();
        _r[lower] = newAddress.getLastByte();
    },
    map: ['bc', 'de', 'hl'],
    bytes: 1
} as InstructionMetaData;
