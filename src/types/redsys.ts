import { Language } from "./payment";

export type RedsysTransactionParameters = {
  DS_MERCHANT_PAYMETHODS: string;
  DS_MERCHANT_TRANSACTIONTYPE: string;
  DS_MERCHANT_BIZUM_MOBILENUMBER: string;
  DS_MERCHANT_MERCHANTURL: string;
  DS_MERCHANT_AMOUNT: string;
  DS_MERCHANT_CURRENCY: string;
  DS_MERCHANT_ORDER: string;
  DS_MERCHANT_MERCHANTCODE: string;
  DS_MERCHANT_CONSUMERLANGUAGE: '001' | '002';
  DS_MERCHANT_SIGNATURE: string;
  DS_MERCHANT_TERMINAL: string;
  DS_MERCHANT_PRODUCTDESCRIPTION: string;
  DS_MERCHANT_TITULAR: string;
  DS_MERCHANT_URLOK: string;
  DS_MERCHANT_URLKO: string;
};

export type RedsysRequestParameters = {
  Ds_MerchantParameters: string;
  Ds_Signature: string;
  Ds_SignatureVersion: string;
};