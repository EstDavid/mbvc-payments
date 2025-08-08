"use server";
import { getZodIssues } from '@/lib/error-handling';
import { paymentSchema, redsysCheckRtpResponseSchema, redsysRestResponseSchema } from '@/lib/schemas/redsys';
import { formDataToObject, requireEnv } from '@/lib/utils/server';
import { checkRtpUsuario, sendRtpRequest } from '@/lib/services/redsys';
import { PaymentData, RedsysRequestParameters, RedsysTransactionParameters } from '@/types/redsys';
import { createMerchantParameters, createMerchantSignature, decodeMerchantParameters } from '../utils/crypto';
import { ErrorTypes } from '@/types/error-handling';
import { z } from 'zod';

const redsysApiKey = requireEnv("REDSYS_API_KEY");
const redsysSignatureVersion = requireEnv("REDSYS_SIGNATURE_VERSION");

function getRedsysResponseData<T> (redsysResponse: RedsysRequestParameters, schema: z.ZodObject): T {
  const decodedData = decodeMerchantParameters(redsysResponse.Ds_MerchantParameters);
  const validatedDecodedCheckRtp = schema.safeParse(decodedData);
  if (!validatedDecodedCheckRtp.success) {
    throw validatedDecodedCheckRtp.error;
  }
  return validatedDecodedCheckRtp.data as T;
}

function createRequestParameters (paymentData: PaymentData): RedsysRequestParameters {
  const {
    phoneNumber,
    amount,
    orderNumber,
    productDescription,
    memberName,
  } = paymentData;

  const amountCents = amount ? Math.round(parseFloat(amount) * 100).toString() : "0";

  const transactionParameters: RedsysTransactionParameters = {
    DS_MERCHANT_PAYMETHODS: "z",
    DS_MERCHANT_TRANSACTIONTYPE: "0",
    DS_MERCHANT_BIZUM_MOBILENUMBER: "+34700000000", // TODO: phoneNumber,  Add phone number variable
    DS_MERCHANT_MERCHANTURL: "https://smee.io/iOl3U5ZdowahwW16",
    DS_MERCHANT_AMOUNT: amountCents,
    DS_MERCHANT_CURRENCY: "978",
    DS_MERCHANT_ORDER: orderNumber || "1612280119",
    DS_MERCHANT_MERCHANTCODE: "362523656",
    DS_MERCHANT_SIGNATURE: redsysApiKey,
    DS_MERCHANT_TERMINAL: "001",
    DS_MERCHANT_PRODUCTDESCRIPTION: productDescription,
    DS_MERCHANT_TITULAR: memberName,
    DS_MERCHANT_MERCHANTNAME: "MONTGO BVC",
    DS_MERCHANT_URLOK: "http://localhost:3000/success",
    DS_MERCHANT_URLKO: "http://localhost:3000?status=fail",
  };

  const Ds_MerchantParameters = createMerchantParameters(transactionParameters);
  const Ds_Signature = createMerchantSignature(transactionParameters, redsysApiKey);
  const Ds_SignatureVersion = redsysSignatureVersion;

  return {
    Ds_MerchantParameters,
    Ds_Signature,
    Ds_SignatureVersion
  };
}

export async function submitRedsysPayment (formData: FormData) {
  const paymentData = formDataToObject(formData);

  const validatedFields = paymentSchema.safeParse(paymentData);
  if (!validatedFields.success) {
    throw validatedFields.error;
  }

  try {
    const transactionParameters = createRequestParameters(validatedFields.data);

    const checkRtpResponse = await checkRtpUsuario(transactionParameters);
    const checkRtpData = getRedsysResponseData<z.infer<typeof redsysCheckRtpResponseSchema>>(checkRtpResponse, redsysCheckRtpResponseSchema);

    if (checkRtpData.Ds_RtpStatus === "OK") {
      // User has RTP
      const rtpRequestResponse = await sendRtpRequest(transactionParameters);
      const rtpRequestData = getRedsysResponseData<z.infer<typeof redsysRestResponseSchema>>(rtpRequestResponse, redsysRestResponseSchema);
      return {
        valid: true,
        rtpRequestData
      };
    } else if (checkRtpData.Ds_RtpResponse === "BIZ00000") {
      // User does not have RTP
      return {
        valid: true,
        redirectParameters: transactionParameters
      };

    } else {
      return {
        valid: false,
        message: 'User has no Bizum',
        errorType: ErrorTypes.NoBizumError
      };
    }
  } catch (error: any) {
    // Log error for debugging
    console.error('submitRedsysPayment error:', error);

    // Zod error (should be caught above, but just in case)
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: getZodIssues(error),
        message: 'Validation error',
        errorType: ErrorTypes.ValidationError
      };
    }

    // Network or API error
    if (error?.name === 'FetchError' || error?.code === 'ECONNREFUSED' || error?.message?.includes('network')) {
      return {
        valid: false,
        message: 'Network or API error. Please try again later.',
        errorType: ErrorTypes.NetworkError
      };
    }

    // Unexpected error
    return {
      valid: false,
      message: error?.message || 'An unexpected error occurred',
      errorType: ErrorTypes.UnknownError
    };
  }
}

