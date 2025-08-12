export class Password {
  private readonly raw: string | null;
  private readonly digest: string | null;
  private readonly algorithm: string | null;

  private static readonly SUPPORTED_ALGORITHMS = [
    "Argon2i",
    "Argon2id",
    "Argon2d",
    "SHA1",
    "SHA256",
    "MD5",
    "Bcrypt",
    "Legacy",
  ];

  constructor(params: {
    password?: string | null;
    passwordDigest?: string | null;
    passwordAlgorithm?: string | null;
  }) {
    this.raw = params.password?.trim() || null;
    this.digest = params.passwordDigest?.trim() || null;
    this.algorithm = params.passwordAlgorithm?.trim() || null;
  }

  isEmpty(): boolean {
    return !this.raw && !this.digest;
  }

  isRawValid(minLength = 6, maxLength = 256): boolean {
    if (!this.raw) return false;
    const len = this.raw.length;
    return len >= minLength && len <= maxLength;
  }

  isDigestValid(): boolean {
    return !!this.digest && this.digest.length <= 256;
  }

  hasSupportedAlgorithm(): boolean {
    return !!this.algorithm && Password.SUPPORTED_ALGORITHMS.includes(this.algorithm);
  }

  isValid(options?: { minLength?: number; maxLength?: number }): boolean {
    const { minLength = 6, maxLength = 256 } = options || {};
    if (this.raw) {
      return this.isRawValid(minLength, maxLength);
    }
    if (this.digest) {
      return this.isDigestValid() && this.hasSupportedAlgorithm();
    }
    return false;
  }

  getPassword(): string | null {
    return this.raw;
  }

  getDigest(): string | null {
    return this.digest;
  }

  getAlgorithm(): string | null {
    return this.algorithm;
  }
}
