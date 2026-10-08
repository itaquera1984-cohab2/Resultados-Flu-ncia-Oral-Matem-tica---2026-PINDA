/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { SchoolData, NetworkData } from '../types';
import { DESCRIPTORS } from '../data';
import { 
  getSectorStats, 
  SETORES_ESCOLAS, 
  SectorAggregatedStats 
} from '../utils/sectors';
import { 
  Building2, 
  Printer, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  Search, 
  Award, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  ArrowUpDown,
  FileText,
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface SetoresViewProps {
  schools: SchoolData[];
  networkData: NetworkData;
  onGenerateReport?: (sectorName: string) => void;
}

export default function SetoresView({ schools, networkData, onGenerateReport }: SetoresViewProps) {
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'sucesso' | 'participacao' | 'nome' | 'escolas'>('sucesso');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Compute stats for all sectors
  const sectorStats = useMemo(() => {
    return getSectorStats(schools);
  }, [schools]);

  // Overall totals across sectors
  const totalSchoolsMapped = useMemo(() => {
    return sectorStats.reduce((acc, s) => acc + s.totalEscolas, 0);
  }, [sectorStats]);

  const totalEvaluated = useMemo(() => {
    return sectorStats.reduce((acc, s) => acc + s.avaliados, 0);
  }, [sectorStats]);

  const totalExpected = useMemo(() => {
    return sectorStats.reduce((acc, s) => acc + s.previstos, 0);
  }, [sectorStats]);

  const avgNetworkParticipation = useMemo(() => {
    return totalExpected > 0 ? Math.round((totalEvaluated / totalExpected) * 1000) / 10 : 0;
  }, [totalEvaluated, totalExpected]);

  const avgNetworkSucesso = useMemo(() => {
    if (schools.length === 0) return 0;
    return Math.round(schools.reduce((acc, s) => acc + s.sucesso, 0) / schools.length);
  }, [schools]);

  // Active sector data if single sector selected
  const activeSectorData = useMemo(() => {
    if (selectedSector === 'all') return null;
    return sectorStats.find(s => s.sectorName === selectedSector) || null;
  }, [sectorStats, selectedSector]);

  // Filtered and sorted sectors list for overview
  const sortedSectors = useMemo(() => {
    const list = [...sectorStats];
    list.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      if (sortBy === 'sucesso') {
        valA = a.sucesso;
        valB = b.sucesso;
      } else if (sortBy === 'participacao') {
        valA = a.participacao;
        valB = b.participacao;
      } else if (sortBy === 'escolas') {
        valA = a.totalEscolas;
        valB = b.totalEscolas;
      } else if (sortBy === 'nome') {
        valA = a.sectorName;
        valB = b.sectorName;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
    return list;
  }, [sectorStats, sortBy, sortOrder]);

  // Filtered schools within selected sector or all
  const filteredSchools = useMemo(() => {
    let list: SchoolData[] = [];

    if (selectedSector === 'all') {
      list = schools;
    } else if (activeSectorData) {
      list = activeSectorData.escolas;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(s => s.nomeEscola.toLowerCase().includes(term));
    }

    return list;
  }, [schools, selectedSector, activeSectorData, searchTerm]);

  // Chart data formatting for Recharts
  const chartData = useMemo(() => {
    return sectorStats
      .filter(s => s.sectorName !== 'NÃO MAPEADO' || s.totalEscolas > 0)
      .map(s => ({
        name: s.sectorName,
        Sucesso: s.sucesso,
        Participacao: s.participacao,
        Parcial: s.parcial,
        Minimo: s.minimo,
        Excedeu: s.excedeu,
        Escolas: s.totalEscolas
      }));
  }, [sectorStats]);

  const handleSortToggle = (column: 'sucesso' | 'participacao' | 'nome' | 'escolas') => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const triggerPrint = () => {
    if (onGenerateReport) {
      onGenerateReport(selectedSector);
    } else {
      window.print();
    }
  };

  return (
    <div id="setores-view" className="space-y-8 animate-fadeIn print:bg-white print:p-0">
      
      {/* 1. Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider print:bg-slate-100 print:text-slate-800">
              Setores Escolares Oficiais
            </span>
            <span className="text-[10px] font-bold text-slate-400 font-mono">Pindamonhangaba • 2026</span>
          </div>
          <h1 className="text-2xl font-black text-white font-display tracking-tight print:text-slate-900">
            Módulo de Análise e Comparativo por Setores
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl font-medium print:text-slate-600">
            Análise territorial consolidada agrupando as unidades escolares da rede municipal nos 6 setores oficiais para orientação pedagógica e tomada de decisão descentralizada.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 print:hidden">
          <button
            onClick={triggerPrint}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Printer size={15} />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:grid-cols-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Setores Ativos</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-800">6</span>
            <span className="text-xs text-slate-500 font-medium">Unidades Territoriais</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total de Escolas</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-600">{totalSchoolsMapped}</span>
            <span className="text-xs text-slate-500 font-medium">Escolas Classificadas</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Participação da Rede</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">{avgNetworkParticipation}%</span>
            <span className="text-xs text-slate-500 font-medium">({totalEvaluated} / {totalExpected})</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Média de Sucesso</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-indigo-600">{avgNetworkSucesso}%</span>
            <span className="text-xs text-slate-500 font-medium">Mínimo + Excedeu</span>
          </div>
        </div>
      </div>

      {/* 2. Navigation / Sector Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setSelectedSector('all')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                selectedSector === 'all'
                  ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 size={14} />
              <span>Todos os Setores (Visão Geral)</span>
            </button>

            {Object.keys(SETORES_ESCOLAS).map(sec => {
              const secStat = sectorStats.find(s => s.sectorName === sec);
              const count = secStat ? secStat.totalEscolas : 0;
              const isSelected = selectedSector === sec;

              return (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{sec}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative shrink-0 w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar escola..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 3. VISÃO GERAL (When "all" is selected) */}
      {selectedSector === 'all' && (
        <>
          {/* Sector Cards Grid */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">Card de Desempenho por Setor</h2>
                <p className="text-xs text-slate-500">Resumo dos 6 setores territoriais da rede municipal</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sectorStats
                .filter(s => s.sectorName !== 'NÃO MAPEADO' || s.totalEscolas > 0)
                .map((sec) => (
                  <div 
                    key={sec.sectorName} 
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top bar */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Unidade Territorial</span>
                          <h3 className="text-lg font-black text-slate-800 font-display">{sec.sectorName}</h3>
                        </div>
                        <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 font-mono">
                          {sec.totalEscolas} escolas
                        </span>
                      </div>

                      {/* Performance metrics */}
                      <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Taxa de Sucesso</span>
                          <span className="text-xl font-black text-indigo-700">{sec.sucesso}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Participação</span>
                          <span className="text-xl font-black text-emerald-600">{sec.participacao}%</span>
                        </div>
                      </div>

                      {/* Performance bands breakdown */}
                      <div className="space-y-1.5 mb-4 text-xs">
                        <div className="flex justify-between text-[11px] font-medium text-slate-600">
                          <span>Atingiu Parcial ({sec.parcial}%)</span>
                          <span>Mínimo ({sec.minimo}%)</span>
                          <span>Excedeu ({sec.excedeu}%)</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                          <div className="bg-amber-400 h-full" style={{ width: `${sec.parcial}%` }} title={`Parcial: ${sec.parcial}%`} />
                          <div className="bg-blue-500 h-full" style={{ width: `${sec.minimo}%` }} title={`Mínimo: ${sec.minimo}%`} />
                          <div className="bg-emerald-500 h-full" style={{ width: `${sec.excedeu}%` }} title={`Excedeu: ${sec.excedeu}%`} />
                        </div>
                      </div>

                      {/* Priorities badges */}
                      <div className="flex items-center gap-2 text-[10px] font-bold mb-3">
                        {sec.highPriorityCount > 0 ? (
                          <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded flex items-center gap-1">
                            <Flame size={12} className="text-red-500" />
                            {sec.highPriorityCount} alta prioridade
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            100% estabilizado
                          </span>
                        )}
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 font-semibold">{sec.avaliados} de {sec.previstos} alunos</span>
                      </div>

                      {/* Best performing school in sector */}
                      {sec.bestSchool && (
                        <div className="text-[11px] text-slate-600 border-t border-slate-100 pt-2.5 flex items-center justify-between">
                          <span className="text-slate-400 font-medium truncate max-w-[65%]">
                            Destaque: <strong className="text-slate-700">{sec.bestSchool.nomeEscola}</strong>
                          </span>
                          <span className="font-bold text-blue-600">{sec.bestSchool.sucesso}%</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedSector(sec.sectorName)}
                      className="mt-4 w-full py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Analisar {sec.sectorName}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Recharts Sector Comparison Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">Gráfico Comparativo de Desempenho dos Setores</h3>
                <p className="text-xs text-slate-500">Comparação da Taxa de Sucesso (Mínimo + Excedeu) e Participação % entre os setores</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600, fill: '#475569' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: any) => [`${value}%`, '']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Bar dataKey="Sucesso" name="Taxa de Sucesso (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Participacao" name="Participação (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Consolidated Sector Ranking Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Tabela de Classificação dos Setores</h3>
                <p className="text-xs text-slate-500">Ranking consolidado ordenado pelos indicadores pedagógicos</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-left border-b border-slate-200">
                    <th className="px-4 py-3 cursor-pointer hover:text-slate-800" onClick={() => handleSortToggle('nome')}>
                      <div className="flex items-center gap-1">
                        <span>Setor Territorial</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="px-3 py-3 text-center cursor-pointer hover:text-slate-800" onClick={() => handleSortToggle('escolas')}>
                      <div className="flex items-center justify-center gap-1">
                        <span>Escolas</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="px-3 py-3 text-center">Avaliados</th>
                    <th className="px-3 py-3 text-center cursor-pointer hover:text-slate-800" onClick={() => handleSortToggle('participacao')}>
                      <div className="flex items-center justify-center gap-1">
                        <span>Participação</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="px-3 py-3 text-center">Parcial</th>
                    <th className="px-3 py-3 text-center">Mínimo</th>
                    <th className="px-3 py-3 text-center">Excedeu</th>
                    <th className="px-4 py-3 text-center cursor-pointer hover:text-slate-800" onClick={() => handleSortToggle('sucesso')}>
                      <div className="flex items-center justify-center gap-1">
                        <span>Sucesso %</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {sortedSectors.map((sec, idx) => (
                    <tr key={sec.sectorName} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-mono font-bold">
                          {idx + 1}
                        </span>
                        <span>{sec.sectorName}</span>
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-bold">{sec.totalEscolas}</td>
                      <td className="px-3 py-3 text-center font-mono">{sec.avaliados} / {sec.previstos}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`font-bold ${sec.participacao >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {sec.participacao}%
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-amber-600 font-semibold">{sec.parcial}%</td>
                      <td className="px-3 py-3 text-center text-blue-600 font-semibold">{sec.minimo}%</td>
                      <td className="px-3 py-3 text-center text-emerald-600 font-semibold">{sec.excedeu}%</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                          {sec.sucesso}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {sec.highPriorityCount > 0 ? (
                          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {sec.highPriorityCount} crítica(s)
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            Consolidado
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedSector(sec.sectorName)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          Detalhar →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 4. DETALHAMENTO DE UM SETOR ESPECÍFICO */}
      {selectedSector !== 'all' && activeSectorData && (
        <div className="space-y-8">
          
          {/* Active Sector Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
              <div>
                <button
                  onClick={() => setSelectedSector('all')}
                  className="text-xs font-bold text-blue-600 hover:underline mb-1 flex items-center gap-1 cursor-pointer"
                >
                  ← Voltar para Visão Geral dos Setores
                </button>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-slate-800 font-display">{activeSectorData.sectorName}</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                    {activeSectorData.totalEscolas} escolas cadastradas
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Sucesso no Setor</span>
                  <span className="text-2xl font-black text-indigo-600">{activeSectorData.sucesso}%</span>
                </div>
                <div className="h-8 w-px bg-slate-200 mx-1" />
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Participação</span>
                  <span className="text-2xl font-black text-emerald-600">{activeSectorData.participacao}%</span>
                </div>
              </div>
            </div>

            {/* Official Schools List for this Sector */}
            <div className="mt-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Escolas vinculadas a este Setor:</span>
              <div className="flex flex-wrap gap-2">
                {activeSectorData.escolas.map((school, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200">
                    {school.nomeEscola}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Table of Schools in this Sector */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Resultados das Unidades Escolares ({activeSectorData.sectorName})</h3>
                <p className="text-xs text-slate-500">Métricas individuais de cada escola pertencente ao setor</p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-md border border-slate-200 font-mono">
                {filteredSchools.length} unidades encontradas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-left border-b border-slate-200">
                    <th className="px-4 py-3">Unidade Escolar</th>
                    <th className="px-3 py-3 text-center">Previstos</th>
                    <th className="px-3 py-3 text-center">Avaliados</th>
                    <th className="px-3 py-3 text-center">Part. %</th>
                    <th className="px-3 py-3 text-center">Parcial %</th>
                    <th className="px-3 py-3 text-center">Mínimo %</th>
                    <th className="px-3 py-3 text-center">Excedeu %</th>
                    <th className="px-4 py-3 text-center">Sucesso %</th>
                    <th className="px-4 py-3 text-center">Prioridade Pedagógica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredSchools.map((sch) => {
                    let priorityLabel = 'Baixa';
                    let priorityStyle = 'bg-emerald-100 text-emerald-800';
                    let reason = 'Desempenho consolidado';

                    if (sch.sucesso < 65 || sch.participacao < 80) {
                      priorityLabel = 'Alta';
                      priorityStyle = 'bg-red-100 text-red-800';
                      reason = sch.sucesso < 65 ? 'Sucesso crítico (< 65%)' : 'Baixa participação (< 80%)';
                    } else if (sch.sucesso < 76) {
                      priorityLabel = 'Média';
                      priorityStyle = 'bg-amber-100 text-amber-800';
                      reason = 'Monitoramento ativo';
                    }

                    return (
                      <tr key={sch.nomeEscola} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{sch.nomeEscola}</td>
                        <td className="px-3 py-3 text-center font-mono">{sch.previstos}</td>
                        <td className="px-3 py-3 text-center font-mono">{sch.avaliados}</td>
                        <td className="px-3 py-3 text-center font-bold text-emerald-600">{sch.participacao}%</td>
                        <td className="px-3 py-3 text-center text-amber-600">{sch.parcial}%</td>
                        <td className="px-3 py-3 text-center text-blue-600">{sch.minimo}%</td>
                        <td className="px-3 py-3 text-center text-emerald-600">{sch.excedeu}%</td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                            {sch.sucesso}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${priorityStyle}`} title={reason}>
                            {priorityLabel} ({reason})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredSchools.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-400 font-medium">
                        Nenhuma escola encontrada para o termo pesquisado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Descriptor Matrix for Selected Sector */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-1">Desempenho nos Descritores de Matemática ({activeSectorData.sectorName})</h3>
            <p className="text-xs text-slate-500 mb-6">Média de acerto percentual por competência pedagógica (D001_J a D007_J)</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DESCRIPTORS.map((desc) => {
                const val = activeSectorData.descritores[desc.id];
                const isCritical = val !== null && val < 70;
                const isHigh = val !== null && val >= 85;

                return (
                  <div key={desc.id} className="p-4 rounded-xl border border-slate-150 bg-slate-50 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                          {desc.id}
                        </span>
                        <span className={`text-base font-black ${
                          isCritical ? 'text-red-600' : isHigh ? 'text-emerald-600' : 'text-slate-800'
                        }`}>
                          {val !== null ? `${val}%` : '-'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                        {desc.description}
                      </p>
                    </div>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                      <div 
                        className={`h-full rounded-full ${isCritical ? 'bg-red-500' : isHigh ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${val || 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sector Pedagogical Guidelines */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <span>Plano de Ação e Orientação Pedagógica do {activeSectorData.sectorName}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">Diretrizes direcionadas à coordenação de setor para alocação de formadores e oficinas pedagógicas</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">1. Diagnóstico do Setor</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  O {activeSectorData.sectorName} possui taxa de sucesso de <strong>{activeSectorData.sucesso}%</strong> e participação de <strong>{activeSectorData.participacao}%</strong>, com <strong>{activeSectorData.highPriorityCount}</strong> escola(s) sinalizada(s) para intervenção prioritária.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">2. Foco de Habilidades</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Recomenda-se reforçar as estratégias didáticas em resolução de problemas do cotidiano (subtração e agrupamento), com acompanhamento semanal nas reuniões de HTPC das unidades do setor.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">3. Encaminhamento</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Organizar visitas de mentoria pedagógica e trocas de experiências entre os professores dos 2ºs anos do {activeSectorData.sectorName} e as escolas com patamar de excelência.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
