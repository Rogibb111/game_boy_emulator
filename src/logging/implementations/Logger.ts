import Aggregator from "./Aggregator.js";

let count = 0;


export default class Logger {
   
	functions: Array<string>;
	properties: Array<string>;
	id: number = null;

    setupLogging() {
        if (this.hasOwnProperty('properties')) {
			for (let propName of this.properties) {
				if (this.hasOwnProperty(propName)) {
					const privatePropName = `_${propName}`;
					
					this[privatePropName] = this[propName];
					
					Object.defineProperty(this, propName, {
						get: function() {
							Aggregator.logProperty(this.id, this.constructor.name, propName, this[privatePropName]);
							return this[privatePropName];
						},

						set: function(val) {
							Aggregator.logProperty(this.id, this.constructor.name, propName, val);
							this[privatePropName] = val;
						}
					});

				} else {
					throw new Error(`Trying to log property [${propName}] that does not exist on ${this.constructor.name}`); 
				}
			}
		}
        if (this.hasOwnProperty('functions')) {
			for (let funcName of this.functions) {
				const func = this[funcName];

				const functionHandler = (...args: any) => {
					const funcMapkey = Aggregator.logBeforeFunc(args);
					const ret = func.apply(this, args);
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
