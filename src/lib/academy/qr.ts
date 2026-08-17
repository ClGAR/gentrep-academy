import QRCode from "qrcode";
import { getSiteUrl } from "@/lib/env";

export function certificateVerifyUrl(certificateCode: string) {
  return `${getSiteUrl()}/certificates/verify/${encodeURIComponent(certificateCode)}`;
}

export async function certificateQrDataUrl(certificateCode: string) {
  return QRCode.toDataURL(certificateVerifyUrl(certificateCode), {
    margin: 1,
    width: 240,
    color: { dark: "#0f0f18", light: "#ffffff" },
  });
}
