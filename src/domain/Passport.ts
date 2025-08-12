export class Passport {
  private readonly value: string;

  constructor(passport: string) {
    this.value = passport?.trim().toUpperCase() || "";
  }

  /**
   * Verifica se o passaporte está vazio
   */
  isEmpty(): boolean {
    return this.value.length === 0;
  }

  /**
   * Valida o formato geral de passaportes internacionais (6 a 9 caracteres alfanuméricos)
   */
  isFormatValid(): boolean {
    const regex = /^[A-Z0-9]{6,9}$/;
    return regex.test(this.value);
  }

  /**
   * Valida especificamente para Brasil (2 letras + 6 números)
   */
  isValidForBrazil(): boolean {
    const regex = /^[A-Z]{2}\d{6}$/;
    return regex.test(this.value);
  }

  /**
   * Validação geral ou específica por país
   */
  isValid(options?: { country?: string; required?: boolean }): boolean {
    if (options?.required && this.isEmpty()) return false;

    if (!this.isFormatValid()) return false;

    if (options?.country?.toLowerCase() === "br" || options?.country?.toLowerCase() === "brazil") {
      return this.isValidForBrazil();
    }

    return true; // Países genéricos passam pelo regex padrão
  }

  toString(): string {
    return this.value;
  }
}
