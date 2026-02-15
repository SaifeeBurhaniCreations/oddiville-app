import { useMemo, useState, useCallback } from "react";
import { mapActivitiesToDocuments } from "@/src/adapters/mapActivities";
import type { SearchRegistryKey } from "@/src/utils/searchRegistyUtil";
import type { SearchDocument } from "@/src/types/search/searchDocument";
import { useAllSearchSources } from "./useAllSearchSources";

type SearchPhase = "idle" | "typing" | "loading" | "results" | "empty";

/* ---------------- TEXT MATCH ---------------- */

function matchesQuery(doc: SearchDocument, query: string) {
  if (!query) return true;

  const tokens = query.toLowerCase().split(/\s+/);

  return tokens.every((token) => doc.keywords.some((k) => k.includes(token)));
}

/* ---------------- CHIP MATCH ---------------- */

function matchesFilters(doc: SearchDocument, filters: SearchRegistryKey[]) {
  if (!filters.length) return true;
  return filters.includes(doc.identifier as SearchRegistryKey);
}

/* ======================================================= */

export function useSearchController(initialQuery = "") {
  /* ---------------- STATE ---------------- */

  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchRegistryKey[]>([]);
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);

  /* ---------------- DATA ---------------- */

  const { activities, isLoading } = useAllSearchSources();

  /* ---------------- INDEXING ---------------- */

const stableActivities = useMemo(
  () => activities,
  [activities.map(a => a.id).join("|")]
);

const documents = useMemo(
  () => mapActivitiesToDocuments(stableActivities),
  [stableActivities]
);

  /* ---------------- FILTERING ---------------- */

  const filteredDocuments = useMemo(() => {
    const q = (submittedQuery ?? "").trim().toLowerCase();

    return documents
      .filter((doc) => matchesQuery(doc, q))
      .filter((doc) => matchesFilters(doc, filters));
  }, [documents, submittedQuery, filters]);

  /* ---------------- SORTING ---------------- */

  const sortedDocuments = useMemo(
    () => [...filteredDocuments].sort((a, b) => b.createdAt - a.createdAt),
    [filteredDocuments],
  );

  /* ---------------- ACTIONS ---------------- */

  const updateQuery = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const submitSearch = useCallback(() => {
    setSubmittedQuery(query.trim());
  }, [query]);

  const toggleFilter = useCallback((key: SearchRegistryKey) => {
    setFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  /* ---------------- PHASE ---------------- */

  const phase: SearchPhase = useMemo(() => {
    if (!submittedQuery && filters.length === 0) return "idle";
    if (isLoading) return "loading";
    if (sortedDocuments.length === 0) return "empty";
    return "results";
  }, [submittedQuery, filters.length, sortedDocuments.length, isLoading]);

  return {
    query,
    updateQuery,
    submitSearch,
    filters,
    toggleFilter,

    results: sortedDocuments,
    rawCount: sortedDocuments.length,
    isLoading,
    phase,
  };
}
