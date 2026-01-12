/**
 * Shared Validation Schemas
 * 
 * Common Zod validation schemas used across the application.
 * Centralizing validation ensures consistency between pages.
 */

import { z } from 'zod';

/**
 * Enhanced Email Validation
 * 
 * Validates that an email address has:
 * - Proper format (user@domain.tld)
 * - Recognized top-level domain (TLD)
 * - No consecutive dots
 * - Valid characters
 * - Proper length constraints
 * 
 * This prevents fake emails like "askldgjaskgljdlg@gmail.com"
 * by ensuring the domain has a valid TLD.
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email is too short')
  .max(254, 'Email is too long') // RFC 5321 standard
  .refine((email) => {
    // Check for consecutive dots (invalid)
    if (email.includes('..')) {
      return false;
    }
    
    // List of recognized top-level domains
    // Includes most common TLDs worldwide
    const validTLDs = [
      'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
      'io', 'co', 'ai', 'app', 'dev', 'tech', 'biz', 'info',
      'me', 'us', 'uk', 'ca', 'au', 'de', 'fr', 'jp', 'cn',
      'in', 'br', 'ru', 'es', 'it', 'nl', 'se', 'no', 'dk',
      'nz', 'sg', 'hk', 'my', 'th', 'id', 'ph', 'vn', 'pk',
      'sa', 'ae', 'za', 'eg', 'ng', 'ke', 'gh', 'tz', 'ug'
    ];
    
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    
    const [localPart, domain] = parts;
    
    // Local part (before @) validations
    if (localPart.length === 0 || localPart.length > 64) return false;
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
    
    // Domain validations
    if (domain.length === 0 || domain.length > 253) return false;
    
    const domainParts = domain.split('.');
    if (domainParts.length < 2) return false;
    
    // Check if TLD is recognized
    const tld = domainParts[domainParts.length - 1].toLowerCase();
    if (!validTLDs.includes(tld)) {
      return false;
    }
    
    // Validate each domain part
    for (const part of domainParts) {
      if (part.length === 0 || part.length > 63) return false;
      if (part.startsWith('-') || part.endsWith('-')) return false;
      // Only alphanumeric and hyphens allowed in domain
      if (!/^[a-zA-Z0-9-]+$/.test(part)) return false;
    }
    
    return true;
  }, {
    message: 'Please enter a valid email with a recognized domain (e.g., gmail.com, yahoo.com)'
  });

/**
 * Password validation schema
 * Minimum 6 characters
 */
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters');

/**
 * Full name validation schema
 */
export const fullNameSchema = z
  .string()
  .min(1, 'Full name is required')
  .max(100, 'Name is too long');
