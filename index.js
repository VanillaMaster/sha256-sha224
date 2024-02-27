import { sha224, stringify as stringify224 } from "./src/sha224.js";
import { sha256, stringify as stringify256 } from "./src/sha256.js";


const encoder = new TextEncoder();

const text = "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Distinctio sunt nobis consequatur commodi debitis, provident incidunt quisquam voluptatibus suscipit ipsa dolor accusamus quae! Molestias cumque ad architecto. Voluptas, necessitatibus accusantium?"

// import { Sha256 } from '@aws-crypto/sha256-js';
// console.time("@aws-crypto/sha256-js")

// for (let i = 0; i < 10_000; i++) {
//     const hash = new Sha256();
//     hash.update(text);
//     const result = hash.digestSync();
//     const val = stringify256(result);
//     if (val !== "19fe88ee8d9148aad14cf036f7065e2806c774645f4086091b2537f7bad6892f") throw new Error();
// }

// console.timeEnd("@aws-crypto/sha256-js");

console.time("vm/sha256")
for (let i = 0; i < 10_000; i++) {
    const val = stringify256(new Uint8Array(sha256(encoder.encode(text))));
    if (val !== "19fe88ee8d9148aad14cf036f7065e2806c774645f4086091b2537f7bad6892f") throw new Error();
}
console.timeEnd("vm/sha256")