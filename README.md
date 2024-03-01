# sha256 / sha224
zero-dependencies, pure javascript implementation of sha256 / sha224
## example
```JavaScript
import { sha256, stringify } from "sha/256";

const text = "Lorem ipsum dolor sit, amet consectetur adipisicing elit."

const encoder = new TextEncoder();
const data = encoder.encode(text);
const hashBuffer = sha256(data);
const hash = stringify(hashBuffer);
```
## todo
 * implement support for "streams"