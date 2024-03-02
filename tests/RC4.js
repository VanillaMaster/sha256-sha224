/**
 * @param { { readonly length: number; [n: number]: number } } source 
 * @param { number } i 
 * @param { number } j 
 */
export function swap(source, i, j) {
    let tmp = source[i];
    source[i] = source[j];
    source[j] = tmp;
}

/**
 * @param { ArrayLike<number> } key 
 */
export function KSA(key) {
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
export function* PRGA(S) {
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
 * @template { { readonly length: number; [n: number]: T; } } O
 * @param { Generator<T, never, never> } iterator 
 * @param { O } out 
 */
export function unpack(iterator, out) {
    for (let i = 0; i < out.length; i++) {
        out[i] = iterator.next().value;
    }
    return out
}