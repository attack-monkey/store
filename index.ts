import { Store } from './src';

// create a new store...

let state = new Store({});

// push items into the store at l1.l2.l3 as a pushArray

state.push('l1/l2/l3',[
  {cat: 'red', val: 1}, 
  {cat: 'blue', val: 2}, 
  {cat: 'red', val: 87},
  {cat: 'red', val: 4},
  {cat: 'red', val: 45}
]);

// update a pushArray item using .set()

state.set('l1/l2/l3/$3/value', {cat: 'red', val: 455});

// update multiple pushArray items with .update() ## this is the preferred method
state.update('l1/l2/l3', [
	{id: 1, value: {cat: 'blue', val: -600}},
  {id: 4, value: {cat: 'blue', val: -1600}}
]);

// query the pushArray at l1.l2.l3 and sort by value/cat ascending, then value/val descending
// Stringify (and prettify) the result

let result = JSON.stringify(state.get('l1/l2/l3', {
	sort: [
  	{by: 'value/cat'},
  	{by: 'value/val', dir: 'desc'}
  ]
}),null, 2);

// print result
document.querySelector('#response')
.innerHTML = result;