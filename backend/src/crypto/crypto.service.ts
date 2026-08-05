import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * CryptoService — AES-256-GCM symmetric encryption for message text.
 *
 * Why AES-256-GCM?
 *   - AES-256: 256-bit key, military-grade encryption (same used by banks/governments)
 *   - GCM mode: "Galois/Counter Mode" — adds an authentication tag so we can
 *     detect if the ciphertext was tampered with (not just encrypted, but integrity-checked)
 *
 * How it works per message:
 *   1. A unique 12-byte IV (Initialization Vector) is randomly generated for EACH message.
 *      This means even two identical messages produce completely different ciphertexts.
 *   2. The IV + ciphertext + auth tag are combined and base64-encoded for storage.
 *   3. Decryption splits them back apart and verifies the auth tag before decrypting.
 *
 * Format stored in DB:
 *   base64( iv[12 bytes] + authTag[16 bytes] + ciphertext[N bytes] )
 */
@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    const hexKey = process.env.ENCRYPTION_KEY;

    if (!hexKey || hexKey.length !== 64) {
      throw new Error(
        'ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
          'Generate one with: node -e "require(\'crypto\').randomBytes(32).toString(\'hex\')"',
      );
    }

    this.key = Buffer.from(hexKey, 'hex');
  }

  /**
   * Encrypts a plaintext string.
   * Returns a base64 string: iv(12) + authTag(16) + ciphertext(N)
   */
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(12); // 12-byte IV for GCM (96 bits is the standard)
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag(); // GCM authentication tag (16 bytes)

    // Combine iv + authTag + ciphertext into one base64 blob
    const combined = Buffer.concat([iv, authTag, encrypted]);
    return combined.toString('base64');
  }

  /**
   * Decrypts a base64 blob produced by encrypt().
   * Returns the original plaintext string.
   * Throws if the data was tampered with (auth tag mismatch).
   */
  decrypt(cipherBlob: string): string {
    const combined = Buffer.from(cipherBlob, 'base64');

    // Split the blob back into its parts
    const iv = combined.subarray(0, 12);
    const authTag = combined.subarray(12, 28); // 16 bytes
    const ciphertext = combined.subarray(28);

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  /**
   * Safe decrypt — returns '[message unavailable]' if decryption fails
   * instead of crashing. Used for legacy messages that may be plain text.
   */
  safeDecrypt(text: string): string {
    try {
      return this.decrypt(text);
    } catch {
      // If decryption fails, the text is likely unencrypted (legacy message).
      // Return as-is so old messages remain readable.
      return text;
    }
  }
}
