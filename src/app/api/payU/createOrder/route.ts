import { NextRequest, NextResponse } from "next/server";
import { getPayUConfig, generateRequestHash, getPayUCheckoutUrl, PayUPaymentRequest } from "@/lib/payu";

/**
 * Route handler to initiate a PayU Hosted Checkout transaction.
 * Generates a unique transaction ID, encodes user-defined fields (UDFs) to maintain state,
 * calculates the secure request hash, and returns the parameters along with the checkout URL.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      productInfo,
      firstName,
      email,
      phone,
      udf1, // productSlug
      udf2, // packSize
      udf3, // quantity
      udf4, // city, state, pin_code
      udf5, // street address
    } = body as {
      amount: string;
      productInfo: string;
      firstName: string;
      email: string;
      phone: string;
      udf1?: string;
      udf2?: string;
      udf3?: string;
      udf4?: string;
      udf5?: string;
    };

    // 1. Basic validation
    if (!amount || !productInfo || !firstName || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required checkout parameters: amount, productInfo, firstName, email, and phone are mandatory." },
        { status: 400 }
      );
    }

    // 2. Fetch PayU configuration
    const config = getPayUConfig();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // 3. Generate a secure, unique transaction ID
    // Format: txn_timestamp_randomString
    const uniqueTxnId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // 4. Construct payment request payload
    // We point surl and furl to our secure intermediate Route Handler (/api/payU/callback)
    const paymentRequest: PayUPaymentRequest = {
      txnid: uniqueTxnId,
      amount: parseFloat(amount).toFixed(2), // Ensure double decimal precision (e.g. 100.00)
      productinfo: productInfo.substring(0, 80), // PayU restricts productinfo length
      firstname: firstName.trim(),
      email: email.trim(),
      phone: phone.trim().replace(/\D/g, ""), // Keep numeric characters only
      surl: `${siteUrl}/api/payU/callback`,
      furl: `${siteUrl}/api/payU/callback`,
      udf1: udf1 || "",
      udf2: udf2 || "",
      udf3: udf3 || "",
      udf4: udf4 || "",
      udf5: udf5 || "",
    };

    // 5. Generate secure signature hash
    const requestHash = generateRequestHash(paymentRequest, config);

    // 6. Build the final form parameters object to be posted to PayU
    const payload = {
      key: config.key,
      txnid: paymentRequest.txnid,
      amount: paymentRequest.amount,
      productinfo: paymentRequest.productinfo,
      firstname: paymentRequest.firstname,
      email: paymentRequest.email,
      phone: paymentRequest.phone,
      surl: paymentRequest.surl,
      furl: paymentRequest.furl,
      hash: requestHash,
      service_provider: "payu_paisa",
      udf1: paymentRequest.udf1,
      udf2: paymentRequest.udf2,
      udf3: paymentRequest.udf3,
      udf4: paymentRequest.udf4,
      udf5: paymentRequest.udf5,
    };

    const payuUrl = getPayUCheckoutUrl(config);

    console.info("PayU checkout session initialized successfully.", { txnid: uniqueTxnId, amount: paymentRequest.amount });

    return NextResponse.json({
      success: true,
      txnId: uniqueTxnId,
      payload,
      payuUrl,
    });
  } catch (err: any) {
    console.error("Error in createOrder API route:", err);
    return NextResponse.json(
      { error: "Internal server error occurred while creating order session." },
      { status: 500 }
    );
  }
}
