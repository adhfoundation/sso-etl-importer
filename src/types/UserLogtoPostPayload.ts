export type UserLogtoPostPayload = {
  primaryPhone: string;
  primaryEmail: string;
  username: string;
  password?: string;
  passwordAlgorithm?: string;
  passwordDigest?: string;
  name: string;
  cpf?: string | null | undefined;
  profile: {
    familyName: string;
    givenName: string;
    middleName?: string;
    nickname?: string;
    preferredUsername: string;
    profile?: string;
    website?: string;
    gender?: string;
    birthdate?: string;
    zoneinfo?: string;
    locale?: string;
    address?: {
      formatted?: string;
      streetAddress?: string;
      locality?: string;
      region?: string;
      postalCode?: string;
      country?: string;
    };
    // customs
    addresses?: {
      formatted?: string;
      streetAddress?: string;
      locality?: string;
      region?: string;
      postalCode?: string;
      country?: string;
    }[];
    phones?: {
      phone?: string;
      countryCode?: string;
      prefix?: string;
      number?: string;
    }[];
  };
};
