"use client";

import { useState, useEffect, useCallback } from "react";
import { accountsReceivable as arApi } from "@/lib/api";
import type { AccountReceivable } from "@/lib/types";

export function useAccountsReceivable(companyId?: string) {
  const [accounts, setAccounts] = useState<AccountReceivable[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await arApi.list(companyId);
      setAccounts(data);
    } catch {
      // API not available
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createAR = useCallback(async (data: Record<string, unknown>) => {
    const ar = await arApi.create({ ...data, companyId: data.companyId || companyId });
    setAccounts((prev) => [...prev, ar]);
    return ar;
  }, [companyId]);

  const updateAR = useCallback(async (id: string, data: Record<string, unknown>) => {
    const ar = await arApi.update(id, data);
    setAccounts((prev) => prev.map((a) => (a.id === id ? ar : a)));
    return ar;
  }, []);

  const deleteAR = useCallback(async (id: string) => {
    await arApi.delete(id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { accounts, loading, refresh, createAR, updateAR, deleteAR };
}
