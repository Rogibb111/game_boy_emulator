import Registers from '../models/Registers.js';
import { InstructionMetaData } from './InstructionMetaData.js';

// Disable IME
export const DI = {
    m: 1,
    t: 4,
    ime: 0
} as InstructionMetaData;

// Enable IME
export const EI = {
    m: 1,
    t: 4,
    ime: 0
} as InstructionMetaData;

// No-opertation (NOP)
export const NOP = {
    m: 1,
    t: 4
};
