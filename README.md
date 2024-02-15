# node-threads
Implementing C#-Style Threading (as minimal as possible) to Node.JS by utilizing the way Node.JS Workers work!

#### Installation:
Use the command `npm i cithread`

#### Usage:
```js
const Thread = require( 'cithread' );

function Thread1Func () {
    let i;
    for ( i = 0; i < 10000; i++ ) {
        // Do literally nothing. :3
    }
    return `Hello World: ${i}`;
}

let myThread = new Thread( Thread1Func );

( async () => console.log( await myThread.run() ) )();
```
