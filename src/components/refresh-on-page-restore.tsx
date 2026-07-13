"use client";

import { useEffect } from "react";

export function RefreshOnPageRestore() {
  useEffect(() => {
    let refreshing = false;

    function wasRestoredFromHistory() {
      const navigation = window.performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming | undefined;

      return navigation?.type === "back_forward";
    }

    function refreshIfRestored(event?: PageTransitionEvent) {
      if (!refreshing && (event?.persisted === true || wasRestoredFromHistory())) {
        refreshing = true;
        // A history snapshot can belong to an older deployment.
        window.location.reload();
      }
    }

    // pageshow may fire before React hydrates, so also inspect the navigation
    // entry immediately after mounting.
    refreshIfRestored();
    window.addEventListener("pageshow", refreshIfRestored);

    return () => {
      window.removeEventListener("pageshow", refreshIfRestored);
    };
  }, []);

  return null;
}
