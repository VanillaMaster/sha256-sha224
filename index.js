import { sha224, stringify as stringify224 } from "./src/sha224.js";
import { sha256, stringify as stringify256 } from "./src/sha256.js";


// const encoder = new TextEncoder();

// const text = "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio sunt nobis consequatur commodi debitis, provident incidunt quisquam voluptatibus suscipit ipsa dolor accusamus quae! Molestias cumque ad architecto. Voluptas, necessitatibus accusantium?"

// for (let i = 0; i < 10_000; i++) {
//     const val = stringify256(new Uint8Array(sha256(encoder.encode(text))));
//     if (val !== "19fe88ee8d9148aad14cf036f7065e2806c774645f4086091b2537f7bad6892f") throw new Error();
// }

// const hash = sha256(new Uint8Array([97, 97, 97, 97]));
// console.log(hash)
// debugger

/**
 * 
 * @param { { readonly length: number; [n: number]: number } } source 
 * @param { number } i 
 * @param { number } j 
 */
function swap(source, i, j) {
    let tmp = source[i];
    source[i] = source[j];
    source[j] = tmp;
}

/**
 * @param { ArrayLike<number> } key 
 */
function KSA(key) {
    const K = new Uint8Array(256);
    for (let i = 0; i < K.length; i++) K[i] = i;

    let j = 0;
    for (let i = 0; i < K.length; i++) {
        j = (j + K[i] + key[i % key.length]) % 256;

        swap(K, i, j);
    }
  
    return K;
}

/**
 * @param { ArrayLike<number> } S 
 * @returns { Generator<number, never, never> }
 */
function* PRGA(S) {
    let i = 0, j = 0;
    while (true) {
        i = (i + 1) % 256
        j = (j + S[i]) % 256

        swap(S, i, j);
        yield S[(S[i] + S[j]) % 256];
    }
}

/**
 * @template T
 * @param { Generator<T, never, never> } iterator 
 * @param { number } length 
 */
function unpack(iterator, length) {
    /**@type { T[] } */
    const result = new Array(length);
    for (let i = 0; i < length; i++) {
        result[i] = iterator.next().value;
    }
    return result
}

const bytes = new Uint8Array(unpack(PRGA(KSA([0])), 4));
const expected = Buffer.from("841267bd4110e1b634e17cd019abc6ae4f9a6dd097fb063000c1615a643b5463", "hex");
const hash = new Uint8Array(sha256(bytes));
debugger