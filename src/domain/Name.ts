export interface NameValidationOptions {
  minLength?: number;
  maxLength?: number;
  allowNumbers?: boolean;
  allowSpecialChars?: boolean;
  required?: boolean;
}

export class Name {
  private readonly value: string;
  private readonly original: string;

  constructor(value: string) {
    this.original = value || "";
    this.value = this.sanitize(value);
  }

  private sanitize(value: string): string {
    if (!value) return "";
    // Remove espaços extras e caracteres de controle
    return value.trim().replace(/\s+/g, ' ').replace(/[\x00-\x1F\x7F]/g, '');
  }

  isEmpty(): boolean {
    return this.value.length === 0;
  }

  getValue(): string {
    return this.value;
  }

  getOriginal(): string {
    return this.original;
  }

  length(): number {
    return this.value.length;
  }

  // Validações específicas
  isValidLength(min: number = 1, max: number = 100): boolean {
    const len = this.value.length;
    return len >= min && len <= max;
  }

  hasOnlyLetters(): boolean {
    return /^[a-zA-ZÀ-ÿ\s]+$/.test(this.value);
  }

  hasOnlyLettersAndNumbers(): boolean {
    return /^[a-zA-ZÀ-ÿ0-9\s]+$/.test(this.value);
  }

  hasValidCharacters(allowNumbers: boolean = false, allowSpecialChars: boolean = false): boolean {
    if (allowSpecialChars) {
      // Permite letras, números, espaços e caracteres especiais comuns
      return /^[a-zA-ZÀ-ÿ0-9\s\-'.,]+$/.test(this.value);
    }
    if (allowNumbers) {
      return this.hasOnlyLettersAndNumbers();
    }
    return this.hasOnlyLetters();
  }

  hasConsecutiveSpaces(): boolean {
    return /\s{2,}/.test(this.value);
  }

  startsOrEndsWithSpace(): boolean {
    return this.value !== this.value.trim();
  }

  // Validação principal
  isValid(options: NameValidationOptions = {}): boolean {
    const {
      minLength = 1,
      maxLength = 100,
      allowNumbers = false,
      allowSpecialChars = false,
      required = false
    } = options;

    // Se é obrigatório e está vazio
    if (required && this.isEmpty()) {
      return false;
    }

    // Se não é obrigatório e está vazio, é válido
    if (!required && this.isEmpty()) {
      return true;
    }

    // Validações quando há conteúdo
    return (
      this.isValidLength(minLength, maxLength) &&
      this.hasValidCharacters(allowNumbers, allowSpecialChars) &&
      !this.hasConsecutiveSpaces() &&
      !this.startsOrEndsWithSpace()
    );
  }

  // Métodos de validação específicos para diferentes contextos
  isValidPersonName(): boolean {
    return this.isValid({
      minLength: 2,
      maxLength: 50,
      allowNumbers: false,
      allowSpecialChars: true, // Para nomes com apostrofes, hífens, etc.
      required: true
    });
  }

  isValidUsername(): boolean {
    return this.isValid({
      minLength: 3,
      maxLength: 30,
      allowNumbers: true,
      allowSpecialChars: false,
      required: true
    });
  }

  toString(): string {
    return this.value;
  }
}
