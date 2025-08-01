import { UserLogtoPostPayload } from 'types/UserLogtoPostPayload';

// Corrige diretamente caracteres com encoding latin1 mal interpretado
function fixEncoding(str: string): string {
  try {
    return Buffer.from(str, 'latin1').toString('utf8').normalize('NFC');
  } catch {
    return str;
  }
}

export function csvDefaultMapper(row: Record<string, string>): UserLogtoPostPayload {
  const safeString = (value: any): string =>
    value === undefined || value === 'undefined' ? '' : fixEncoding(String(value).trim());

  const sanitize = (val: any): any => {
    if (val === 'NULL' || val === '') return null;
    if (val === 'true') return true;
    if (val === 'false') return false;
    return safeString(val);
  };

  const firstName = sanitize(row['first_name']) || '';
  const lastName = sanitize(row['last_name']) || '';
  const fullName = sanitize(row['fullname']) || `${firstName} ${lastName}`.trim();
  const username = sanitize(row['username']) || '';
  const email = sanitize(row['email']) || '';
  const phone = sanitize(row['otp']) || '';
  const cpf = sanitize(row['cpf']);
  const addressFormatted = sanitize(row['medicalclinicaddress']);
  const region = sanitize(row['uf']);
  // const crm = sanitize(row['crm']);

  return {
    primaryPhone: phone || undefined,
    primaryEmail: email || undefined,
    username: username || undefined,
    password: '', // pode ser uma hash
    name: fullName || undefined,
    cpf: cpf || undefined,
    profile: {
      givenName: firstName || undefined,
      familyName: lastName || undefined,
      preferredUsername: username || undefined,
      nickname: firstName || undefined,
      zoneinfo: 'America/Sao_Paulo',
      locale: 'pt-BR',
      address: addressFormatted
        ? {
            formatted: addressFormatted,
            region,
            country: 'BR',
          }
        : undefined,
      addresses: addressFormatted
        ? [
            {
              formatted: addressFormatted,
              region,
              country: 'BR',
            },
          ]
        : [],
      phones: phone
        ? [
            {
              phone,
              number: phone,
            },
          ]
        : [],
    },
  };
}
