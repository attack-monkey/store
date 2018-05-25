Store.js
========

Store is a local JSON store for javascript. It differs from a normal object in that it is dereferenced from any other object. Only specific methods can get, create, update, delete data. When `get` returns data, it is only a copy - keeping the original unchanged. Store also provides querying (sort, limit, filter), locking, and more...

_Normal objects..._

```javascript

var obj1 = {thing: 'apple'};
var obj2 = obj1;
obj2.thing = 'banana';
console.log(obj1.thing); // Oh no it's changed to banana!

```

_Store objects..._

```javascript

const obj1 = createStore({thing: 'apple'});
const obj2 = obj1.get();
obj2.thing = 'banana';
console.log(obj1.get('thing')); // Still apple baby!

```

## Features

- Holds a JSON object with no reference to other objects
- Is protected and can only be retrieved with `.get()` and updated with methods such as `set`, `push`, `unshift`, `update`, and `apply`
- `.get()` returns a copy of the object, keeping the original object unchanged
- When nodes are added, any missing parent nodes are added automatically
- When nodes are deleted, any redundent parent nodes are cleaned up automatically
- A Store can be locked and unlocked to aid in data not being accidentally changed
- Advanced querying with filters, limits, and multi-level sorting

## Install

### JS in the Browser

Use /lib/store.js into your project

```html

<script src="store.js">

```

### ES6 / Typescript

Use either store.ts or store.js from /src

```javascript

install { Store } from './src'

```

### Run this example project

clone the repo

$ `https://github.com/attack-monkey/store`

install parcel.js globally. Required to run the project.

$ `npm install -g parcel-bundler`

Run the project which will automatically install typescript into the project

$ `npm start`

This will run the project locally on localhost:1234 by default


## Basics

```javascript

 let store = new Store({});
 
 store.set('lvl1/lvl2', 'hello')	// Adds or updates the node and adds any parents if missing
 store.set('lvl1/lvl2', undefined) 	// Deletes the node and cleans up any child-less parent nodes (undefined / null / [] / {}) all result in delete
 store.get();				// gets the full contents of store
 store.get('lvl1');			// gets the contents of store at a particular node
 store.lock();				// Restricts any changes to the store
 store.unlock();			// Removes the lock
 ```
 
## PushArrays

While you can get and set arrays, Store provides a more powerful solution in the form of pushArrays.

To create a pushArray just use .push() in place of set.

```javascript

store.push('lvl1', ['a', 'b', 'c']);

```

If you use push when there is already a pushArray present, then the new items are appended to the existing pushArray.

```javascript

store.push('lvl1', ['d', 'e']);

```

You can also push single values...

```javascript

store.push('lvl1', 'f');

```

**To push items to the front of the pushArray use `.unshift()` instead of `.push()`**

pushArrays are stored as an array of rows. A row is just an object with an id and value. `id` is a unique sequential ID and `value` is the value of the array item.

```javascript

{
	lvl1: [
		{id: 1, value: 'a'},
		{id: 2, value: 'b'},
		{id: 3, value: 'c'},
		{id: 4, value: 'd'},
		{id: 5, value: 'e'},
		{id: 6, value: 'f'}
	]
}

```

A pushArray can be retrieved in full with `store.get('lvl1')` which returns

```javascript

[
	{id: 1, value: 'a'},
	{id: 2, value: 'b'},
	{id: 3, value: 'c'},
	{id: 4, value: 'd'},
	{id: 5, value: 'e'},
	{id: 6, value: 'f'}
]

```

A pushArray row can be retrieved directly by `$<id>` - eg.  

`store.get('lvl1/$1')` which returns `{id: 1, value: 'a'}`.

### Stripping meta-data from the pushArray result

To strip the meta-data from an individual pushArray row, just get the value 

`store.get('lvl1/$1/value')` which returns just the value 'a'.

To strip the meta data from a full pushArray result set, use  

`store.get('lvl1', {})` - which returns `['a', 'b', 'c', 'd', 'e', 'f']`

The second argument in the above `.get()` is an a empty 'query options' object, which tells Store that it's querying a pushArray and expects an array (without meta-data) back.

### Queries

By passing a 'query options' object with `.get()`, powerful queries are possible.  
A 'query options' object tells Store that it's querying a pushArray and expects an array (without meta-data) back.

You can still specify to have the result with meta-data by passing 
`meta: true` ...
For example:

`store.get('lvl1', {meta: true})` 

#### Filter

pushArrays can be filtered by passing in a filter function
For example, here we filter out any items that are not of type string...  

`store.get('lvl1', {filter: row => typeof row.value === 'string'});`  

A filter function passes each row into the filter and evaluates it to a boolean result.
If a filter function against a row equates to true, the row will be returned in the result set.

#### Sort and Limit

pushArrays can be sorted and limited ... 

`store.get('lvl1', {sort: {by: 'value', dir: 'desc'}, limit: 3})` returns `['f', 'e', 'd']`  

and multi value sorted...  

`store.get('lvl1', {sort: [{by: 'value', dir: 'desc'}, {by: id', dir: 'asc'}], limit: 3})`  
which sorts by value in descending order, then id in ascending order.

and sorted by child nodes...  
`store.get('lvl1', {sort: {'value/category', 'desc'}, limit: 3})`

### Deleting pushArray rows

pushArray rows can be deleted with the normal set syntax...

`store.set('lvl1/$1', undefined); // delete`

### Updating pushArray rows

**The safest way to update a pushArray is with `.update()`, however `.set()` can also be used...**

Updating with `.set()` - eg.

`store.set('lvl1/$1/value', 'z'); // Update value of 'a' to 'z'`  

or with `store.set('lvl1/$1', { id: 1, value: 'z'}); // Update value of 'a' to 'z'`  

> Note: a pushArray row's id should not be updated -  
`store.set('lvl1/$1/id', 99) // BAD!!!!`  
`store.set('lvl1/$1/', { id: 99, value: 'z'}) // BAD!!!!`

The safest way to update pushArrays is with `.update()` ... 

```javascript

store.update('lvl1', {id: 1, value: 'z'}); // Update value of 'a' to 'z'

```

`.update()` is also more powerful than using `.set()` because it allows multiple row updates at once...

```javascript

store.update('lvl1', [{id: 1, value: 'z'}, {id: 3, value: 'y'}]);

```

### Apply

pushArrays can also have any array.prototype function applied to them with `.apply()`

`store.apply('lvl1', pushArray => pushArray.pop()) // removes the last row of the pushArray`

`newResult = store.apply('lvl1', pushArray => pushArray.find(row => row.id === 1)) // returns the pushArray row where id is 1`

> Note: that some array.prototype functions (such as pop and shift) mutate the pushArray - that is they make actual changes.
Other array.prototype functions do not mutate, and instead can be used to generate a result.

> !!! Don't use `apply` + ( `unshift` or `push` ) as this will add items into the array without wrapping them with meta-data!  
eg.  

`store.apply('lvl1', pushArray => pushArray.push(something)) // BAD!!`  

Instead use `store.push('lvl1', something)` or `store.unshift('lvl1', something)`

