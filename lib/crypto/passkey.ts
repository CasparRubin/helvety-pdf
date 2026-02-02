/**
 * Passkey Module
 * Handles WebAuthn passkey registration and authentication with PRF extension
 *
 * This module provides the bridge between WebAuthn/passkeys and authentication.
 * It uses SimpleWebAuthn browser helpers and integrates with Supabase for storage.
 */

import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from "@simplewebauthn/browser";

import { base64Encode, base64Decode } from "./encoding";
import { CryptoError, CryptoErrorType } from "./types";

import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/browser";

/**
 * Relying Party configuration
 */
export interface RPConfig {
  /** Domain name (e.g., 'localhost' for dev, 'helvety.com' for prod) */
  rpId: string;
  /** Human-readable name shown in passkey prompts */
  rpName: string;
  /** Origin URL (e.g., 'http://localhost:3000') */
  origin: string;
}

/**
 * Get RP config based on the current browser location
 *
 * Note: The rpId MUST match the actual domain for WebAuthn security.
 * WebAuthn automatically uses the current domain, so no configuration needed.
 *
 * The rpName is the human-readable name shown in password managers.
 */
export function getRPConfig(): RPConfig {
  // Always use "Helvety PDF" as the display name
  const rpName = "Helvety PDF";

  if (typeof window === "undefined") {
    // Server-side fallback (passkey operations should only happen client-side)
    return {
      rpId: "localhost",
      rpName,
      origin: "http://localhost:3000",
    };
  }

  // Client-side: Always use the current hostname
  // WebAuthn requires rpId to match the actual domain
  return {
    rpId: window.location.hostname,
    rpName,
    origin: window.location.origin,
  };
}

/**
 * Passkey registration result with PRF output for encryption setup
 */
export interface PasskeyRegistrationResult {
  /** The WebAuthn registration response to send to server */
  response: RegistrationResponseJSON;
  /** Credential ID (base64url encoded) */
  credentialId: string;
  /** PRF output for deriving encryption key (if PRF supported) */
  prfOutput?: ArrayBuffer;
  /** Whether PRF was enabled during registration */
  prfEnabled: boolean;
}

/**
 * Passkey authentication result with PRF output for encryption unlock
 */
export interface PasskeyAuthenticationResult {
  /** The WebAuthn authentication response to send to server */
  response: AuthenticationResponseJSON;
  /** Credential ID used (base64url encoded) */
  credentialId: string;
  /** PRF output for deriving encryption key */
  prfOutput?: ArrayBuffer;
  /** Whether PRF was used during authentication */
  prfEnabled: boolean;
}

/**
 * Check if the browser supports WebAuthn passkeys
 */
export function isPasskeySupported(): boolean {
  return browserSupportsWebAuthn();
}

/**
 * Check if a platform authenticator is available (Face ID, Touch ID, Windows Hello)
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  return platformAuthenticatorIsAvailable();
}

/**
 * Detect if running on a mobile device via user agent
 * This checks for actual mobile devices, not just screen width
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * Check if platform authenticator supports PRF extension
 * Uses getClientCapabilities() on Chrome 133+, falls back to heuristics
 *
 * PRF is supported on:
 * - iOS 18+, macOS 15+ (Safari)
 * - Android 14+ (Chrome 128+)
 * - Windows 11 (Chrome/Edge 128+)
 */
export async function getPlatformPRFSupport(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    return false;
  }

  // Modern API (Chrome 133+) - checks platform authenticator PRF support directly
  if ("getClientCapabilities" in PublicKeyCredential) {
    try {
      const getClientCapabilities = (
        PublicKeyCredential as typeof PublicKeyCredential & {
          getClientCapabilities: () => Promise<Record<string, boolean>>;
        }
      ).getClientCapabilities;
      const caps = await getClientCapabilities();
      if (caps?.prf === true) return true;
    } catch {
      /* fall through to heuristics */
    }
  }

  // Fallback heuristics based on known platform support
  const ua = navigator.userAgent;

  // iOS 18+ / macOS 15+ Safari supports PRF for platform authenticators
  const safariMatch = ua.match(/Version\/(\d+).*Safari/);
  if (safariMatch?.[1] && parseInt(safariMatch[1]) >= 18) {
    // Safari on iOS/macOS with version 18+ supports PRF
    return true;
  }

  // Android Chrome 128+ supports PRF for platform authenticators
  if (/Android/.test(ua)) {
    const chromeMatch = ua.match(/Chrome\/(\d+)/);
    if (chromeMatch?.[1] && parseInt(chromeMatch[1]) >= 128) {
      return true;
    }
  }

  // Windows with Chrome/Edge 128+ may support PRF via Windows Hello
  // But we can't reliably detect this, so we return false to be safe
  // Users on Windows will use cross-device (QR code) flow

  return false;
}

/**
 * Device capability information for passkey operations
 */
