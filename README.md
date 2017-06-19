[![version](https://img.shields.io/npm/v/trainmanjs.svg)](https://www.npmjs.com/package/trainmanjs)
[![dependencies](https://img.shields.io/david/macku/trainmanjs.svg)](https://david-dm.org/macku/trainmanjs)
[![dev dependencies](https://img.shields.io/david/dev/macku/trainmanjs.svg)](https://david-dm.org/macku/trainmanjs?type=dev)

# TrainmanJS

TrainmanJS is [Cross-Origin Communication Library](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing). It's a
wrapper for the native [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) API.

It allows you to send bidirectional **Topics** and **Messages** between the **iframes** and wrapper (parent) window.

[![Trainman](http://www.hotflick.net/flicks/2003_The_Matrix_Revolutions/fhd003TMR_Bruce_Spence_002.jpg)](http://matrix.wikia.com/wiki/The_Trainman)

***The Trainman** is an exile who created and operates Mobil Avenue and is a servant of another exile program known as the Merovingian.*

source: http://matrix.wikia.com/wiki/The_Trainman

## Features

 - Topics and messages
  
   You can listen to different kind of topics and message to it. You have control to which frame you would like to send
   a message. What is also important, the parent frame knows exactly which child frame did send the message. Thanks to
   that you can omit some topics from particular recipients inside your topic listener.
 
 - Lazy loading
 
   Thanks to the queuing mechanism and buffer you can start sending messages immediately.
   You can send a message from the wrapper (parent) window to the child iframe even it's still loading.
   Queued messages will be delivered once the connection is established.
   
 - Reconnection
 
   When the child frame will reload itself, Trainman will try to reconnect with it. During the reconnection, Trainman
   will queue messages inside his buffer. Queued messages will be delivered once the connection is established again.
   
 - Bulk operation (upcoming)
   
   Post a message to all child frames at once. Don't need to specify an exact recipient. You can use the **'*'** symbol
   for sending a message to all of the connect children frames.
    
 - Debug mode
   
   Easily turn on and off logging mechanism. Thanks to that you can debug your code and application in a much more simple
   way. You can track and check whole Trainman and Passenger communication.

 - F2F (upcoming)

   Frame-to-frame direct communication. Allow to send and proxy messages directly between the child frames.


## How to install

### NPM and Yarn

You can install the library using **NPM**:

```bash
npm install trainmanjs -S
// or
yarn add trainmanjs
```

Next, you can import **TrainmanJS** module into your app:

```js
import Trainman from 'trainmnanjs';
```

For the child pages (frames) you should import **Passenger** class:

```js
import { Passenger } from 'trainmnanjs';
````

### Using CDN

You can also use the **CDN** service ex. [unpkg.com](https://unpkg.com/trainmanjs@0.5.0) or [npm-cdn.herrokuapp.com](http://npm-cdn.herokuapp.com/trainmanjs@0.5.0/lib/trainmanjs.js)

```html
<script src="https://unpkg.com/trainmanjs"></script>

<!-- or -->

<script src="http://npm-cdn.herokuapp.com/trainmanjs@0.5.0/lib/trainmanjs.js"></script>
```

Then you can access the **Trainman** and **Passenger** from the injected module:

```js
(function(module) {
  const Trainman = module.Trainman;
  const Passenger = module.Passenger;
})(window.trainmanjs);
```

## How to use it
TBA

## Examples

### Simple Example
1. [Check simple example](https://rawgit.com/macku/trainmanjs/master/examples/simple/index.html) how to use Trainman
2. [Here you can find the source code](/examples/simple/) for the above example

### Re-connection and Debug Mode
1. [Reconnection example](https://rawgit.com/macku/trainmanjs/master/examples/reconnect/index.html)
2. [Here you can find the source code](/examples/reconnect/) for the above example
