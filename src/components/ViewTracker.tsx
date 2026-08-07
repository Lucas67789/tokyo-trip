"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  targetId: string;
  actionType: "VIEW_HOTEL" | "VIEW_STATION" | "VIEW_POST" | "VIEW_PASS";
}

export default function ViewTracker({ targetId, actionType }: ViewTrackerProps) {
  useEffect(() => {
    // Only run once on mount
    const trackView = async () => {
      try {
        await fetch("/api/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action_type: actionType,
            target_id: targetId,
          }),
        });
      } catch (error) {
        console.error("View tracking failed", error);
      }
    };

    trackView();
  }, [targetId, actionType]);

  return null; // This component renders nothing
}
