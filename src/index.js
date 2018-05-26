var stores = {};
var locks = {};
var storeIdCount = 1;
var idCount = 1; // General numeric id used for any ids other than the store id
export var Store = /** @class */ (function () {
    function Store(obj) {
        this.storeId = storeIdCount;
        stores[this.storeId] = cloner(obj);
        locks[this.storeId] = false;
        storeIdCount++;
    }
    Store.prototype.get = function (key, options) { return get(key, options, stores[this.storeId]); };
    Store.prototype.set = function (key, val) {
        if (locks[this.storeId].locked) {
            console.log('This Store is locked. Unlock to perform set operations');
        }
        else {
            stores[this.storeId] = iu(stores[this.storeId], key, val);
        }
    };
    Store.prototype.push = function (key, val) {
        if (locks[this.storeId].locked) {
            console.log('This Store is locked. Unlock to perform push operations');
        }
        else {
            var valArray = isArray(val) ? val : [val];
            var rows = valArray.reduce(function (ac, cv) {
                ac.push({ id: idCount, value: cv });
                idCount++;
                return ac;
            }, get(key, undefined, stores[this.storeId]) || []);
            stores[this.storeId] = iu(stores[this.storeId], key, rows);
        }
    };
    Store.prototype.unshift = function (key, val) {
        if (locks[this.storeId].locked) {
            console.log('This Store is locked. Unlock to perform unshift operations');
        }
        else {
            var valArray = isArray(val) ? val : [val];
            var rows = valArray.reduce(function (ac, cv) {
                ac.unshift({ id: idCount, value: cv });
                idCount++;
                return ac;
            }, get(key, undefined, stores[this.storeId]) || []);
            stores[this.storeId] = iu(stores[this.storeId], key, rows);
        }
    };
    Store.prototype.update = function (key, val) {
        if (locks[this.storeId].locked) {
            console.log('This Store is locked. Unlock to perform update operations');
        }
        else {
            update(key, val, stores[this.storeId]);
        }
    };
    Store.prototype.apply = function (key, func) {
        if (locks[this.storeId].locked) {
            console.log('This Store is locked. Unlock to perform apply operations');
        }
        else {
            var pushArray = get(key, undefined, stores[this.storeId]);
            return func(pushArray);
        }
    };
    Store.prototype.lock = function () {
        locks[this.storeId].locked = true;
    };
    Store.prototype.unlock = function () {
        locks[this.storeId].locked = false;
    };
    return Store;
}());
// get -------------------------------------------------------------
function get(key, options, store) {
    if (!key && !options) {
        return store;
    }
    if (!key && options) {
        return queryResult(store, options);
    }
    else if (key) {
        var subArray = keyToArray(key);
        var result = subArray.reduce(function (ac, cv, i, arr) {
            return ac ? objectAtNode(ac, cv) : undefined;
        }, store);
        if (!options) {
            return result;
        }
        else {
            return queryResult(result, options);
        }
    }
}
// END: get ----------------------------------------------------------
// getting ids / keys and objects at a node --------------------------
function objectAtNode(obj, key) {
    try {
        return key.match(/\$/) ? pushArrayRef(obj, key) : obj[key];
    }
    catch (e) {
        console.log(e);
    }
}
function posAtNode(obj, key) {
    return key.match(/\$/) ? pushArrayPosGetter(obj, key) : key;
}
function pushArrayRef(obj, key) {
    try {
        if (!isArray(obj)) {
            throw ('Error with $ ref => ' + key + ' not referencing a pushArray');
        }
        else {
            return obj.filter(function (row) { return row.id === parseInt(key.replace('$', '')); })[0];
        }
    }
    catch (e) {
        console.error(e);
    }
}
function pushArrayPosGetter(obj, key) {
    try {
        if (!isArray(obj)) {
            throw ('Error with $ ref => ' + key + ' not referencing a pushArray');
        }
        else {
            var objToFind = obj.filter(function (row) { return row.id === parseInt(key.replace('$', '')); })[0];
            return obj.indexOf(objToFind);
        }
    }
    catch (e) {
        console.error(e);
    }
}
// END: getting ids / keys and objects at a node --------------------------
// pushArray queries --------------------------------------------------
function queryResult(obj, options) {
    /*
   * queries are expected to be performed on pushArrays - not arrays... see readme
   *
   * options
   * - filter: fn => boolean: Function that returns boolean for each result
   * - limit: number: Limits the final result set to the specified limit
   * - sort: Array<{by: string, dir: asc | desc}>: Sorts the result set by this key
   */
    obj = filterResults(obj, options.filter);
    obj = sortResults(obj, options.sort);
    obj = limitResults(obj, options.limit);
    if (!options.meta) {
        return Object.keys(obj).map(function (key) { return obj[key].value; });
    }
    else {
        return obj;
    }
}
function filterResults(obj, filter) {
    if (!filter) {
        return Object.keys(obj).map(function (key) { return obj[key]; });
    }
    else {
        return Object
            .keys(obj) // get keys as array
            .map(function (key) { return obj[key]; }) // get the values as array
            .filter(function (item) { return filter(item); }); // apply the filter function to each item in array
    }
}
function sortResults(obj, sort) {
    if (!sort) {
        return obj;
    }
    else {
        var sortObjArray = isArray(sort) ? sort : [sort];
        var values = numberSort(objToValueArray(obj), sortObjArray);
        return values;
    }
}
function limitResults(obj, limit) {
    if (!limit) {
        return obj;
    }
    else {
        var newKeys = Object.keys(obj);
        if (limit < newKeys.length) {
            newKeys.length = limit;
        }
        return newKeys.map(function (key) { return obj[key]; });
    }
}
// set ------------------------------------------------
function iu(state, subArray, val) {
    subArray = keyToArray(subArray);
    return reducer(state, subArray, val ? cloner(val) : undefined, 0);
}
function keyToArray(subArray) {
    try {
        if (!subArray) {
            throw 'No target provided';
        }
        else if (subArray.length < 1) {
            throw 'No target provided';
        }
        else
            return subArray.split('/').filter(function (segment) { return segment; });
    }
    catch (error) {
        console.error('Error in reading keys', error);
    }
}
function reducer(_state, subArray, val, l) {
    try {
        var key = posAtNode(_state, subArray[l]); // gets the position of pushArray, else the key of an object
        if (l + 1 === subArray.length) {
            var value = val;
            var replacer = val === undefined ||
                val === null ||
                typeof val === 'object' && Array.isArray(val) && val.length === 0 ||
                typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0 ? undefined : val;
            if (isArray(_state)) {
                var clonedState = cloner(_state);
                if (replacer) {
                    clonedState.splice(key, 1, replacer);
                    return clonedState;
                }
                else {
                    clonedState.splice(key, 1);
                    return clonedState;
                }
            }
            else {
                return Object.assign({}, _state, (_a = {}, _a[key] = replacer, _a));
            }
        }
        else {
            var value = _state[key] ? _state[key] : {};
            if (isArray(_state)) {
                var clonedState = cloner(_state);
                clonedState.splice(key, 1, reducer(value, subArray, val, l + 1));
                return clonedState;
            }
            else {
                return Object.assign({}, _state, (_b = {}, _b[key] = reducer(value, subArray, val, l + 1), _b));
            }
        }
    }
    catch (error) {
        console.error('reducer error =>', error);
    }
    var _a, _b;
}
// END: set ------------------------------------------------
// array sort functions -------------------------------------------------------
function numberSort(arr, sortArr, direction) {
    var sortLevel = 0;
    var result = arr.reduce(function (ac, cv, i, arr) {
        if (!ac.old) {
            ac.old = arr;
        }
        var targetItem = sortArr[sortLevel].dir && sortArr[sortLevel].dir === 'desc' ?
            largest(ac.old, sortArr, sortLevel)
            :
                smallest(ac.old, sortArr, sortLevel);
        var newArray = ac.new.concat([targetItem]);
        var oldArray = ac.old.filter(function (item) { return item !== targetItem; });
        return { old: oldArray, new: newArray };
    }, { new: [] }).new;
    return result;
}
function smallest(arr, sortArr, sortLevel) {
    try {
        return arr.reduce(function (ac, cv, i, arr) {
            return whichIsSmaller(ac, cv, sortArr, sortLevel);
        });
    }
    catch (e) {
        console.error('Error - Trying to sort by an object instead of a value!');
    }
}
function whichIsSmaller(ac, cv, sortArr, sortLevel) {
    var acVal = sortByRetriever(ac, sortArr[sortLevel].by);
    var curVal = sortByRetriever(cv, sortArr[sortLevel].by);
    if (typeof acVal === 'object' || typeof curVal === 'object') {
        throw (true);
    }
    else if (ifMC(acVal) < ifMC(curVal)) {
        return ac;
    }
    else if (ifMC(acVal) > ifMC(curVal)) {
        return cv;
    }
    else 
    // comparitor and accumulator are same - if last sort level return ac
    if (sortArr.length - 1 === sortLevel) {
        return ac;
    }
    else {
        // There are more sort levels - increase the sort level
        sortLevel++;
        if (sortArr[sortLevel].dir && sortArr[sortLevel].dir === 'desc') {
            return whichIsLarger(ac, cv, sortArr, sortLevel);
        }
        else {
            return whichIsSmaller(ac, cv, sortArr, sortLevel);
        }
    }
}
function largest(arr, sortArr, sortLevel) {
    try {
        return arr.reduce(function (ac, cv, i, arr) {
            return whichIsLarger(ac, cv, sortArr, sortLevel);
        });
    }
    catch (e) {
        console.error('Error - Trying to sort by an object instead of a value!');
    }
}
function whichIsLarger(ac, cv, sortArr, sortLevel) {
    var acVal = sortByRetriever(ac, sortArr[sortLevel].by);
    var curVal = sortByRetriever(cv, sortArr[sortLevel].by);
    if (typeof acVal === 'object' || typeof curVal === 'object') {
        throw (true);
    }
    else if (ifMC(acVal) > ifMC(curVal)) {
        return ac;
    }
    else if (ifMC(acVal) < ifMC(curVal)) {
        return cv;
    }
    else 
    // comparitor and accumulator are same - if last sort level return ac
    if (sortArr.length - 1 === sortLevel) {
        return ac;
    }
    else {
        // There are more sort levels - increase the sort level
        sortLevel++;
        if (sortArr[sortLevel].dir && sortArr[sortLevel].dir === 'desc') {
            return whichIsLarger(ac, cv, sortArr, sortLevel);
        }
        else {
            return whichIsSmaller(ac, cv, sortArr, sortLevel);
        }
    }
}
// update ---------------------------------
function update(key, val, store) {
    try {
        var subArray = keyToArray(key);
        var valArray = isArray(val) ? val : [val];
        var rows = valArray.reduce(function (ac, cv) {
            var objToFind = ac.filter(function (row) { return row.id === cv.id; });
            if (objToFind.length === 0) {
                throw ('Cannot update a row that doesn\'t exist');
            }
            else {
                var pos = ac.indexOf(objToFind[0]);
                ac.splice(pos, 1, cv);
                return ac;
            }
        }, get(key, undefined, store) || []);
    }
    catch (e) {
        console.error();
    }
}
// END: update ---------------------------------
// Utilities ----------------
function ifMC(arg) {
    // if string make mixed case all lower case
    return typeof arg === 'string' ? arg.toLowerCase() : arg;
}
function sortByRetriever(obj, by) {
    return by.split('/').reduce(function (ac, cv) {
        return ac[cv];
    }, obj);
}
function cloner(arg) {
    return JSON.parse(JSON.stringify(arg));
}
function objToValueArray(obj) {
    return Object.keys(obj).map(function (key) { return obj[key]; });
}
function isArray(val) {
    return typeof val === 'object' && Array.isArray(val);
}