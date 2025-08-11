import { Address } from "./Address"; // ajuste o caminho conforme sua estrutura

export class Profile {
  readonly familyName: string;
  readonly givenName: string;
  readonly middleName: string;
  readonly nickname: string;
  readonly preferredUsername: string;
  readonly profile: string;
  readonly website: string;
  readonly gender: string;
  readonly birthdate: string;
  readonly zoneinfo: string;
  readonly locale: string;
  readonly address: Address;

  constructor(data: Partial<Profile & { address?: Partial<Address> }> = {}) {
    this.familyName = data.familyName?.trim() || "";
    this.givenName = data.givenName?.trim() || "";
    this.middleName = data.middleName?.trim() || "";
    this.nickname = data.nickname?.trim() || "";
    this.preferredUsername = data.preferredUsername?.trim() || "";
    this.profile = data.profile?.trim() || "";
    this.website = data.website?.trim() || "";
    this.gender = data.gender?.trim() || "";
    this.birthdate = data.birthdate?.trim() || "";
    this.zoneinfo = data.zoneinfo?.trim() || "";
    this.locale = data.locale?.trim() || "";
    this.address = new Address(data.address);
  }

  /**
   * Verifica se há pelo menos um campo mínimo para considerar válido
   */
  hasMinimum(): boolean {
    return !!(this.givenName || this.familyName || this.nickname);
  }

  isValidGender(): boolean {
    return ["male", "female", "other"].includes(this.gender.toLowerCase());
  }

  isValidBirthdate(): boolean {
    if (!this.birthdate) return true;
    const date = new Date(this.birthdate);
    return !isNaN(date.getTime()) && date <= new Date();
  }

  isValidZoneInfo(): boolean {
    if (!this.zoneinfo) return true;
    try {
      Intl.DateTimeFormat(undefined, { timeZone: this.zoneinfo });
      return true;
    } catch {
      return false;
    }
  }

  isValidLocale(): boolean {
    return ["pt-BR", "en-US", "es-ES"].includes(this.locale);
  }

  isValidWebsite(): boolean {
    if (!this.website) return true;
    try {
      new URL(this.website);
      return true;
    } catch {
      return false;
    }
  }

  hasInvalidFields(): boolean {
    return (
      !this.isValidGender() ||
      !this.isValidBirthdate() ||
      !this.isValidZoneInfo() ||
      !this.isValidLocale() ||
      !this.isValidWebsite() ||
      this.address.isEmpty()
    );
  }
}
