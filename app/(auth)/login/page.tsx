"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { FRONTEND_BASE_URL, OAUTH_LOGIN_URL } from "@/utils/env";

const LoginPage = () => {
  // OAuth Configuration
  const [clientId, setClientId] = useState<string>(
    process.env.NEXT_PUBLIC_OAUTH_WIFAKEY_CLIENT_ID!
  );
  const [redirectUri, setRedirectUri] = useState<string>(
    `${FRONTEND_BASE_URL}/login/callback`
  );
  const [scope, setScope] = useState<string>("openid profile");
  const [responseType, setResponseType] = useState<string>("code");
  const [state, setState] = useState<string>("");
  const [nonce, setNonce] = useState<string>("");

  // PKCE State
  const [codeVerifier, setCodeVerifier] = useState<string>("");
  const [codeChallenge, setCodeChallenge] = useState<string>("");
  const [codeChallengeMethod, setCodeChallengeMethod] =
    useState<string>("S256");

  // UI State
  const [error, setError] = useState<{
    title: string;
    message: string;
    code?: string;
  } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Generate cryptographically secure random string
   */
  const generateRandomString = (length: number = 32): string => {
    const array = new Uint8Array(length);
    if (typeof window !== "undefined" && window.crypto) {
      window.crypto.getRandomValues(array);
    }
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  };

  /**
   * Base64 URL encode (without padding)
   */
  const base64UrlEncode = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  };

  /**
   * Generate code_challenge from code_verifier using SHA-256
   * This is PKCE S256 method (most secure)
   */
  const generateCodeChallenge = async (verifier: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return base64UrlEncode(hash);
  };

  /**
   * Initialize PKCE, state and nonce on mount
   */
  useEffect(() => {
    const initializeSecurity = async () => {
      // Generate state and nonce (CSRF & replay protection)
      const newState = generateRandomString(32);
      const newNonce = generateRandomString(32);

      // Generate PKCE code_verifier (43-128 characters, URL-safe)
      const newCodeVerifier = generateRandomString(64); // 128 hex chars = 64 bytes

      // Generate code_challenge from code_verifier
      const newCodeChallenge = await generateCodeChallenge(newCodeVerifier);

      // Update state
      setState(newState);
      setNonce(newNonce);
      setCodeVerifier(newCodeVerifier);
      setCodeChallenge(newCodeChallenge);

      // Store for validation later
      sessionStorage.setItem("oauth_state", newState);
      sessionStorage.setItem("oauth_nonce", newNonce);
      sessionStorage.setItem("oauth_code_verifier", newCodeVerifier); // IMPORTANT for token exchange

      console.log("🔐 Generated security tokens:", {
        state: newState,
        nonce: newNonce,
        codeVerifier: newCodeVerifier,
        codeChallenge: newCodeChallenge,
        codeChallengeMethod: "S256",
      });
    };

    initializeSecurity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Open OAuth popup window with PKCE
   */
  const openPopup = () => {
    if (!state || !nonce || !codeChallenge) {
      alert("Initializing security tokens... Please wait.");
      return;
    }

    // Clear previous errors
    setError(null);
    setSuccess(null);

    // Build authorization URL with PKCE parameters
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope,
      response_type: responseType,
      state: state,
      nonce: nonce,
      code_challenge: codeChallenge, //PKCE
      code_challenge_method: codeChallengeMethod, // PKCE (S256)
    });

    const url = `${OAUTH_LOGIN_URL}?${params.toString()}`;

    const width = 900;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    console.log("🚀 Opening OAuth popup with PKCE:", url);

    const popup = window.open(
      url,
      "oauthwifakey",
      `toolbar=no, location=no, directories=no, status=no, menubar=no, 
      scrollbars=no, resizable=no, copyhistory=no,
      width=${width}, height=${height}, top=${top}, left=${left}`
    );

    if (!popup) {
      setError({
        title: "Popup Blocked",
        message: "Please allow popups for this site and try again.",
        code: "popup_blocked",
      });
    }
  };

  /**
   * Listen for messages from callback page (popup)
   */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        console.warn("❌ Message from untrusted origin:", event.origin);
        return;
      }

      console.log("📨 Received message from callback:", event.data);

      // CASE 1: OAuth success
      if (event.data?.type === "oauth_success") {
        console.log("✅ OAuth flow completed successfully!");

        setSuccess("Login successful! Redirecting to dashboard...");

        // Clear security tokens
        sessionStorage.removeItem("oauth_state");
        sessionStorage.removeItem("oauth_nonce");
        sessionStorage.removeItem("oauth_code_verifier"); // ✅ Clear PKCE verifier

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "/infor";
        }, 1500);

        return;
      }

      // CASE 2: OAuth error
      if (event.data?.type === "oauth_error") {
        setError({
          title: "Authentication Error",
          message:
            event.data.message ||
            "An unknown error occurred during authentication.",
          code: event.data.error,
        });

        return;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          OAuth Configuration with PKCE
        </CardTitle>
        <CardDescription>
          Configure and test OAuth 2.0 / OpenID Connect with PKCE security
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{error.title}</AlertTitle>
            <AlertDescription>
              {error.message}
              {error.code && (
                <div className="mt-2 text-xs font-mono">
                  Error Code: {error.code}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success!</AlertTitle>
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Configuration Form */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {/* client_id */}
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
          </div>

          {/* redirect_uri */}
          <div className="space-y-2">
            <Label htmlFor="redirectUri">Redirect URI</Label>
            <Input
              id="redirectUri"
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
            />
          </div>

          {/* scope */}
          <div className="space-y-2">
            <Label htmlFor="scope">Scope</Label>
            <Input
              id="scope"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="openid profile email"
            />
          </div>

          {/* response_type */}
          <div className="space-y-2">
            <Label htmlFor="responseType">Response Type</Label>
            <Input
              id="responseType"
              value={responseType}
              onChange={(e) => setResponseType(e.target.value)}
            />
          </div>

          {/* state (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="state" className="flex items-center gap-2">
              State
              <span className="text-xs text-gray-500">(CSRF Protection)</span>
            </Label>
            <Input
              id="state"
              value={state || "Generating..."}
              readOnly
              className="bg-slate-100 font-mono text-xs"
            />
          </div>

          {/* nonce (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="nonce" className="flex items-center gap-2">
              Nonce
              <span className="text-xs text-gray-500">(Replay Protection)</span>
            </Label>
            <Input
              id="nonce"
              value={nonce || "Generating..."}
              
              className="bg-slate-100 font-mono text-xs"
            />
          </div>

          {/* code_verifier (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="codeVerifier" className="flex items-center gap-2">
              Code Verifier
              <span className="text-xs text-gray-500">(PKCE - Secret)</span>
            </Label>
            <Input
              id="codeVerifier"
              value={codeVerifier ? `${codeVerifier}` : "Generating..."}
              readOnly
              className="bg-slate-100 font-mono text-xs"
              title={codeVerifier}
            />
          </div>

          {/* code_challenge (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="codeChallenge" className="flex items-center gap-2">
              Code Challenge
              <span className="text-xs text-gray-500">(PKCE - SHA256)</span>
            </Label>
            <Input
              id="codeChallenge"
              value={codeChallenge || "Generating..."}
              className="bg-slate-100 font-mono text-xs"
              title={codeChallenge}
              onChange={(e) => setCodeChallenge(e.target.value)}
            />
          </div>

          {/* code_challenge_method (readonly) */}
          <div className="space-y-2">
            <Label
              htmlFor="codeChallengeMethod"
              className="flex items-center gap-2"
            >
              Code Challenge Method
              <span className="text-xs text-gray-500">(PKCE Algorithm)</span>
            </Label>
            <Input
              id="codeChallengeMethod"
              value={codeChallengeMethod}
              onChange={(e) => setCodeChallengeMethod(e.target.value)}
              className="bg-slate-100 font-mono text-xs"
            />
          </div>
        </form>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={openPopup}
          disabled={!state || !nonce || !codeChallenge}
        >
          Login with WiFaKey (PKCE Secured)
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LoginPage;
