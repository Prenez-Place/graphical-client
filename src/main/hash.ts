
// Compute the SHA256 hash of a file
export function hashFile(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = require("crypto").createHash('sha256');
    const stream = require('fs').createReadStream(file);
    stream.on('error', reject);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}
