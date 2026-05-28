import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithPhoneNumber,
  ConfirmationResult,
  Auth,
  RecaptchaVerifier,
} from "firebase/auth";
import { Platform } from "react-native";

const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const IS_DEMO_MODE = !FIREBASE_CONFIG.apiKey;

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _pendingConfirmation: ConfirmationResult | null = null;
let _demoPhone: string | null = null;

function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getApps()[0];
    return _app;
  }
  _app = initializeApp(FIREBASE_CONFIG as any);
  return _app;
}

function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  return _auth;
}

export function getPendingConfirmation() {
  return _pendingConfirmation;
}

export function clearPendingConfirmation() {
  _pendingConfirmation = null;
  _demoPhone = null;
}

export async function sendOtp(
  phoneNumber: string,
  recaptchaVerifier?: RecaptchaVerifier
): Promise<void> {
  if (IS_DEMO_MODE) {
    _demoPhone = phoneNumber;
    await new Promise((r) => setTimeout(r, 1200));
    return;
  }

  const auth = getFirebaseAuth();

  if (Platform.OS === "web") {
    if (!recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
      _pendingConfirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        verifier
      );
    } else {
      _pendingConfirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier
      );
    }
  } else {
    if (!recaptchaVerifier) throw new Error("RecaptchaVerifier required on native");
    _pendingConfirmation = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier
    );
  }
}

export async function verifyOtp(code: string): Promise<string> {
  if (IS_DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 800));
    if (code !== "123456") throw new Error("Invalid OTP. Use 123456 in demo mode.");
    return `demo_firebase_token_${_demoPhone}_${Date.now()}`;
  }

  if (!_pendingConfirmation) throw new Error("No pending OTP verification.");
  const result = await _pendingConfirmation.confirm(code);
  const token = await result.user.getIdToken();
  return token;
}
