import { K, __H, __W, __block, __blockOffset, __buffer, __bufferOffset, __byteLength } from "./constants.js";
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

/**
 * @param { Uint32Array } H 
 * @param { Uint32Array } W 
 * @param { Uint32Array } block 
 */
export function hash(H, W, block) {
    for (let t = 0; t < 16; t++) W[t] = block[t];

    for (let t = 16; t < 64; t++) W[t] = (σ1(W[t - 2]) + W[t - 7] + σ0(W[t - 15]) + W[t - 16]) >>> 0;

    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];

    for (let t = 0; t < 64; t++) {
        const T1 = (h + Σ1(e) + Ch(e, f, g) + K[t] + W[t]) >>> 0;
        const T2 = (Σ0(a) + Maj(a, b, c)) >>> 0;

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

/**
 * @param { Uint32Array } block 
 * @param { Uint8Array } buffer 
 * @param { Uint32Array } H 
 * @param { Uint32Array } W 
 * @param { number } blockOffset 
 * @param { number } bufferOffset 
 * @param { number } byteLength 
 */
export function finalize(block, buffer, H, W, blockOffset, bufferOffset, byteLength) {
    block[blockOffset++] = uint8TailToUint32BE(buffer, 0, bufferOffset, 0x80)
    if (blockOffset > 14) {
        block.fill(0, blockOffset);
        hash(H, W, block);
        block.fill(0, 0, 14);
    } else {
        block.fill(0, blockOffset, 14);
    }
    block[14] = (byteLength >>> 29);
    block[15] = ((byteLength << 3) >>> 0);
    hash(H, W, block);
}

export class CryptoHasher {
    /**
     * @param { ReadonlyArrayLike<number>} init 
     */
    constructor(init) {
        this[__H].set(init);
    }
    /**
     * @type { Uint32Array }
     */
    [__H] = new Uint32Array(8);
    /**
     * @type { number }
     */
    [__byteLength] = 0;
    /**
     * @type { number }
    */
    [__blockOffset] = 0;
    /**
     * @type { number }
     */
    [__bufferOffset] = 0;
    /**
     * @type { Uint32Array }
     */
    [__block] = new Uint32Array(16);//new Array(16);
    /**
     * @type { Uint8Array }
     */
    [__buffer] = new Uint8Array(4);//new Array(4);
    /**
     * @type { Uint32Array }
     */
    [__W] = new Uint32Array(64);//new Array(64);

    /**
     * Update the hash with data
     * 
     * @param { Uint8Array } data 
     */
    update(data) {
        if (data.length === 0) return;

        this[__byteLength] += data.byteLength;

        let i = 0;
        let blockOffset = this[__blockOffset];

        const bufferOffset = this[__bufferOffset];
        const block = this[__block];
        const buffer = this[__buffer];
        const H = this[__H];
        const W = this[__W];

        if (bufferOffset !== 0) {
            if (data.length < (4 - bufferOffset)) {
                switch (data.length) {
                    case 1:
                        buffer[bufferOffset] = data[0];
                        this[__bufferOffset] = bufferOffset + 1;
                        break;
                    case 2:
                        buffer[1] = data[0];
                        buffer[2] = data[1];
                        this[__bufferOffset] = 3;
                        break;
                    default: throw new Error("unreachable");
                }
                return;
            }
            switch (bufferOffset) {
                case 1:
                    buffer[1] = data[0];
                    buffer[2] = data[1];
                    buffer[3] = data[2];
                    i = 3;
                    break;
                case 2:
                    buffer[2] = data[0];
                    buffer[3] = data[1];
                    i = 2;
                    break;
                case 3:
                    buffer[3] = data[0];
                    i = 1;
                    break;
                default: throw new Error("unreachable");
            }
            this[__bufferOffset] = 0;
            block[blockOffset++] = uint8ArrayToUint32BE(buffer, 0);
            if (blockOffset === 16) {
                hash(H, W, block);
                blockOffset = 0;
            }
        }

        const l = data.length - 4;
        for (; i <= l; i += 4) {
            block[blockOffset++] = uint8ArrayToUint32BE(data, i);
            if (blockOffset == 16) {
                hash(H, W, block);
                blockOffset = 0;
            }
        }
        this[__blockOffset] = blockOffset;
        switch (data.length - i) {
            case 0:
                break;
            case 1:
                buffer[0] = data[i];
                this[__bufferOffset] = 1;
                break;
            case 2:
                buffer[0] = data[i];
                buffer[1] = data[i + 1];
                this[__bufferOffset] = 2;
                break;
            case 3:
                buffer[0] = data[i];
                buffer[1] = data[i + 1];
                buffer[2] = data[i + 2];
                this[__bufferOffset] = 3;
                break;
            default: throw new Error("unreachable");
        }
    }
}