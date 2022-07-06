import Crypto from "crypto";
import fs from "fs";
import path from "path";

type Stat = {
  file: string;
  algorithm: string;
  fileSize: number;
  time: number;
  hash: string;
};

const timer = async (filepath: string, algorithm: string): Promise<Stat> => {
  // const filepath = process.argv[2];
  // const algorithm = process.argv[3] || "sha256";

  const stats = fs.statSync(filepath);

  const start = Date.now();
  const hash = await fileHash(filepath, algorithm);
  const end = Date.now();

  return {
    file: filepath,
    algorithm,
    fileSize: stats.size,
    time: end - start,
    hash,
  };
};

const fileHash = (filepath: string, algorithm: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filepath);
    const hash = Crypto.createHash(algorithm);

    fileStream.on("data", (data) => hash.update(data));

    fileStream.on("error", reject);
    fileStream.on("end", () => resolve(hash.digest("hex")));
  });

/**
 * Usage: `ts-node fileHash.ts <directory>`
 *
 * This program will hash all files in the directory and hash them all by 5 different algorithms.
 * File size, time taken will be recorded for each file and algorithm.
 * Detail result will be exported to json files. Summary will be printed to console.
 */
const main = async () => {
  const directory = process.argv[2];

  const files = fs.readdirSync(directory);

  /**
   * MD5: 32 char / 128 bits
   * SHA1: 40 char / 160 bits
   * SHA256: 64 char / 256 bits
   * SHA384: 96 char / 384 bits
   * SHA512: 128 char / 512 bits
   */
  const algorithms = ["md5", "sha1", "sha256", "sha384", "sha512"];

  for (const alg of algorithms) {
    const results: Stat[] = [];
    const start = Date.now();
    for (const file of files) {
      const filepath = path.join(directory, file);
      const result = await timer(filepath, alg);
      results.push(result);
    }

    // const totalTime = results.reduce((acc, cur) => acc + cur.time, 0); // since hashing time for each file is short, uncertainty can be huge
    const totalTime = Date.now() - start;

    const totalFileSize = results.reduce((acc, cur) => acc + cur.fileSize, 0);

    const averageSpeed = totalFileSize / totalTime;
    console.log(
      `${alg}: ${averageSpeed / 1000} MB/s (${
        totalFileSize / 1000
      }kB / ${totalTime}ms)`
    );

    fs.writeFileSync(`./output/${alg}.json`, JSON.stringify(results, null, 2));
  }
};

main();
