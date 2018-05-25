// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({3:[function(require,module,exports) {
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.__esModule = true;
var Store = /** @class */function () {
    function Store(obj) {
        this.idCount = 1;
        this.store = cloner(obj);
    }
    Store.prototype.get = function (key, options) {
        return get(key, options, this.store);
    };
    Store.prototype.set = function (key, val) {
        if (this.locked) {
            console.log('This Store is locked. Unlock to perform set operations');
        } else {
            this.store = iu(this.store, key, val);
        }
    };
    Store.prototype.push = function (key, val) {
        var _this = this;
        if (this.locked) {
            console.log('This Store is locked. Unlock to perform push operations');
        } else {
            var valArray = isArray(val) ? val : [val];
            var rows = valArray.reduce(function (ac, cv) {
                ac.push({ id: _this.idCount, value: cv });
                _this.idCount++;
                return ac;
            }, get(key, undefined, this.store) || []);
            this.store = iu(this.store, key, rows);
        }
    };
    Store.prototype.unshift = function (key, val) {
        var _this = this;
        if (this.locked) {
            console.log('This Store is locked. Unlock to perform unshift operations');
        } else {
            var valArray = isArray(val) ? val : [val];
            var rows = valArray.reduce(function (ac, cv) {
                ac.unshift({ id: _this.idCount, value: cv });
                _this.idCount++;
                return ac;
            }, get(key, undefined, this.store) || []);
            this.store = iu(this.store, key, rows);
        }
    };
    Store.prototype.update = function (key, val) {
        if (this.locked) {
            console.log('This Store is locked. Unlock to perform update operations');
        } else {
            update(key, val, this.store);
        }
    };
    Store.prototype.apply = function (key, func) {
        if (this.locked) {
            console.log('This Store is locked. Unlock to perform apply operations');
        } else {
            var pushArray = get(key, undefined, this.store);
            return func(pushArray);
        }
    };
    Store.prototype.lock = function () {
        this.locked = true;
    };
    Store.prototype.unlock = function () {
        this.locked = false;
    };
    return Store;
}();
exports.Store = Store;
// export function storeCreator(obj) {
// 	let store = cloner(obj);
// 	let locked = false;
// 	let idCount = 1;
// 	return {
// 		get: (key, options) => get(key, options, store),
// 		set: (key, val) => {
// 			if (locked) {
// 				console.log('This Store is locked. Unlock to perform set operations');
// 			} else {
// 				store = iu(store, key, val);
// 			}
// 		},
// 		push: (key, val) => {
// 			if (locked) {
// 				console.log('This Store is locked. Unlock to perform push operations');
// 			} else {
// 				const valArray = isArray(val) ? val : [val];
// 				const rows = valArray.reduce((ac, cv) => {
// 					ac.push({ id: idCount, value: cv });
// 					idCount++;
// 					return ac;
// 				}, get(key, undefined, store) || []);
// 				store = iu(store, key, rows);
// 			}
// 		},
// 		unshift: (key, val) => {
// 			if (locked) {
// 				console.log('This Store is locked. Unlock to perform unshift operations');
// 			} else {
// 				const valArray = isArray(val) ? val : [val];
// 				const rows = valArray.reduce((ac, cv) => {
// 					ac.unshift({ id: idCount, value: cv });
// 					idCount++;
// 					return ac;
// 				}, get(key, undefined, store) || []);
// 				store = iu(store, key, rows);
// 			}
// 		},
// 		update: (key, val) => {
// 			if (locked) {
// 				console.log('This Store is locked. Unlock to perform update operations');
// 			} else { update(key, val, store) }
// 		},
// 		apply(key, func) {
// 			if (locked) {
// 				console.log('This Store is locked. Unlock to perform apply operations');
// 			} else {
// 				const pushArray = get(key, undefined, store);
// 				return func(pushArray);
// 			}
// 		},
// 		lock: () => {
// 			locked = true;
// 		},
// 		unlock: () => {
// 			locked = false;
// 		}
// 	};
// }
// get -------------------------------------------------------------
function get(key, options, store) {
    if (!key && !options) {
        return store;
    }
    if (!key && options) {
        return queryResult(store, options);
    } else if (key) {
        var subArray = keyToArray(key);
        var result = subArray.reduce(function (ac, cv, i, arr) {
            return ac ? objectAtNode(ac, cv) : undefined;
        }, store);
        if (!options) {
            return result;
        } else {
            return queryResult(result, options);
        }
    }
}
// END: get ----------------------------------------------------------
// getting ids / keys and objects at a node --------------------------
function objectAtNode(obj, key) {
    return key.match(/\$/) ? pushArrayRef(obj, key) : obj[key];
}
function posAtNode(obj, key) {
    return key.match(/\$/) ? pushArrayPosGetter(obj, key) : key;
}
function pushArrayRef(obj, key) {
    try {
        if (!isArray(obj)) {
            throw 'Error with $ ref => ' + key + ' not referencing a pushArray';
        } else {
            return obj.filter(function (row) {
                return row.id === parseInt(key.replace('$', ''));
            })[0];
        }
    } catch (e) {
        console.error(e);
    }
}
function pushArrayPosGetter(obj, key) {
    try {
        if (!isArray(obj)) {
            throw 'Error with $ ref => ' + key + ' not referencing a pushArray';
        } else {
            var objToFind = obj.filter(function (row) {
                return row.id === parseInt(key.replace('$', ''));
            })[0];
            return obj.indexOf(objToFind);
        }
    } catch (e) {
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
        return Object.keys(obj).map(function (key) {
            return obj[key].value;
        });
    } else {
        return obj;
    }
}
function filterResults(obj, filter) {
    if (!filter) {
        return Object.keys(obj).map(function (key) {
            return obj[key];
        });
    } else {
        return Object.keys(obj) // get keys as array
        .map(function (key) {
            return obj[key];
        }) // get the values as array
        .filter(function (item) {
            return filter(item);
        }); // apply the filter function to each item in array
    }
}
function sortResults(obj, sort) {
    if (!sort) {
        return obj;
    } else {
        var sortObjArray = isArray(sort) ? sort : [sort];
        var values = numberSort(objToValueArray(obj), sortObjArray);
        return values;
    }
}
function limitResults(obj, limit) {
    if (!limit) {
        return obj;
    } else {
        var newKeys = Object.keys(obj);
        if (limit < newKeys.length) {
            newKeys.length = limit;
        }
        return newKeys.map(function (key) {
            return obj[key];
        });
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
        } else if (subArray.length < 1) {
            throw 'No target provided';
        } else return subArray.split('/').filter(function (segment) {
            return segment;
        });
    } catch (error) {
        console.error('Error in reading keys', error);
    }
}
function reducer(_state, subArray, val, l) {
    try {
        var key = posAtNode(_state, subArray[l]); // gets the position of pushArray, else the key of an object
        if (l + 1 === subArray.length) {
            var value = val;
            var replacer = val === undefined || val === null || (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && Array.isArray(val) && val.length === 0 || (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && !Array.isArray(val) && Object.keys(val).length === 0 ? undefined : val;
            if (isArray(_state)) {
                var clonedState = cloner(_state);
                if (replacer) {
                    clonedState.splice(key, 1, replacer);
                    return clonedState;
                } else {
                    clonedState.splice(key, 1);
                    return clonedState;
                }
            } else {
                return Object.assign({}, _state, (_a = {}, _a[key] = replacer, _a));
            }
        } else {
            var value = _state[key] ? _state[key] : {};
            if (isArray(_state)) {
                var clonedState = cloner(_state);
                clonedState.splice(key, 1, reducer(value, subArray, val, l + 1));
                return clonedState;
            } else {
                return Object.assign({}, _state, (_b = {}, _b[key] = reducer(value, subArray, val, l + 1), _b));
            }
        }
    } catch (error) {
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
        var targetItem = sortArr[sortLevel].dir && sortArr[sortLevel].dir === 'desc' ? largest(ac.old, sortArr, sortLevel) : smallest(ac.old, sortArr, sortLevel);
        var newArray = ac["new"].concat([targetItem]);
        var oldArray = ac.old.filter(function (item) {
            return item !== targetItem;
        });
        return { old: oldArray, "new": newArray };
    }, { "new": [] })["new"];
    return result;
}
function smallest(arr, sortArr, sortLevel) {
    try {
        return arr.reduce(function (ac, cv, i, arr) {
            return whichIsSmaller(ac, cv, sortArr, sortLevel);
        });
    } catch (e) {
        console.error('Error - Trying to sort by an object instead of a value!');
    }
}
function whichIsSmaller(ac, cv, sortArr, sortLevel) {
    var acVal = sortByRetriever(ac, sortArr[sortLevel].by);
    var curVal = sortByRetriever(cv, sortArr[sortLevel].by);
    if ((typeof acVal === 'undefined' ? 'undefined' : _typeof(acVal)) === 'object' || (typeof curVal === 'undefined' ? 'undefined' : _typeof(curVal)) === 'object') {
        throw true;
    } else if (ifMC(acVal) < ifMC(curVal)) {
        return ac;
    } else if (ifMC(acVal) > ifMC(curVal)) {
        return cv;
    } else
        // comparitor and accumulator are same - if last sort level return ac
        if (sortArr.length - 1 === sortLevel) {
            return ac;
        } else {
            // There are more sort levels - increase the sort level
            sortLevel++;
            if (sortArr[sortLevel].dir && sortArr[sortLevel].dir === 'desc') {
                return whichIsLarger(ac, cv, sortArr, sortLevel);
            } else {
                return whichIsSmaller(ac, cv, sortArr, sortLevel);
            }
        }
}
function largest(arr, sortArr, sortLevel) {
    try {
        return arr.reduce(function (ac, cv, i, arr) {
            return whichIsLarger(ac, cv, sortArr, sortLevel);
        });
    } catch (e) {
        console.error('Error - Trying to sort by an object instead of a value!');
    }
}
function whichIsLarger(ac, cv, sortArr, sortLevel) {
    var acVal = sortByRetriever(ac, sortArr[sortLevel].by);
    var curVal = sortByRetriever(cv, sortArr[sortLevel].by);
    if ((typeof acVal === 'undefined' ? 'undefined' : _typeof(acVal)) === 'object' || (typeof curVal === 'undefined' ? 'undefined' : _typeof(curVal)) === 'object') {
        throw true;
    } else if (ifMC(acVal) > ifMC(curVal)) {
        return ac;
    } else if (ifMC(acVal) < ifMC(curVal)) {
        return cv;
    } else
        // comparitor and accumulator are same - if last sort level return ac
        if (sortArr.length - 1 === sortLevel) {
            return ac;
        } else {
            // There are more sort levels - increase the sort level
            sortLevel++;
            if (sortArr[sortLevel].dir && sortArr[sortLevel].dir === 'desc') {
                return whichIsLarger(ac, cv, sortArr, sortLevel);
            } else {
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
            var objToFind = ac.filter(function (row) {
                return row.id === cv.id;
            });
            if (objToFind.length === 0) {
                throw 'Cannot update a row that doesn\'t exist';
            } else {
                var pos = ac.indexOf(objToFind[0]);
                ac.splice(pos, 1, cv);
                return ac;
            }
        }, get(key, undefined, store) || []);
    } catch (e) {
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
    return Object.keys(obj).map(function (key) {
        return obj[key];
    });
}
function isArray(val) {
    return (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && Array.isArray(val);
}
},{}],2:[function(require,module,exports) {
"use strict";

exports.__esModule = true;
var src_1 = require("./src");
// create a new store...
var state = new src_1.Store({});
// push items into the store at l1.l2.l3 as a pushArray
state.push('l1/l2/l3', [{ cat: 'red', val: 1 }, { cat: 'blue', val: 2 }, { cat: 'red', val: 87 }, { cat: 'red', val: 4 }, { cat: 'red', val: 45 }]);
// update a pushArray item using .set()
state.set('l1/l2/l3/$3/value', { cat: 'red', val: 455 });
// update multiple pushArray items with .update() ## this is the preferred method
state.update('l1/l2/l3', [{ id: 1, value: { cat: 'blue', val: -600 } }, { id: 4, value: { cat: 'blue', val: -1600 } }]);
// query the pushArray at l1.l2.l3 and sort by value/cat ascending, then value/val descending
// Stringify (and prettify) the result
var result = JSON.stringify(state.get('l1/l2/l3', {
    sort: [{ by: 'value/cat' }, { by: 'value/val', dir: 'desc' }]
}), null, 2);
// print result
document.querySelector('#response').innerHTML = result;
},{"./src":3}],4:[function(require,module,exports) {

var global = (1, eval)('this');
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    }
  };
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '50753' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.require, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + 'data.error.stack');
    }
  };
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(function (id) {
    return hmrAccept(global.require, id);
  });
}
},{}]},{},[4,2])
//# sourceMappingURL=/dist/store.map