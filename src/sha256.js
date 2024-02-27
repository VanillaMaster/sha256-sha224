import { byteToHex } from "./constants.js";
import { hash, uint32ToUint8ArrayBE, uint8ArrayToUint32BE, uint8TailToUint32BE } from "./utils.js";

const uint64buffer = new ArrayBuffer(8);
const uint64view = new DataView(uint64buffer);

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
    const H = [
        0x6a09e667,
        0xbb67ae85,
        0x3c6ef372,
        0xa54ff53a,
        0x510e527f,
        0x9b05688c,
        0x1f83d9ab,
        0x5be0cd19
    ];
    
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
            const boundaries = msgLength - 4;
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
            uint64view.setBigUint64(0, BigInt(msgLength) * 8n, false);
            const lenHigh = uint64view.getUint32(0, false);
            const lenLow = uint64view.getUint32(4, false);
    
            block[14] = lenHigh;
            block[15] = lenLow;
            hash(H, W, block);
        }
    }

    const result = new Uint8Array(32);
    for (let i = 0; i < 8; i++) {
        uint32ToUint8ArrayBE(H[i], result, i * 4);
    }
    return result.buffer;
}

/**
 * @param { Uint8Array } source 
 */
export function stringify(source) {
    return (
        byteToHex[source[0]] +
        byteToHex[source[1]] +
        byteToHex[source[2]] +
        byteToHex[source[3]] +
        byteToHex[source[4]] +
        byteToHex[source[5]] +
        byteToHex[source[6]] +
        byteToHex[source[7]] +
        byteToHex[source[8]] +
        byteToHex[source[9]] +
        byteToHex[source[10]] +
        byteToHex[source[11]] +
        byteToHex[source[12]] +
        byteToHex[source[13]] +
        byteToHex[source[14]] +
        byteToHex[source[15]] +
        byteToHex[source[16]] +
        byteToHex[source[17]] +
        byteToHex[source[18]] +
        byteToHex[source[19]] +
        byteToHex[source[20]] +
        byteToHex[source[21]] +
        byteToHex[source[22]] +
        byteToHex[source[23]] +
        byteToHex[source[24]] +
        byteToHex[source[25]] +
        byteToHex[source[26]] +
        byteToHex[source[27]] +
        byteToHex[source[28]] +
        byteToHex[source[29]] +
        byteToHex[source[30]] +
        byteToHex[source[31]]
    ).toLowerCase();
}