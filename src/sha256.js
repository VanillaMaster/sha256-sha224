import { __H, __W, __block, __byteLength, __blockOffset, __buffer, byteToHex, sha256_H, __bufferOffset } from "./constants.js";
import { finalize, hash, uint32ToUint8ArrayBE, uint8ArrayToUint32BE, uint8TailToUint32BE } from "./utils.js";



export class SHA256 {
    constructor(){}
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
     * @type { number[] }
     */
    [__block] = new Array(16);
    /**
     * @type { number[] }
     */
    [__buffer] = new Array(4);
    /**
     * @type { number[] }
     */
    [__W] = new Array(64);
    /**
     * @type { number[] }
     */
    [__H] = Array.from(sha256_H);

    /**
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
                    default: debugger;
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
                default: debugger;
            }
            this[__bufferOffset] = 0;
            block[blockOffset++] = uint8ArrayToUint32BE(buffer, 0);
            if (blockOffset === 16) {
                hash(this[__H], this[__W], block);
                blockOffset = 0;
            }
        }

        const l = data.length - 4;
        for (; i <= l; i += 4) {
            block[blockOffset++] = uint8ArrayToUint32BE(data, i);
            if (blockOffset == 16) {
                hash(this[__H], this[__W], block);
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
            default: debugger;
        }
    }

    /**
     * @param { Uint8Array } [out] 
     */
    digest(out = new Uint8Array(32)) {
        const H = this[__H];
        finalize(this[__block], this[__buffer], H, this[__W], this[__blockOffset], this[__bufferOffset], this[__byteLength]);
        for (let i = 0; i < 8; i++) uint32ToUint8ArrayBE(H[i], out, i * 4);
        return out;
    }

    /**
     * @param { Uint8Array } source 
     */
    static from(source) {
        return sha256(source);
    }
}

/**
 * @param { Uint8Array } source 
 */
export function sha256(source) {
    const msgLength = source.byteLength;
    const payloadLength = msgLength + 1;
    const payloadBlocks = Math.ceil(payloadLength / 64);

    /**@type { number[] } */
    const block = new Array(16);
    /**@type { number[] } */
    const W = new Array(64);
    /**@type { number[] } */
    const H = Array.from(sha256_H);
    
    {
        let byteIndex = 0;
        const nonLastBlocks = payloadBlocks - 1;
        for (let i = 0; i < nonLastBlocks; i++) {
            for (let j = 0; j < 16; j++) {
                block[j] =  uint8ArrayToUint32BE(source, byteIndex);
                byteIndex += 4;
            }
            hash(H, W, block);
        }
        {
            const boundaries = msgLength - 3;
            let blockIndex = 0;
            for (;byteIndex < boundaries; blockIndex++, byteIndex += 4) {
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
    // return result.buffer;
    return result;
}

/**
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