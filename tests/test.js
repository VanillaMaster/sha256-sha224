import { createReadStream } from "node:fs"
import { createInterface } from "node:readline";
import test from 'node:test';

import { KSA, PRGA, unpack } from "./RC4.js"
import { Sha256, stringify } from "../src/sha256.js";
import { strict as assert } from "node:assert";


/**
 * @param { string } source 
 */
function fromHex(source){
    if ((source.length & 0b1) === 1) throw new Error();
    const buffer = new Uint8Array(source.length >>> 1);
    for (let i = 0, j = 0, k = 2; i < buffer.length; i++, j = k, k += 2) {
        buffer[i] = Number.parseInt(source.substring(j, k), 16);
    }
    return buffer;
}

const fileStream = createReadStream("./tests/SHAd256_Test_Vectors.txt");
const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

for await (const line of rl) {
    if (!line.startsWith(":")) continue;
    const [identifier, __octetLength, input, SHA_256, SHA_d_256] = line.substring(1).split(" ");
    const octetLength = Number(__octetLength);

    
    
    await test(`${identifier}`, function(t) {
        switch (input) {
            case "RC4": {
                const buffer = new Uint8Array(35);
                const hasher = new Sha256();
                let i = 0, l = octetLength - 35;
                const iter = PRGA(KSA([0]));
                for (; i <= l; i+= 35) {
                    unpack(PRGA(KSA([0])), buffer);
                    hasher.update(unpack(iter, buffer));
                }
                l = octetLength - i;
                if (l > 0) {
                    const __buffer = new Uint8Array(buffer.buffer, buffer.byteOffset, l);
                    hasher.update(unpack(iter, __buffer));
                }
                const hashBuffer = hasher.digest();
                const hash = stringify(hashBuffer);
                if (hash !== SHA_256) debugger
                assert.deepEqual(hash, SHA_256, "sha256");
            } break;
            case "MILLION_a": {
                const source = new Uint8Array(1_000_000).fill(97);
    
                const hasher = new Sha256();
                hasher.update(source);
                const hashBuffer = hasher.digest();
                const hash = stringify(hashBuffer);
                assert.deepEqual(hash, SHA_256, "sha256");
            } break;
            default: {
                const source = new Uint8Array(fromHex(input));
    
                const hasher = new Sha256();
                hasher.update(source);
                const hashBuffer = hasher.digest();
                const hash = stringify(hashBuffer);
                assert.deepEqual(hash, SHA_256, "sha256");
            } break;
        }
    })
}

