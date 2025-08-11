import { RedsysTransactionParameters } from '@/types/redsys';
import crypto from 'crypto';

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