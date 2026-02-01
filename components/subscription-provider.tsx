"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useSubscription } from "@/hooks/use-subscription";
import {
  TIER_LIMITS,
  type SubscriptionContextValue,
} from "@/lib/types/subscription";

/**
 * Subscription context
 */
const SubscriptionContext = createContext<SubscriptionContextValue>({
  isLoading: true,
  isAuthenticated: false,
  tier: "free",
  limits: TIER_LIMITS.free,
  isPro: false,
  refresh: async () => {},
});

/**
 * Hook to access subscription context
 */
export function useSubscriptionContext(): SubscriptionContextValue {
  return useContext(SubscriptionContext);
}

/**
 * Subscription provider component that wraps the app and provides subscription context
 */
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const subscription = useSubscription();

  return (
    <SubscriptionContext.Provider value={subscription}>
      {children}
    </SubscriptionContext.Provider>
  );
}
