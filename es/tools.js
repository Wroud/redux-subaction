export function deepExtend(destination, source) {
    if (Array.isArray(destination)) {
        destination.length = 0;
        destination.push.apply(destination, source);
        return;
    }
    for (const property in source) {
        if (typeof source[property] === "object"
            && source[property] !== null
            && !Array.isArray(source[property])) {
            destination[property] = Object.assign({}, destination[property]) || {};
            this.deepExtend(destination[property], source[property]);
        }
        else if (source[property] !== "__delete__") {
            destination[property] = source[property];
        }
        else {
            delete destination[property];
        }
    }
}
