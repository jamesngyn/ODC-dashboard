"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "show_backlog_links";

const DEFAULT_SHOW = true;

function readFromStorage(): boolean {
  if (typeof window === "undefined") return DEFAULT_SHOW;
  const value = localStorage.getItem(STORAGE_KEY);
  if (value === null) return DEFAULT_SHOW;
  return value === "1" || value === "true";
}

export function useShowBacklogLinks(): {
  showBacklogLinks: boolean;
  setShowBacklogLinks: (show: boolean) => void;
} {
  const [showBacklogLinks, setState] = useState<boolean>(() =>
    typeof window === "undefined" ? DEFAULT_SHOW : readFromStorage()
  );

  useEffect(() => {
    setState(readFromStorage());
  }, []);

  const setShowBacklogLinks = useCallback((show: boolean) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, show ? "1" : "0");
    setState(show);
  }, []);

  return { showBacklogLinks, setShowBacklogLinks };
}
