import { RedsysTransactionParameters } from '@/types/redsys';
import crypto from 'crypto';
import z, { ZodError } from 'zod';
import { redsysEncodedResponseSchema, redsysErrorResponseSchema } from '../schemas/redsys';
import { DecodedResponseValidationError, EncodedResponseValidationError, RedsysGatewayError } from '../error-handling';

export function zeroPad (buf: string | Buffer<ArrayBuffer>, blocksize: number) {
  const buffer = typeof buf === 'string' ? Buffer.from(buf, 'utf8') : buf;
  const pad = Buffer.alloc((blocksize - (buffer.length % blocksize)) % blocksize, 0);
  return Buffer.concat([buffer, pad]);
}

export function encrypt3DES (str: string, apiKey: string) {
  const secretKey = Buffer.from(apiKey, 'base64');
  const iv = Buffer.alloc(8, 0);
  const cipher = crypto.createCipheriv('des-ede3-cbc', secretKey, iv);
  cipher.setAutoPadding(false);
  return cipher.update(zeroPad(str, 8), undefined, 'base64')
    + cipher.final('base64');
}

export function mac256 (data: string, orderKey: string) {
  return crypto.createHmac('sha256', Buffer.from(orderKey, 'base64'))
    .update(data)
    .digest('base64');
}

export function createMerchantParameters (data: RedsysTransactionParameters) {
  return Buffer.from(JSON.stringify(data), 'utf8').toString('base64');
}

export function createMerchantSignature (data: RedsysTransactionParameters, apiKey: string) {
  const merchantParameters = createMerchantParameters(data);
  const orderId = data.DS_MERCHANT_ORDER;
  const orderKey = encrypt3DES(orderId, apiKey);

  return mac256(merchantParameters, orderKey);
}

export function decodeMerchantParameters (encodedData: string) {
  const decodedString = Buffer.from(encodedData, 'base64').toString('utf8');
  const decodedData = JSON.parse(decodedString);
  const res: Record<string, string> = {};
  Object.keys(decodedData).forEach((param) => {
    res[decodeURIComponent(param)] = decodeURIComponent(decodedData[param]);
  });
  return res;
}

export function getRedsysResponseData<T> (
  redsysResponse: Record<string, unknown>,
  schema: z.ZodObject
): T {
  const validatedRedsysResponse = redsysEncodedResponseSchema.safeParse(redsysResponse);
  if (!validatedRedsysResponse.success) {
    try {
      const validatedRedsysErrorResponse = redsysErrorResponseSchema.parse(redsysResponse);
      throw new RedsysGatewayError(
        `Redsys response error code: ${validatedRedsysErrorResponse.errorCode}`,
        validatedRedsysErrorResponse.errorCode
      );
    } catch (error) {
      if (error instanceof ZodError) {
        throw new EncodedResponseValidationError('Encoded response from Redsys is invalid');
      } else if (error instanceof RedsysGatewayError) {
        throw error;
      } else {
        throw new RedsysGatewayError('Unknown Redsys response', 'UNKNOWN');
      }
    }
  }

  const decodedData = decodeMerchantParameters(validatedRedsysResponse.data.Ds_MerchantParameters);
  const validatedDecodedCheckRtp = schema.safeParse(decodedData);
  if (!validatedDecodedCheckRtp.success) {
    throw new DecodedResponseValidationError('Decoded response from Redsys is invalid');
  }

  return validatedDecodedCheckRtp.data as T;
}