import { NextRequest, NextResponse } from "next/server";
import { getPayUConfig, verifyResponseHash } from "@/lib/payu";

/**
 * Route handler to receive asynchronous webhook notifications (IPNs) from PayU.
 * PayU sends webhooks directly to this endpoint when a transaction state changes.
 * This endpoint verifies the request signature to ensure it is authentic and logs the update.
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let params: Record<string, string> = {};

    // 1. Support both application/x-www-form-urlencoded and application/json webhooks
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        params[key] = value.toString();
      });
    } else if (contentType.includes("application/json")) {
      params = await req.json();
    } else {
      console.warn("PayU webhook received with unsupported content type:", contentType);
      return NextResponse.json({ error: "Unsupported Content-Type" }, { status: 400 });
    }

    console.info("PayU Webhook event received:", {
      txnid: params.txnid,
      status: params.status,
      amount: params.amount,
      mihpayid: params.mihpayid,
    });

    // 2. Validate webhook configuration and signature
    const config = getPayUConfig();
    const isSignatureValid = verifyResponseHash(params, config);

    if (!isSignatureValid) {
      console.error("PayU Webhook signature verification failed! Rejecting webhook.", { txnid: params.txnid });
      return NextResponse.json({ error: "Invalid hash verification signature." }, { status: 400 });
    }

    // 3. Process the payment status update
    const txnId = params.txnid;
    const status = params.status; // e.g., "success", "failure", "pending"
    const amount = params.amount;
    const paymentId = params.mihpayid;

    console.info("PayU Webhook processed successfully for transaction:", {
      txnId,
      status,
      amount,
      paymentId,
      email: params.email,
    });

    // TODO: Implement your database order status updates here
    // Example:
    // await db.order.update({ where: { txnId }, data: { paymentStatus: status, gatewayRef: paymentId } });

    // 4. Respond with a 200 OK to acknowledge receipt of the webhook.
    // PayU expects a simple success status. If you return non-200, PayU will retry sending it.
    return NextResponse.json({
      success: true,
      message: "Webhook processed and signature verified.",
      txnId,
      status,
    });
  } catch (err: any) {
    console.error("Error processing PayU Webhook:", err);
    return NextResponse.json(
      { error: "Internal server error processing webhook." },
      { status: 500 }
    );
  }
}
