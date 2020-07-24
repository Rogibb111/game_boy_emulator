import Aggregator from "./Aggregator.js";

const proxyHandler = {
	set(obj: { properties: Array<string> }, prop: string, value: any) {
		if (prop === 'test') {
			throw new Error('Trying to overwrite class name: this property is necessary for logging');
		}

		if (obj.properties.includes(prop)) {
			Aggregator.logProperty(obj.constructor.name, prop, value);
		}
		
		obj[prop] = value;
	}
};


export default class Logger {
   
	functions: Array<string>;
	properties: Array<string>;

    setupLogging() {
        if (this.hasOwnProperty('properties')) {
        	Object.assign(this, proxyHandler);
		}
        if (this.hasOwnProperty('functions')) {
			for (let funcName in this.functions) {
				const func = this[funcName];

				const functionHandler = (...args: any) => {
					Aggregator.logBeforeFunc(this.constructor.name, funcName, args);
					const ret = func(args);
					Aggregator.logAfterFunc(this.constructor.name, funcName, ret);

					return ret;
				}

				Object.assign(this, { [funcName]: functionHandler });
			}
        }
    }
}
