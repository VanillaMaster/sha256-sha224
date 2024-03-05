import { __H, __W, __block, __byteLength, __blockOffset, __buffer, byteToHex, __bufferOffset, sha256_H } from "./constants.js";
import { CryptoHasher, finalize, hash, uint32ToUint8ArrayBE, uint8ArrayToUint32BE, uint8TailToUint32BE } from "./common.js";

/**
 * Utility class that lets you incrementally compute a hash.
 * 
 * #### Example:
 * 
 * ```JavaScript
 * const text = "Lorem ipsum dolor sit, amet consectetur adipisicing elit."
 * 
 * const encoder = new TextEncoder();
 * const data = encoder.encode(text);
 * const hasher = new Sha256();
 * hasher.update(data);
 * const hashBuffer = hasher.digest();
 * const hash = stringify(hashBuffer);
 * ```
 * 
 * #### Reference:
 * 
 * [SHA RFC](https://www.rfc-editor.org/rfc/rfc4634.html)
 * 
 * #### Notes:
 *  * inernaly used 4 arrays (length of 4, 8, 16 and 64),
 *    so creation of class instance produce 5
 *    (6 if `digest` method called without passing pre-existing container) objects,
 *    which must be garbage collected at the end, if performance is critical
 *    ~pure javascript implementation should not be used~
 *    internal counters could be setted to `0` manually
 *    (`__byteLength`, `__blockOffset`, `__bufferOffset`),
 *    to allow re-use of existing instance.
 */
export class Sha256 extends CryptoHasher {
    constructor() {
        super(sha256_H);
    }

    /**
     * Finalize the hash,
     * optionally method can write the hash into a pre-existing `Uint8Array` instance.
     * 
     * @param { Uint8Array } [out] array to write has into (32 byts)
     */
    digest(out = new Uint8Array(32)) {
        const H = this[__H];
        finalize(this[__block], this[__buffer], H, this[__W], this[__blockOffset], this[__bufferOffset], this[__byteLength]);
        for (let i = 0; i < 8; i++) uint32ToUint8ArrayBE(H[i], out, i * 4);
        return out;
    }

    /**
     * alias for `sha256` function
     */
    static from = sha256;

    /**
     * alias for `stringify` function
     */
    static stringify = stringify;
}

/**
 * non-incremental sha-256 implementation,
 * should be prefered over incremental implementation
 * if all data containd in single chunk.
 * 
 * #### Example:
 * 
 * ```JavaScript
 * const text = "Lorem ipsum dolor sit, amet consectetur adipisicing elit."
 * const encoder = new TextEncoder();
 * const data = encoder.encode(text);
 * const hashBuffer = sha256(data);
 * const hash = stringify(hashBuffer);
 * ```
 * 
 * #### Reference:
 * 
 * [SHA RFC](https://www.rfc-editor.org/rfc/rfc4634.html)
 * 
 * @param { Uint8Array } source 
 */
export function sha256(source) {
    const msgLength = source.byteLength;
    const payloadLength = msgLength + 1;
    const payloadBlocks = Math.ceil(payloadLength / 64);

    /**@type { Uint32Array } */
    const block = new Uint32Array(16);//new Array(16);
    /**@type { Uint32Array } */
    const W = new Uint32Array(64);//new Array(64);
    /**@type { Uint32Array } */
    const H = new Uint32Array(8);//[0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    H.set(sha256_H);

    {
        let byteIndex = 0;
        const nonLastBlocks = payloadBlocks - 1;
        for (let i = 0; i < nonLastBlocks; i++) {
            for (let j = 0; j < 16; j++) {
                block[j] = uint8ArrayToUint32BE(source, byteIndex);
                byteIndex += 4;
            }
            hash(H, W, block);
        }
        {
            const boundaries = msgLength - 3;
            let blockIndex = 0;
            for (; byteIndex < boundaries; blockIndex++, byteIndex += 4) {
                block[blockIndex] = uint8ArrayToUint32BE(source, byteIndex);
            }
            block[blockIndex] = uint8TailToUint32BE(source, byteIndex, msgLength % 4, 0x80);
            if (blockIndex >= 14) {
                block.fill(0, blockIndex + 1);
                hash(H, W, block);
                block.fill(0, 0, 14);
            } else {
                block.fill(0, blockIndex + 1, 14);
            }

            block[14] = (msgLength >>> 29);
            block[15] = ((msgLength << 3) >>> 0);

            hash(H, W, block);
        }
    }

    const result = new Uint8Array(32);
    for (let i = 0; i < 8; i++) {
        uint32ToUint8ArrayBE(H[i], result, i * 4);
    }
    return result;
}

/**
 * convert 32-bit hash into hex string
 * @param { Uint8Array } source 
 */
export function stringify(source) {
    return (
        byteToHex[source[0x00]] +
        byteToHex[source[0x01]] +
        byteToHex[source[0x02]] +
        byteToHex[source[0x03]] +
        byteToHex[source[0x04]] +
        byteToHex[source[0x05]] +
        byteToHex[source[0x06]] +
        byteToHex[source[0x07]] +
        byteToHex[source[0x08]] +
        byteToHex[source[0x09]] +
        byteToHex[source[0x0A]] +
        byteToHex[source[0x0B]] +
        byteToHex[source[0x0C]] +
        byteToHex[source[0x0D]] +
        byteToHex[source[0x0E]] +
        byteToHex[source[0x0F]] +
        byteToHex[source[0x10]] +
        byteToHex[source[0x11]] +
        byteToHex[source[0x12]] +
        byteToHex[source[0x13]] +
        byteToHex[source[0x14]] +
        byteToHex[source[0x15]] +
        byteToHex[source[0x16]] +
        byteToHex[source[0x17]] +
        byteToHex[source[0x18]] +
        byteToHex[source[0x19]] +
        byteToHex[source[0x1A]] +
        byteToHex[source[0x1B]] +
        byteToHex[source[0x1C]] +
        byteToHex[source[0x1D]] +
        byteToHex[source[0x1E]] +
        byteToHex[source[0x1F]]
    ).toLowerCase();
}