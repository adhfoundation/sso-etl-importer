export interface AddressValidationOptions {
  requireStreetAddress?: boolean;
  requireLocality?: boolean;
  requireRegion?: boolean;
  requirePostalCode?: boolean;
  requireCountry?: boolean;
  validatePostalCodeFormat?: boolean;
  countryCode?: string; // Para validações específicas por país
}

export class Address {
  public formatted?: string;
  public streetAddress?: string;
  public locality?: string;
  public region?: string;
  public postalCode?: string;
  public country?: string;

  constructor(data: Partial<Address> = {}) {
    this.formatted = this.sanitizeString(data.formatted);
    this.streetAddress = this.sanitizeString(data.streetAddress);
    this.locality = this.sanitizeString(data.locality);
    this.region = this.sanitizeString(data.region);
    this.postalCode = this.sanitizePostalCode(data.postalCode);
    this.country = this.sanitizeString(data.country);
  }

  private sanitizeString(value?: string): string | undefined {
    if (!value) return undefined;
    const trimmed = value.trim().replace(/\s+/g, ' ');
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private sanitizePostalCode(value?: string): string | undefined {
    if (!value) return undefined;
    // Remove espaços e caracteres especiais desnecessários, mantém apenas alfanuméricos e hífens
    const cleaned = value.trim().replace(/[^a-zA-Z0-9\-]/g, '').toUpperCase();
    return cleaned.length > 0 ? cleaned : undefined;
  }

  isEmpty(): boolean {
    return (
      !this.formatted &&
      !this.streetAddress &&
      !this.locality &&
      !this.region &&
      !this.postalCode &&
      !this.country
    );
  }

  hasMinimumFields(): boolean {
    return !!(this.streetAddress && this.locality);
  }

  // Validações específicas
  isValidStreetAddress(): boolean {
    if (!this.streetAddress) return false;
    return this.streetAddress.length >= 5 && this.streetAddress.length <= 200;
  }

  isValidLocality(): boolean {
    if (!this.locality) return false;
    return /^[a-zA-ZÀ-ÿ\s\-'.,]{2,100}$/.test(this.locality);
  }

  isValidRegion(): boolean {
    if (!this.region) return false;
    return /^[a-zA-ZÀ-ÿ\s\-'.,]{2,100}$/.test(this.region);
  }

  isValidCountry(): boolean {
    if (!this.country) return false;
    // Aceita nomes de países ou códigos ISO (2 ou 3 letras)
    return /^([a-zA-ZÀ-ÿ\s\-'.,]{2,100}|[A-Z]{2,3})$/.test(this.country);
  }

  isValidPostalCode(countryCode?: string): boolean {
    if (!this.postalCode) return false;

    // Validações específicas por país
    switch (countryCode?.toUpperCase()) {
      case 'BR': // Brasil
        return /^\d{5}-?\d{3}$/.test(this.postalCode);
      case 'US': // Estados Unidos
        return /^\d{5}(-\d{4})?$/.test(this.postalCode);
      case 'CA': // Canadá
        return /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/.test(this.postalCode);
      case 'GB': // Reino Unido
        return /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/.test(this.postalCode);
      case 'DE': // Alemanha
        return /^\d{5}$/.test(this.postalCode);
      case 'FR': // França
        return /^\d{5}$/.test(this.postalCode);
      default:
        // Validação genérica: 3-10 caracteres alfanuméricos com possível hífen
        return /^[A-Z0-9\-]{3,10}$/.test(this.postalCode);
    }
  }

  hasValidLength(): boolean {
    const fields = [this.streetAddress, this.locality, this.region, this.country, this.formatted];
    return fields.every(field => !field || (field.length >= 2 && field.length <= 200));
  }

  // Validação principal
  isValid(options: AddressValidationOptions = {}): boolean {
    const {
      requireStreetAddress = false,
      requireLocality = false,
      requireRegion = false,
      requirePostalCode = false,
      requireCountry = false,
      validatePostalCodeFormat = true,
      countryCode
    } = options;

    // Se o endereço está vazio e nenhum campo é obrigatório
    if (this.isEmpty() && !requireStreetAddress && !requireLocality && !requireRegion && !requirePostalCode && !requireCountry) {
      return true;
    }

    // Verificar campos obrigatórios
    if (requireStreetAddress && !this.streetAddress) return false;
    if (requireLocality && !this.locality) return false;
    if (requireRegion && !this.region) return false;
    if (requirePostalCode && !this.postalCode) return false;
    if (requireCountry && !this.country) return false;

    // Validar formato dos campos preenchidos
    if (this.streetAddress && !this.isValidStreetAddress()) return false;
    if (this.locality && !this.isValidLocality()) return false;
    if (this.region && !this.isValidRegion()) return false;
    if (this.country && !this.isValidCountry()) return false;
    if (this.postalCode && validatePostalCodeFormat && !this.isValidPostalCode(countryCode)) return false;

    // Validar comprimentos
    if (!this.hasValidLength()) return false;

    return true;
  }

  // Validações específicas para diferentes contextos
  isValidBrazilianAddress(): boolean {
    return this.isValid({
      requireStreetAddress: true,
      requireLocality: true,
      requireRegion: true,
      requirePostalCode: true,
      requireCountry: false,
      validatePostalCodeFormat: true,
      countryCode: 'BR'
    });
  }

  isValidInternationalAddress(): boolean {
    return this.isValid({
      requireStreetAddress: true,
      requireLocality: true,
      requireCountry: true,
      validatePostalCodeFormat: true
    });
  }

  isValidMinimalAddress(): boolean {
    return this.isValid({
      requireStreetAddress: true,
      requireLocality: true,
      validatePostalCodeFormat: false
    });
  }

  // Método para formatar endereço automaticamente
  generateFormattedAddress(): string {
    const parts = [
      this.streetAddress,
      this.locality,
      this.region,
      this.postalCode,
      this.country
    ].filter(part => part && part.trim().length > 0);

    return parts.join(', ');
  }

  // Atualizar o endereço formatado
  updateFormattedAddress(): void {
    if (!this.formatted || this.formatted.trim().length === 0) {
      this.formatted = this.generateFormattedAddress();
    }
  }

  toJSON(): Record<string, string | undefined> {
    return {
      formatted: this.formatted,
      streetAddress: this.streetAddress,
      locality: this.locality,
      region: this.region,
      postalCode: this.postalCode,
      country: this.country,
    };
  }

  toString(): string {
    return this.formatted || this.generateFormattedAddress();
  }
}
