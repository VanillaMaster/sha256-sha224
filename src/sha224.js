import { K, byteToHex } from "./constants.js";
import { uint32ToUint8ArrayBE, uint8ArrayToUint32BE, uint8TailToUint32BE, Σ0, Σ1, σ0, σ1, Ch, Maj} from "./utils.js"

const uint64buffer = new ArrayBuffer(8);
const uint64view = new DataView(uint64buffer);

/**
 * @param { Uint8Array } source 
 */
export function sha224(source) {
    const msgLength = source.byteLength;

    const payload = msgLength + 9;// 1 + 8
    const blocksLength = Math.ceil(payload / 64);
    const totalLength = blocksLength * 16;
    
    const buffer = new Array(totalLength);

    const full = Math.trunc(msgLength / 4);
    const remaining = msgLength % 4;

    for (let i = 0; i < full; i++) {
        buffer[i] = uint8ArrayToUint32BE(source, i * 4);
    }
    buffer[full] = uint8TailToUint32BE(source, full * 4, remaining, 0x80);

    uint64view.setBigUint64(0, BigInt(msgLength) * 8n, false);
    const lenHigh = uint64view.getUint32(0, false);
    const lenLow = uint64view.getUint32(4, false);

    buffer[totalLength - 2] = lenHigh;
    buffer[totalLength - 1] = lenLow;

    buffer.fill(0, full + 1, -2);

    const H = [
        0xC1059ED8,
        0x367CD507,
        0x3070DD17,
        0xF70E5939,
        0xFFC00B31,
        0x68581511,
        0x64F98FA7,
        0xBEFA4FA4
    ];

    const W = new Array(64);

    for (let i = 0; i < blocksLength; i++) {
        for (let t = 0; t < 16; t++) W[t] = buffer[(i * 16) + t];
        for (let t = 16; t < 64; t++) W[t] = (σ1(W[t - 2]) + W[t - 7] + σ0(W[t - 15]) + W[t - 16]) >>> 0;

        let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
        
        for (let t=0; t<64; t++) {
            const T1 = h + Σ1(e) + Ch(e, f, g) + K[t] + W[t];
            const T2 =     Σ0(a) + Maj(a, b, c);
            h = g;
            g = f;
            f = e;
            e = (d + T1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (T1 + T2) >>> 0;
        }

        H[0] = (H[0]+a) >>> 0;
        H[1] = (H[1]+b) >>> 0;
        H[2] = (H[2]+c) >>> 0;
        H[3] = (H[3]+d) >>> 0;
        H[4] = (H[4]+e) >>> 0;
        H[5] = (H[5]+f) >>> 0;
        H[6] = (H[6]+g) >>> 0;
        H[7] = (H[7]+h) >>> 0;
    }

    const result = new Uint8Array(28);
    for (let i = 0; i < 7; i++) {
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
        byteToHex[source[27]]
    ).toLowerCase();
}