'use client';

import { RedsysRequestParameters } from "@/types/redsys";
import { Ref } from "react";

const redsysApiAddress = process.env.NEXT_PUBLIC_REDSYS_API_ADDRESS_REDIRECTION;

export default function RedsysRequestForm ({
  request,
  formRef
}:
  {
    request: RedsysRequestParameters | null;
    formRef: Ref<HTMLFormElement>;
  }) {
  if (!redsysApiAddress) {
    throw new Error('Redsys redirection address not defined');
  }

  return (
    <form method="POST" action={redsysApiAddress} ref={formRef}>
      <input type="hidden" name="Ds_MerchantParameters" value={request?.Ds_MerchantParameters || ""} />
      <input type="hidden" name="Ds_Signature" value={request?.Ds_Signature || ""} />
      <input type="hidden" name="Ds_SignatureVersion" value={request?.Ds_SignatureVersion || ""} />
    </form>
  );
}