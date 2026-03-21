"use client";

import { useState, useEffect, useCallback } from "react";
import { companies as companiesApi } from "@/lib/api";
import type { Company } from "@/lib/types";

export function useCompanies() {
  const [companiesList, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await companiesApi.list();
      setCompanies(data);
    } catch {
      // API not available, keep empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createCompany = useCallback(async (data: { name: string; rif: string; phone: string; contactName: string; sendDailySummary?: boolean }) => {
    const company = await companiesApi.create(data);
    setCompanies((prev) => [...prev, company]);
    return company;
  }, []);

  const updateCompany = useCallback(async (id: string, data: Record<string, unknown>) => {
    const company = await companiesApi.update(id, data);
    setCompanies((prev) => prev.map((c) => (c.id === id ? company : c)));
    return company;
  }, []);

  const deleteCompany = useCallback(async (id: string) => {
    await companiesApi.delete(id);
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { companies: companiesList, loading, refresh, createCompany, updateCompany, deleteCompany };
}
