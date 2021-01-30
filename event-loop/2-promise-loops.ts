// define a separate name space through a separate module
export const _ = undefined;

const main = () => {
    console.log("[main]: start");

    for (let i = 1; i <= 3; i++) {
        console.log(`   [loop]: ${i} start`);

        // executed immediately, synchronously
        // executed in a task context
        new Promise((resolve: (value: number) => void) => {
            console.log(`   [promise]: ${i}`);
            resolve(i); // queue corresponding then callback
        })
            .then((res: number) => {
                console.log(`       [resolve]: ${res}`);
                return res * 10 + res; // queue next then callback
            })
            .then((res) => {
                console.log(`           [resolve]: ${res}`);
            });

        console.log(`   [loop]: ${i} end`);
    }

    /*
    Scheduled callbacks once loop is done:
        - MicrotaskQueue: resolve-1, resolve-2, resolve-3
    */

    console.log("[main]: end");
};

main();

/*
MicrotaskQueue states after each microtask execution:
    - resolve-1, resolve-2, resolve-3
    - resolve-2, resolve-3, resolve-11
    - resolve-3, resolve-11, resolve-22
    - resolve-11, resolve-22, resolve-33
    - resolve-22, resolve-33
    - resolve-33
    -
*/

/*
Expected output:

[main]: start
    [loop]: 1 start
    [promise]: 1
    [loop]: 1 end
    [loop]: 2 start
    [promise]: 2
    [loop]: 2 end
    [loop]: 3 start
    [promise]: 3
    [loop]: 3 end
[main]: end
        [resolve]: 1
        [resolve]: 2
        [resolve]: 3
            [resolve]: 11
            [resolve]: 22
            [resolve]: 33
*/
