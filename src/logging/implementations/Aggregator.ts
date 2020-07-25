import Display from '../interfaces/Display.js';

interface MapVals {
	args: any,
	date: Date,
	className: string,
	funcName: string
}

class Aggregator {

	registeredDisplays: Array<Display> = [];
	
	unfinishedFunctions: Map<string, MapVals> = new Map();

	registerDisplay(display: Display) {
		this.registeredDisplays.push(display);	
	}

	logProperty(classId: number, className: string, prop: string, value: any): void {
		for (const display in this.registeredDisplays) {
			display.logProperties(className, prop, value);
		}
	}	

	logBeforeFunc(classId: number, className: string, funcName: string, args: any): void {
		// TODO: 	Need to figure out how store function starts so their information is retrievable in the right 
		// 			order. Because multiple class instances could call the same function, or even one class
		// 			instance could call the same function multiple times, im finding it hard to keep track of
		// 			which start will belong to which end.
		this.unfinishedFunctions.set(className, { args, date: new Date(), className, funcName });	
	}

	logAfterFunc(classId: number, className: string, funcName: string, ret: any): void {
	}

}
const instance = new Aggregator();
export default instance;
