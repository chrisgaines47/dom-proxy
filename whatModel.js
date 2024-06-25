let whatModel = new Proxy({_models: {}, _makeModel: function(inputData){
    let dirty = false;
    var validatorMap = new Map();
    var subscribers = new Map();

    return new Proxy(inputData, {
        get: function(target, prop, receiver) {
            if(prop === 'dirty') return () => dirty = structuredClone(target);
            if(prop === 'clean') return () => dirty = false;
            if(prop === '_dirty') return dirty;
            if(prop === 'setValidator') return (propName, fn) => fn ? validatorMap.set(propName, fn) : validatorMap.delete(propName);
            if(prop === 'subscribe') return (subscriber, fnArg) => subscribers.set(subscriber, fnArg);
            if(prop === 'validate') {
                if(!dirty) return true;
                return (makePromise=false, validator) => {
                    let failedFields = {};
                    for(let [prop, validator] of validatorMap.entries()) {  let result = validator(dirty[prop]); if(result !== true) failedFields[prop] = result; }
                    if(validator) { let result = validator(dirty); if(result !== true) failedFields[prop] = result; }


                    function dirtySet() {
                        for(let key in dirty) target[key] = dirty[key];
                        dirty = false;
                        return true;
                    }

                    if(makePromise) {
                        return new Promise(function(resolve, reject){
                            if(!!Object.keys(failedFields).length)
                                reject(failedFields);
                            else
                                dirtySet() && resolve(true);
                        });
                    } else {
                        if(!!Object.keys(failedFields).length) return failedFields;
                        return dirtySet();
                    }
                }
            }

            const result = Reflect.get(target, prop, receiver);
            return (typeof result == 'object') ? whatModel._makeModel(result) : result;
        },
        set: function(model, key, value) {
            if(!!dirty) {
                dirty[key] = value;
                return true;
            }

            const result = Reflect.set(model,key,value);
            for(let [subscriber, fn] of subscribers.entries()) {
                fn({model, key, value});
            }
            return (typeof result == 'object') ? whatModel._makeModel(result) : result;
        }
    })
}}, {
    get: function(whatProxy, modelName){
        if(modelName === '_makeModel') return whatProxy._makeModel;
        if(!(modelName in whatProxy._models)) return false; 
        return whatProxy._models[modelName];
    },
    set: function(whatProxy, modelName, modelData) {
        whatProxy._models[modelName] = whatProxy._makeModel(modelData);
    }
});

whatModel.a = {ok: 'go'};
whatModel.a.dirty();
whatModel.a.setValidator('ok', ok => typeof ok === 'number');
whatModel.a.ok = 'hey';