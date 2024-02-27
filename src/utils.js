import { K } from "./constants.js";
/**
 * @template T
 * @typedef { { readonly length: number; [n: number]: T; } } ArrayLike 
 */
/**
 * @template T
 * @typedef { { readonly length: number; readonly [n: number]: T; } } ReadonlyArrayLike 
 */

/**
 * @param { number } value 
 * @param { ArrayLike<number> } target 
 * @param { number } offset 
 */
export function uint32ToUint8ArrayBE(value, target, offset) {
    target[offset] = (value >>> 24) & 0xff;
    target[offset + 1] = (value >>> 16) & 0xff;
    target[offset + 2] = (value >>> 8) & 0xff;
    target[offset + 3] = (value >>> 0) & 0xff;
}

/**
 * @param { ReadonlyArrayLike<number> } source 
 * @param { number } offset
 */
export function uint8ArrayToUint32BE(source, offset) {
    return (
        (source[offset] << 24) |
        (source[offset + 1] << 16) |
        (source[offset + 2] << 8) |
        (source[offset + 3] << 0)
    ) >>> 0;
}

/**
 * @param { ReadonlyArrayLike<number> } source 
 * @param { number } offset 
 * @param { number } length 
 * @param { number } last 
 */
export function uint8TailToUint32BE(source, offset, length, last) {
    switch (length) {
        case 0:
            return (
                (last << 24)
            ) >>> 0;
        case 1:
            return (
                (source[offset] << 24) |
                (last << 16)
            ) >>> 0
        case 2:
            return (
                (source[offset] << 24) |
                (source[offset + 1] << 16) |
                (last << 8)
            ) >>> 0
        case 3:
            return (
                (source[offset] << 24) |
                (source[offset + 1] << 16) |
                (source[offset + 2] << 8) |
                (last << 0)
            ) >>> 0
        default:
            throw new Error("unreachable");
    }
}

/**
 * @param { number } n 
 * @param { number } x 
 */
function ROTR(n, x) {
    return (x >>> n) | (x << (32 - n));
}

/**@param { number } x */
export function Σ0(x) { return ROTR(2, x) ^ ROTR(13, x) ^ ROTR(22, x) }
/**@param { number } x */
export function Σ1(x) { return ROTR(6, x) ^ ROTR(11, x) ^ ROTR(25, x) }
/**@param { number } x */
export function σ0(x) { return ROTR(7, x) ^ ROTR(18, x) ^ (x >>> 3) }
/**@param { number } x */
export function σ1(x) { return ROTR(17, x) ^ ROTR(19, x) ^ (x >>> 10) }
/**
 * @param { number } x 
 * @param { number } y 
 * @param { number } z 
 */
export function Ch(x, y, z) { return (x & y) ^ (~x & z) }
/**
 * @param { number } x 
 * @param { number } y 
 * @param { number } z 
 */
export function Maj(x, y, z) { return (x & y) ^ (x & z) ^ (y & z) }

/**
 * @param { number[] } H 
 * @param { number[] } W 
 * @param { number[] } block 
 */
export function hash(H, W, block) {
    for (let t = 0; t < 16; t++) W[t] = block[t];

    for (let t = 16; t < 64; t++) W[t] = (σ1(W[t - 2]) + W[t - 7] + σ0(W[t - 15]) + W[t - 16]) >>> 0;

    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    
    for (let t = 0; t < 64; t++) {
        const T1 = h + Σ1(e) + Ch(e, f, g) + K[t] + W[t];
        const T2 = Σ0(a) + Maj(a, b, c);

        h = g;
        g = f;
        f = e;
        e = (d + T1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (T1 + T2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
}