import { z } from "zod";

const MAX_CHAR_DESCRIPTION = 125;
const MAX_CHAR_NAME = 60;

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
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
  orderNumber: z.string().max(125, "Must be 125 characters or less"),
  productDescription: z.preprocess(trimDescriptionString, z.string('Invalid product description').min(1)),
  name: z.preprocess(trimDescriptionString, z.string('Invalid member name').min(1)),
  surname: z.preprocess(trimDescriptionString, z.string('Invalid member surname').min(1)),
}).transform((payment) => {
  return {
    ...payment,
    memberName: trimString(`${payment.name} ${payment.surname}`, MAX_CHAR_NAME)
  };
});

export const redsysRestResponseSchema =
  z.object({
    Ds_Amount: z.string(),
    Ds_Currency: z.string(),
    Ds_Order: z.string(),
    Ds_MerchantCode: z.string(),
    Ds_Terminal: z.string(),
    Ds_Response: z.string(),
    Ds_AuthorisationCode: z.string(),
    Ds_TransactionType: z.string(),
    Ds_SecurePayment: z.string().nullish(),
    Ds_Language: z.string(),
    Ds_MerchantData: z.string(),
    Ds_Bizum_IdOper: z.string(),
    Ds_ProcessedPayMethod: z.string(),
    Ds_RtpResponse: z.string(),
    Ds_RtpDescription: z.string()
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
