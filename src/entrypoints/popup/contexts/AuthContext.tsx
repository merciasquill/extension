import { Spinner } from "@heroui/react";
import { decodeJwt } from "jose";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { CookieNames } from "@/lib/enums";

interface User {
  username: string;
  displayName: string;
  avatarUrl: string;
}

type AuthContextType =
  | {
      user: User;
      token: string;
      signed: true;
    }
  | {
      user: null;
      token: null;
      signed: false;
    };

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [signed, setSigned] = useState<boolean>(false);

  useEffect(() => {
    async function asynchronous() {
      const accessToken = await browser.cookies.get({
        name: CookieNames.AccessToken,
        url: "https://auth.merciasquill.com",
      });

      if (!accessToken?.value) {
        return setMounted(true);
      }

      const decodedJwt = decodeJwt(accessToken.value);

      if (!decodedJwt.username || typeof decodedJwt.username !== "string") {
        throw new Error("Invalid JWT: missing or invalid 'username' claim");
      }

      if (
        !decodedJwt.displayName ||
        typeof decodedJwt.displayName !== "string"
      ) {
        throw new Error("Invalid JWT: missing or invalid 'displayName' claim");
      }

      if (!decodedJwt.avatarUrl || typeof decodedJwt.avatarUrl !== "string") {
        throw new Error("Invalid JWT: missing or invalid 'avatarUrl' claim");
      }

      setUser({
        username: decodedJwt.username,
        displayName: decodedJwt.displayName,
        avatarUrl: decodedJwt.avatarUrl,
      });
      setToken(accessToken.value);
      setSigned(true);

      setMounted(true);
    }

    asynchronous();
  }, []);

  if (!mounted)
    return (
      <div className="p-4">
        <Spinner className="text-muted" size="xl" />
      </div>
    );

  return (
    <AuthContext.Provider
      value={{ user: user, token, signed } as AuthContextType}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");

  return context;
};
