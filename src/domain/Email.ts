export class Email {
  private readonly value: string;

  constructor(email: string) {
    this.value = email?.trim().toLowerCase() || "";
  }

  /**
   * Verifica se o email está presente
   */
  isEmpty(): boolean {
    return this.value.length === 0;
  }

  /**
   * Valida formato geral
   */
  isFormatValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.value);
  }

  /**
   * Retorna o domínio (parte após o @)
   */
  getDomain(): string | null {
    if (!this.isFormatValid()) return null;
    return this.value.split("@")[1];
  }

  /**
   * Verifica se o domínio está na lista permitida
   */
  isAllowedDomain(allowedDomains?: string[]): boolean {
    if (!allowedDomains?.length) return true;
    return allowedDomains.includes(this.getDomain() || "");
  }

  /**
   * Verifica se o domínio NÃO está na lista bloqueada
   */
  isNotBlockedDomain(blockedDomains?: string[]): boolean {
    if (!blockedDomains?.length) return true;
    return !blockedDomains.includes(this.getDomain() || "");
  }

  /**
   * Valida tudo de uma vez
   */
  isValid(options?: { 
    required?: boolean; 
    allowedDomains?: string[]; 
    blockedDomains?: string[]; 
  }): boolean {
    if (options?.required && this.isEmpty()) return false;
    if (!this.isEmpty() && !this.isFormatValid()) return false;
    if (!this.isAllowedDomain(options?.allowedDomains)) return false;
    if (!this.isNotBlockedDomain(options?.blockedDomains)) return false;
    return true;
  }

  toString(): string {
    return this.value;
  }
}
