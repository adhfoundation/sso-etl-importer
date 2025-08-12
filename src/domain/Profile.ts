import { Address, AddressValidationOptions } from "./Address";
import { Email } from "./Email";
import { Name, NameValidationOptions } from "./Name";
import { Username } from "./Username";

export interface ProfileValidationOptions {
  requireName?: boolean;
  requireEmail?: boolean;
  requirePhoneNumber?: boolean;
  requireAddress?: boolean;
  validateEmailFormat?: boolean;
  validatePhoneFormat?: boolean;
  addressValidationOptions?: AddressValidationOptions;
  nameValidationOptions?: NameValidationOptions;
}

export class Profile {
  public sub?: string;
  public name?: string;
  public familyName?: string;
  public givenName?: string;
  public middleName?: string;
  public nickname?: string;
  public preferredUsername?: string;
  public profile?: string;
  public picture?: string;
  public website?: string;
  public email?: string;
  public emailVerified?: boolean;
  public gender?: string;
  public birthdate?: string;
  public zoneinfo?: string;
  public locale?: string;
  public phoneNumber?: string;
  public phoneNumberVerified?: boolean;
  public address?: Address;
  public updatedAt?: number;

  constructor(data: Partial<Profile> = {}) {
    this.sub = this.sanitizeString(data.sub);
    this.name = this.sanitizeString(data.name);
    this.nickname = this.sanitizeString(data.nickname);
    this.profile = this.sanitizeUrl(data.profile);
    this.picture = this.sanitizeUrl(data.picture);
    this.website = this.sanitizeUrl(data.website);
    this.email = this.sanitizeEmail(data.email);
    this.emailVerified = data.emailVerified;
    this.gender = this.sanitizeString(data.gender);
    this.birthdate = this.sanitizeBirthdate(data.birthdate);
    this.zoneinfo = this.sanitizeString(data.zoneinfo);
    this.locale = this.sanitizeLocale(data.locale);
    this.phoneNumber = this.sanitizePhoneNumber(data.phoneNumber);
    this.phoneNumberVerified = data.phoneNumberVerified;
    this.address = data.address ? new Address(data.address) : undefined;
    this.updatedAt = data.updatedAt || Date.now();

    // Usar classes de domínio para validação e formatação de nomes
    if (data.familyName) {
      const familyNameObj = new Name(data.familyName);
      this.familyName = familyNameObj.getValue();
    }

    if (data.givenName) {
      const givenNameObj = new Name(data.givenName);
      this.givenName = givenNameObj.getValue();
    }

    if (data.middleName) {
      const middleNameObj = new Name(data.middleName);
      this.middleName = middleNameObj.getValue();
    }

    if (data.preferredUsername) {
      const usernameObj = new Username(data.preferredUsername);
      this.preferredUsername = usernameObj.toString();
    }
  }

