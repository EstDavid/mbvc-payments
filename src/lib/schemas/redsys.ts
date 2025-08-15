import { z } from "zod";
import { requireEnv } from "../utils/server";

const MAX_CHAR_DESCRIPTION = 125;
const MAX_CHAR_NAME = 60;

const redsysSignatureVersion = requireEnv('REDSYS_SIGNATURE_VERSION');

function trimString (str: string, maxLength: number) {
  return str.length > maxLength ? str.slice(0, maxLength) : str;
}

function trimDescriptionString (val: unknown,) {
  if (typeof val === "string") {
    return trimString(val, MAX_CHAR_DESCRIPTION);
  }
  return val;
}

export const paymentSchema = z.object({
  phoneNumber: z.string().regex(/^[679]\d{8}$/, "Invalid phone number"),
  amount: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount")
    .refine(val => parseFloat(val) >= 1, { message: "Amount must be 1 euro or above" }),
  productDescription: z.preprocess(trimDescriptionString, z.string('Invalid product description').min(1)),
  name: z.preprocess(trimDescriptionString, z.string('Invalid member name').min(4)),
  surname: z.preprocess(trimDescriptionString, z.string('Invalid member surname').min(4)),
  email: z.email("Invalid email address"),
  language: z.enum(['es', 'en'])
}).transform((payment) => {
  return {
    ...payment,
    memberName: trimString(`${payment.name} ${payment.surname}`, MAX_CHAR_NAME)
  };
});

export const redsysEncodedResponseSchema = z.object({
  Ds_MerchantParameters: z.string(),
  Ds_Signature: z.string(),
  Ds_SignatureVersion: z.literal(redsysSignatureVersion)
});

export const redsysRestResponseSchema = z.object({
  Ds_Amount: z.string(),
  Ds_Currency: z.string(),
  Ds_Order: z.coerce.number(),
  Ds_MerchantCode: z.string(),
  Ds_Terminal: z.string(),
  Ds_Response: z.string(),
  Ds_AuthorisationCode: z.string().nullish(),
  Ds_TransactionType: z.string(),
  Ds_SecurePayment: z.string().nullish(),
  Ds_Language: z.string(),
  Ds_MerchantData: z.string().nullish(),
  Ds_Bizum_IdOper: z.string().nullish(),
  Ds_ProcessedPayMethod: z.string().nullish(),
  Ds_RtpResponse: z.string().nullish(),
  Ds_RtpDescription: z.string().nullish()
});

export const redsysRestEventSchema = redsysRestResponseSchema
  .extend({
    Ds_Date: z.string(),
    Ds_Hour: z.string(),
    Ds_ConsumerLanguage: z.string(),
    Ds_Bizum_CuentaTruncada: z.string().nullish(),
    Ds_Bizum_MobileNumber: z.string().nullish()
  })
  .omit({
    Ds_Language: true
  });

export const redsysCheckRtpResponseSchema = z.object({
  Ds_RtpStatus: z.literal('OK').or(z.literal('KO')),
  Ds_RtpResponse: z.string(),
  Ds_RtpDescription: z.string(),
  Ds_MerchantCode: z.string(),
  Ds_Terminal: z.string(),
  Ds_Order: z.string(),
  Ds_Currency: z.string(),
  Ds_Amount: z.string()
});

export const redsysErrorResponseSchema = z.object({
  errorCode: z.string()
});
