import { NextRequest, NextResponse } from "next/server";
import { generatePaytmSignature, getPaytmConfig } from "@/lib/paytm";

export const runtime = "nodejs";

interface PaytmCreateOrderBody {
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
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PaytmCreateOrderBody;
    const { amount, productInfo, firstName, email, phone, udf1, udf2, udf3 } = body;

    if (!amount || !productInfo || !firstName || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required checkout parameters: amount, productInfo, firstName, email, and phone are mandatory." },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "A valid positive amount is required." }, { status: 400 });
    }

    const config = getPaytmConfig();
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, "");
    const orderId = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const formattedAmount = numericAmount.toFixed(2);
    const cleanPhone = phone.replace(/\D/g, "");

    const paytmBody = {
      requestType: "Payment",
      mid: config.mid,
      websiteName: config.website,
      orderId,
      callbackUrl: `${siteUrl}/api/paytm/callback`,
      txnAmount: {
        value: formattedAmount,
        currency: "INR",
      },
      userInfo: {
        custId: `CUST_${cleanPhone || Date.now()}`,
        email: email.trim(),
        phone: cleanPhone,
      },
    };

    const bodyString = JSON.stringify(paytmBody);
    const signature = generatePaytmSignature(bodyString, config.merchantKey);
    const initiateUrl = `${config.baseUrl.replace(/\/$/, "")}/theia/api/v1/initiateTransaction?mid=${encodeURIComponent(
      config.mid
    )}&orderId=${encodeURIComponent(orderId)}`;

    const paytmResponse = await fetch(initiateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body: paytmBody,
        head: { signature },
      }),
    });

    const data = await paytmResponse.json();
    const resultInfo = data?.body?.resultInfo;

    if (!paytmResponse.ok || resultInfo?.resultStatus !== "S" || !data?.body?.txnToken) {
      return NextResponse.json(
        { error: resultInfo?.resultMsg || "Paytm Initiate Transaction API failed." },
        { status: 502 }
      );
    }

    const searchParams = new URLSearchParams({
      product: udf1 || "",
      size: udf2 || "",
      qty: udf3 || "",
      name: firstName.trim(),
      total: formattedAmount,
      method: "Paytm",
    });

    return NextResponse.json({
      success: true,
      orderId,
      txnToken: data.body.txnToken,
      paytmUrl: `${config.baseUrl.replace(/\/$/, "")}/theia/api/v1/showPaymentPage?mid=${encodeURIComponent(
        config.mid
      )}&orderId=${encodeURIComponent(orderId)}`,
      mid: config.mid,
      redirectState: searchParams.toString(),
    });
  } catch (err) {
    console.error("Paytm create order failed:", err);
    return NextResponse.json({ error: "Paytm initiation failed. Please try again." }, { status: 500 });
  }
}
