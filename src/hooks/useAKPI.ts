import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const AKPI_YEARS = Array.from({ length: 17 }, (_, i) => 2019 + i); // 2019..2035
export const HISTORICAL_YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

export type AKPIStatus = 'On Track' | 'Needs Attention' | 'Behind' | 'No Data' | 'Target Not Set';

export interface AKPIIndicator {
  id: string;
  aspirasi: string;
  akpi_code: string;
  indicator_bm: string;
  indicator_en: string | null;
  lead_agency: string | null;
  metric_type: string | null;
  target_2035: number | null;
  direction: string;
  review_cycle: string | null;
  source_note: string | null;
  validation_note: string | null;
  definition_bm: string | null;
  definition_en: string | null;
  sort_order: number;
  values: Record<number, number | null>;
}

export interface AKPIDerived extends AKPIIndicator {
  latestValue: number | null;
  latestYear: number | null;
  progressPct: number | null; // 0..1+
  status: AKPIStatus;
  isHigherBetter: boolean;
}

const STATUS_COLORS: Record<AKPIStatus, string> = {
  'On Track': 'hsl(142 71% 45%)',
  'Needs Attention': 'hsl(38 92% 50%)',
  'Behind': 'hsl(0 84% 60%)',
  'No Data': 'hsl(220 9% 46%)',
  'Target Not Set': 'hsl(263 70% 60%)',
};

export const getStatusColor = (s: AKPIStatus) => STATUS_COLORS[s];

const computeDerived = (ind: AKPIIndicator): AKPIDerived => {
  const isHigherBetter = !ind.direction?.startsWith('≤');
  // latest historical value (most recent year with data, up to 2035)
  let latestValue: number | null = null;
  let latestYear: number | null = null;
  for (let y = 2035; y >= 2019; y--) {
    const v = ind.values[y];
    if (v !== null && v !== undefined && !Number.isNaN(Number(v))) {
      latestValue = Number(v);
      latestYear = y;
      break;
    }
  }
  let progressPct: number | null = null;
  let status: AKPIStatus = 'No Data';
  if (ind.target_2035 == null) {
    status = latestValue == null ? 'No Data' : 'Target Not Set';
  } else if (latestValue == null) {
    status = 'No Data';
  } else {
    if (isHigherBetter) {
      progressPct = ind.target_2035 === 0 ? (latestValue >= 0 ? 1 : 0) : latestValue / ind.target_2035;
    } else {
      // Lower is better. If target is 0, treat any non-zero as 0 progress
      if (ind.target_2035 === 0) {
        progressPct = latestValue === 0 ? 1 : 0;
      } else {
        progressPct = ind.target_2035 / Math.max(latestValue, 0.0001);
      }
    }
    if (progressPct >= 1) status = 'On Track';
    else if (progressPct >= 0.7) status = 'Needs Attention';
    else status = 'Behind';
  }
  return { ...ind, latestValue, latestYear, progressPct, status, isHigherBetter };
};

export function useAKPI() {
  const [indicators, setIndicators] = useState<AKPIIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: inds, error: e1 }, { data: vals, error: e2 }] = await Promise.all([
      supabase.from('akpi_indicators').select('*').order('sort_order'),
      supabase.from('akpi_yearly_values').select('*'),
    ]);
    if (e1 || e2) {
      toast({ title: 'Error', description: 'Failed to load AKPI data.', variant: 'destructive' });
      setLoading(false);
      return;
    }
    const valuesByIndicator: Record<string, Record<number, number | null>> = {};
    (vals || []).forEach((v: any) => {
      if (!valuesByIndicator[v.indicator_id]) valuesByIndicator[v.indicator_id] = {};
      valuesByIndicator[v.indicator_id][v.year] = v.value == null ? null : Number(v.value);
    });
    const merged = (inds || []).map((i: any) => ({
      ...i,
      target_2035: i.target_2035 == null ? null : Number(i.target_2035),
      values: valuesByIndicator[i.id] || {},
    }));
    setIndicators(merged);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchAll();
    const ch = supabase
      .channel('akpi-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'akpi_indicators' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'akpi_yearly_values' }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchAll]);

  const derived = useMemo(() => indicators.map(computeDerived), [indicators]);

  const saveValue = useCallback(async (indicatorId: string, year: number, value: number | null) => {
    const { error } = await supabase
      .from('akpi_yearly_values')
      .upsert({ indicator_id: indicatorId, year, value }, { onConflict: 'indicator_id,year' });
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      throw error;
    }
  }, [toast]);

  const updateIndicator = useCallback(async (id: string, patch: Partial<AKPIIndicator>) => {
    const { values, ...rest } = patch;
    const { error } = await supabase.from('akpi_indicators').update(rest).eq('id', id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      throw error;
    }
  }, [toast]);

  return { indicators, derived, loading, saveValue, updateIndicator, refresh: fetchAll };
}
