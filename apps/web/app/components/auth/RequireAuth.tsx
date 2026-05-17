import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

import { useAppSelector } from "../../store/hooks";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAppSelector((s) => s.auth.hasHydratedFromStorage);
  const token = useAppSelector((s) => s.auth.accessToken);
  const me = useAppSelector((s) => s.me.me);
  const meStatus = useAppSelector((s) => s.me.status);
  const navigate = useNavigate();
  const location = useLocation();

  const isHydrating = !!token && !me && (meStatus === "idle" || meStatus === "loading");

  useEffect(() => {
    if (!hasHydrated) return;
    // Only redirect when we're sure there's no valid session
    if (!token && !isHydrating) {
      const next = `${location.pathname}${location.search}${location.hash}`;
      navigate(`/sign-in?next=${encodeURIComponent(next)}`, { replace: true });
    }
  }, [hasHydrated, token, isHydrating, navigate, location]);

  // Match SSR / first client paint: no token in Redux until `hydrateFromStorage` runs
  if (!hasHydrated) return null;
  if (!token) return null;
  return children;
}

