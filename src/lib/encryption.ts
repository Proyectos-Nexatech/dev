/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import CryptoJS from 'crypto-js';

/**
 * Encrypts a string using AES.
 * @param text The plain text to encrypt
 * @param secretKey The master passphrase
 */
export const encryptData = (text: string, secretKey: string): string => {
  return CryptoJS.AES.encrypt(text, secretKey).toString();
};

/**
 * Decrypts an AES encrypted string.
 * @param ciphertext The encrypted string
 * @param secretKey The master passphrase
 */
export const decryptData = (ciphertext: string, secretKey: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
};
