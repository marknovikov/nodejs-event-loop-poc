// define a separate name space through a separate module
export const _ = undefined;

const main = () => {
    console.log("[main]: start");

    setImmediate(() => console.log("[check]: 1"));
    setTimeout(() => console.log("[timer]: 1"), 0);

    // callback to "then" always queued as microtask and executed asynchronously, even if the Promise is already resolved at the moment "then" is called
    Promise.resolve().then(() => {
        console.log("   [resolve]: 0");
    });

    // executed immediately, synchronously
    // executed in a task context
    const promise = new Promise((resolve) => {
        console.log("[promise]: 1");
        resolve(undefined);
    })
        .then(() => console.log("   [resolve]: 1")) // queued immediately once promise-1 is resolved
        .then(() => console.log("   [resolve]: 2"));

    setImmediate(() => console.log("[check]: 2")); // queued after resolve-1 is queued
    setTimeout(() => console.log("[timer]: 2"), 0);

    promise
        .then(() => {
            console.log("   [resolve]: 3");

            // executed immediately, synchronously
            // executed in a microtask context
            new Promise((resolve) => {
                console.log("       [promise]: 2");
                resolve(undefined);
            })
                .then(() => console.log("           [resolve]: 21"))
                .then(() => console.log("           [resolve]: 22")); // queued after 22 is done
        })
        .then(() => console.log("   [resolve]: 4")); // queued after 3 (hence, 21) is done

    // Executed after all the timer callbacks queued previously because internally queues a timer callback
    new Promise((resolve) => {
        setTimeout(resolve, 0);
    })
        .then(() => {
            console.log("   [resolve]: 5");

            // executed immediately, synchronously
            // executed in a microtask context
            const promise = new Promise((resolve) => {
                console.log("       [promise]: 3");
                resolve(undefined);
            });

            // These 2 callbacks will be queued simultaneously once "promise-3" is resolved
            promise.then(() => console.log("           [resolve]: 31"));
            promise.then(() => console.log("           [resolve]: 32"));
        })
        .then(() => console.log("   [resolve]: 6")); // hence "resolve-6" will be queued after both 31 and 32

    console.log("[main]: end");
};

main();

/*
Scheduled callbacks once main is done:

    - MicrotaskQueue: resolve-1
    - TimersQueue: timer-1, timer-2
    - CheckQueue: check-1, check-2
*/

/*
MicrotaskQueue states after each microtask execution:
    - resolve-0, resolve-1
    - resolve-1
    - resolve-2
    - resolve-3
    - resolve-3, resolve-21 // "resolve-21" is queued immediately while microtask "resolve-3" is still running
    - resolve-21, resolve-4 // and only once microtask "resolve-3" is resolved, microtask "resolve-4" is queued
    - resolve-4, resolve-22
    - resolve-22
    - 
    - resolve-5
    - resolve-31, resolve-32 // queued simultaneously while "resolve-5" is still running
    - resolve-31, resolve-32, resolve-6 // "resolve-6" is queued only once microtask "resolve-5" is resolved
    - resolve-32, resolve-6
    - resolve-6
    -
*/

/*
Expected output:

[main]: start
[promise]: 1
[main]: end
    [resolve]: 0
    [resolve]: 1
    [resolve]: 2
    [resolve]: 3
        [promise]: 2
            [resolve]: 21
    [resolve]: 4
            [resolve]: 22
[timer]: 1
[timer]: 2
[check]: 1
[check]: 2
    [resolve]: 5
            [resolve]: 31
            [resolve]: 32
        [resolve]: 6
*/
