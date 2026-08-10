import { FormControl, FormGroup } from '@angular/forms';

import {
  centsToReaisInput,
  minFilesValidator,
  moneyValidator,
  passwordsMatchValidator,
  reaisToCents,
  trimmedLengthValidator,
  whatsappValidator
} from './custom-validators';

describe('whatsappValidator', () => {
  const validator = whatsappValidator();

  it('aceita 11 digitos (DDD + 9 + numero)', () => {
    expect(validator(new FormControl('11999999999'))).toBeNull();
  });

  it('aceita 10 digitos (DDD + numero fixo)', () => {
    expect(validator(new FormControl('1133334444'))).toBeNull();
  });

  it('rejeita quando ha letras/simbolos', () => {
    expect(validator(new FormControl('+55 11 99999-9999'))).toEqual({ whatsappFormat: true });
  });

  it('rejeita quantidade de digitos fora de 10-11', () => {
    expect(validator(new FormControl('119999999'))).toEqual({ whatsappLength: true });
  });

  it('nao valida campo vazio (deixa o Validators.required cuidar disso)', () => {
    expect(validator(new FormControl(''))).toBeNull();
  });
});

describe('passwordsMatchValidator', () => {
  const validator = passwordsMatchValidator();

  it('retorna null quando as senhas coincidem', () => {
    const group = new FormGroup({
      password: new FormControl('senha12345'),
      passwordConfirmation: new FormControl('senha12345')
    });
    expect(validator(group)).toBeNull();
  });

  it('retorna passwordMismatch quando as senhas nao coincidem', () => {
    const group = new FormGroup({
      password: new FormControl('senha12345'),
      passwordConfirmation: new FormControl('outraSenha')
    });
    expect(validator(group)).toEqual({ passwordMismatch: true });
  });
});

describe('minFilesValidator', () => {
  it('rejeita quando nao ha nenhum arquivo (regra "pelo menos 1 foto")', () => {
    const validator = minFilesValidator(1);
    const result = validator(new FormControl([]));
    expect(result).toEqual({ minFiles: { required: 1, actual: 0 } });
  });

  it('aceita quando ha pelo menos 1 arquivo', () => {
    const validator = minFilesValidator(1);
    const file = new File(['conteudo'], 'foto.jpg', { type: 'image/jpeg' });
    expect(validator(new FormControl([file]))).toBeNull();
  });
});

describe('moneyValidator', () => {
  const validator = moneyValidator();

  it('aceita valor com virgula', () => expect(validator(new FormControl('150,00'))).toBeNull());
  it('aceita valor com ponto', () => expect(validator(new FormControl('150.00'))).toBeNull());
  it('aceita valor inteiro sem casas decimais', () => expect(validator(new FormControl('150'))).toBeNull());
  it('rejeita texto invalido', () => expect(validator(new FormControl('R$ 150'))).toEqual({ money: true }));
});

describe('reaisToCents / centsToReaisInput', () => {
  it('converte reais (texto) para centavos (inteiro)', () => {
    expect(reaisToCents('150,00')).toBe(15000);
    expect(reaisToCents('150.50')).toBe(15050);
    expect(reaisToCents('150')).toBe(15000);
  });

  it('converte centavos para o texto exibido no formulario', () => {
    expect(centsToReaisInput(15000)).toBe('150,00');
    expect(centsToReaisInput(15050)).toBe('150,50');
  });
});

describe('trimmedLengthValidator', () => {
  const validator = trimmedLengthValidator(2, 40);

  it('aceita valor dentro do intervalo', () => {
    expect(validator(new FormControl('Livros'))).toBeNull();
  });

  it('rejeita valor cujo tamanho trimado fica abaixo do minimo', () => {
    expect(validator(new FormControl(' a '))).toEqual({ trimmedLength: { min: 2, max: 40, actual: 1 } });
  });

  it('rejeita valor cujo tamanho trimado fica acima do maximo', () => {
    const tooLong = 'a'.repeat(41);
    expect(validator(new FormControl(tooLong))).toEqual({ trimmedLength: { min: 2, max: 40, actual: 41 } });
  });

  it('nao valida campo vazio (deixa o Validators.required cuidar disso)', () => {
    expect(validator(new FormControl(''))).toBeNull();
    expect(validator(new FormControl('   '))).toBeNull();
  });
});
