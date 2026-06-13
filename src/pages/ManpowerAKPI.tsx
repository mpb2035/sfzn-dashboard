import { useMemo, useState, useEffect } from 'react';
import { useAKPI, AKPI_YEARS, HISTORICAL_YEARS, AKPIDerived, AKPIStatus, getStatusColor } from '@/hooks/useAKPI';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Download, Info, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, HelpCircle, Target, Activity, Zap, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line,
} from 'recharts';
import * as XLSX from 'xlsx';

const STATUS_ORDER: AKPIStatus[] = ['On Track', 'Needs Attention', 'Behind', 'No Data', 'Target Not Set'];

type ProjectionScenario = 'low' | 'medium' | 'high';
interface ProjectionRates { low: number; medium: number; high: number }
const PROJECTION_STORAGE_KEY = 'akpi_projection_rates_v1'; // legacy single-set, migrated on load
const SCENARIO_SETS_KEY = 'akpi_projection_scenario_sets_v1';
const ACTIVE_SET_KEY = 'akpi_projection_active_set_v1';
const DEFAULT_RATES: ProjectionRates = { low: 2, medium: 5, high: 10 };

interface ScenarioSet { id: string; name: string; rates: ProjectionRates }
const DEFAULT_SCENARIO_SETS: ScenarioSet[] = [
  { id: 'default',      name: 'Default',      rates: { low: 2, medium: 5,  high: 10 } },
  { id: 'conservative', name: 'Conservative', rates: { low: 1, medium: 3,  high: 6  } },
  { id: 'aggressive',   name: 'Aggressive',   rates: { low: 5, medium: 10, high: 15 } },
];
const SCENARIO_META: Record<ProjectionScenario, { label: string; color: string; icon: typeof Activity }> = {
  low:    { label: 'Low Projection',    color: 'hsl(0 84% 60%)',  icon: TrendingDown },
  medium: { label: 'Medium Projection', color: 'hsl(38 92% 50%)', icon: Activity },
  high:   { label: 'High Projection',   color: 'hsl(142 71% 45%)', icon: Zap },
};

interface ProjectionResult {
  projected2035: number | null;
  projectedProgressPct: number | null;
  willMeetTarget: boolean;
  trajectory: { year: string; historical: number | null; projected: number | null; target: number | null }[];
}

function computeProjection(d: AKPIDerived, ratePct: number): ProjectionResult {
  const empty: ProjectionResult = { projected2035: null, projectedProgressPct: null, willMeetTarget: false, trajectory: [] };
  if (d.latestValue == null || d.latestYear == null) return empty;
  const r = ratePct / 100;
  const trajectory = AKPI_YEARS.map(y => {
    if (y < d.latestYear!) {
      const v = d.values[y];
      return { year: String(y), historical: v == null ? null : Number(v), projected: null as number | null, target: d.target_2035 };
    }
    if (y === d.latestYear) {
      return { year: String(y), historical: d.latestValue, projected: d.latestValue, target: d.target_2035 };
    }
    const yrs = y - d.latestYear!;
    const factor = d.isHigherBetter ? Math.pow(1 + r, yrs) : Math.pow(Math.max(1 - r, 0), yrs);
    return { year: String(y), historical: null, projected: d.latestValue! * factor, target: d.target_2035 };
  });
  const projected2035 = trajectory[trajectory.length - 1].projected;
  let projectedProgressPct: number | null = null;
  let willMeetTarget = false;
  if (d.target_2035 != null && projected2035 != null) {
    if (d.isHigherBetter) {
      projectedProgressPct = d.target_2035 === 0 ? (projected2035 >= 0 ? 1 : 0) : projected2035 / d.target_2035;
      willMeetTarget = projected2035 >= d.target_2035;
    } else {
      projectedProgressPct = d.target_2035 === 0 ? (projected2035 === 0 ? 1 : 0) : d.target_2035 / Math.max(projected2035, 0.0001);
      willMeetTarget = projected2035 <= d.target_2035;
    }
  }
  return { projected2035, projectedProgressPct, willMeetTarget, trajectory };
}

