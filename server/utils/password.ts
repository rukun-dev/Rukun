// server/utils/password.ts
import bcrypt from "bcryptjs";

/**
 * Default configuration for password hashing
 */
const PASSWORD_CONFIG = {
  saltRounds: 12,
  minLength: 8,
  maxLength: 128,
} as const;

/**
 * Password strength requirements
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: PASSWORD_CONFIG.minLength,
  maxLength: PASSWORD_CONFIG.maxLength,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
} as const;

/**
 * Hash a plain text password
 * @param password - Plain text password to hash
 * @param saltRounds - Number of salt rounds (default: 12)
 * @returns Promise<string> - Hashed password
 */
export async function hashPassword(
  password: string,
  saltRounds: number = PASSWORD_CONFIG.saltRounds,
): Promise<string> {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string");
  }

  if (password.length < PASSWORD_CONFIG.minLength) {
    throw new Error(`Password must be at least ${PASSWORD_CONFIG.minLength} characters long`);
  }

  if (password.length > PASSWORD_CONFIG.maxLength) {
    throw new Error(`Password must be no more than ${PASSWORD_CONFIG.maxLength} characters long`);
  }

  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error("Failed to hash password");
  }
}

/**
 * Verify a password against its hash
 * @param password - Plain text password to verify
 * @param hashedPassword - Previously hashed password
 * @returns Promise<boolean> - True if password matches hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  if (!password || !hashedPassword) {
    return false;
  }

  if (typeof password !== "string" || typeof hashedPassword !== "string") {
    return false;
  }

  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    return false;
  }
}

/**
 * Check if password meets strength requirements
 * @param password - Password to validate
 * @returns Object with validation result and details
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "fair" | "good" | "strong";
} {
  const errors: string[] = [];

  // Check length
  if (!password || password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  if (password && password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must be no more than ${PASSWORD_REQUIREMENTS.maxLength} characters long`);
  }

  if (!password) {
    return {
      isValid: false,
      errors,
      strength: "weak",
    };
  }

  // Check character requirements
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  // Calculate strength
  let strengthScore = 0;

  if (password.length >= 8) strengthScore++;
  if (password.length >= 12) strengthScore++;
  if (/[A-Z]/.test(password)) strengthScore++;
  if (/[a-z]/.test(password)) strengthScore++;
  if (/\d/.test(password)) strengthScore++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strengthScore++;
  if (password.length >= 16) strengthScore++;

  let strength: "weak" | "fair" | "good" | "strong" = "weak";
  if (strengthScore >= 6) strength = "strong";
  else if (strengthScore >= 4) strength = "good";
  else if (strengthScore >= 2) strength = "fair";

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Generate a random password with specified requirements
 * @param length - Password length (default: 16)
 * @param options - Generation options
 * @returns string - Generated password
 */
export function generatePassword(
  length: number = 16,
  options: {
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSpecialChars?: boolean;
    excludeSimilar?: boolean;
  } = {},
): string {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSpecialChars = true,
    excludeSimilar = true,
  } = options;

  let charset = "";

  if (includeUppercase) {
    charset += excludeSimilar ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }

  if (includeLowercase) {
    charset += excludeSimilar ? "abcdefghjkmnpqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
  }

  if (includeNumbers) {
    charset += excludeSimilar ? "23456789" : "0123456789";
  }

  if (includeSpecialChars) {
    charset += "!@#$%^&*()";
  }

  if (!charset) {
    throw new Error("At least one character type must be included");
  }

  if (length < 4) {
    throw new Error("Password length must be at least 4 characters");
  }

  let password = "";

  // Ensure at least one character from each required type
  if (includeUppercase) {
    const upperChars = excludeSimilar ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    password += upperChars[Math.floor(Math.random() * upperChars.length)];
  }

  if (includeLowercase) {
    const lowerChars = excludeSimilar ? "abcdefghjkmnpqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
    password += lowerChars[Math.floor(Math.random() * lowerChars.length)];
  }

  if (includeNumbers) {
    const numberChars = excludeSimilar ? "23456789" : "0123456789";
    password += numberChars[Math.floor(Math.random() * numberChars.length)];
  }

  if (includeSpecialChars) {
    const specialChars = "!@#$%^&*()";
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
  }

  // Fill remaining length
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * Check if password has been compromised (simple length and common patterns check)
 * @param password - Password to check
 * @returns boolean - True if password appears to be compromised/weak
 */
export function isPasswordCompromised(password: string): boolean {
  if (!password || password.length < 6) {
    return true;
  }

  // Common weak passwords
  const commonPasswords = [
    "password", "123456", "password123", "admin", "qwerty",
    "letmein", "welcome", "monkey", "1234567890", "abc123",
    "password1", "123456789", "welcome123", "admin123",
    "root", "toor", "pass", "test", "guest", "user"
  ];

  const lowerPassword = password.toLowerCase();

  // Check against common passwords
  if (commonPasswords.includes(lowerPassword)) {
    return true;
  }

  // Check for simple patterns
  if (/^(.)\1+$/.test(password)) { // All same character
    return true;
  }

  if (/^(012|123|234|345|456|567|678|789|890)+$/.test(password)) { // Sequential numbers
    return true;
  }

  if (/^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+$/i.test(password)) { // Sequential letters
    return true;
  }

  return false;
}

/**
 * Generate a secure temporary password for user registration/reset
 * @returns string - Temporary password
 */
export function generateTempPassword(): string {
  return generatePassword(12, {
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSpecialChars: false, // Avoid special chars for easier typing
    excludeSimilar: true,
  });
}

/**
 * Hash multiple passwords in batch (useful for seeding/migration)
 * @param passwords - Array of plain text passwords
 * @param saltRounds - Salt rounds for hashing
 * @returns Promise<string[]> - Array of hashed passwords
 */
export async function hashPasswordsBatch(
  passwords: string[],
  saltRounds: number = PASSWORD_CONFIG.saltRounds,
): Promise<string[]> {
  const promises = passwords.map(password => hashPassword(password, saltRounds));
  return Promise.all(promises);
}

/**
 * Time-safe password comparison to prevent timing attacks
 * @param password - Plain text password
 * @param hashedPassword - Hashed password
 * @returns Promise<boolean> - True if passwords match
 */
export async function timeSafeVerifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  // Always perform a hash operation even if inputs are invalid
  // to prevent timing attacks that could reveal valid usernames
  const dummyHash = "$2a$12$dummyhashtopreventtimingattack1234567890";

  try {
    if (!password || !hashedPassword) {
      // Still perform bcrypt operation to maintain consistent timing
      await bcrypt.compare("dummy", dummyHash);
      return false;
    }

    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    // Perform dummy operation to maintain timing consistency
    await bcrypt.compare("dummy", dummyHash);
    return false;
  }
}

// Default export with all functions
export default {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generatePassword,
  isPasswordCompromised,
  generateTempPassword,
  hashPasswordsBatch,
  timeSafeVerifyPassword,
  PASSWORD_REQUIREMENTS,
};