  private sanitizeString(value?: string): string | undefined {
    if (!value) return undefined;
    const trimmed = value.trim().replace(/\s+/g, ' ');
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private sanitizeEmail(value?: string): string | undefined {
    if (!value) return undefined;
    return value.trim().toLowerCase() || undefined;
  }

  private sanitizeUrl(value?: string): string | undefined {
    if (!value) return undefined;
    const trimmed = value.trim();
    // Adiciona protocolo se não existir
    if (trimmed && !trimmed.match(/^https?:\/\//)) {
      return `https://${trimmed}`;
    }
    return trimmed || undefined;
  }

  private sanitizePhoneNumber(value?: string): string | undefined {
    if (!value) return undefined;
    // Remove caracteres não numéricos, exceto + no início
    const cleaned = value.trim().replace(/[^\d+]/g, '');
    return cleaned.length > 0 ? cleaned : undefined;
  }

  private sanitizeBirthdate(value?: string): string | undefined {
    if (!value) return undefined;
    const trimmed = value.trim();
    // Valida formato ISO (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    return undefined;
  }

  private sanitizeLocale(value?: string): string | undefined {
    if (!value) return undefined;
    const trimmed = value.trim().toLowerCase();
    // Valida formato de locale (ex: pt-BR, en-US)
    if (/^[a-z]{2}(-[A-Z]{2})?$/.test(trimmed)) {
      return trimmed;
    }
    return undefined;
  }

  // Validações específicas
  isValidEmail(): boolean {
    if (!this.email) return true; // Campo opcional
    const emailObj = new Email(this.email);
    return emailObj.isValid();
  }

  isValidPhoneNumber(): boolean {
    if (!this.phoneNumber) return true; // Campo opcional
    // Validação básica: deve ter entre 10 e 15 dígitos
    const digitsOnly = this.phoneNumber.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  }

  isValidBirthdate(): boolean {
    if (!this.birthdate) return true; // Campo opcional
    const date = new Date(this.birthdate);
    const now = new Date();
    const minDate = new Date('1900-01-01');
    return date >= minDate && date <= now;
  }

  isValidWebsite(): boolean {
    if (!this.website) return true; // Campo opcional
    try {
      new URL(this.website);
      return true;
    } catch {
      return false;
    }
  }

  isValidPicture(): boolean {
    if (!this.picture) return true; // Campo opcional
    try {
      new URL(this.picture);
      return this.picture.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null;
    } catch {
      return false;
    }
  }

  isValidGender(): boolean {
    if (!this.gender) return true; // Campo opcional
    const validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
    return validGenders.includes(this.gender.toLowerCase());
  }

  hasValidNames(): boolean {
    const familyNameObj = this.familyName ? new Name(this.familyName) : null;
    const givenNameObj = this.givenName ? new Name(this.givenName) : null;
    const middleNameObj = this.middleName ? new Name(this.middleName) : null;

    return (
      (!familyNameObj || familyNameObj.isValidPersonName()) &&
      (!givenNameObj || givenNameObj.isValidPersonName()) &&
      (!middleNameObj || middleNameObj.isValidPersonName())
    );
  }

  hasValidUsername(): boolean {
    if (!this.preferredUsername) return true; // Campo opcional
    const usernameObj = new Username(this.preferredUsername);
    return usernameObj.isValid();
  }

  hasValidAddress(options?: AddressValidationOptions): boolean {
    if (!this.address) return true; // Campo opcional
    return this.address.isValid(options);
  }

  // Validação principal
  isValid(options: ProfileValidationOptions = {}): boolean {
    const {
      requireName = false,
      requireEmail = false,
      requirePhoneNumber = false,
      requireAddress = false,
      validateEmailFormat = true,
      validatePhoneFormat = true,
      addressValidationOptions,
      nameValidationOptions
    } = options;

    // Verificar campos obrigatórios
    if (requireName && !this.hasCompleteName()) return false;
    if (requireEmail && !this.email) return false;
    if (requirePhoneNumber && !this.phoneNumber) return false;
    if (requireAddress && !this.address) return false;

    // Validar formatos dos campos preenchidos
    if (validateEmailFormat && !this.isValidEmail()) return false;
    if (validatePhoneFormat && !this.isValidPhoneNumber()) return false;
    if (!this.isValidBirthdate()) return false;
    if (!this.isValidWebsite()) return false;
    if (!this.isValidPicture()) return false;
    if (!this.isValidGender()) return false;
    if (!this.hasValidNames()) return false;
    if (!this.hasValidUsername()) return false;
    if (!this.hasValidAddress(addressValidationOptions)) return false;

    return true;
  }

  // Métodos auxiliares
  hasCompleteName(): boolean {
    return !!(this.givenName && this.familyName);
  }

  getFullName(): string {
    const parts = [this.givenName, this.middleName, this.familyName]
      .filter(part => part && part.trim().length > 0);
    return parts.join(' ');
  }

  hasVerifiedEmail(): boolean {
    return !!(this.email && this.emailVerified);
  }

  hasVerifiedPhone(): boolean {
    return !!(this.phoneNumber && this.phoneNumberVerified);
  }

  isEmpty(): boolean {
    return !this.sub && !this.name && !this.familyName && !this.givenName && 
           !this.email && !this.phoneNumber && (!this.address || this.address.isEmpty());
  }

  // Validações específicas para diferentes contextos
  isValidForRegistration(): boolean {
    return this.isValid({
      requireName: true,
      requireEmail: true,
      validateEmailFormat: true,
      validatePhoneFormat: true
    });
  }

  isValidForProfileUpdate(): boolean {
    return this.isValid({
      validateEmailFormat: true,
      validatePhoneFormat: true
    });
  }

  hasInvalidFields(): boolean {
    return !this.isValid();
  }

  // Método para atualizar timestamp
  touch(): void {
    this.updatedAt = Date.now();
  }
}
