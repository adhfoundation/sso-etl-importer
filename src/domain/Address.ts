import { json } from "stream/consumers";

export class Address {
  readonly formatted: string;
  readonly streetAddress: string;
  readonly locality: string;
  readonly region: string;
  readonly postalCode: string;
  readonly country: string;

  constructor(address: Partial<Address> = {}) {
    this.formatted = address.formatted?.trim() || "";
    this.streetAddress = address.streetAddress?.trim() || "";
    this.locality = address.locality?.trim() || "";
    this.region = address.region?.trim() || "";
    this.postalCode = address.postalCode?.trim() || "";
    this.country = address.country?.trim() || "";
  }

  isEmpty(): boolean {
    return !this.formatted &&
      !this.streetAddress &&
      !this.locality &&
      !this.region &&
      !this.postalCode &&
      !this.country;
  }

  hasMinimum(): boolean {
    return !this.isEmpty() && !!(this.formatted || this.streetAddress || this.locality || this.region || this.postalCode || this.country);
  }

  toJSON(): Record<string, string> {
    return JSON.parse(JSON.stringify({
      formatted: this.formatted,
      streetAddress: this.streetAddress,
      locality: this.locality,
      region: this.region,
      postalCode: this.postalCode,
      country: this.country,
    }));
  }
}
