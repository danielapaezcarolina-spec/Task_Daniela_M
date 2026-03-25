"use client";

import { useState, useEffect, useCallback } from "react";
import { loans as loansApi } from "@/lib/api";
import type { PersonalLoan } from "@/lib/types";

export function useLoans() {
  const [loans, setLoans] = useState<PersonalLoan[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await loansApi.list();
      setLoans(data);
    } catch {
      // API not available
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createLoan = useCallback(async (data: Record<string, unknown>) => {
    const loan = await loansApi.create(data);
    setLoans((prev) => [...prev, loan]);
    return loan;
  }, []);

  const updateLoan = useCallback(async (id: string, data: Record<string, unknown>) => {
    const loan = await loansApi.update(id, data);
    setLoans((prev) => prev.map((l) => (l.id === id ? loan : l)));
    return loan;
  }, []);

  const deleteLoan = useCallback(async (id: string) => {
    await loansApi.delete(id);
    setLoans((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return { loans, loading, refresh, createLoan, updateLoan, deleteLoan };
}
