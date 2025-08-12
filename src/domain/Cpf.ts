export class Cpf {
  private readonly value: string;

  constructor(cpf: string) {
    // Remove qualquer caractere que não seja número
    this.value = cpf?.replace(/\D/g, "") || "";
  }

  /**
   * Verifica se o CPF está vazio
   */
  isEmpty(): boolean {
    return this.value.length === 0;
  }

  /**
   * Verifica se o CPF tem formato válido
   * Deve conter exatamente 11 dígitos e passar no algoritmo de validação
   */
  isFormatValid(): boolean {
    if (this.value.length !== 11) return false;

    // Rejeita CPFs com todos os dígitos iguais (ex: 00000000000, 11111111111)
    if (/^(\d)\1{10}$/.test(this.value)) return false;

    // Validação dos dígitos verificadores
    const digits = this.value.split("").map(Number);

    const isValidDigit = (factor: number): boolean => {
      let sum = 0;
      for (let i = 0; i < factor - 1; i++) {
        sum += digits[i] * (factor - i);
      }
      const check = (sum * 10) % 11;
      return check === (digits[factor - 1] % 10);
    };

    return isValidDigit(10) && isValidDigit(11);
  }

  /**
   * Validação completa (opcionalmente exigida)
   */
  isValid(options?: { required?: boolean }): boolean {
    if (options?.required && this.isEmpty()) return false;
    if (!this.isEmpty() && !this.isFormatValid()) return false;
    return true;
  }

  /**
   * Retorna o CPF numérico sem formatação
   */
  toString(): string {
    return this.value;
  }

  /**
   * Retorna o CPF formatado: 000.000.000-00
   */
  format(): string {
    if (this.value.length !== 11) return this.value;
    return this.value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }
}
