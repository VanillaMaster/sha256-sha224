import { __H, __W, __block, __blockOffset, __buffer, __bufferOffset, __byteLength, byteToHex, sha224_H, sha256_H } from "./constants.js";
import { uint32ToUint8ArrayBE, uint8ArrayToUint32BE, uint8TailToUint32BE } from "./common.js";
import { CryptoHasher_LE, finalize_LE } from "./commonLE.js";

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
 * const hasher = new Sha224();
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
export class Sha224 extends CryptoHasher_LE {
    constructor() {
        super(sha256_H);
    }

    /**
     * Finalize the hash,
     * optionally method can write the hash into a pre-existing `Uint8Array` instance.
     * 
     * @param { Uint8Array } [out] array to write has into (28 byts)
     */
    digest(out = new Uint8Array(28)) {
        const H = this.H;
        finalize_LE(this.block8, this.block32, H, this.W, this.blockOffset, this.byteLength);
        for (let i = 0; i < 8; i++) uint32ToUint8ArrayBE(H[i], out, i * 4);
        return out;
    }

    /**
     * alias for `stringify` function
     */
    static stringify = stringify;
}

/**
 * convert 28-bit hash into hex string
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
        byteToHex[source[0x1B]]
    ).toLowerCase();
}