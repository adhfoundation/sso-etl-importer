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
   * Aceita telefones nacionais e internacionais
   * Exemplo válido: +55 (11) 91234-5678 -> 5511912345678
   */
  isFormatValid(): boolean {
    // Aceita telefones com 8 a 15 dígitos (padrão internacional)
    const regex = /^\d{8,15}$/;
    return regex.test(this.value);
  }

  /**
   * Extrai o DDI (código do país)
   * Ex: 55 (Brasil), 1 (EUA), 44 (Reino Unido)
   */
  getDDI(): string | null {
    if (this.value.length < 10) return null; // Mínimo para ter DDI
    // Para telefones com 10-11 dígitos, assume que não há DDI (nacional)
    if (this.value.length <= 11) return null;
    // Para telefones com 12+ dígitos, extrai os primeiros 1-3 dígitos como DDI
    if (this.value.length === 12) return this.value.slice(0, 2); // DDI de 2 dígitos
    if (this.value.length === 13) return this.value.slice(0, 3); // DDI de 3 dígitos
    return this.value.slice(0, this.value.length - 10); // Fallback
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
