import { NextRequest, NextResponse } from "next/server";
import { getPaytmConfig, verifyPaytmSignature } from "@/lib/paytm";

export const runtime = "nodejs";

function redirectUrl(req: NextRequest, path: string): URL {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, "");
  return new URL(path, siteUrl);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const params = Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, String(value)]));

  const status = params.STATUS || "";
  const orderId = params.ORDERID || "";
  const txnId = params.TXNID || "";
  const amount = params.TXNAMOUNT || "";
  const responseMessage = params.RESPMSG || "";
  const checksum = params.CHECKSUMHASH || "";
  const config = getPaytmConfig();

  let isSignatureValid = false;
  try {
    isSignatureValid = Boolean(checksum) && verifyPaytmSignature(params, config.merchantKey, checksum);
  } catch (err) {
    console.error("Paytm callback signature verification failed:", err);
  }

  if (!isSignatureValid) {
    const failureUrl = redirectUrl(req, "/payment-failure");
    failureUrl.searchParams.set("txnid", orderId);
    failureUrl.searchParams.set("message", "Security verification failed. Paytm checksum did not match.");
    return NextResponse.redirect(failureUrl, 302);
  }

  if (status === "TXN_SUCCESS") {
    const successUrl = redirectUrl(req, "/payment-success");
    successUrl.searchParams.set("txnid", orderId);
    successUrl.searchParams.set("paymentId", txnId || "unknown");
    successUrl.searchParams.set("total", amount);
    successUrl.searchParams.set("method", "Paytm");
    return NextResponse.redirect(successUrl, 302);
  }

  const failureUrl = redirectUrl(req, "/payment-failure");
  failureUrl.searchParams.set("txnid", orderId);
  failureUrl.searchParams.set("amount", amount);
  failureUrl.searchParams.set("message", responseMessage || "Your payment could not be processed by Paytm.");
  return NextResponse.redirect(failureUrl, 302);
}
