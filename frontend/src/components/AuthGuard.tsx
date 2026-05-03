// components/AuthGuard.tsx
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

async function getUserInfo(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error("Failed to get user info");
  return res.json();
}

export function AuthGuard({ children }: Readonly<AuthGuardProps>) {
  useEffect(() => {
    // Keep global auth state in sync without blocking app screens.
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === "GOOGLE_AUTH_SUCCESS") {
        const tokens = event.data.tokens;

        // Store tokens with expiry time
        const expiryTime = Date.now() + (tokens.expires_in || 3600) * 1000;
        localStorage.setItem("google_access_token", tokens.access_token);
        localStorage.setItem("google_token_expiry", expiryTime.toString());

        if (tokens.refresh_token) {
          localStorage.setItem("google_refresh_token", tokens.refresh_token);
        }

        // Get and store user info
        try {
          const userInfo = await getUserInfo(tokens.access_token);
          localStorage.setItem("user_info", JSON.stringify(userInfo));

          // Dispatch event to notify navbar
          globalThis.dispatchEvent(
            new CustomEvent("auth-state-changed", { detail: userInfo }),
          );
        } catch (error) {
          console.error("Failed to get user info:", error);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return <>{children}</>;
}
