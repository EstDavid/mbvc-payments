import { RedsysRequestParameters } from "@/types/redsys";
import { requireEnv } from "@/lib/utils/server";
import { handleResponseError } from "@/lib/error-handling";
import { getHeaders } from "@/app/api/helpers";

const apiAddressTrataPeticionREST = requireEnv("REDSYS_API_ADDRESS_TRATA_PETICION_REST");
const apiAddressCheckRtpUsuario = requireEnv("REDSYS_API_ADDRESS_CHECK_RTP_USUARIO");

export async function checkRtpUsuario (requestParameters: RedsysRequestParameters): Promise<RedsysRequestParameters> {
  const response = await fetch(apiAddressCheckRtpUsuario, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(requestParameters)
  });

  await handleResponseError(response, 'Rtp check request failed');

  const result = await response.json();
  return result;
}

export async function sendRtpRequest (requestParameters: RedsysRequestParameters): Promise<RedsysRequestParameters> {
  const response = await fetch(apiAddressTrataPeticionREST, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(requestParameters)
  });

  await handleResponseError(response, 'Rtp request failed');

  return await response.json();
}
