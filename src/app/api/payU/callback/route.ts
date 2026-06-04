import { NextRequest, NextResponse } from "next/server";
import { getPayUConfig, verifyResponseHash } from "@/lib/payu";

/**
 * Route handler that serves as the success/failure URL (surl/furl) for PayU.
 * PayU performs a client POST redirect containing form-encoded transaction response data.
 * This API parses that data, verifies the signature using the SHA-512 reverse hash,
 * and performs a server-side redirect (302 GET) to the user-facing success or failure pages.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Parse the application/x-www-form-urlencoded payload sent by PayU
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.info("Received callback POST from PayU:", {
      txnid: params.txnid,
      status: params.status,
      mihpayid: params.mihpayid,
    });

    // 2. Load config and verify signature hash
    const config = getPayUConfig();
    const isSignatureValid = verifyResponseHash(params, config);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // 3. If signature verification fails, redirect to failure page with security error
    if (!isSignatureValid) {
      console.error("PayU callback signature verification failed. Possible tampering.", { txnid: params.txnid });
      const failureUrl = new URL(`${siteUrl}/payment-failure`);
      failureUrl.searchParams.set("txnid", params.txnid || "unknown");
      failureUrl.searchParams.set("message", "Security verification failed. The transaction response hash did not match.");
      return NextResponse.redirect(failureUrl.toString(), 302);
    }

    // 4. Extract UDF (User Defined Fields) details passed during checkout initialization
    const productSlug = params.udf1 || "";
    const packSize = params.udf2 || "";
    const quantity = params.udf3 || "";
    
    // 5. Check payment status
    if (params.status === "success") {
      const successUrl = new URL(`${siteUrl}/payment-success`);
      successUrl.searchParams.set("txnid", params.txnid);
      successUrl.searchParams.set("paymentId", params.mihpayid || "unknown");
      successUrl.searchParams.set("product", productSlug);
      successUrl.searchParams.set("size", packSize);
      successUrl.searchParams.set("qty", quantity);
      successUrl.searchParams.set("name", params.firstname || "Customer");
      successUrl.searchParams.set("total", params.amount);
      successUrl.searchParams.set("method", params.net_amount_debit ? "PayU Card/NetBanking" : "PayU Hosted Checkout");
      
      console.info("Payment successful, redirecting customer to success page.", { txnid: params.txnid });
      return NextResponse.redirect(successUrl.toString(), 302);
    } else {
      const failureUrl = new URL(`${siteUrl}/payment-failure`);
      failureUrl.searchParams.set("txnid", params.txnid);
      failureUrl.searchParams.set("amount", params.amount);
      
      // Select the best error message from PayU payload
      const errorMessage = params.error_Message || params.unmappedstatus || "Your payment could not be processed by the bank.";
      failureUrl.searchParams.set("message", errorMessage);

      console.warn("Payment failed, redirecting customer to failure page.", { txnid: params.txnid, error: errorMessage });
      return NextResponse.redirect(failureUrl.toString(), 302);
    }
  } catch (err: any) {
    console.error("Fatal error inside PayU callback POST handler:", err);
    // In case of fatal crash, fallback redirect to generic failure page
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return NextResponse.redirect(`${siteUrl}/payment-failure?message=A+fatal+server+error+occurred+during+payment+redirection.`, 302);
  }
}
