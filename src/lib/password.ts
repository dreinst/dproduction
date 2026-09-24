import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import bcrypt from 'bcrypt';

// Format hash sama persis dengan Produksia (src/lib/kataSandi.ts): scrypt bawaan Node, garam acak 16 byte,
// panjang kunci 64, parameter default. Hash yang disalin dari Produksia bisa langsung dipakai di sini.
const scrypt = promisify(scryptCallback) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

const BCRYPT_PREFIX = /^\$2[aby]\$/;

// Hash scrypt dari string acak yang tidak disimpan di mana pun. Dipakai saat user tidak ada atau tidak aktif
// supaya lama respons login tetap setara dan keberadaan akun tidak bisa ditebak.
export const DUMMY_PASSWORD_HASH =
  'scrypt$yP0LZcIVnb6OxdLGz99g-A$XgwC6o3NREmpCd_cuxCPQoqdWL2c-zxHwb7glUmxboapt-w6Wo-CocwkJKJFy-JYWJ9fhWBiW_AQHeVC6IuNKg';

// Password selalu di-trim sebelum dicek dan di-hash, sama dengan Produksia.
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password.trim(), salt, 64);
  return `scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

// Menerima hash scrypt (format baru) dan hash bcrypt lama. Format lain atau error apa pun dianggap tidak cocok.
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const input = password.trim();
    if (stored.startsWith('scrypt$')) {
      const [, salt, hash] = stored.split('$');
      if (!salt || !hash) return false;
      const target = Buffer.from(hash, 'base64url');
      const actual = await scrypt(input, Buffer.from(salt, 'base64url'), 64);
      return actual.length === target.length && timingSafeEqual(actual, target);
    }
    if (BCRYPT_PREFIX.test(stored)) return await bcrypt.compare(input, stored);
    return false;
  } catch {
    return false;
  }
}

export function checkPasswordStrength(password: string): string | null {
  const value = password.trim();
  if (value.length < 8) return 'Password minimal 8 karakter.';
  if (value.length > 200) return 'Password maksimal 200 karakter.';
  if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) return 'Password harus memuat huruf dan angka.';
  return null;
}
