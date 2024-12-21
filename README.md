# [mc-event](https://github.com/theajack/mc-event) 

**[Demo](https://shiyix.cn/jsbox/?github=theajack.mc-event ) | [Versions](https://github.com/theajack/mc-event/blob/main/dev/version.md) | [MessageBoard](https://theajack.github.io/message-board?app=mc-event)**

An event library that communicates using MessageChannel.

## 1. features

1. Support event communication across workers 
3. Powerful ts type support, support event names and parameter type hints for on, emit and other functions
3. Support static call, new call, inheritance call and binding use
4. Support to get whether the configuration triggers the last emit event before on
5. Support head, once, headOnce, off, clear methods (subsequent may consider adding logic such as index, order, but may increase the package size)
6. Easy to use, does not depend on any third-party library

### 1.1 install

```
npm i mc-event
```

## 2. MessageChannel EventBus

Use MessageChannel for cross-worker communication

#### 2.1 Basic usage

In worker (worker.js)

```js
import MCEvent from 'mc-event';

async function workerMain () {
     const e = await MCevents.copy();
     e.on('test', (v) => {console.log('Worker receive', v);});
     e.emit('test', 'worker data');
}
workerMain();
```

Main thread

```js
import MCEvent from 'mc-event';

const e = new MCEvent();

const worker = new Worker('worker.js'); // Fill in the real worker or use vite import syntax to import the worker
e.into(worker)

e.on('test', (v) => {console.log('Main receive', v);});
e.emit('test', 'main data');
```

#### 2.2 Advanced Use

In worker (worker.js)

```js
// id can be agreed upon or passed using worker message
const e = await MCEvent.copy(id);

e.emitTransfer('test', {
     data: [{
          stream: readableStream, // Transferable to be transferred
     }],
     transfer: [readableStream]
})
```

## 3. Normal EventBus

MCEvent Also Support all Usages in this Section

### 3.1 Basic use (static call)

```js

import {Events} from 'mc-event';

Events.on('hello', (v) => {
     console.log('Say ' + v);
});
Events.emit('hello', 'Hi');
```

### 3.2 ts type support

```ts
const e = new Events<{
     aa: [string, number, ...any[]],
     bb: [{a: string}],
}>();
e.on('aa', (a1, a2, a3) => {
     // Here it will be inferred that a1 is string, a2 is number, a3 is any
});
e.on('bb', (v, v2) => {
     v.a; // here it will be inferred that v is {a:string}
     // v2 will report an error
});
e.on('cc', () => { // error, cc does not exist
});
e.emit('bb', {a: '1', b: 2}); // attribute b will report an error
```

### 3.3 new use

```js
const e = new Events();
e.on('hello', (v) => {
     console.log('Say ' + v);
});
e.emit('hello', 'Hi');
```

### 3.3 Inheritance use

```js
class Test extends Events {
     test () {
         this.on('hello', () => {console.log('hello');});
         this.emit('hello');
     }
}
```

Generics + inheritance

```ts
class Test extends Events<{
     aa: [string, number, ...any[]],
     bb: [{a: string}],
}> {
     //...
}
```

### 3.4 Binding usage

```js
const a = {};
events.bind(a);
a.on('hello', () => {console.log('hello');});
a.emit('hello');
```

binding + generics

```ts
const a: Events<{aa: [string]}> & {
     [prop: string]: any;
} = {
};
events.bind(a);
a.on('aa', (v) => {console.log('hello', v);});
a.emit('aa');
```

### 3.5 head,once,off,clear

```js
const e = new Events();
e.once('hello', (v) => {console.log('once', v);}); // Only trigger once
e.head('hello', (v) => {console.log('head', v);}); // Put the event in the head
e.headOnce('hello', (v) => {console.log('head', v);}); // combine the above two
const handler = (v) => {console.log(v);}
e.on('hello', handler);
e.off('hello', handler); // Remove a single event listener
e.clear('hello'); // Remove all listeners for the entire event
```

### 3.6 Trigger pre-events

global open

```js
events.usePrevEmit = true;
events.emit('hello', 'hi');
events.on('hello', (v) => {console.log(v);});
```

turn on or off for an object

```js
const e = new Events();
e.usePrevEmit = false;
e.emit('hello', 'hi');
e.on('hello', (v) => {console.log(v);}); // will not trigger hello
```

If you only want to trigger on static calls, you can write like this

```js
Events._.usePrevEmit = true;
```

### 3.7 onWait

```js
Events.onWait('xxx').then();

const e = new Events();
e.onWait('xxx').then();
```