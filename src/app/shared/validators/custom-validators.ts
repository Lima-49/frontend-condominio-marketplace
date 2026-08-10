import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validacoes de cliente espelhando as regras de DTO do backend (API_SPEC.md secao 2).
 * Repetido aqui de proposito: o backend SEMPRE revalida tudo — o frontend so existe
 * para dar feedback rapido/proximo ao campo (padrao tecnico do CLAUDE.md).
 */

/** WhatsApp: apenas digitos, 10 ou 11 (DDD + numero), sem +55. */
export function whatsappValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '') as string;
    if (!value) {
      return null; // deixa o Validators.required cuidar de campo vazio
    }
    const digitsOnly = /^\d+$/.test(value);
    if (!digitsOnly) {
      return { whatsappFormat: true };
    }
    if (value.length < 10 || value.length > 11) {
      return { whatsappLength: true };
    }
    return null;
  };
}

/** Confirmacao de senha: validator de grupo (aplicado no FormGroup, nao no controle isolado). */
export function passwordsMatchValidator(passwordField = 'password', confirmationField = 'passwordConfirmation'): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordField)?.value;
    const confirmation = group.get(confirmationField)?.value;

    if (!password || !confirmation) {
      return null;
    }

    return password === confirmation ? null : { passwordMismatch: true };
  };
}

/** Garante pelo menos 1 arquivo selecionado (regra "pelo menos 1 foto" do POST /products). */
export function minFilesValidator(min = 1): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const files = (control.value ?? []) as File[];
    return files.length >= min ? null : { minFiles: { required: min, actual: files.length } };
  };
}

/** Valor em reais digitado como texto (ex.: "150,00" ou "150.00"), aceita virgula ou ponto. */
export function moneyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '') as string;
    if (!value) {
      return null;
    }
    const isValidFormat = /^\d+([.,]\d{1,2})?$/.test(value.trim());
    if (!isValidFormat) {
      return { money: true };
    }
    return null;
  };
}

/** Converte "150,00" / "150.00" / "150" para centavos (inteiro), formato exigido pelo backend. */
export function reaisToCents(value: string): number {
  const normalized = value.trim().replace(',', '.');
  return Math.round(parseFloat(normalized) * 100);
}

/** Converte centavos (inteiro, vindo da API) para o texto usado no campo de valor do form. */
export function centsToReaisInput(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

/**
 * Tamanho minimo/maximo considerando o valor "trimado" (sem espaco nas pontas).
 * Usado no nome de categoria do Painel Admin (H5): evita habilitar o submit ou aceitar
 * um nome tipo " a " (3 chars) quando na pratica o nome util tem so 1 char.
 */
export function trimmedLengthValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = ((control.value ?? '') as string).trim();
    if (!value) {
      return null; // deixa o Validators.required cuidar de campo vazio
    }
    if (value.length < min || value.length > max) {
      return { trimmedLength: { min, max, actual: value.length } };
    }
    return null;
  };
}
