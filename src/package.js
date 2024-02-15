/*
    Threads
    Made for Node.JS to bring threading in a
    promise-based level.

    Made by Citrizon.
*/

const { Worker } = require( 'worker_threads' );

class OutwardsPromise {
    static create () {
        let resolve, reject;
        const promise = new Promise( ( res, rej ) => {
            resolve = res;
            reject = rej;
        } );
        return Object.assign( promise, { resolve, reject } );
    }
}

module.exports = class Thread {
    // Private Variables
    #_Function;
    #_EventHandlers;
    #_ReturnPromise;
    #_WorkerInstance;

    // Construct dat shiet
    constructor ( callable, options ) {
        this.#_Function = callable;
        this.#_EventHandlers = { };
        this.options = options ?? { };
    }

    // Handle Incoming Events in a private function
    #_EventHandlerFunction ( message ) {
        if ( !message.event ) throw new Error( 'Message posted in unknown format!' );
        ( this.#_EventHandlers[ message.event ] ??= [] ).forEach( e => e.call( this, message.data ) );
        if ( message.event == '__RETURN' ) this.#_ReturnPromise.resolve( message.data );
    }

    // Function Environment Constructor
    static #_FunctionConstructor ( functionString ) {
        return `
            const { parentPort, workerData } = require( 'worker_threads' );
            function post ( event, data ) { parentPort.postMessage( { event, data } ) }
            function sendMessage( data ) { post( 'message', data ) }
            parentPort.postMessage( { event: '__RETURN', data: (${ functionString }).call( parentPort, ...workerData ) } );
        `;
    }

    // Some event functions
    on( event, call ) {
        ( this.#_EventHandlers[event] ??= [] ).push( call );
    }
    off( event, call ) {
        delete ( this.#_EventHandlers[event] ??= [] )[ this.#_EventHandlers[event].at( call ) ];
    }

    // The god dayumh runner
    async run( ...args ) {
        this.#_ReturnPromise = OutwardsPromise.create();
        if ( this.#_WorkerInstance ) return false;
        this.#_WorkerInstance = new Worker( Thread.#_FunctionConstructor( this.#_Function.toString() ), { workerData: args, eval: true } );
        this.#_WorkerInstance.on( 'message', ( data ) => this.#_EventHandlerFunction( data ) );
        this.#_WorkerInstance.on( 'error', ( data ) => this.#_WorkerInstance.reject( data ) );
        let returnData = await this.#_ReturnPromise;
        await this.#_WorkerInstance.terminate();
        this.#_WorkerInstance = undefined;
        return returnData;
    }
}