function hasNoProgress(d: AKPIDerived): boolean {
  const points: number[] = [];
  for (const y of HISTORICAL_YEARS) {
    const v = d.values[y];
    if (v != null && !Number.isNaN(Number(v))) points.push(Number(v));
  }
  if (points.length < 2) return false;
  const first = points[0];
  const last = points[points.length - 1];
  return d.isHigherBetter ? last <= first : last >= first;
}

const StatusBadge = ({ status }: { status: AKPIStatus }) => (
  <Badge style={{ background: `${getStatusColor(status)}25`, color: getStatusColor(status), borderColor: `${getStatusColor(status)}50` }} variant="outline">
    {status}
  </Badge>
);

const ValueCell = ({
  value, isAdmin, onSave,
}: { value: number | null; isAdmin: boolean; onSave: (v: number | null) => void }) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value == null ? '' : String(value));
  if (!isAdmin) {
    return <span className="text-sm">{value == null ? '—' : value}</span>;
  }
  if (!editing) {
    return (
      <button
        onClick={() => { setText(value == null ? '' : String(value)); setEditing(true); }}
        className="text-sm w-full text-left px-1 py-0.5 rounded hover:bg-muted/50"
      >
        {value == null ? <span className="text-muted-foreground">—</span> : value}
      </button>
    );
  }
  const commit = () => {
    const trimmed = text.trim();
    if (trimmed === '') { onSave(null); }
    else { const n = Number(trimmed); if (!Number.isNaN(n)) onSave(n); }
    setEditing(false);
  };
  return (
    <Input
      autoFocus
      className="h-7 px-1 text-sm"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
    />
  );
};

