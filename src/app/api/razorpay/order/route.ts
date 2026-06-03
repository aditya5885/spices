import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();
    
    if (!amount || typeof amount !== "number") {
      return NextResponse.json(
        { error: "Invalid request: amount is required and must be a number." },
        { status: 400 }
      );
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials are not configured on the server. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." },
        { status: 500 }
      );
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // convert to paise
        currency: "INR",
        receipt: `rcpt_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.description || "Failed to initiate transaction with Razorpay." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      id: data.id,
      amount: data.amount,
      currency: data.currency,
    });
  } catch (error: any) {
    console.error("Razorpay order API error:", error);
    return NextResponse.json(
      { error: "Internal server error while processing transaction." },
      { status: 500 }
    );
  }
}
