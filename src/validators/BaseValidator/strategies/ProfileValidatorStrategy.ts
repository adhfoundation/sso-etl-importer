import { UserWithRelations } from "repositories/StgUserRepository";
import { BaseValidator, ValidationContext } from "../BaseValidator";
import { Profile } from "domain/Profile";
import { Address } from "domain/Address";
import { stg_profile } from "@prisma/client";

/** Converte null para undefined para melhor compatibilidade com tipos do domínio */
function nullToUndefined<T>(value: T | null | undefined): T | undefined {
  return value === null ? undefined : value;
}

export class ProfileValidatorStrategy extends BaseValidator {
  protected async handle(user: UserWithRelations, context: ValidationContext): Promise<void> {
    const rawProfile = user.stg_profile as (stg_profile & { stg_address: any[] }) | null;
    if (!rawProfile) {
      context.logs.push("Perfil ausente");
      return;
    }

const profile = new Profile({
  ...rawProfile,
  familyName: nullToUndefined(rawProfile.family_name),
  givenName: nullToUndefined(rawProfile.given_name),
  nickname: nullToUndefined(rawProfile.nickname),
  preferredUsername: nullToUndefined(rawProfile.preferred_username),
  profile: nullToUndefined(rawProfile.profile),
  website: nullToUndefined(rawProfile.website),
  gender: nullToUndefined(rawProfile.gender),
  birthdate: rawProfile.birthdate 
    ? typeof rawProfile.birthdate === "string" 
      ? rawProfile.birthdate 
      : rawProfile.birthdate.toISOString()
    : undefined,
  zoneinfo: nullToUndefined(rawProfile.zoneinfo),
  locale: nullToUndefined(rawProfile.locale),
  address: rawProfile.stg_address && rawProfile.stg_address.length > 0
     ? new Address({
       country: nullToUndefined(rawProfile.stg_address[0].country),
       region: nullToUndefined(rawProfile.stg_address[0].region),
       locality: nullToUndefined(rawProfile.stg_address[0].locality),
       streetAddress: nullToUndefined(rawProfile.stg_address[0].street_address),
       postalCode: nullToUndefined(rawProfile.stg_address[0].postal_code),
       formatted: nullToUndefined(rawProfile.stg_address[0].formatted),
     })
     : undefined,
});

    if (!profile.hasMinimum()) {
      context.logs.push("Perfil mínimo não atendido");
      return;
    }

    if (profile.hasInvalidFields()) {
      context.logs.push("Perfil com campos inválidos");
      return;
    }

    this.validateName(profile, context);
    this.validateNickname(profile, context);
    this.validateWebsite(profile, context);
    this.validateGender(profile, context);
    this.validateBirthdate(profile, context);
    this.validateLocale(profile, context);
    this.validateZoneInfo(profile, context);

    context.validations.profile = true;
    context.logs.push("Perfil válido para LogTo");
  }

  private validateName(profile: Profile, context: ValidationContext): void {
    if (profile.givenName || profile.familyName) {
      context.logs.push("Nome do perfil presente");
    } else {
      context.logs.push("Nome do perfil ausente");
    }
  }

  private validateNickname(profile: Profile, context: ValidationContext): void {
    if (profile.nickname) {
      context.logs.push("Nickname presente");
    }
  }

  private validateWebsite(profile: Profile, context: ValidationContext): void {
    if (!profile.isValidWebsite()) {
      context.errors.push(`Website inválido: ${profile.website}`);
      return;
    }
    if (profile.website) {
      context.logs.push("Website válido");
    }
  }

  private validateGender(profile: Profile, context: ValidationContext): void {
    if (!profile.gender) return;

    if (!profile.isValidGender()) {
      context.errors.push(`Gênero inválido: ${profile.gender} - deve ser male, female ou other`);
      return;
    }
    context.logs.push("Gênero válido");
  }

  private validateBirthdate(profile: Profile, context: ValidationContext): void {
    if (!profile.birthdate) return;

    if (!profile.isValidBirthdate()) {
      context.errors.push(`Data de nascimento inválida ou no futuro: ${profile.birthdate}`);
      return;
    }
    context.logs.push("Data de nascimento válida");
  }

  private validateLocale(profile: Profile, context: ValidationContext): void {
    if (!profile.locale) return;

    if (!profile.isValidLocale()) {
      context.logs.push(`Locale não padrão: ${profile.locale}`);
      return;
    }
    context.logs.push("Locale válido");
  }

  private validateZoneInfo(profile: Profile, context: ValidationContext): void {
    if (!profile.zoneinfo) return;

    if (!profile.isValidZoneInfo()) {
      context.errors.push(`Zoneinfo inválido: ${profile.zoneinfo}`);
      return;
    }
    context.logs.push("Zoneinfo válido");
  }
}
