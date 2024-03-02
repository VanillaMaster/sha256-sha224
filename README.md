# sha256 / sha224
zero-dependencies, pure javascript implementation of sha256 / sha224

*it also must be fast, not like rust, obviously*
## example
```JavaScript
import { sha256, stringify } from "@vanilla/sha/256";

const text = "Lorem ipsum dolor sit, amet consectetur adipisicing elit."

const encoder = new TextEncoder();
const data = encoder.encode(text);
const hashBuffer = sha256(data);
const hash = stringify(hashBuffer);
```
or
```JavaScript
import { Sha256, stringify } from "@vanilla/sha/256";

const text = "Lorem ipsum dolor sit, amet consectetur adipisicing elit."

const encoder = new TextEncoder();
const data = encoder.encode(text);
const hasher = new Sha256();
hasher.update(data);
const hashBuffer = hasher.digest();
const hash = stringify(hashBuffer);
```