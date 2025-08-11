export class Phone {
  private readonly value: string;

  constructor(phone: string) {
    // Remove tudo que não for número
    this.value = phone?.replace(/\D/g, "") || "";
  }

  /**
   * Verifica se o telefone está vazio
   */
  isEmpty(): boolean {
    return this.value.length === 0;
  }

  /**
   * Verifica se o formato é válido
   * Exemplo válido: +55 (11) 91234-5678 -> 5511912345678
   */
  isFormatValid(): boolean {
    const regex = /^(?:\d{2})?(?:\d{2})?(?:9\d{8}|\d{8,9})$/;
    return regex.test(this.value);
  }

  /**
   * Extrai o DDI (código do país)
   * Ex: 55 (Brasil)
   */
  getDDI(): string | null {
    if (this.value.length < 12) return null; // Exige DDI + DDD + número
    return this.value.slice(0, this.value.length - 10);
  }

  /**
   * Extrai o DDD (código da cidade)
   */
  getDDD(): string | null {
    if (this.value.length < 10) return null;
    return this.value.slice(this.value.length - 10, this.value.length - 8);
  }

  /**
   * Extrai o número do telefone (sem DDI ou DDD)
   */
  getNumber(): string | null {
    if (this.value.length < 8) return null;
    return this.value.slice(this.value.length - 8);
  }

  /**
   * Verifica se o DDI está permitido
   */
  isAllowedDDI(allowedDDIs?: string[]): boolean {
    if (!allowedDDIs?.length) return true;
    return allowedDDIs.includes(this.getDDI() || "");
  }

  /**
   * Verifica se o DDI NÃO está bloqueado
   */
  isNotBlockedDDI(blockedDDIs?: string[]): boolean {
    if (!blockedDDIs?.length) return true;
    return !blockedDDIs.includes(this.getDDI() || "");
  }

  /**
   * Validação completa
   */
  isValid(options?: {
    required?: boolean;
    allowedDDIs?: string[];
    blockedDDIs?: string[];
  }): boolean {
    if (options?.required && this.isEmpty()) return false;
    if (!this.isEmpty() && !this.isFormatValid()) return false;
    if (!this.isAllowedDDI(options?.allowedDDIs)) return false;
    if (!this.isNotBlockedDDI(options?.blockedDDIs)) return false;
    return true;
  }

  /**
   * Retorna o valor numérico (sem formatação)
   */
  toString(): string {
    return this.value;
  }
}