export default function ManpowerAKPI() {
  const { derived, loading, saveValue, updateIndicator } = useAKPI();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [tab, setTab] = useState('overview');
  const [aspirasiFilter, setAspirasiFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<AKPIStatus | 'all'>('all');
  const [detail, setDetail] = useState<AKPIDerived | null>(null);

  // Projection scenarios — multiple named sets persisted in localStorage
  const [scenarioSets, setScenarioSets] = useState<ScenarioSet[]>(() => {
    try {
      const raw = localStorage.getItem(SCENARIO_SETS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ScenarioSet[];
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
      // Migrate legacy single-set storage into a "Custom" scenario
      const legacy = localStorage.getItem(PROJECTION_STORAGE_KEY);
      if (legacy) {
        const r = { ...DEFAULT_RATES, ...JSON.parse(legacy) } as ProjectionRates;
        return [{ id: 'custom', name: 'Custom', rates: r }, ...DEFAULT_SCENARIO_SETS];
      }
    } catch { /* noop */ }
    return DEFAULT_SCENARIO_SETS;
  });
  const [activeSetId, setActiveSetId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_SET_KEY);
      if (stored) return stored;
    } catch { /* noop */ }
    return 'default';
  });

  const activeSet = scenarioSets.find(s => s.id === activeSetId) ?? scenarioSets[0];
  const rates: ProjectionRates = activeSet?.rates ?? DEFAULT_RATES;

  const [draftRates, setDraftRates] = useState<ProjectionRates>(rates);
  const [scenario, setScenario] = useState<ProjectionScenario>('medium');
  useEffect(() => { setDraftRates(rates); }, [activeSetId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist whenever sets change
  useEffect(() => {
    try { localStorage.setItem(SCENARIO_SETS_KEY, JSON.stringify(scenarioSets)); } catch { /* noop */ }
  }, [scenarioSets]);
  useEffect(() => {
    try { localStorage.setItem(ACTIVE_SET_KEY, activeSetId); } catch { /* noop */ }
  }, [activeSetId]);

  const saveRates = () => {
    setScenarioSets(prev => prev.map(s => s.id === activeSetId ? { ...s, rates: draftRates } : s));
    toast({ title: `"${activeSet?.name}" updated`, description: `Low ${draftRates.low}% · Medium ${draftRates.medium}% · High ${draftRates.high}%` });
  };

  const createScenarioSet = () => {
    const name = window.prompt('Name this scenario set:', `Scenario ${scenarioSets.length + 1}`);
    if (!name?.trim()) return;
    const id = `s_${Date.now()}`;
    setScenarioSets(prev => [...prev, { id, name: name.trim(), rates: { ...draftRates } }]);
    setActiveSetId(id);
    toast({ title: 'Scenario created', description: name.trim() });
  };

  const renameScenarioSet = () => {
    if (!activeSet) return;
    const name = window.prompt('Rename scenario:', activeSet.name);
    if (!name?.trim()) return;
    setScenarioSets(prev => prev.map(s => s.id === activeSetId ? { ...s, name: name.trim() } : s));
  };

  const duplicateScenarioSet = () => {
    if (!activeSet) return;
    const id = `s_${Date.now()}`;
    const copy: ScenarioSet = { id, name: `${activeSet.name} (copy)`, rates: { ...activeSet.rates } };
    setScenarioSets(prev => [...prev, copy]);
    setActiveSetId(id);
  };

  const deleteScenarioSet = () => {
    if (!activeSet) return;
    if (scenarioSets.length <= 1) {
      toast({ title: 'Cannot delete', description: 'At least one scenario set must remain.', variant: 'destructive' });
      return;
    }
    if (!window.confirm(`Delete scenario "${activeSet.name}"?`)) return;
    const remaining = scenarioSets.filter(s => s.id !== activeSetId);
    setScenarioSets(remaining);
    setActiveSetId(remaining[0].id);
  };

  const resetToDefaults = () => {
    if (!window.confirm('Reset all scenario sets to the built-in defaults? Custom sets will be removed.')) return;
    setScenarioSets(DEFAULT_SCENARIO_SETS);
    setActiveSetId('default');
  };

  // No-progress / stagnant indicators (≥2 historical points, no improvement)
  const stagnant = useMemo(() => derived.filter(hasNoProgress), [derived]);

  // Projections for the currently selected scenario across all indicators
  const projections = useMemo(() => {
    const rate = rates[scenario];
    return derived.map(d => ({ d, p: computeProjection(d, rate) }));
  }, [derived, rates, scenario]);

  const projectionSummary = useMemo(() => {
    let willMeet = 0, willMiss = 0, noData = 0;
    projections.forEach(({ d, p }) => {
      if (d.target_2035 == null || p.projected2035 == null) noData++;
      else if (p.willMeetTarget) willMeet++;
      else willMiss++;
    });
    return { willMeet, willMiss, noData, total: projections.length };
  }, [projections]);

  const filtered = useMemo(() => derived.filter(d =>
    (aspirasiFilter === 'all' || d.aspirasi === aspirasiFilter) &&
    (statusFilter === 'all' || d.status === statusFilter)
  ), [derived, aspirasiFilter, statusFilter]);

  const aspirasis = useMemo(() => Array.from(new Set(derived.map(d => d.aspirasi))).sort(), [derived]);

  const statusCounts = useMemo(() => {
    const counts: Record<AKPIStatus, number> = {
      'On Track': 0, 'Needs Attention': 0, 'Behind': 0, 'No Data': 0, 'Target Not Set': 0,
    };
    derived.forEach(d => { counts[d.status]++; });
    return counts;
  }, [derived]);

  const byAspirasi = useMemo(() => {
    const map: Record<string, Record<AKPIStatus, number> & { total: number }> = {};
    derived.forEach(d => {
      if (!map[d.aspirasi]) map[d.aspirasi] = { 'On Track': 0, 'Needs Attention': 0, 'Behind': 0, 'No Data': 0, 'Target Not Set': 0, total: 0 };
      map[d.aspirasi][d.status]++;
      map[d.aspirasi].total++;
    });
    return Object.entries(map).map(([aspirasi, c]) => ({ aspirasi, ...c }));
  }, [derived]);

  const yearCompleteness = useMemo(() =>
    HISTORICAL_YEARS.map(y => ({
      year: String(y),
      withData: derived.filter(d => d.values[y] != null).length,
      total: derived.length,
    })), [derived]);

  const pieData = STATUS_ORDER
    .map(s => ({ name: s, value: statusCounts[s], color: getStatusColor(s) }))
    .filter(d => d.value > 0);

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    // Dashboard sheet
    const dashRows: any[][] = [
      ['DASHBOARD — MPB KPI STATUS OVERVIEW | WAWASAN BRUNEI 2035'],
      [],
      ['', 'On Track', 'Needs Attention', 'Behind', 'No Data', 'Target Not Set', 'Total'],
      ['Count', statusCounts['On Track'], statusCounts['Needs Attention'], statusCounts['Behind'], statusCounts['No Data'], statusCounts['Target Not Set'], derived.length],
      [],
      ['BREAKDOWN BY ASPIRASI'],
      ['Aspirasi', 'On Track', 'Needs Attention', 'Behind', 'No Data', 'Target Not Set', 'Total'],
      ...byAspirasi.map(b => [b.aspirasi, b['On Track'], b['Needs Attention'], b['Behind'], b['No Data'], b['Target Not Set'], b.total]),
      [],
      ['DATA COMPLETENESS BY YEAR'],
      ['Year', ...yearCompleteness.map(y => y.year)],
      ['KPIs with data', ...yearCompleteness.map(y => `${y.withData}/${y.total}`)],
      [],
      ['PROGRESS TOWARD 2035 TARGET'],
      ['AKPI', 'Indicator (BM)', 'Latest Value', 'Latest Year', 'Target (2035)', 'Progress %', 'Direction', 'Status'],
      ...derived.map(d => [
        d.akpi_code, d.indicator_bm,
        d.latestValue ?? '—', d.latestYear ?? '—',
        d.target_2035 ?? '—',
        d.progressPct == null ? '—' : Math.round(d.progressPct * 1000) / 10 + '%',
        d.direction, d.status,
      ]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dashRows), 'Dashboard');

    // AKPI_Data sheet — preserve original layout
    const headers = [
      'Aspirasi', 'AKPI', 'Indicator (BM)', 'Lead Agency', 'Metric Type',
      ...AKPI_YEARS.map(y => String(y)),
      'Target (2035)', 'Direction', 'Status', 'Review Cycle', 'Source Note', 'Validation Note',
      'Definisi (BM)', 'Definition (EN)',
    ];
    const dataRows = derived.map(d => [
      d.aspirasi, d.akpi_code, d.indicator_bm, d.lead_agency || '', d.metric_type || '',
      ...AKPI_YEARS.map(y => d.values[y] ?? ''),
      d.target_2035 ?? '', d.direction, d.status, d.review_cycle || '',
      d.source_note || '', d.validation_note || '',
      d.definition_bm || '', d.definition_en || '',
    ]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers, ...dataRows]), 'AKPI_Data');

    // Definitions
    const defRows = [
      ['AKPI', 'Indicator (BM)', 'Definisi (BM)', 'Definition (EN)'],
      ...derived.map(d => [d.akpi_code, d.indicator_bm, d.definition_bm || '', d.definition_en || '']),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(defRows), 'Definitions');

    XLSX.writeFile(wb, `Manpower_AKPI_Dashboard_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast({ title: 'Exported', description: 'Workbook downloaded.' });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1800px] mx-auto space-y-6">
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold gold-text tracking-wide">
            Manpower AKPI Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Wawasan Brunei 2035 · 24 indicators across 4 Aspirasi · {isAdmin ? 'Admin edit mode' : 'Read-only view'}
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" className="border-primary/30 hover:bg-primary/10 text-primary">
          <Download className="h-4 w-4 mr-2" /> Export to Excel
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="glass-card p-4 col-span-2 sm:col-span-3 lg:col-span-1 border-primary/40">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total AKPIs</p>
          <p className="text-3xl font-bold gold-text mt-1">{derived.length}</p>
        </Card>
        {STATUS_ORDER.map(s => {
          const Icon = s === 'On Track' ? CheckCircle2 : s === 'Behind' ? TrendingDown : s === 'Needs Attention' ? AlertTriangle : s === 'No Data' ? HelpCircle : Target;
          return (
            <Card
              key={s}
              className={cn('glass-card p-4 cursor-pointer hover:scale-[1.02] transition', statusFilter === s && 'ring-2 ring-primary')}
              style={{ borderColor: `${getStatusColor(s)}50` }}
              onClick={() => { setStatusFilter(statusFilter === s ? 'all' : s); setTab('indicators'); }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide" style={{ color: getStatusColor(s) }}>{s}</p>
                <Icon className="h-4 w-4" style={{ color: getStatusColor(s) }} />
              </div>
              <p className="text-3xl font-bold mt-1" style={{ color: getStatusColor(s) }}>{statusCounts[s]}</p>
            </Card>
          );
        })}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-5 max-w-3xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="indicators">Indicators</TabsTrigger>
          <TabsTrigger value="projection">Projection</TabsTrigger>
          <TabsTrigger value="data-entry">Data Entry</TabsTrigger>
          <TabsTrigger value="definitions">Definitions</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass-card p-4">
              <h3 className="font-semibold mb-3">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {pieData.map(d => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="glass-card p-4 lg:col-span-2">
              <h3 className="font-semibold mb-3">Breakdown by Aspirasi</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byAspirasi}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="aspirasi" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {STATUS_ORDER.map(s => (
                    <Bar key={s} dataKey={s} stackId="a" fill={getStatusColor(s)} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="glass-card p-4">
            <h3 className="font-semibold mb-3">Data Completeness by Year</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={yearCompleteness}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }}
                  formatter={(v: any) => [`${v} / ${derived.length}`, 'KPIs with data']} />
                <Bar dataKey="withData" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="glass-card p-4">
            <h3 className="font-semibold mb-3">Progress Toward 2035 Target</h3>
            <div className="space-y-3">
              {derived.map(d => (
                <div key={d.id} className="flex items-center gap-3 cursor-pointer hover:bg-muted/30 p-2 rounded-lg" onClick={() => setDetail(d)}>
                  <div className="w-12 text-xs font-mono text-muted-foreground">{d.akpi_code}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{d.indicator_bm}</p>
                    <Progress value={Math.min((d.progressPct ?? 0) * 100, 100)} className="h-1.5 mt-1" />
                  </div>
                  <div className="text-right text-xs w-24">
                    <p className="font-semibold">{d.latestValue ?? '—'} / {d.target_2035 ?? '—'}</p>
                    <p className="text-muted-foreground">{d.progressPct == null ? '—' : `${Math.round(d.progressPct * 100)}%`}</p>
                  </div>
                  <div className="w-32 text-right"><StatusBadge status={d.status} /></div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* INDICATORS */}
        <TabsContent value="indicators" className="space-y-4 mt-6">
          <div className="flex flex-wrap gap-3">
            <Select value={aspirasiFilter} onValueChange={setAspirasiFilter}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Aspirasi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Aspirasi</SelectItem>
                {aspirasis.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUS_ORDER.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="ml-auto self-center">{filtered.length} of {derived.length}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(d => (
              <Card key={d.id} className="glass-card p-4 cursor-pointer hover:border-primary/50 transition" onClick={() => setDetail(d)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-muted-foreground">{d.aspirasi} · {d.akpi_code}</p>
                    <p className="font-medium text-sm mt-1 line-clamp-2">{d.indicator_bm}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold">{d.latestValue ?? '—'}<span className="text-xs text-muted-foreground ml-1">{d.metric_type}</span></p>
                    <p className="text-xs text-muted-foreground">Latest: {d.latestYear ?? '—'} · Target: {d.target_2035 ?? '—'}</p>
                  </div>
                  <div className="text-right">
                    {d.isHigherBetter ? <TrendingUp className="h-4 w-4 text-emerald-400 inline" /> : <TrendingDown className="h-4 w-4 text-amber-400 inline" />}
                    <p className="text-xs text-muted-foreground">{d.lead_agency}</p>
                  </div>
                </div>
                <Progress value={Math.min((d.progressPct ?? 0) * 100, 100)} className="h-1.5 mt-3" />
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* PROJECTION */}
        <TabsContent value="projection" className="space-y-6 mt-6">
          {/* Scenario set manager + rate inputs */}
          <Card className="glass-card p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-end gap-3 lg:gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg">Projection Scenarios</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Switch between saved scenario sets. Each set holds its own Low / Medium / High annual % rates
                  applied from each indicator's latest year through 2035.
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Active Scenario Set</label>
                <Select value={activeSetId} onValueChange={setActiveSetId}>
                  <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {scenarioSets.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.rates.low}/{s.rates.medium}/{s.rates.high}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={createScenarioSet}>+ New</Button>
                <Button variant="outline" size="sm" onClick={duplicateScenarioSet}>Duplicate</Button>
                <Button variant="outline" size="sm" onClick={renameScenarioSet}>Rename</Button>
                <Button variant="outline" size="sm" onClick={deleteScenarioSet} className="text-red-400 border-red-500/40 hover:bg-red-500/10">
                  Delete
                </Button>
                <Button variant="ghost" size="sm" onClick={resetToDefaults} className="text-muted-foreground">
                  Reset defaults
                </Button>
              </div>
            </div>

            <div className="border-t border-border/40 pt-4 flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
              <div className="flex-1">
                <p className="text-sm font-medium">Rates for "{activeSet?.name}"</p>
                <p className="text-xs text-muted-foreground">Edit values, then click Save to update this scenario set.</p>
              </div>
              {(['low','medium','high'] as ProjectionScenario[]).map(s => {
                const meta = SCENARIO_META[s];
                return (
                  <div key={s} className="space-y-1">
                    <label className="text-xs uppercase tracking-wide" style={{ color: meta.color }}>{meta.label} (%)</label>
                    <Input
                      type="number"
                      step="0.1"
                      className="w-28"
                      value={draftRates[s]}
                      onChange={(e) => setDraftRates({ ...draftRates, [s]: Number(e.target.value) || 0 })}
                    />
                  </div>
                );
              })}
              <Button
                onClick={saveRates}
                disabled={JSON.stringify(draftRates) === JSON.stringify(rates)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" /> Save Rates
              </Button>
            </div>
          </Card>


          {/* Scenario selector + summary */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">Active scenario:</span>
            {(['low','medium','high'] as ProjectionScenario[]).map(s => {
              const meta = SCENARIO_META[s];
              const Icon = meta.icon;
              const active = scenario === s;
              return (
                <Button
                  key={s}
                  variant="outline"
                  size="sm"
                  onClick={() => setScenario(s)}
                  className={cn('border', active && 'ring-2')}
                  style={{ borderColor: `${meta.color}60`, color: meta.color, background: active ? `${meta.color}15` : undefined }}
                >
                  <Icon className="h-3.5 w-3.5 mr-1.5" />
                  {meta.label} · {rates[s]}%
                </Button>
              );
            })}
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="glass-card p-4 border-emerald-500/40">
              <p className="text-xs uppercase tracking-wide text-emerald-400">Will meet 2035</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{projectionSummary.willMeet}</p>
              <p className="text-xs text-muted-foreground mt-1">of {projectionSummary.total} indicators</p>
            </Card>
            <Card className="glass-card p-4 border-red-500/40">
              <p className="text-xs uppercase tracking-wide text-red-400">Will miss 2035</p>
              <p className="text-3xl font-bold text-red-400 mt-1">{projectionSummary.willMiss}</p>
              <p className="text-xs text-muted-foreground mt-1">based on {SCENARIO_META[scenario].label.toLowerCase()}</p>
            </Card>
            <Card className="glass-card p-4 border-muted-foreground/30">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Insufficient data</p>
              <p className="text-3xl font-bold mt-1">{projectionSummary.noData}</p>
              <p className="text-xs text-muted-foreground mt-1">no latest value or no target</p>
            </Card>
            <Card className="glass-card p-4 border-amber-500/40">
              <p className="text-xs uppercase tracking-wide text-amber-400">No progress yet</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">{stagnant.length}</p>
              <p className="text-xs text-muted-foreground mt-1">historical trend flat or declining</p>
            </Card>
          </div>

          {/* No-progress detail list */}
          {stagnant.length > 0 && (
            <Card className="glass-card p-4 border-amber-500/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h3 className="font-semibold">Indicators showing no progress</h3>
                <Badge variant="outline" className="text-amber-400 border-amber-500/40">{stagnant.length}</Badge>
              </div>
              <div className="space-y-2">
                {stagnant.map(d => (
                  <div key={d.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/30 cursor-pointer" onClick={() => setDetail(d)}>
                    <div className="w-12 text-xs font-mono text-muted-foreground">{d.akpi_code}</div>
                    <p className="flex-1 text-sm truncate">{d.indicator_bm}</p>
                    <span className="text-xs text-muted-foreground">Latest {d.latestValue ?? '—'} ({d.latestYear ?? '—'})</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Per-indicator projection cards with scenario sub-tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {derived.map(d => {
              const results: Record<ProjectionScenario, ProjectionResult> = {
                low: computeProjection(d, rates.low),
                medium: computeProjection(d, rates.medium),
                high: computeProjection(d, rates.high),
              };
              return (
                <Card key={d.id} className="glass-card p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-muted-foreground">{d.aspirasi} · {d.akpi_code}</p>
                      <p className="font-medium text-sm mt-1 line-clamp-2">{d.indicator_bm}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Latest {d.latestValue ?? '—'} ({d.latestYear ?? '—'}) → Target {d.target_2035 ?? '—'} ·{' '}
                        {d.isHigherBetter ? '↑ higher is better' : '↓ lower is better'}
                      </p>
                    </div>
                  </div>

                  <Tabs defaultValue={scenario}>
                    <TabsList className="grid grid-cols-3 w-full h-8">
                      {(['low','medium','high'] as ProjectionScenario[]).map(s => (
                        <TabsTrigger key={s} value={s} className="text-xs">
                          {SCENARIO_META[s].label.replace(' Projection','')} {rates[s]}%
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {(['low','medium','high'] as ProjectionScenario[]).map(s => {
                      const r = results[s];
                      const meta = SCENARIO_META[s];
                      const stag = hasNoProgress(d);
                      return (
                        <TabsContent key={s} value={s} className="mt-3 space-y-3">
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="text-[10px] uppercase text-muted-foreground">Projected 2035</p>
                              <p className="text-lg font-bold" style={{ color: meta.color }}>
                                {r.projected2035 == null ? '—' : r.projected2035.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase text-muted-foreground">Vs. Target</p>
                              <p className="text-lg font-bold">
                                {r.projectedProgressPct == null ? '—' : `${Math.round(r.projectedProgressPct * 100)}%`}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase text-muted-foreground">Outcome</p>
                              {r.projected2035 == null ? (
                                <Badge variant="outline" className="text-muted-foreground">No data</Badge>
                              ) : r.willMeetTarget ? (
                                <Badge style={{ background: `${meta.color}25`, color: meta.color, borderColor: `${meta.color}60` }} variant="outline">Meets</Badge>
                              ) : (
                                <Badge variant="outline" className="text-red-400 border-red-500/40">Misses</Badge>
                              )}
                            </div>
                          </div>

                          <Progress
                            value={r.projectedProgressPct == null ? 0 : Math.min(r.projectedProgressPct * 100, 100)}
                            className="h-2"
                          />

                          {stag && (
                            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded p-2">
                              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>No measurable progress in historical data — projection assumes new growth starting now.</span>
                            </div>
                          )}

                          <ResponsiveContainer width="100%" height={160}>
                            <LineChart data={r.trajectory}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={2} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', fontSize: 11 }} />
                              <Line type="monotone" dataKey="historical" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} connectNulls name="Historical" />
                              <Line type="monotone" dataKey="projected" stroke={meta.color} strokeWidth={2} strokeDasharray="4 4" dot={false} connectNulls name="Projected" />
                              {d.target_2035 != null && (
                                <Line type="monotone" dataKey="target" stroke={getStatusColor('On Track')} strokeDasharray="2 2" dot={false} name="Target" />
                              )}
                            </LineChart>
                          </ResponsiveContainer>
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* DATA ENTRY */}
        <TabsContent value="data-entry" className="mt-6">
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Yearly Values · 2019 – 2035</h3>
              {!isAdmin && <Badge variant="outline" className="text-amber-400 border-amber-500/40"><Info className="h-3 w-3 mr-1" /> Read-only · admins can edit</Badge>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 sticky top-0 bg-card">
                    <th className="text-left px-2 py-2 sticky left-0 bg-card z-10">AKPI</th>
                    <th className="text-left px-2 py-2 sticky left-12 bg-card z-10 min-w-[220px]">Indicator</th>
                    {AKPI_YEARS.map(y => <th key={y} className="px-1 py-2 text-center w-14">{y}</th>)}
                    <th className="px-2 py-2 text-center">Target</th>
                    <th className="px-2 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {derived.map(d => (
                    <tr key={d.id} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="px-2 py-1.5 font-mono sticky left-0 bg-card">{d.akpi_code}</td>
                      <td className="px-2 py-1.5 sticky left-12 bg-card">
                        <button className="text-left hover:text-primary" onClick={() => setDetail(d)}>{d.indicator_bm}</button>
                      </td>
                      {AKPI_YEARS.map(y => (
                        <td key={y} className="px-1 py-1 text-center">
                          <ValueCell
                            value={d.values[y] ?? null}
                            isAdmin={isAdmin}
                            onSave={async (v) => {
                              await saveValue(d.id, y, v);
                              toast({ title: 'Saved', description: `${d.akpi_code} · ${y}` });
                            }}
                          />
                        </td>
                      ))}
                      <td className="px-2 py-1.5 text-center font-semibold">{d.target_2035 ?? '—'}</td>
                      <td className="px-2 py-1.5 text-center"><StatusBadge status={d.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* DEFINITIONS */}
        <TabsContent value="definitions" className="mt-6 space-y-3">
          {derived.map(d => (
            <Card key={d.id} className="glass-card p-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="font-mono">{d.akpi_code}</Badge>
                <div className="flex-1">
                  <p className="font-medium">{d.indicator_bm}</p>
                  <p className="text-xs text-muted-foreground mt-1">{d.aspirasi} · {d.lead_agency} · {d.metric_type}</p>
                  {d.definition_bm && <p className="text-sm mt-2"><span className="text-muted-foreground">BM:</span> {d.definition_bm}</p>}
                  {d.definition_en && <p className="text-sm mt-1"><span className="text-muted-foreground">EN:</span> {d.definition_en}</p>}
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Indicator detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-3xl bg-card">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">{detail.akpi_code}</Badge>
                  {detail.indicator_bm}
                </DialogTitle>
                <DialogDescription>{detail.aspirasi} · {detail.lead_agency} · {detail.metric_type}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div><p className="text-xs text-muted-foreground">Latest</p><p className="text-xl font-bold">{detail.latestValue ?? '—'}</p><p className="text-xs">{detail.latestYear ?? '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Target 2035</p><p className="text-xl font-bold">{detail.target_2035 ?? '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Progress</p><p className="text-xl font-bold">{detail.progressPct == null ? '—' : `${Math.round(detail.progressPct * 100)}%`}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={detail.status} /></div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Trend</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={AKPI_YEARS.map(y => ({ year: String(y), value: detail.values[y] ?? null, target: detail.target_2035 }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} connectNulls dot={{ r: 3 }} />
                    {detail.target_2035 != null && <Line type="monotone" dataKey="target" stroke={getStatusColor('On Track')} strokeDasharray="4 4" dot={false} />}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {(detail.definition_bm || detail.definition_en) && (
                <div className="text-sm space-y-1">
                  {detail.definition_bm && <p><span className="text-muted-foreground">Definisi (BM):</span> {detail.definition_bm}</p>}
                  {detail.definition_en && <p><span className="text-muted-foreground">Definition (EN):</span> {detail.definition_en}</p>}
                </div>
              )}
              {(detail.source_note || detail.validation_note) && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {detail.source_note && <p><strong>Source:</strong> {detail.source_note}</p>}
                  {detail.validation_note && <p><strong>Validation:</strong> {detail.validation_note}</p>}
                </div>
              )}

              {isAdmin && (
                <div className="border-t border-border/50 pt-3">
                  <p className="text-xs text-muted-foreground mb-2">Admin: edit target / direction</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs">Target 2035</label>
                      <Input
                        type="number"
                        defaultValue={detail.target_2035 ?? ''}
                        onBlur={async (e) => {
                          const v = e.target.value === '' ? null : Number(e.target.value);
                          await updateIndicator(detail.id, { target_2035: v });
                          toast({ title: 'Target updated' });
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs">Direction</label>
                      <Select defaultValue={detail.direction} onValueChange={async (v) => {
                        await updateIndicator(detail.id, { direction: v });
                        toast({ title: 'Direction updated' });
                      }}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="≥ (Higher is better)">≥ (Higher is better)</SelectItem>
                          <SelectItem value="≤ (Lower is better)">≤ (Lower is better)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
