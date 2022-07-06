# Obtaining hash of a file using `crypto`

## Introduction

This project is to demonstrate obtaining the hash of a file with the use of `crypto` package in Node.js.

It also aimed to find the speed of hashing among different algorithms:

`md5`, `sha1`, `sha256`, `sha384`, `sha512`.

Note: using command `openssl speed md5 sha1 sha256 sha512` can also find the speed of hashing, in a more convenient way. (`openssl` does not support `sha384`)

## Result

_Tested on MacBook Pro 2019_

By `fileHash.ts`

| type   | speed                   | size/time               |
| ------ | ----------------------- | ----------------------- |
| md5    | 371.5538203655353 MB/s  | (711525.566kB / 1915ms) |
| sha1   | 564.7028301587302 MB/s  | (711525.566kB / 1260ms) |
| sha256 | 344.23104305757136 MB/s | (711525.566kB / 2067ms) |
| sha384 | 454.06864454371413 MB/s | (711525.566kB / 1567ms) |
| sha512 | 406.1218984018265 MB/s  | (711525.566kB / 1752ms) |

By `openssl speed`

| type   | 16 bytes  | 64 bytes   | 256 bytes  | 1024 bytes | 8192 bytes |
| ------ | --------- | ---------- | ---------- | ---------- | ---------- |
| md5    | 70677.61k | 212551.21k | 475744.82k | 625006.77k | 742867.06k |
| sha1   | 85683.40k | 238263.01k | 522288.32k | 714790.78k | 866602.51k |
| sha256 | 55110.10k | 130111.62k | 263739.54k | 353396.54k | 396328.90k |
| sha512 | 59258.75k | 234690.33k | 340543.48k | 456706.51k | 511251.35k |

Conclusion:
`sha1` is the fastest algorithm.
`sha512` has extremely low collision rate and acceptable speed.

## Code

```ts
import Crypto from "crypto";
import fs from "fs";

const fileHash = (filepath: string, algorithm: string): Promise<string> =>
  new Promise((resolve, reject) => {
    // Read by stream instead of putting the whole file into memory
    const fileStream = fs.createReadStream(filepath);
    const hash = Crypto.createHash(algorithm);

    fileStream.on("data", (data) => hash.update(data));

    fileStream.on("error", reject);
    fileStream.on("end", () => resolve(hash.digest("hex")));
  });
```
