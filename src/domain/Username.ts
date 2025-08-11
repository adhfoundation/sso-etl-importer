export interface UsernameOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

export class Username {
  private readonly value: string;
  private readonly original: string;

  constructor(username: string) {
    this.original = username;
    this.value = username?.trim() || "";
  }

  /**
   * Verifica se o username está vazio
   */
  isEmpty(): boolean {
    return this.value.length === 0;
  }

  /**
   * Verifica se é um e-mail (não permitido como username)
   */
  isEmailFormat(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.value);
  }

  /**
   * Verifica se o formato geral é válido
   * Deve começar com letra ou underline, seguido de letras, dígitos ou underline
   */
  isFormatValid(): boolean {
    const usernameRegex = /^[A-Z_a-z]\w*$/;
    return usernameRegex.test(this.value);
  }

  /**
   * Verifica se o comprimento é válido conforme opções
   */
  isLengthValid(min?: number, max?: number): boolean {
    const len = this.value.length;
    if (min !== undefined && len < min) return false;
    if (max !== undefined && len > max) return false;
    return true;
  }

  /**
   * Validação completa com opções
   */
  isValid(options?: UsernameOptions): boolean {
    if (options?.required && this.isEmpty()) return false;
    if (!this.isLengthValid(options?.minLength, options?.maxLength)) return false;
    if (!this.isFormatValid()) return false;
    if (this.isEmailFormat()) return false;
    return true;
  }

  /**
   * Retorna o valor como string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Retorna o valor original (sem trim)
   */
  getOriginal(): string {
    return this.original;
  }
}
