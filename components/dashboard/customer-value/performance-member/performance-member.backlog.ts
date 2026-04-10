"use client";

import { useEffect, useMemo } from "react";
import { QUERY_KEYS } from "@/constants/common";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { TaskStatus } from "@/types/enums/common";
import type { BacklogIssue } from "@/types/interfaces/common";
import { idbKvGet, idbKvSet } from "@/lib/storage/idb-kv";
import {
  getBacklogIssueTypes,
  getBacklogProjectMembers,
  getBacklogStatuses,
  getBacklogTasksByActualEndDateRange,
} from "@/lib/api/backlog";

import type {
  BacklogProjectDataItem,
  BacklogProjectMapping,
  BacklogProjectsResult,
} from "./performance-member.types";

type BacklogProjectMeta = {
  members: Awaited<ReturnType<typeof getBacklogProjectMembers>>;
  closedStatusId: number | null;
  taskIssueTypeId: number | null;
  fetchedAtMs: number;
};

type BacklogProjectIssuesCache = {
  issues: BacklogIssue[];
  fetchedAtMs: number;
};

const BACKLOG_META_TTL_MS = 6 * 60 * 60 * 1000; // 6h
const BACKLOG_ISSUES_TTL_MS = 5 * 60 * 1000; // 5m
const BACKLOG_CONCURRENCY = 3;

const backlogMetaCache = new Map<string, BacklogProjectMeta>();
const backlogIssuesCache = new Map<string, BacklogProjectIssuesCache>();

const PERSIST_PREFIX = "customer-value:performance-member:backlog:v1:";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(error: unknown): boolean {
  const e = error as {
    response?: { status?: number };
    status?: number;
    message?: string;
  };
  return (
    e?.response?.status === 429 ||
    e?.status === 429 ||
    (typeof e?.message === "string" && e.message.includes("429"))
  );
}

async function withRateLimitRetry<T>(fn: () => Promise<T>): Promise<T> {
  const maxRetries = 3;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (!isRateLimitError(error) || attempt === maxRetries) {
        throw error;
      }
      const base = 600 * 2 ** attempt;
      const jitter = Math.floor(Math.random() * 200);
      await sleep(base + jitter);
    }
  }
  throw new Error("Retry exceeded");
}

async function getMetaCached(
  backlogProjectId: string,
  now: number
): Promise<BacklogProjectMeta | null> {
  try {
    const memory = backlogMetaCache.get(backlogProjectId);
    if (memory) return memory;

    const persisted = await idbKvGet<BacklogProjectMeta>(
      `${PERSIST_PREFIX}meta:${backlogProjectId}`
    );
    if (persisted?.value) {
      backlogMetaCache.set(backlogProjectId, persisted.value);
      return persisted.value;
    }
    return null;
  } catch {
    return null;
  }
}

async function setMetaCached(
  backlogProjectId: string,
  meta: BacklogProjectMeta
): Promise<void> {
  try {
    backlogMetaCache.set(backlogProjectId, meta);
    await idbKvSet(`${PERSIST_PREFIX}meta:${backlogProjectId}`, meta, {
      ttlMs: BACKLOG_META_TTL_MS,
    });
  } catch {
    // Best-effort cache write
  }
}

async function getIssuesCached(
  issuesKey: string,
  now: number
): Promise<BacklogIssue[] | null> {
  try {
    const memory = backlogIssuesCache.get(issuesKey);
    if (memory) return memory.issues;

    const persisted = await idbKvGet<BacklogProjectIssuesCache>(
      `${PERSIST_PREFIX}issues:${issuesKey}`
    );
    if (persisted?.value) {
      backlogIssuesCache.set(issuesKey, persisted.value);
      return persisted.value.issues;
    }
    return null;
  } catch {
    return null;
  }
}

async function setIssuesCached(
  issuesKey: string,
  cache: BacklogProjectIssuesCache
): Promise<void> {
  try {
    backlogIssuesCache.set(issuesKey, cache);
    await idbKvSet(`${PERSIST_PREFIX}issues:${issuesKey}`, cache, {
      ttlMs: BACKLOG_ISSUES_TTL_MS,
    });
  } catch {
    // Best-effort cache write
  }
}

async function asyncPool<TItem, TResult>(
  concurrency: number,
  items: TItem[],
  iterator: (item: TItem) => Promise<TResult>
): Promise<TResult[]> {
  const results: TResult[] = [];
  const executing = new Set<Promise<void>>();

  const enqueue = async (item: TItem) => {
    const p = (async () => {
      const r = await iterator(item);
      results.push(r);
    })();
    executing.add(p);
    p.finally(() => executing.delete(p));
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  };

  for (const item of items) {
    await enqueue(item);
  }
  await Promise.all(Array.from(executing));
  return results;
}

