import { RootObject } from "types/generated-types";
import { UserLogtoPostPayload } from "types/UserLogtoPostPayload";

export function medcelAdminStudentsMapper(
  root: RootObject
): UserLogtoPostPayload {
  const firstName = root.firstName || "";
  const lastName = root.lastName || "";
  const middleName: string = (root.personal?.middleName as string) || "";

  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");

  const phone = root.contact?.phones?.[root.contact?.mainPhone ?? 0];
  const email = root.contact?.emails?.[root.contact?.mainEmail ?? 0];
  const address = root.contact?.addresses?.[0] || {};

  //custom
  const addresses = root.contact?.addresses || [];
  const phones = root.contact?.phones || [];

  const cpf =
    root.personal?.documents?.find((doc) => doc.documentType === "cpf")
      ?.number || null;

  const addressValidation = (address: any) => {
    const validateAddress = [
      address.name,
      address.number,
      address.district,
      address.city,
      address.state,
      address.postalCode,
    ]
      .filter((item) => !!item)
      .join(" ");

    const validateStreet = [address.name, address.number]
      .filter((item) => !!item)
      .join(" ");

    const addressObject = {
      formatted: asString(validateAddress || ""),
      streetAddress: asString(validateStreet || ""),
      locality: asString(address?.city || ""),
      region: asString(address?.state || ""),
      postalCode: asString(address?.postalCode || ""),
      country: asString("BR"),
    };

    return addressObject;
  };
  return {
    primaryPhone: normalizePhone([
      phone?.countryCode,
      phone?.prefix,
      phone?.number,
    ]),
    primaryEmail: isValidEmail(email?.name) ? email.name : "",
    username: root.account?.username || "",
    password: root.account?.password || "",
    name: fullName,
    cpf,
    profile: {
      givenName: firstName,
      familyName: lastName,
      middleName: middleName ?? "",
      nickname: root.account?.username ?? "",
      preferredUsername: root.account?.username ?? "",
      gender: root.gender,
      birthdate: parseBirthDate(root.personal?.birthDate),
      // profile: undefined,
      website: undefined,
      zoneinfo: "America/Sao_Paulo",
      locale: "pt-BR",
      address: addressValidation(address),

      //customs
      addresses: addresses?.map((addr) => addressValidation(addr)),
      ///
      phones: phones?.map((phone) => ({
        phone: normalizePhone([
          phone?.countryCode,
          phone?.prefix,
          phone?.number,
        ]),
        countryCode: phone?.countryCode,
        prefix: phone?.prefix,
        number: phone?.number,
      })),
      ///
    },
  };
}

function parseBirthDate(birthDateObj?: {
  $date?: { $numberLong?: string };
}): string | undefined {
  const raw = birthDateObj?.$date?.$numberLong;
  if (!raw || isNaN(Number(raw))) return undefined;
  const date = new Date(Number(raw));
  return date.toISOString().split("T")[0];
}

function normalizePhone(parts: (string | undefined)[]): string {
  return parts
    .filter(Boolean)
    .map((p) => p!.replace(/\D/g, ""))
    .join("");
}

function isValidEmail(email?: string): email is string {
  return !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
