import { logEvent } from "firebase/analytics";
import { analytics } from "../firebase/config";

export const useAnalytics = () => {
  const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
    try {
      if (analytics) {
        logEvent(analytics, eventName, params);
      }
    } catch (e) {
      console.warn("Analytics not available:", e);
    }
  };

  return { trackEvent };
};
