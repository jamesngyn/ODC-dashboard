"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "backlog_project_id";

function readFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "" ? null : value;
}

export function useBacklogProjectId(): {
  backlogProjectId: string | null;
  setBacklogProjectId: (id: string | null) => void;
} {
  const [backlogProjectId, setState] = useState<string | null>(() =>
    typeof window === "undefined" ? null : readFromStorage()
  );

  useEffect(() => {
    setState(readFromStorage());
  }, []);

  const setBacklogProjectId = useCallback((id: string | null) => {
    if (typeof window === "undefined") return;
    if (id === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, id);
    }
    setState(id);
  }, []);

  return { backlogProjectId, setBacklogProjectId };
}
