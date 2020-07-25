import Display, { LogTypes } from '../interfaces/Display.js';

class Aggregator {

	registeredDisplays: Array<Display> = [];
	
	unfinishedFunctions: Map<Date, any> = new Map();

	registerDisplay(display: Display) {
		this.registeredDisplays.push(display);	
	}

	logProperty(classId: number, className: string, prop: string, value: any): void {
		this.registeredDisplays.forEach((display: Display) => {
			const profile = display.loggingProfile.find(({ classType }) => classType === className);
			
			if (profile && profile.logTypes.includes(LogTypes.functions)) {
				display.logProperties(classId, className, prop, value);
			}
		});
	}	

	logBeforeFunc(args: any): Date {
		// TODO: 	Need to figure out how store function starts so their information is retrievable in the right 
		// 			order. Because multiple class instances could call the same function, or even one class
		// 			instance could call the same function multiple times, im finding it hard to keep track of
		// 			which start will belong to which end.
		const date = new Date();
		
		this.unfinishedFunctions.set(date, args);

		return date; 
	}

	logAfterFunc(classId: number, className: string, funcName: string, start: Date, ret: any): void {
		const end: Date = new Date();
		const args: any = this.unfinishedFunctions.get(start);
		
		this.unfinishedFunctions.delete(start);

		this.registeredDisplays.forEach((display: Display) => {
			const profile = display.loggingProfile.find(({ classType }) => classType === className);
			
			if (profile  && profile.logTypes.includes(LogTypes.functions)) {
				display.logFunctions(classId, className, funcName, start, end, args, ret);
			}
		});
	}

}
const instance = new Aggregator();
export default instance;
