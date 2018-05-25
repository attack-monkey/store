export class Store {
  
	constructor(obj) {
		this.store = cloner(obj);
		this.locked = false;
		this.idCount = 1;
	}

	get(key, options) { return get(key, options, this.store); }

	set(key, val) {
		if (this.locked) {
			console.log('This Store is locked. Unlock to perform set operations');
		} else {
			this.store = iu(this.store, key, val);
		}
	}

	push(key, val) {
		if (this.locked) {
			console.log('This Store is locked. Unlock to perform push operations');
		} else {
			const valArray = isArray(val) ? val : [val];
			const rows = valArray.reduce((ac, cv) => {
				ac.push({ id: this.idCount, value: cv });
				this.idCount++;
				return ac;
			}, get(key, undefined, this.store) || []);
			this.store = iu(this.store, key, rows);
		}
	}

	unshift(key, val) {
		if (this.locked) {
			console.log('This Store is locked. Unlock to perform unshift operations');
		} else {
			const valArray = isArray(val) ? val : [val];
			const rows = valArray.reduce((ac, cv) => {
				ac.unshift({ id: this.idCount, value: cv });
				this.idCount++;
				return ac;
			}, get(key, undefined, this.store) || []);
			this.store = iu(this.store, key, rows);
		}
	}

	update(key, val) {
		if (this.locked) {
			console.log('This Store is locked. Unlock to perform update operations');
		} else { update(key, val, this.store) }
	}

	apply(key, func) {
		if (this.locked) {
			console.log('This Store is locked. Unlock to perform apply operations');
		} else {
			const pushArray = get(key, undefined, this.store);
			return func(pushArray);
		}
	}

	lock() {
		this.locked = true;
	}

	unlock() {
		this.locked = false;
	}
}

// get -------------------------------------------------------------

function get(key, options, store) {
	if (!key && !options) { return store; }
	if (!key && options) { return queryResult(store, options); }
	else if (key) {
		const subArray = keyToArray(key);
		const result = subArray.reduce((ac, cv, i, arr) => {
			return ac ? objectAtNode(ac, cv) : undefined;
		}, store);
		if (!options) { return result } else {
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
		if (!isArray(obj)) { throw ('Error with $ ref => ' + key + ' not referencing a pushArray'); }
		else {
			return obj.filter(row => row.id === parseInt(key.replace('$', '')))[0];
		}
	} catch (e) { console.error(e); }
}

function pushArrayPosGetter(obj, key) {
	try {
		if (!isArray(obj)) { throw ('Error with $ ref => ' + key + ' not referencing a pushArray'); }
		else {
			const objToFind = obj.filter(row => row.id === parseInt(key.replace('$', '')))[0];
			return obj.indexOf(objToFind);
		}
	} catch (e) { console.error(e); }
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
		return Object.keys(obj).map(key => obj[key].value);
	} else { return obj; }
}

function filterResults(obj, filter) {
	if (!filter) { return Object.keys(obj).map(key => obj[key]); }
	else {
		return Object
			.keys(obj)	// get keys as array
			.map(key => obj[key]) // get the values as array
			.filter(item => filter(item))	// apply the filter function to each item in array
	}
}

function sortResults(obj, sort) {
	if (!sort) { return obj } else {
		const sortObjArray = isArray(sort) ? sort : [sort];
		const values = numberSort(objToValueArray(obj), sortObjArray);
		return values;
	}
}

function limitResults(obj, limit) {
	if (!limit) { return obj } else {
		const newKeys = Object.keys(obj);
		if (limit < newKeys.length) { newKeys.length = limit }
		return newKeys.map(key => obj[key]);
	}
}

// set ------------------------------------------------

function iu(state, subArray, val) {
	subArray = keyToArray(subArray);
	return reducer(state, subArray, val ? cloner(val) : undefined, 0);
}

function keyToArray(subArray) {
	try {
		if (!subArray) { throw 'No target provided'; } else
			if (subArray.length < 1) { throw 'No target provided'; } else
				return subArray.split('/').filter(segment => segment);
	} catch (error) { console.error('Error in reading keys', error) }
}

function reducer(_state, subArray, val, l) {
	try {
		const key = posAtNode(_state, subArray[l]); // gets the position of pushArray, else the key of an object
		if (l + 1 === subArray.length) {
			const value = val;
			const replacer =
				val === undefined ||
					val === null ||
					typeof val === 'object' && Array.isArray(val) && val.length === 0 ||
					typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0 ? undefined : val;
			if (isArray(_state)) {
				const clonedState = cloner(_state);
				if (replacer) {
					clonedState.splice(key, 1, replacer);
					return clonedState;
				} else {
					clonedState.splice(key, 1);
					return clonedState;
				}
			} else {
				return Object.assign({}, _state, { [key]: replacer });
			}
		}
		else {
			const value = _state[key] ? _state[key] : {};
			if (isArray(_state)) {
				const clonedState = cloner(_state);
				clonedState.splice(key, 1, reducer(value, subArray, val, l + 1));
				return clonedState;
			} else {
				return Object.assign({}, _state, { [key]: reducer(value, subArray, val, l + 1) });
			}
		}
	} catch (error) { console.error('reducer error =>', error); }
}

