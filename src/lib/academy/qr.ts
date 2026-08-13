import QRCode from "qrcode";
import { getSiteUrl } from "@/lib/env";

export function certificateVerifyUrl(certificateId: string) {
  return `${getSiteUrl()}/verify/${certificateId}`;
}

export async function certificateQrDataUrl(certificateId: string) {
  return QRCode.toDataURL(certificateVerifyUrl(certificateId), {
    margin: 1,
    width: 240,
    color: { dark: "#0f0f18", light: "#ffffff" },
  });
}
