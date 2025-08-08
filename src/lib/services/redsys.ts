import { RedsysRequestParameters } from "@/types/redsys";
import { requireEnv } from "../utils/server";

const apiAddressTrataPeticionREST = requireEnv("REDSYS_API_ADDRESS_TRATA_PETICION_REST");
const apiAddressCheckRtpUsuario = requireEnv("REDSYS_API_ADDRESS_CHECK_RTP_USUARIO");

export async function checkRtpUsuario (requestParameters: RedsysRequestParameters): Promise<RedsysRequestParameters> {
  const response = await fetch(apiAddressCheckRtpUsuario, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestParameters)
  });

  if (!response.ok) {
    throw new Error("Rtp check request failed");
  }

  const result = await response.json();
  return result;
}

export async function sendRtpRequest (requestParameters: RedsysRequestParameters): Promise<RedsysRequestParameters> {
  const response = await fetch(apiAddressTrataPeticionREST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestParameters)
  });

  if (!response.ok) {
    throw new Error("Rtp request failed");
  }

  return await response.json();
}
