// define a separate name space through a separate module
export const _ = undefined;

const main = async () => {
    console.log("[main]: start");

    for (let i = 1; i <= 3; i++) {
        console.log("   [loop]: start " + i);

        setTimeout(() => console.log("   [timer]: " + i), 0);

        console.log("   [loop]: pause...");

        // pause loop execution
        const result = await f(i);

        console.log("   [loop]: " + result);

        console.log("   [loop]: end " + i);
    }

    console.log("[main]: end");
};

const f = async (i: number): Promise<Promise<string>> => {
    return new Promise((resolve) => {
        console.log("   [async]: start " + i);
        setTimeout(() => {
            console.log("       [async]: resolve " + i);
            resolve("result from await " + i);
        }, 0);
    });
};

main();

// "main()" is effectively equivalent to:
const mainPromisified = () => {
    return Promise.resolve().then(() => {
        // main body's part before loop with awaits
        console.log("[main]: start");

        let promise = Promise.resolve();

        for (let i = 1; i <= 3; i++) {
            promise = promise
                .then(() => {
                    // loop body's part before await
                    console.log("   [loop]: start " + i);

                    setTimeout(() => console.log("   [timer]: " + i), 0);

                    console.log("   [loop]: pause...");
                })
                .then(() => {
                    // loop body's part after await

                    // Next "then" callbacks that we about to chain in the next loop's iterations won't be queued onto a microtask queue until a promise returned from "f()" is resolved
                    // And the promise returned from "f()" won't be resolved until we execute the timer we use internally for it
                    // So at this point there are no more microtasks might be scheduled in this loop iteration and event loop is forced to proceed to the Timers phase
                    return f(i).then((result) => {
                        console.log("   [loop]: " + result);

                        console.log("   [loop]: end " + i);
                    });
                });
        }

        // main body's part after loop with awaits
        promise.then(() => {
            console.log("[main]: end");
        });
    });
};

// mainPromisified();

/*
Expected output:

[main]: start
   [loop]: start 1
   [loop]: pause...
   [async]: start 1
   [timer]: 1
       [async]: resolve 1
   [loop]: result from await 1
   [loop]: end 1
   [loop]: start 2
   [loop]: pause...
   [async]: start 2
   [timer]: 2
       [async]: resolve 2
   [loop]: result from await 2
   [loop]: end 2
   [loop]: start 3
   [loop]: pause...
   [async]: start 3
   [timer]: 3
       [async]: resolve 3
   [loop]: result from await 3
   [loop]: end 3
[main]: end
*/