export interface DeviceCapabilities {
  /** Whether the device is a mobile device (phone/tablet) */
  isMobile: boolean;
  /** Whether a platform authenticator is available */
  hasPlatformAuthenticator: boolean;
  /** Whether the platform authenticator supports PRF extension */
  platformSupportsPRF: boolean;
  /** Whether to use platform authenticator for passkey operations */
  usePlatformAuth: boolean;
}

/**
 * Get comprehensive device capabilities for passkey operations
 * This helps determine the best authentication flow for the current device
 */
export async function getDeviceCapabilities(): Promise<DeviceCapabilities> {
  const isMobile = isMobileDevice();
  const hasPlatformAuthenticator = await isPlatformAuthenticatorAvailable();
  const platformSupportsPRF = await getPlatformPRFSupport();

  // Use platform auth on mobile devices with PRF support
  // This allows Face ID, Touch ID, Fingerprint to work directly
  const usePlatformAuth = isMobile && hasPlatformAuthenticator && platformSupportsPRF;

  return {
    isMobile,
    hasPlatformAuthenticator,
    platformSupportsPRF,
    usePlatformAuth,
  };
}

/**
 * Generate registration options for creating a new passkey
 * This should be called on the server, but we provide client-side generation for simplicity
 *
 * Automatically detects device capabilities to determine whether to use:
 * - Platform authenticator (Face ID, Touch ID, Fingerprint) on mobile devices with PRF support
 * - Cross-platform authenticator (phone via QR code) on desktop or unsupported mobile
 *
 * @param userId - The user's ID
 * @param userEmail - The user's email
 * @param userName - The user's display name
 * @param prfSalt - Optional PRF salt for encryption (base64 encoded)
 */
export async function generateRegistrationOptions(
  userId: string,
  userEmail: string,
  userName: string,
  prfSalt?: string
): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const rpConfig = getRPConfig();
  const capabilities = await getDeviceCapabilities();

  // Generate a random challenge
  const challenge = base64Encode(crypto.getRandomValues(new Uint8Array(32)));

  const options: PublicKeyCredentialCreationOptionsJSON = {
    challenge,
    rp: {
      id: rpConfig.rpId,
      name: rpConfig.rpName,
    },
    user: {
      id: base64Encode(new TextEncoder().encode(userId)),
      name: userEmail,
      displayName: userName || userEmail,
    },
    pubKeyCredParams: [
      { alg: -7, type: "public-key" }, // ES256
      { alg: -257, type: "public-key" }, // RS256
    ],
    authenticatorSelection: {
      userVerification: "required",
      residentKey: "required",
      requireResidentKey: true,
      // On mobile with PRF support, allow platform authenticators (Face ID, Touch ID, etc.)
      // On desktop or mobile without PRF support, force cross-platform (QR code flow)
      ...(capabilities.usePlatformAuth
        ? {} // Let browser decide - allows platform authenticator
        : { authenticatorAttachment: "cross-platform" as const }),
    },
    timeout: 60000,
    attestation: "none",
  };

  // Set hints based on device capabilities
  // "client-device" hints to use the current device's authenticator
  // "hybrid" hints to use cross-device flow (QR code)
  (
    options as PublicKeyCredentialCreationOptionsJSON & { hints?: string[] }
  ).hints = capabilities.usePlatformAuth ? ["client-device"] : ["hybrid"];

  // Add PRF extension if salt provided
  if (prfSalt) {
    (
      options as PublicKeyCredentialCreationOptionsJSON & {
        extensions?: Record<string, unknown>;
      }
    ).extensions = {
      prf: {
        eval: {
          first: base64Decode(prfSalt),
        },
      },
    };
  }

  return options;
}

/**
 * Generate authentication options for signing in with a passkey
 *
 * Automatically detects device capabilities to determine whether to prefer:
 * - Platform authenticator (Face ID, Touch ID, Fingerprint) on mobile devices with PRF support
 * - Cross-platform authenticator (phone via QR code) on desktop or unsupported mobile
 *
 * @param allowCredentials - Optional list of credential IDs to allow
 * @param prfSalt - PRF salt for encryption key derivation (base64 encoded)
 */
