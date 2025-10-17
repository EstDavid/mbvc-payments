"use server";
import { DecodedResponseValidationError, EncodedResponseValidationError, getZodIssues, RedsysGatewayError } from '@/lib/error-handling';
import { paymentSchema, redsysCheckRtpResponseSchema, redsysRestResponseSchema } from '@/lib/schemas/redsys';
import { addQueryParameterToAbsoluteUrl, formDataToObject, requireEnv } from '@/lib/utils/server';
import { checkRtpUsuario, sendRtpRequest } from '@/lib/services/redsys';
import { RedsysRequestParameters, RedsysTransactionParameters } from '@/types/redsys';
import { createMerchantParameters, createMerchantSignature, getRedsysResponseData } from '../utils/crypto';
import { ErrorTypes } from '@/types/error-handling';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const DS_MERCHANT_SIGNATURE = requireEnv('REDSYS_API_KEY');
const redsysSignatureVersion = requireEnv('REDSYS_SIGNATURE_VERSION');
const DS_MERCHANT_MERCHANTCODE = requireEnv('REDSYS_MERCHANT_CODE');
const DS_MERCHANT_TERMINAL = requireEnv('REDSYS_MERCHANT_TERMINAL');
const DS_MERCHANT_MERCHANTURL = requireEnv('REDSYS_MERCHANT_URL');
const DS_MERCHANT_URLOK = requireEnv('REDSYS_MERCHANT_URLOK');
const DS_MERCHANT_URLKO = requireEnv('REDSYS_MERCHANT_URLKO');
const apiAddress = requireEnv('REDSYS_API_ADDRESS_CHECK_RTP_USUARIO');

const orderNumberCodePadding = parseInt(requireEnv('ORDER_NUMBER_CODE_PADDING'));

function createRequestParameters (paymentData: z.infer<typeof paymentSchema>, orderNumber: string): RedsysRequestParameters {
  const {
    phoneNumber,
    countryDialCode,
    amount,
    productDescription,
    memberName,
    language
  } = paymentData;

  const amountCents = amount ? Math.round(parseFloat(amount) * 100).toString() : '0';
  const isTestEnvironment = /sis-t/.test(apiAddress);

  const dsMerchantUrlOkWithParams = addQueryParameterToAbsoluteUrl(
    DS_MERCHANT_URLOK,
    'language',
    language
  );

  const dsMerchantUrlKoWithParams = addQueryParameterToAbsoluteUrl(
    DS_MERCHANT_URLKO,
    'language',
    language
  );

  const consumerLanguages: Record<string, RedsysTransactionParameters["DS_MERCHANT_CONSUMERLANGUAGE"]> = {
    es: '001',
    en: '002'
  };

  // Construct full international phone number
  const fullPhoneNumber = isTestEnvironment ? `+34700000000` : `${countryDialCode}${phoneNumber}`;

  const transactionParameters: RedsysTransactionParameters = {
    DS_MERCHANT_PAYMETHODS: "z",
    DS_MERCHANT_TRANSACTIONTYPE: "0",
    DS_MERCHANT_BIZUM_MOBILENUMBER: fullPhoneNumber,
    DS_MERCHANT_MERCHANTURL,
    DS_MERCHANT_AMOUNT: amountCents,
    DS_MERCHANT_CURRENCY: "978",
    DS_MERCHANT_ORDER: orderNumber,
    DS_MERCHANT_MERCHANTCODE,
    DS_MERCHANT_CONSUMERLANGUAGE: consumerLanguages[language],
    DS_MERCHANT_SIGNATURE,
    DS_MERCHANT_TERMINAL,
    DS_MERCHANT_PRODUCTDESCRIPTION: productDescription,
    DS_MERCHANT_TITULAR: memberName,
    DS_MERCHANT_URLOK: dsMerchantUrlOkWithParams,
    DS_MERCHANT_URLKO: dsMerchantUrlKoWithParams
  };

  const Ds_MerchantParameters = createMerchantParameters(transactionParameters);
  const Ds_Signature = createMerchantSignature(transactionParameters, DS_MERCHANT_SIGNATURE);
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
    return {
      valid: false,
      errors: getZodIssues(validatedFields.error),
      message: 'Validation error',
      errorType: ErrorTypes.FormValidationError
    };
  }

  const { data } = validatedFields;

  const newOrder = await prisma.order.create({
    data: {
      amount: parseFloat(data.amount),
      description: data.productDescription,
      status: "Pending",
      language: data.language,
      email: data.email,
      user: {
        connectOrCreate: {
          where: {
            phoneNumber: data.phoneNumber
          },
          create: {
            phoneNumber: data.phoneNumber,
            name: data.name,
            lastName: data.surname
          }
        }
      }
    }
  });

  const orderNumber = newOrder.id.toString().padStart(orderNumberCodePadding, "0");

  try {
    const transactionParameters = createRequestParameters(data, orderNumber);

    const checkRtpResponse = await checkRtpUsuario(transactionParameters);
    const checkRtpData = getRedsysResponseData<z.infer<typeof redsysCheckRtpResponseSchema>>(checkRtpResponse, redsysCheckRtpResponseSchema);

    if ('Ds_RtpStatus' in checkRtpData && checkRtpData.Ds_RtpStatus === "OK") {
      // User has RTP
      const rtpRequestResponse = await sendRtpRequest(transactionParameters);

      const rtpRequestData = getRedsysResponseData<z.infer<typeof redsysRestResponseSchema>>(rtpRequestResponse, redsysRestResponseSchema);

      return {
        valid: true,
        rtpRequestData
      };
    } else if ('Ds_RtpResponse' in checkRtpData && checkRtpData.Ds_RtpResponse === "BIZ00000") {
      // User does not have RTP
      return {
        valid: true,
        redirectParameters: transactionParameters
      };

    } else {
      // User does not have Bizum
      await prisma.order.update({
        where: { id: parseInt(orderNumber) },
        data: { status: "Cancelled" }
      });

      return {
        valid: false,
        message: 'User has no Bizum',
        errorType: ErrorTypes.NoBizumError
      };
    }
  } catch (error: unknown) {
    // Log error for debugging
    console.error('submitRedsysPayment error:', error);

    // Zod error (should be caught above, but just in case)
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: getZodIssues(error),
        message: 'Validation error',
        errorType: ErrorTypes.FormValidationError
      };
    }

    if (error instanceof RedsysGatewayError) {
      return {
        valid: false,
        message: error.message,
        errorType: ErrorTypes.PaymentGatewayError
      };
    }

    if (
      error instanceof EncodedResponseValidationError ||
      error instanceof DecodedResponseValidationError
    ) {
      return {
        valid: false,
        message: error.message,
        errorType: ErrorTypes.ServerValidationError
      };
    }

    if (typeof error === "object" && error) {    // Network or API error
      if (
        'name' in error && error?.name === 'FetchError' ||
        'code' in error && error?.code === 'ECONNREFUSED' ||
        'message' in error && typeof error?.message === 'string' && error?.message?.includes('network')) {
        return {
          valid: false,
          message: 'Network or API error. Please try again later.',
          errorType: ErrorTypes.NetworkError
        };
      }
    }

    // Unexpected error
    return {
      valid: false,
      message: error && typeof error === 'object' && 'message' in error && error?.message || 'An unexpected error occurred',
      errorType: ErrorTypes.UnknownError
    };
  }
}

