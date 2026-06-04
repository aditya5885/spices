import crypto from "crypto";

/**
 * PayU Configuration Interface
 */
export interface PayUConfig {
  key: string;
  salt: string;
  merchantId: string;
  baseUrl: string;
  mode: "test" | "live";
}

/**
 * Interface representing standard transaction parameters required by PayU
 */
export interface PayUPaymentRequest {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  udf6?: string;
  udf7?: string;
  udf8?: string;
  udf9?: string;
  udf10?: string;
}

/**
 * Retrieves the PayU configuration from environment variables
 */
export function getPayUConfig(): PayUConfig {
  const key = process.env.PAYU_KEY;
  const salt = process.env.PAYU_SALT;
  const merchantId = process.env.NEXT_PUBLIC_PAYU_MERCHANT_ID || "";
  const baseUrl = process.env.PAYU_BASE_URL || "https://test.payu.in";
  const mode = (process.env.PAYU_MODE as "test" | "live") || "test";

  if (!key || !salt) {
    throw new Error("PayU key or salt is missing from environment variables.");
  }

  return { key, salt, merchantId, baseUrl, mode };
}

/**
 * Generates the secure request SHA-512 hash needed for initiating a PayU payment.
 * 
 * Formula:
 * hash = sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt)
 */
export function generateRequestHash(params: PayUPaymentRequest, config: PayUConfig): string {
  const {
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
    udf6 = "",
    udf7 = "",
    udf8 = "",
    udf9 = "",
    udf10 = "",
  } = params;

  const { key, salt } = config;

  // Construct the hash string strictly maintaining the parameter sequence separated by pipes
  const hashSequence = [
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
    udf6,
    udf7,
    udf8,
    udf9,
    udf10,
    salt
  ].join("|");

  return crypto.createHash("sha512").update(hashSequence).digest("hex");
}

/**
 * Verifies the response hash sent by PayU to confirm payload integrity.
 * 
 * Standard Formula:
 * hash = sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 * 
 * Formula if additionalCharges is present:
 * hash = sha512(additionalCharges|salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function verifyResponseHash(responseParams: Record<string, string>, config: PayUConfig): boolean {
  const { salt } = config;
  
  const key = responseParams.key || "";
  const txnid = responseParams.txnid || "";
  const amount = responseParams.amount || "";
  const productinfo = responseParams.productinfo || "";
  const firstname = responseParams.firstname || "";
  const email = responseParams.email || "";
  const udf1 = responseParams.udf1 || "";
  const udf2 = responseParams.udf2 || "";
  const udf3 = responseParams.udf3 || "";
  const udf4 = responseParams.udf4 || "";
  const udf5 = responseParams.udf5 || "";
  const status = responseParams.status || "";
  const additionalCharges = responseParams.additionalCharges || "";
  const receivedHash = responseParams.hash || "";

  if (!receivedHash) {
    console.error("No hash received in response payload.");
    return false;
  }

  // Construct the base reverse sequence (which covers empty udf6-udf10 using empty slots)
  // There are 6 slots between status and udf5: status|udf10|udf9|udf8|udf7|udf6|udf5
  // Hence 5 empty pipes after status
  const baseSequence = [
    salt,
    status,
    "", // udf10
    "", // udf9
    "", // udf8
    "", // udf7
    "", // udf6
    udf5,
    udf4,
    udf3,
    udf2,
    udf1,
    email,
    firstname,
    productinfo,
    amount,
    txnid,
    key
  ].join("|");

  let finalSequence = baseSequence;
  
  // If additionalCharges are returned, prepend them to the sequence (with a pipe separator)
  if (additionalCharges && additionalCharges.trim() !== "") {
    finalSequence = `${additionalCharges}|${baseSequence}`;
  }

  const calculatedHash = crypto.createHash("sha512").update(finalSequence).digest("hex");
  
  const isVerified = calculatedHash.toLowerCase() === receivedHash.toLowerCase();
  
  if (!isVerified) {
    console.warn("PayU Signature Mismatch!", {
      received: receivedHash.toLowerCase(),
      calculated: calculatedHash.toLowerCase(),
      sequence: finalSequence
    });
  }

  return isVerified;
}

/**
 * Returns the PayU Checkout gateway URL based on active mode configuration.
 */
export function getPayUCheckoutUrl(config: PayUConfig): string {
  // Production URL: https://secure.payu.in/_payment
  // Test URL: https://test.payu.in/_payment
  const base = config.baseUrl.replace(/\/$/, "");
  return `${base}/_payment`;
}
