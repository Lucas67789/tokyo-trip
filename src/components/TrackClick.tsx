"use client";

import React, { AnchorHTMLAttributes } from "react";

interface TrackClickProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  actionType: string;
  targetId?: string;
}

export default function TrackClick({ actionType, targetId, children, onClick, ...props }: TrackClickProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Fire tracking request asynchronously
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action_type: actionType, target_id: targetId }),
      keepalive: true,
    }).catch(err => console.error("TrackClick error:", err));

    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <a onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
