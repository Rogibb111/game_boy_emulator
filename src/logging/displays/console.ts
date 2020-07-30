import Display, { LogTypes }  from '../interfaces/Display.js';

const registers = {
	'a': 0,
	'b': 0,
	'c': 0,
	'd': 0,
	'e': 0,
	'f': 0,
	'h': 0,
	'pc': 0,
	'sp': 0,
	'm': 0,
	't': 0,
	'ime': 0
};

const registerNames: Array<string> = Object.keys(registers);

function log(className: string, logString: string): void {
	console.log(`[${className}]: 	${logString}`);		
}

function printRegisters() {
	console.log('<------REGISTERS------>');
	for (let key in registerNames) {
		console.log(`${key}: ${registers[key]}`);
	}
}

export default class Console implements Display {
	loggingProfile = [
		{
			classType: 'Z80',
			logTypes: [
				LogTypes.properties,
				LogTypes.functions
			]
		}
	];	

	logProperties(classId: number, className: string, name: string, value: any) {
		if (className === 'Z80' && registerNames.includes(name)) {
			registers[name] = value;
		}
	}

	logFunctions(classId: number, className: string, name: string, start: Date, end: Date, args: any, ret: any) {
		log(className, `!!!!!!!!!!  Ran ${name} function!!!!!!!!!`);
		
		if (name === 'executeInstructionAction') {
			const instructionMetaData = args[0];
			log(className, `InstructionMetaData: ${JSON.stringify(instructionMetaData)}`);
		} else if (name === 'executeCurrentInstruction') {
			printRegisters();	
		}
	}
}
