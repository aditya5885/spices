import crypto from "crypto";

const PAYTM_IV = "@@@@&&&&####$$$$";
const PAYTM_STAGE_URL = "https://securestage.paytmpayments.com";

export interface PaytmConfig {
  mid: string;
  merchantKey: string;
  website: string;
  baseUrl: string;
}

export function getPaytmConfig(): PaytmConfig {
  return {
    mid: process.env.PAYTM_MID || "rdWAFo18634751496152",
    merchantKey: process.env.PAYTM_MERCHANT_KEY || "E9#KULkD&o8kuU&H",
    website: process.env.PAYTM_WEBSITE || "WEBSTAGING",
    baseUrl: process.env.PAYTM_BASE_URL || PAYTM_STAGE_URL,
  };
}

function normalizeMerchantKey(key: string): Buffer {
  const keyBytes = Buffer.from(key, "utf8");

  if (keyBytes.length === 16) {
    return keyBytes;
  }

  if (keyBytes.length > 16) {
    return keyBytes.subarray(0, 16);
  }

  return Buffer.concat([keyBytes, Buffer.alloc(16 - keyBytes.length)]);
}

function encrypt(input: string, key: string): string {
  const cipher = crypto.createCipheriv("aes-128-cbc", normalizeMerchantKey(key), Buffer.from(PAYTM_IV, "utf8"));
  return Buffer.concat([cipher.update(input, "utf8"), cipher.final()]).toString("base64");
}

function decrypt(input: string, key: string): string {
  const decipher = crypto.createDecipheriv("aes-128-cbc", normalizeMerchantKey(key), Buffer.from(PAYTM_IV, "utf8"));
  return Buffer.concat([decipher.update(input, "base64"), decipher.final()]).toString("utf8");
}

function randomSalt(length = 4): string {
  const chars = "9876543210ZYXWVUTSRQPONMLKJIHGFEDCBAabcdefghijklmnopqrstuvwxyz!@#$&_";
  let salt = "";

  for (let i = 0; i < length; i += 1) {
    salt += chars[crypto.randomInt(chars.length)];
  }

  return salt;
}

function calculateHash(params: string, salt: string): string {
  return crypto.createHash("sha256").update(`${params}|${salt}`).digest("hex") + salt;
}

function paramsToString(params: Record<string, unknown>): string {
  return Object.keys(params)
    .sort()
    .map((key) => {
      const value = params[key];
      if (value === null || value === undefined || String(value).toLowerCase() === "null") {
        return "";
      }
      return String(value);
    })
    .join("|");
}

export function generatePaytmSignature(params: string | Record<string, unknown>, merchantKey: string): string {
  const body = typeof params === "string" ? params : paramsToString(params);
  const salt = randomSalt();
  return encrypt(calculateHash(body, salt), merchantKey);
}

export function verifyPaytmSignature(params: Record<string, unknown>, merchantKey: string, checksum: string): boolean {
  const paramsWithoutChecksum = { ...params };
  delete paramsWithoutChecksum.CHECKSUMHASH;

  const body = paramsToString(paramsWithoutChecksum);
  const paytmHash = decrypt(checksum, merchantKey);
  const salt = paytmHash.slice(-4);

  return paytmHash === calculateHash(body, salt);
}
