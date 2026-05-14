import { SignJWT, jwtVerify } from "jose";

// Gunakan kunci rahasia yang kuat. Di production, taruh di .env
const secretKey = process.env.JWT_SECRET || "kunci-rahasia-gree-electric-super-aman";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h") // Sesi login valid selama 8 jam jam kerja
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null; // Jika token expired atau dimanipulasi
  }
}