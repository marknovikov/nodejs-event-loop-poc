// define a separate name space through a separate module
export const _ = undefined;

const main = async () => {
    console.log("[main]: start");

    // queues timer callback
    setTimeout(() => {
        console.log("[timer]: 1");
    }, 0);

    // immediately queues one microtask "resolve-1"
    // "resolve-1" in turn, once current caller function execution context is paused immediately executes and queues microtask "resolve-2"
    new Promise((resolve) => {
        console.log("   [promise]: 1");
        resolve(undefined);
    })
        .then(() => console.log("       [resolve]: 1"))
        .then(() => console.log("       [resolve]: 2"));

    console.log("[main]: pause...");

    // await does two things:
    // 1. Pauses current caller function execution context
    // 2. Resumes current caller execution context once the promise returned from "f()" is settled
    //
    // In between steps 1 and 2 event loop is free to continue looping through it's phases executing pending callbacks from other queues as usual
    // That is why "timer-1" is executed in the meanwhile, before await, which internally queues another timer callback, returns
    //
    // Nothing below this line gets executed unless the "f()" is resolved
    const result = await f();

    console.log("[main]: continue...");

    console.log("[main]: " + result);

    console.log("[main]: end");
};

const f = async (): Promise<Promise<string>> => {
    // wrapping returned promise into another one to imitate asyncronous task resolved to some result
    return new Promise<string>((resolve) => {
        console.log("   [async]: start");
        setTimeout(() => {
            console.log("       [async]: resolve");
            resolve("result from await");
        }, 0);
    }).then((res) => {
        console.log("       [async]: microtask");
        return res;
    });
};

// main();

// Main is effectively equivalent to:
const mainPromisified = () => {
    // any "async" function's body is wrapped into callback to "new Promise"
    return Promise.resolve().then(() => {
        console.log("[main]: start");

        setTimeout(() => {
            console.log("[timer]: 1");
        }, 0);

        new Promise((resolve) => {
            console.log("   [promise]: 1");
            resolve(undefined);
        })
            .then(() => console.log("       [resolve]: 1"))
            .then(() => console.log("       [resolve]: 2"));

        console.log("[main]: pause...");

        // any "await" call is translated to chaining the rest of the caller's body as a callback to returned promise's "then"
        f().then((result) => {
            console.log("[main]: continue...");

            console.log("[main]: " + result);

            console.log("[main]: end");
        });
    });
};

mainPromisified();

/*
MicrotaskQueue states after each microtask execution:
    - resolve-1
    - resolve-2
    - async-microtask
    - 
*/

/*
Expected output:

[main]: start
    [promise]: 1
[main]: pause...
    [async]: start
        [resolve]: 1
        [resolve]: 2
[timer]: 1
        [async]: resolve
        [async]: microtask
[main]: continue...
[main]: result from await
[main]: end
*/
