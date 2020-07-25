import Aggregator from "./Aggregator.js";

const proxyHandler = {
	set(obj: { properties: Array<string>, id: number }, prop: string, value: any) {
		if (prop === 'test') {
			throw new Error('Trying to overwrite class name: this property is necessary for logging');
		}

		if (obj.properties.includes(prop)) {
			Aggregator.logProperty(obj.id, obj.constructor.name, prop, value);
		}
		
		obj[prop] = value;
	}
};

let count = 0;


export default class Logger {
   
	functions: Array<string>;
	properties: Array<string>;
	id: number = null;

    setupLogging() {
        if (this.hasOwnProperty('properties')) {
        	Object.assign(this, proxyHandler);
		}
        if (this.hasOwnProperty('functions')) {
			for (let funcName in this.functions) {
				const func = this[funcName];

				const functionHandler = (...args: any) => {
					const funcMapkey = Aggregator.logBeforeFunc(args);
					const ret = func(args);
					Aggregator.logAfterFunc(this.id, this.constructor.name, funcName, funcMapkey, ret);

					return ret;
				}

				Object.assign(this, { [funcName]: functionHandler });
			}
        }
		count += 1;
		this.id = count;
    }
}
