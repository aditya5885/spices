import { NextResponse } from "next/server";
import { createHmac } from "crypto";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required verification fields." },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        { error: "Razorpay configuration error on server: Key Secret missing." },
        { status: 500 }
      );
    }

    // Razorpay signature formula: HMAC-SHA256(order_id + "|" + payment_id, secret)
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = createHmac("sha256", keySecret)
      .update(text)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { verified: false, error: "Payment verification failed: cryptographic signature mismatch." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      verified: true,
      message: "Payment successfully verified.",
    });
  } catch (error: any) {
    console.error("Razorpay verification API error:", error);
    return NextResponse.json(
      { error: "Internal server error during payment verification." },
      { status: 500 }
    );
  }
}