// END: set ------------------------------------------------

// array sort functions -------------------------------------------------------

function numberSort(arr, sortArr, direction) {
	let sortLevel = 0;
	const result = arr.reduce((ac, cv, i, arr) => {
		if (!ac.old) { ac.old = arr }
		const targetItem = sortArr[sortLevel].dir && sortArr[sortLevel].dir === 'desc' ?
			largest(ac.old, sortArr, sortLevel)
			:
			smallest(ac.old, sortArr, sortLevel);
		const newArray = [...ac.new, targetItem];
		const oldArray = ac.old.filter(item => item !== targetItem);
		return { old: oldArray, new: newArray };
	}, { new: [] }).new;
	return result;
}

function smallest(arr, sortArr, sortLevel) {
	try {
		return arr.reduce((ac, cv, i, arr) => {
			return whichIsSmaller(ac, cv, sortArr, sortLevel);
		})
	} catch (e) { console.error('Error - Trying to sort by an object instead of a value!'); }
}

function whichIsSmaller(ac, cv, sortArr, sortLevel) {
	const acVal = sortByRetriever(ac, sortArr[sortLevel].by);
	const curVal = sortByRetriever(cv, sortArr[sortLevel].by);
	if (typeof acVal === 'object' || typeof curVal === 'object') { throw (true); } else
		if (ifMC(acVal) < ifMC(curVal)) { return ac; } else
			if (ifMC(acVal) > ifMC(curVal)) { return cv; } else
				// comparitor and accumulator are same - if last sort level return ac
				if (sortArr.length - 1 === sortLevel) { return ac; }
				else {
					// There are more sort levels - increase the sort level
					sortLevel++;
					if (sortArr[sortLevel].dir && sortArr[sortLevel].dir === 'desc') {
						return whichIsLarger(ac, cv, sortArr, sortLevel);
					} else { return whichIsSmaller(ac, cv, sortArr, sortLevel); }
				}
}

function largest(arr, sortArr, sortLevel) {
	try {
		return arr.reduce((ac, cv, i, arr) => {
			return whichIsLarger(ac, cv, sortArr, sortLevel);
		})
	} catch (e) { console.error('Error - Trying to sort by an object instead of a value!'); }
}

function whichIsLarger(ac, cv, sortArr, sortLevel) {
	const acVal = sortByRetriever(ac, sortArr[sortLevel].by);
	const curVal = sortByRetriever(cv, sortArr[sortLevel].by);
	if (typeof acVal === 'object' || typeof curVal === 'object') { throw (true); } else
		if (ifMC(acVal) > ifMC(curVal)) { return ac; } else
			if (ifMC(acVal) < ifMC(curVal)) { return cv; } else
				// comparitor and accumulator are same - if last sort level return ac
				if (sortArr.length - 1 === sortLevel) { return ac; }
				else {
					// There are more sort levels - increase the sort level
					sortLevel++;
					if (sortArr[sortLevel].dir && sortArr[sortLevel].dir === 'desc') {
						return whichIsLarger(ac, cv, sortArr, sortLevel);
					} else { return whichIsSmaller(ac, cv, sortArr, sortLevel); }
				}
}

// update ---------------------------------

function update(key, val, store) {
	try {
		const subArray = keyToArray(key);
		const valArray = isArray(val) ? val : [val];
		const rows = valArray.reduce((ac, cv) => {
			const objToFind = ac.filter(row => row.id === cv.id);
			if (objToFind.length === 0) {
				throw ('Cannot update a row that doesn\'t exist');
			} else {
				const pos = ac.indexOf(objToFind[0]);
				ac.splice(pos, 1, cv);
				return ac;
			}
		}, get(key, undefined, store) || []);
	} catch (e) { console.error(); }
}

// END: update ---------------------------------

// Utilities ----------------

function ifMC(arg) {
	// if string make mixed case all lower case
	return typeof arg === 'string' ? arg.toLowerCase() : arg;
}

function sortByRetriever(obj, by) {
	return by.split('/').reduce((ac, cv) => {
		return ac[cv];
	}, obj);
}

function cloner(arg) {
	return JSON.parse(JSON.stringify(arg));
}

function objToValueArray(obj) {
	return Object.keys(obj).map(key => obj[key]);
}

function isArray(val) {
	return typeof val === 'object' && Array.isArray(val);
}