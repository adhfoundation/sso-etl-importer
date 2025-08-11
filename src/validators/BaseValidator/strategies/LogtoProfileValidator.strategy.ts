import { UserWithRelations } from "repositories/StgUserRepository";
import { BaseValidator, ValidationContext } from "../BaseValidator";

export class LogtoProfileValidator extends BaseValidator {
  protected async handle(
    user: UserWithRelations,
    context: ValidationContext
  ): Promise<void> {
    if (!user.stg_profile) {
      context.logs.push("Perfil ausente");
      return;
    }

    const profile = user.stg_profile;
    let hasValidProfile = false;

    // Validar nome (given_name ou family_name)
    if (profile.given_name || profile.family_name) {
      hasValidProfile = true;
      context.logs.push("Nome do perfil presente");
    } else {
      context.logs.push("Nome do perfil ausente");
    }

    // Validar nickname
    if (profile.nickname) {
      hasValidProfile = true;
      context.logs.push("Nickname presente");
    }

    // Validar website
    if (profile.website) {
      try {
        new URL(profile.website);
        context.logs.push("Website válido");
      } catch {
        context.errors.push(`Website inválido: ${profile.website}`);
      }
    }

    // Validar gênero
    if (profile.gender) {
      const validGenders = ['male', 'female', 'other'];
      if (!validGenders.includes(profile.gender.toLowerCase())) {
        context.errors.push(`Gênero inválido: ${profile.gender} - deve ser male, female ou other`);
      } else {
        context.logs.push("Gênero válido");
      }
    }

    // Validar data de nascimento
    if (profile.birthdate) {
      const birthDate = new Date(profile.birthdate);
      const today = new Date();
      
      if (isNaN(birthDate.getTime())) {
        context.errors.push(`Data de nascimento inválida: ${profile.birthdate}`);
      } else if (birthDate > today) {
        context.errors.push(`Data de nascimento no futuro: ${profile.birthdate}`);
      } else {
        context.logs.push("Data de nascimento válida");
      }
    }

    // Validar locale
    if (profile.locale) {
      const validLocales = ['pt-BR', 'en-US', 'es-ES'];
      if (!validLocales.includes(profile.locale)) {
        context.logs.push(`Locale não padrão: ${profile.locale}`);
      } else {
        context.logs.push("Locale válido");
      }
    }

    // Validar zoneinfo
    if (profile.zoneinfo) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: profile.zoneinfo });
        context.logs.push("Zoneinfo válido");
      } catch {
        context.errors.push(`Zoneinfo inválido: ${profile.zoneinfo}`);
      }
    }

    if (hasValidProfile) {
      context.validations.profile = true;
      context.logs.push("Perfil válido para LogTo");
    } else {
      context.logs.push("Perfil mínimo não atendido");
    }
  }
}
