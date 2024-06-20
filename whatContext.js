const whatContext = new Proxy({_contexts: {}, byPath: (o,s) => s.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.').forEach(path => o = o[path]) ?? o}, {
    get: function(whatProxy, contextName){
        whatProxy._contexts[contextName] ??= new Proxy({name: contextName, actions: new Map(), data: {},
            expose: (fnKey, fn, data={}) => context.actions.set(fnKey,{fn, data}) || (() => {context.actions.delete(fnKey)}),
            utilize: (fnKey, fnExclude) => context.actions.get(fnKey) ?? [...context.actions.keys()].filter(actionKey => actionKey.includes(fnKey) && !(actionKey.includes(fnExclude))).map(actionKey => context.actions.get(actionKey)),
        },{
            get: (invokerContext, prop) => {
                if(prop in invokerContext) return invokerContext[prop];
                let {fn, data} = invokerContext.actions.get(prop);
                return fn ? new Proxy(fn, { apply: (l, m, args) => (typeof args[0] === 'function') ? args[0].apply({}, [fn, data]) : fn.apply({}, [...args, data])}) : Reflect.get(...arguments);
            }
        });
        let context = whatProxy._contexts[contextName];
        return context;
    }
});

window.whatContext = whatContext;