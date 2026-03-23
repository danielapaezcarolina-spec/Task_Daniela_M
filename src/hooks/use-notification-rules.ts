"use client";

import { useState, useEffect, useCallback } from "react";

export interface NotificationRule {
  id: string;
  type: "general" | "company";
  companyId?: string;
  companyName?: string;
  daysBefore: number;
  enabled: boolean;
}

const STORAGE_KEY = "notification_rules";

const defaultGeneral: NotificationRule = {
  id: "general",
  type: "general",
  daysBefore: 3,
  enabled: true,
};

export function useNotificationRules() {
  const [rules, setRules] = useState<NotificationRule[]>([defaultGeneral]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRules(JSON.parse(stored));
    } catch {}
  }, []);

  const persist = useCallback((updated: NotificationRule[]) => {
    setRules(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  }, []);

  const updateGeneralRule = useCallback((patch: Partial<NotificationRule>) => {
    persist(rules.map((r) => r.id === "general" ? { ...r, ...patch } : r));
  }, [rules, persist]);

  const addCompanyRule = useCallback((companyId: string, companyName: string, daysBefore: number) => {
    // Don't add duplicate
    if (rules.find((r) => r.companyId === companyId)) return;
    persist([...rules, {
      id: `company-${companyId}`,
      type: "company",
      companyId,
      companyName,
      daysBefore,
      enabled: true,
    }]);
  }, [rules, persist]);

  const updateCompanyRule = useCallback((id: string, patch: Partial<NotificationRule>) => {
    persist(rules.map((r) => r.id === id ? { ...r, ...patch } : r));
  }, [rules, persist]);

  const removeCompanyRule = useCallback((id: string) => {
    persist(rules.filter((r) => r.id !== id));
  }, [rules, persist]);

  const generalRule = rules.find((r) => r.id === "general") ?? defaultGeneral;
  const companyRules = rules.filter((r) => r.type === "company");

  // Get effective days for a company (company rule overrides general)
  const getDaysForCompany = useCallback((companyId: string): number | null => {
    const companyRule = companyRules.find((r) => r.companyId === companyId);
    if (companyRule?.enabled) return companyRule.daysBefore;
    if (generalRule.enabled) return generalRule.daysBefore;
    return null;
  }, [companyRules, generalRule]);

  return { rules, generalRule, companyRules, updateGeneralRule, addCompanyRule, updateCompanyRule, removeCompanyRule, getDaysForCompany };
}
