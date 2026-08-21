import React, { useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Sparkles, 
  ShieldAlert, 
  Info,
  CheckCircle2,
  FileSpreadsheet,
  FileDown
} from 'lucide-react';
import { ReportItem, SchoolSettings } from '../types';

interface AnalyticsChartsProps {
  reports: ReportItem[];
  schoolSettings: SchoolSettings;
  onExportExcel: () => void;
  onExportPdf: () => void;
}

const PIE_COLORS = ['#e11d48', '#4f46e5']; // Korban (Rose), Saksi (Indigo)
const LOCATION_COLORS = ['#3b82f6', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
const TIME_COLORS = ['#38bdf8', '#3b82f6', '#1d4ed8', '#4338ca', '#64748b'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  reports,
  schoolSettings,
  onExportExcel,
  onExportPdf
}) => {
  // 1. Reporter Status Data (Korban vs Saksi)
  const statusData = useMemo(() => {
    const korban = reports.filter(r => r.reporterStatus === 'Korban').length;
    const saksi = reports.filter(r => r.reporterStatus === 'Saksi').length;
    return [
      { name: 'Korban', value: korban },
      { name: 'Saksi', value: saksi }
    ];
  }, [reports]);

  // 2. Location Distribution Data
  const locationData = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach(r => {
      const loc = r.location.startsWith('Lainnya:') ? 'Lainnya' : r.location;
      counts[loc] = (counts[loc] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [reports]);

  // 3. Time Slot Distribution Data
  const timeSlotData = useMemo(() => {
    const slots = [
      '06.00-09.00',
      '09.00-12.00',
      '12.00-15.00',
      '15.00-18.00',
      'Di luar jam sekolah'
    ];

    const counts: Record<string, number> = {
      '06.00-09.00': 0,
      '09.00-12.00': 0,
      '12.00-15.00': 0,
      '15.00-18.00': 0,
      'Di luar jam sekolah': 0
    };

    reports.forEach(r => {
      const slot = r.timeSlotGroup || '09.00-12.00';
      if (counts[slot] !== undefined) {
        counts[slot] += 1;
      } else {
        counts['Di luar jam sekolah'] += 1;
      }
    });

    return slots.map(slot => ({
      slot,
      jumlah: counts[slot] || 0
    }));
  }, [reports]);

  // 4. Monthly Trend Data
  const monthlyTrendData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const currentYear = new Date().getFullYear();
    const monthsMap: Record<number, { total: number; korban: number; saksi: number }> = {};

    for (let i = 0; i < 12; i++) {
      monthsMap[i] = { total: 0, korban: 0, saksi: 0 };
    }

    reports.forEach(r => {
      const d = new Date(r.incidentDate || r.createdAt);
      if (d.getFullYear() === currentYear) {
        const m = d.getMonth();
        monthsMap[m].total += 1;
        if (r.reporterStatus === 'Korban') monthsMap[m].korban += 1;
        if (r.reporterStatus === 'Saksi') monthsMap[m].saksi += 1;
      }
    });

    // Return current up to active months (e.g. first 8-9 months or all 12)
    return monthNames.map((name, index) => ({
      bulan: name,
      Total: monthsMap[index].total,
      Korban: monthsMap[index].korban,
      Saksi: monthsMap[index].saksi
    }));
  }, [reports]);

  // 5. Category Breakdown Data
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach(r => {
      const cat = r.category.split('(')[0].trim();
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [reports]);

  // Top Risk Hotspot
  const topLocation = locationData[0]?.name || 'Belum terdata';
  const topTimeSlot = timeSlotData.reduce((prev, curr) => curr.jumlah > prev.jumlah ? curr : prev, { slot: '-', jumlah: 0 });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Visualisasi & Analisis Statistik Perundungan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Peta pola kejadian, lokasi risiko tinggi, dan tren waktu di {schoolSettings.schoolName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>
          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            <FileDown className="w-4 h-4 text-rose-600" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* AI Assistant Hotspot Summary Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 border border-blue-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/30 text-amber-300 flex items-center justify-center border border-blue-400/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-white">Ringkasan Analisis & Pola Rawan (AI Insights Guru BK)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
            <div className="text-xs text-blue-200 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              Lokasi Paling Sering Terjadi:
            </div>
            <div className="text-lg font-bold text-white mt-1">{topLocation}</div>
            <div className="text-[11px] text-blue-200 mt-0.5">
              Disarankan meningkatkan patroli guru piket di area ini saat jam istirahat.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
            <div className="text-xs text-blue-200 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Periode Jam Kejadian Rawan:
            </div>
            <div className="text-lg font-bold text-white mt-1">{topTimeSlot.slot}</div>
            <div className="text-[11px] text-blue-200 mt-0.5">
              {topTimeSlot.jumlah} laporan terjadi pada rentang waktu ini.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
            <div className="text-xs text-blue-200 font-medium flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              Partisipasi Saksi:
            </div>
            <div className="text-lg font-bold text-white mt-1">
              {statusData.find(s => s.name === 'Saksi')?.value || 0} Laporan Saksi
            </div>
            <div className="text-[11px] text-blue-200 mt-0.5">
              Tingginya laporan saksi menunjukkan kepedulian antar siswa yang positif.
            </div>
          </div>
        </div>
      </div>

      {/* Grid 1: Donut Status & Bar Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Donut Korban vs Saksi */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Perbandingan Laporan: Korban vs Saksi</h3>
              <p className="text-xs text-slate-500">Menganalisis proporsi pelapor langsung vs saksi mata</p>
            </div>
            <PieIcon className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value} Kasus`, 'Jumlah']} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Bar Chart Locations */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Laporan Berdasarkan Lokasi Kejadian</h3>
              <p className="text-xs text-slate-500">Distribusi sebaran kejadian perundungan di lingkungan sekolah</p>
            </div>
            <MapPin className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#475569" width={85} tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(val: any) => [`${val} Kasus`, 'Jumlah']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]}>
                  {locationData.map((entry, index) => (
                    <Cell key={`cell-loc-${index}`} fill={LOCATION_COLORS[index % LOCATION_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid 2: Monthly Trend & Time Slot Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Tren Laporan Bulanan */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Tren Laporan Bulanan ({new Date().getFullYear()})</h3>
              <p className="text-xs text-slate-500">Perkembangan jumlah pengaduan per bulan sepanjang tahun</p>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bulan" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="Total" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="Korban" stroke="#e11d48" strokeWidth={1.5} fill="none" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Jam Rawan Kejadian */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Laporan Berdasarkan Rentang Waktu</h3>
              <p className="text-xs text-slate-500">Pola waktu kejadian bullying yang dilaporkan siswa</p>
            </div>
            <Clock className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSlotData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="slot" stroke="#64748b" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip 
                  formatter={(val: any) => [`${val} Kasus`, 'Jumlah']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="jumlah" fill="#4f46e5" radius={[8, 8, 0, 0]}>
                  {timeSlotData.map((entry, index) => (
                    <Cell key={`cell-time-${index}`} fill={TIME_COLORS[index % TIME_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
