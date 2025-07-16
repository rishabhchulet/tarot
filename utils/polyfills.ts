/**
 * Polyfills for React Native compatibility
 * Must be imported before any Supabase code
 */

// CRITICAL FIX: structuredClone polyfill for React Native
// Supabase v2.39+ uses structuredClone which doesn't exist in React Native
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = function structuredClone(obj: any): any {
    // Handle primitives and null
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    // Handle Date objects
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    // Handle Arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => structuredClone(item));
    }

    // Handle Objects
    if (typeof obj === 'object') {
      const cloned: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          cloned[key] = structuredClone(obj[key]);
        }
      }
      return cloned;
    }

    return obj;
  };
  
  console.log('✅ structuredClone polyfill applied for React Native compatibility');
}

// WebCrypto polyfill warning suppression
if (typeof global.crypto === 'undefined') {
  console.log('⚠️ WebCrypto not available - using fallback methods');
}

export default {}; 