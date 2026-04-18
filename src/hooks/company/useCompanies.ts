import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { CompanyProfile } from "@/types/company";

type CompaniesPayload = {
  data: CompanyProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function useCompanies() {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(
    async (page: number, limit: number, search?: string, sort?: string) => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string | number> = { page, limit };
        if (search) params.q = search;
        if (sort) params.sort = sort;

        const res = await api.get<ApiResponse<CompaniesPayload>>("/companies", {
          params,
        });
        setCompanies(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      } catch (err: any) {
        setError(err.message || "Failed to load companies");
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    companies,
    total,
    totalPages,
    loading,
    error,
    fetchCompanies,
  };
}
