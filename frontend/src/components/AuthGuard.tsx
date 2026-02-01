// components/AuthGuard.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

async function getGoogleAuthUrl() {
  const res = await fetch("/api/cards/auth-url");
  const data = await res.json();
  return data.authUrl;
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

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();

    // Listen for OAuth callback
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
          window.dispatchEvent(
            new CustomEvent("auth-state-changed", { detail: userInfo }),
          );

          setIsAuthenticated(true);

          // Redirect to intended destination or home
          const intendedPath = localStorage.getItem("intended_path");
          if (intendedPath) {
            localStorage.removeItem("intended_path");
            navigate(intendedPath, { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        } catch (error) {
          console.error("Failed to get user info:", error);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  const checkAuth = () => {
    const storedAccess = localStorage.getItem("google_access_token");
    const expiryTime = localStorage.getItem("google_token_expiry");

    // If token exists and is not expired
    if (storedAccess && expiryTime) {
      if (Date.now() < parseInt(expiryTime)) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      } else {
        // Token expired, clear it and store intended path
        console.log("Token expired, storing current path:", location.pathname);
        localStorage.setItem(
          "intended_path",
          location.pathname + location.search,
        );
        localStorage.removeItem("google_access_token");
        localStorage.removeItem("google_token_expiry");
        localStorage.removeItem("user_info");
      }
    } else {
      // No token, store intended path if not already at root
      if (location.pathname !== "/") {
        console.log("No token, storing current path:", location.pathname);
        localStorage.setItem(
          "intended_path",
          location.pathname + location.search,
        );
      }
    }

    setIsAuthenticated(false);
    setIsLoading(false);
  };

  const handleLogin = async () => {
    // Store current path before opening auth popup
    if (location.pathname !== "/") {
      localStorage.setItem(
        "intended_path",
        location.pathname + location.search,
      );
    }

    const authUrl = await getGoogleAuthUrl();
    window.open(authUrl, "Google Auth", "width=600,height=600");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Welcome to CardTracker</h1>
            <p className="text-muted-foreground">
              Sign in with Google to get started
            </p>
            {location.pathname !== "/" && (
              <p className="text-sm text-blue-600 dark:text-blue-400">
                You'll be redirected to {location.pathname} after signing in
              </p>
            )}
          </div>

          <div className="space-y-4">
            <Button onClick={handleLogin} className="w-full" size="lg">
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              We use Google authentication to securely export your card
              collection to Google Sheets
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