export function usePerformanceBacklogProjects(options: {
  from: string;
  to: string;
  selectedProjectId: string;
  mappings: BacklogProjectMapping[];
  allValue: string;
}) {
  const { from, to, selectedProjectId, mappings, allValue } = options;
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => [
      ...QUERY_KEYS.CUSTOMER_VALUE.PERFORMANCE_CLOSED_ISSUES([]),
      "multi-backlog-projects",
      from,
      to,
      selectedProjectId,
      mappings.map((p) => p.acmsProjectId).join(","),
    ],
    [from, mappings, selectedProjectId, to]
  );

  useEffect(() => {
    let isCancelled = false;

    const hydrateFromCache = async () => {
      if (mappings.length === 0) return;

      const mappingsToHydrate =
        selectedProjectId === allValue
          ? mappings
          : mappings.filter((m) => String(m.acmsProjectId) === selectedProjectId);

      const now = Date.now();
      const attemptedCount = mappingsToHydrate.length;

      const settled = await Promise.all(
        mappingsToHydrate.map(async (mapping) => {
          try {
            const meta = await getMetaCached(mapping.backlogProjectId, now);
            if (!meta) return null;

            const issuesKey = `${mapping.backlogProjectId}|${from}|${to}|${meta.closedStatusId ?? "x"}|${meta.taskIssueTypeId ?? "y"}`;
            const issues = await getIssuesCached(issuesKey, now);
            if (!issues) return null;

            const item: BacklogProjectDataItem = {
              mapping,
              members: meta.members,
              issues,
            };
            return item;
          } catch {
            return null;
          }
        })
      );

      if (isCancelled) return;

      const items = settled
        .filter((x): x is BacklogProjectDataItem => x != null)
        .sort((a, b) =>
          a.mapping.acmsProjectName.localeCompare(b.mapping.acmsProjectName)
        );

      if (items.length === 0) return;

      const failedCount = attemptedCount - items.length;
      queryClient.setQueryData<BacklogProjectsResult>(queryKey, {
        items,
        attemptedCount,
        failedCount,
      });
    };

    hydrateFromCache();

    return () => {
      isCancelled = true;
    };
  }, [allValue, from, mappings, queryClient, queryKey, selectedProjectId, to]);

  return useQuery({
    queryKey,
    enabled: mappings.length > 0,
    staleTime: 0,
    gcTime: 30 * 60 * 1000,
    placeholderData: (previous) => previous,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
    queryFn: async (): Promise<BacklogProjectsResult> => {
      const mappingsToFetch =
        selectedProjectId === allValue
          ? mappings
          : mappings.filter(
              (m) => String(m.acmsProjectId) === selectedProjectId
            );

      const now = Date.now();
      const concurrency =
        selectedProjectId === allValue ? 1 : BACKLOG_CONCURRENCY;
      const attemptedCount = mappingsToFetch.length;

      const settled = await asyncPool(
        concurrency,
        mappingsToFetch,
        async (mapping) => {
          try {
            const metaKey = mapping.backlogProjectId;
            let meta: BacklogProjectMeta | null = null;
            try {
              const [members, statuses, issueTypes] = await Promise.all([
                withRateLimitRetry(() =>
                  getBacklogProjectMembers(false, mapping.backlogProjectId)
                ),
                withRateLimitRetry(() =>
                  getBacklogStatuses(mapping.backlogProjectId)
                ),
                withRateLimitRetry(() =>
                  getBacklogIssueTypes(mapping.backlogProjectId)
                ),
              ]);

              const closedStatusId =
                statuses.find(
                  (status) =>
                    status.name?.toLowerCase() ===
                    TaskStatus.Closed.toLowerCase()
                )?.id ?? null;
              const taskIssueTypeId =
                issueTypes.find(
                  (issueType) => issueType.name?.toLowerCase() === "task"
                )?.id ?? null;

              meta = {
                members,
                closedStatusId,
                taskIssueTypeId,
                fetchedAtMs: now,
              };
              await setMetaCached(metaKey, meta);
            } catch {
              meta = await getMetaCached(metaKey, now);
            }

            if (!meta) return null;

            const issuesKey = `${mapping.backlogProjectId}|${from}|${to}|${meta.closedStatusId ?? "x"}|${meta.taskIssueTypeId ?? "y"}`;
            let issues: BacklogIssue[] = [];
            if (meta.closedStatusId != null && meta.taskIssueTypeId != null) {
              try {
                const fetched = await withRateLimitRetry(() =>
                  getBacklogTasksByActualEndDateRange({
                    projectId: mapping.backlogProjectId,
                    statusIds: [meta.closedStatusId as number],
                    issueTypeIds: [meta.taskIssueTypeId as number],
                    from,
                    to,
                  })
                );
                issues = fetched;
                await setIssuesCached(issuesKey, {
                  issues: fetched,
                  fetchedAtMs: now,
                });
              } catch {
                issues = (await getIssuesCached(issuesKey, now)) ?? [];
              }
            }

            const item: BacklogProjectDataItem = {
              mapping,
              members: meta.members,
              issues,
            };
            return item;
          } catch {
            return null;
          }
        }
      );

      const items = settled
        .filter((x): x is BacklogProjectDataItem => x != null)
        .sort((a, b) =>
          a.mapping.acmsProjectName.localeCompare(b.mapping.acmsProjectName)
        );

      const failedCount = attemptedCount - items.length;
      if (items.length === 0) {
        throw new Error("BACKLOG_ALL_PROJECTS_FAILED");
      }

      return { items, attemptedCount, failedCount };
    },
  });
}
