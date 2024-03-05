import { __H, __W, __block, __blockOffset, __buffer, __bufferOffset, __byteLength } from "./constants.js";
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
    target[offset + 0] = (value >>> 0x18) & 0xff;
    target[offset + 1] = (value >>> 0x10) & 0xff;
    target[offset + 2] = (value >>> 0x08) & 0xff;
    target[offset + 3] = (value >>> 0x00) & 0xff;
}

/**
 * @param { ReadonlyArrayLike<number> } source 
 * @param { number } offset
 */
export function uint8ArrayToUint32BE(source, offset) {
    return (
        (source[offset + 0] << 0x18) |
        (source[offset + 1] << 0x10) |
        (source[offset + 2] << 0x08) |
        (source[offset + 3] << 0x00)
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
                (last << 0x18)
            ) >>> 0;
        case 1:
            return (
                (source[offset + 0] << 0x18) |
                (last << 0x10)
            ) >>> 0
        case 2:
            return (
                (source[offset + 0] << 0x18) |
                (source[offset + 1] << 0x10) |
                (last << 0x08)
            ) >>> 0
        case 3:
            return (
                (source[offset + 0] << 0x18) |
                (source[offset + 1] << 0x10) |
                (source[offset + 2] << 0x08) |
                (last << 0x00)
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