[![version](https://badge.fury.io/js/trainmanjs.svg)](https://www.npmjs.com/package/trainmanjs)
[![dependencies](https://img.shields.io/david/macku/trainmanjs.svg)](package.json)
[![dev dependencies](https://img.shields.io/david/dev/macku/trainmanjs.svg)](package.json)


# TrainmanJS

TrainmanJS is [Cross-Origin Communication Library](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing). It's a
wrapper for the native [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) API.

It allows you to send bidirectional **Topics** and **Messages** between the **iframes** and wrapper (parent) window.

## Features

 - Topics and messages
  
   You can listen to different kind of topics and message to it. You have control to which frame you would like to send
   a message. What is also important, the parent frame knows exactly which child frame did send the message. Thanks to
   that you can omit some topics from particular recipients inside your topic listener.
 
 - Lazy loading
 
   Thanks to the queuing mechanism and buffer you can start sending messages immediately.
   You can send a message from the wrapper (parent) window to the child iframe even it's still loading.
   Queued messages will be delivered once the connection is established.
   
 - Reconnection (upcoming)
 
   Reconnect with the child iframe even if it will reload itself. During the reconnection, Trainman will queue messages
   in his buffer. Queued messages will be delivered once the connection is established again.
   
  - Bulk operation (upcoming)
   
    Post a message to all child frames at once. Don't need to specify an exact recipient. You can use the **'*'** symbol
    for sending a message to all of the connect children frames.
    
  - Log mode (upcoming)
  
    Easily turn on and off logging mechanism. Thanks to that you debug your code and application in a much more simple
    way.

## How to install

### NPM

You can install the library using **NPM**:

```bash
npm install trainmanjs
```

Next, you can import **TrainmanJS** module into your app:

```js
import Trainman from 'trainmnajs';
```

For the child pages (frames) you should import **Passenger** class:

```js
import { Passenger } from 'trainmnajs';
````

### Using CDN

You can also use the **CDN** service ex. [unpkg.com](https://unpkgs.com) or [npm-cdn.herrokuapp.com](http://npm-cdn.herokuapp.com/trainmanjs@0.2.0/lib/trainmanjs.js)

```html
<script src="https://unpkg.com/trainmanjs"></script>

<!-- or -->

<script src="http://npm-cdn.herokuapp.com/trainmanjs@0.2.0/lib/trainmanjs.js"></script>
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
1. [Check simple example](https://cdn.rawgit.com/macku/trainmanjs/ba192230/examples/simple/index.html) how to use Trainman
2. [Here you can find the source code](/examples/simple/) for the the above example
