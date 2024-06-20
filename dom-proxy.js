const dom = new Proxy({registry: new Map()}, {
    get: (obj, key) => (props = {}, children = [], events = {}) => {
        let isInsert = child => ["string","boolean","number"].includes(typeof child);
		let addChild = child => isInsert(child) ? el.insertAdjacentHTML("beforeend", child) : el.appendChild(child);
        if(key === 'register') return obj.registry.set(props.name, props); if(key in Object.getOwnPropertyDescriptors(obj)) return obj[key];
        var el = document.createElement(key);
        if ((props instanceof Array) || (props instanceof Element) || isInsert(props)) events = children, children = props;
        else Object.keys(props).filter(attr => !['disabled', 'checkbox'].includes(attr)).forEach(attr => el.setAttribute(attr, props[attr]));
        if(obj.registry.has(key)) return el.appendChild(obj.registry.get(key)(children, events)).parentElement;
        Array.isArray(children) ? children.forEach(addChild) : insertOrAppend(addChild);
        for(let eventName in events) el.addEventListener(eventName, (e) => events[eventName](e, el));
        return el;
    }
});