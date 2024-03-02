import { createReadStream } from "node:fs"
import { createInterface } from "node:readline";
import { KSA, PRGA, unpack } from "./RC4.js"
import { SHA256, sha256, stringify } from "../src/sha256.js";
import { strict as assert } from "node:assert";
import { Buffer } from "node:buffer";

import test from 'node:test';

const fileStream = createReadStream("./tests/SHAd256_Test_Vectors.txt");
const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

/**@type { { [key: string]: (identifier: string, octetLength: number, inputData: string, SHA_256: string, SHA_d_256: string) => Uint8Array }} */
const wellKnownInputData = {
    "RC4"(identifier, octetLength, inputData, SHA_256, SHA_d_256){
        return new Uint8Array(unpack(PRGA(KSA([0])), octetLength));
    },
    "MILLION_a"(identifier, octetLength, inputData, SHA_256, SHA_d_256) {
        return new Uint8Array(1_000_000).fill(97);
    }
}

for await (const line of rl) {
    if (!line.startsWith(":")) continue;
    const [identifier, __octetLength, input, SHA_256, SHA_d_256] = line.substring(1).split(" ");
    const octetLength = Number(__octetLength);

    /**@type { Uint8Array } */
    let source;
    if (input in wellKnownInputData) {
        source = wellKnownInputData[input](identifier, octetLength, input, SHA_256, SHA_d_256);
    } else {
        source = new Uint8Array(Buffer.from(input, "hex"));
    }
    await test(`${identifier}`, function(t) {
        if (identifier === "RC4.2^13+116") debugger;
        const hasher = new SHA256();
        hasher.update(source);
        const hashBuffer = hasher.digest();
        const hash = stringify(hashBuffer);
        // const hash = new Uint8Array(sha256(source));
        // const hash_d = new Uint8Array(sha256(hash));
        // const hash = sha256(source);
        // const hash_d = sha256(hash);

        assert.deepEqual(hash, SHA_256, "sha256");
        // assert.deepEqual(stringify(hash_d), SHA_d_256, "sha_d_256");
    })
}