export async function generateAuthenticationOptions(
  allowCredentials?: string[],
  prfSalt?: string
): Promise<PublicKeyCredentialRequestOptionsJSON> {
  const rpConfig = getRPConfig();
  const capabilities = await getDeviceCapabilities();

  // Generate a random challenge
  const challenge = base64Encode(crypto.getRandomValues(new Uint8Array(32)));

  const options: PublicKeyCredentialRequestOptionsJSON = {
    challenge,
    rpId: rpConfig.rpId,
    timeout: 60000,
    userVerification: "required",
  };

  // Add allowed credentials if provided
  // Include all transports for maximum flexibility - the browser will filter
  // based on what's actually available for each credential
  if (allowCredentials && allowCredentials.length > 0) {
    options.allowCredentials = allowCredentials.map((id) => ({
      id,
      type: "public-key",
      // Include all transports so credentials can be used from any source
      transports: ["internal", "hybrid", "usb", "ble", "nfc"],
    }));
  }

  // Set hints based on device capabilities
  // "client-device" hints to use the current device's authenticator
  // "hybrid" hints to use cross-device flow (QR code)
  (
    options as PublicKeyCredentialRequestOptionsJSON & { hints?: string[] }
  ).hints = capabilities.usePlatformAuth ? ["client-device"] : ["hybrid"];

  // Add PRF extension if salt provided
  if (prfSalt) {
    (
      options as PublicKeyCredentialRequestOptionsJSON & {
        extensions?: Record<string, unknown>;
      }
    ).extensions = {
      prf: {
        eval: {
          first: base64Decode(prfSalt),
        },
      },
    };
  }

  return options;
}

/**
 * Register a new passkey with PRF extension for encryption
 *
 * Note: PRF output is only returned during authentication, not registration.
 * Registration only tells us if PRF is enabled/supported by the authenticator.
 *
 * @param options - Registration options from server or generateRegistrationOptions
 * @returns Registration result (prfEnabled indicates if PRF is supported)
 */
export async function registerPasskey(
  options: PublicKeyCredentialCreationOptionsJSON
): Promise<PasskeyRegistrationResult> {
  try {
    const response = await startRegistration({ optionsJSON: options });

    // During registration, PRF only returns 'enabled' status, not actual output
    // The actual PRF output is only available during authentication
    const clientExtResults = response.clientExtensionResults as {
      prf?: { enabled?: boolean };
    };

    // PRF is considered enabled if the extension was processed
    // Note: Some authenticators return enabled:true, others just include the prf object
    const prfEnabled = clientExtResults.prf !== undefined;

    return {
      response,
      credentialId: response.id,
      prfOutput: undefined, // PRF output only available during authentication
      prfEnabled,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "NotAllowedError") {
        throw new CryptoError(
          CryptoErrorType.KEY_DERIVATION_FAILED,
          "Passkey registration was cancelled or not allowed"
        );
      }
      if (error.name === "InvalidStateError") {
        throw new CryptoError(
          CryptoErrorType.KEY_DERIVATION_FAILED,
          "A passkey already exists for this account on this device"
        );
      }
    }
    throw new CryptoError(
      CryptoErrorType.KEY_DERIVATION_FAILED,
      "Failed to register passkey",
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Authenticate with a passkey and get PRF output for encryption
 *
 * @param options - Authentication options from server or generateAuthenticationOptions
 * @returns Authentication result with PRF output for encryption unlock
 */
export async function authenticateWithPasskey(
  options: PublicKeyCredentialRequestOptionsJSON
): Promise<PasskeyAuthenticationResult> {
  try {
    const response = await startAuthentication({ optionsJSON: options });

    // Extract PRF output if available
    const clientExtResults = response.clientExtensionResults as {
      prf?: { results?: { first?: ArrayBuffer } };
    };

    const prfOutput = clientExtResults.prf?.results?.first;
    const prfEnabled = prfOutput !== undefined;

    return {
      response,
      credentialId: response.id,
      prfOutput,
      prfEnabled,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "NotAllowedError") {
        throw new CryptoError(
          CryptoErrorType.KEY_DERIVATION_FAILED,
          "Passkey authentication was cancelled or not allowed"
        );
      }
      if (error.name === "SecurityError") {
        throw new CryptoError(
          CryptoErrorType.KEY_DERIVATION_FAILED,
          "Security error during passkey authentication"
        );
      }
    }
    throw new CryptoError(
      CryptoErrorType.KEY_DERIVATION_FAILED,
      "Failed to authenticate with passkey",
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Combined passkey registration and encryption setup
 * Use this for new user onboarding
 *
 * @param userId - User's ID
 * @param userEmail - User's email
 * @param prfSalt - PRF salt for encryption (base64 encoded)
 */
export async function registerPasskeyWithEncryption(
  userId: string,
  userEmail: string,
  prfSalt: string
): Promise<PasskeyRegistrationResult> {
  const options = await generateRegistrationOptions(
    userId,
    userEmail,
    userEmail,
    prfSalt
  );
  return registerPasskey(options);
}

/**
 * Combined passkey authentication and encryption unlock
 * Use this for returning user sign-in
 *
 * @param credentialIds - Optional list of allowed credential IDs
 * @param prfSalt - PRF salt for encryption (base64 encoded)
 */
export async function authenticatePasskeyWithEncryption(
  credentialIds?: string[],
  prfSalt?: string
): Promise<PasskeyAuthenticationResult> {
  const options = await generateAuthenticationOptions(credentialIds, prfSalt);
  return authenticateWithPasskey(options);
}
