import { K, sha256_H } from "./constants.js"
import { Σ0, Σ1, σ0, σ1, Ch, Maj, uint32ToUint8ArrayBE } from "./common.js"

export class CryptoHasher_LE {
    /**
     * @param { Uint32Array } init 
     */
    constructor(init) {
        this.H.set(init);
    }
    
    block8  = new Uint8Array(64);
    block32 = new Uint32Array(this.block8.buffer);

    W = new Uint32Array(64);
    H = new Uint32Array(8);

    blockOffset = 64;

    byteLength = 0;

    /**
     * Update the hash with data
     * 
     * @param { Uint8Array } data 
     */
    update(data) {
        if (data.length === 0) return;
        this.byteLength += data.byteLength;

        const block8 = this.block8;
        const block32 = this.block32;
        const H = this.H;
        const W = this.W;
        let j = this.blockOffset;
        for (let i = 0; i < data.length; i++) {
            block8[--j] = data[i];
            if (j === 0) {
                j = 64;
                hash_LE(H, W, block32);
            }
        }
        this.blockOffset = j;
    }
}

/**
 * @param { Uint8Array } block8 
 * @param { Uint32Array } block32
 * @param { Uint32Array } H 
 * @param { Uint32Array } W 
 * @param { number } blockOffset 
 * @param { number } byteLength 
 */
export function finalize_LE(block8, block32, H, W, blockOffset, byteLength) {
    block8[--blockOffset] = 0x80;
    if (blockOffset < 8) {
        block8.fill(0, 0, blockOffset);
        hash_LE(H, W, block32);
        blockOffset = 64;
    }
    block32[0] = ((byteLength << 3) >>> 0);
    block32[1] = (byteLength >>> 29);
    block8.fill(0, 8, blockOffset);
    hash_LE(H, W, block32);
}

/**
 * @param { Uint32Array } W 
 * @param { Uint32Array } block 
 */
function initW_LE(W, block) {
    W[0x0] = block[0xF];
    W[0x1] = block[0xE];
    W[0x2] = block[0xD];
    W[0x3] = block[0xC];
    W[0x4] = block[0xB];
    W[0x5] = block[0xA];
    W[0x6] = block[0x9];
    W[0x7] = block[0x8];
    W[0x8] = block[0x7];
    W[0x9] = block[0x6];
    W[0xA] = block[0x5];
    W[0xB] = block[0x4];
    W[0xC] = block[0x3];
    W[0xD] = block[0x2];
    W[0xE] = block[0x1];
    W[0xF] = block[0x0];
}

/**
 * @param { Uint32Array } H 
 * @param { Uint32Array } W 
 * @param { Uint32Array } block 
 */
function hash_LE(H, W, block) {

    // for (let t = 0; t < 16; t++) W[t] = block[t];
    initW_LE(W, block);

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

export class Sha256__ extends CryptoHasher_LE {
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
        // const H = this[__H];
        // finalize(this[__block], this[__buffer], H, this[__W], this[__blockOffset], this[__bufferOffset], this[__byteLength]);
        // for (let i = 0; i < 8; i++) uint32ToUint8ArrayBE(H[i], out, i * 4);
        // return out;
        const H = this.H;
        finalize_LE(this.block8, this.block32, H, this.W, this.blockOffset, this.byteLength);
        for (let i = 0; i < 8; i++) uint32ToUint8ArrayBE(H[i], out, i * 4);
        return out;
    }
}