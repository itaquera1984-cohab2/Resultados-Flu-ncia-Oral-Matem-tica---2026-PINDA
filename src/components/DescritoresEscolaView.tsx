/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { SchoolData } from '../types';
import { getSchoolDisplayName } from './ParticipacaoFaixasView';
import { Search, Sparkles, BookOpen, AlertTriangle, CheckCircle2, Award } from 'lucide-react';

interface DescritoresEscolaViewProps {
  schools: SchoolData[];
  onGenerateReport?: () => void;
}

// Function to calculate cell color based on score
function getCellBadgeStyle(val: number | null | undefined): string {
  if (val === null || val === undefined) return 'text-slate-300 bg-slate-50 border-slate-200/40';
  if (val < 50) return 'bg-red-50 text-red-700 border-red-200/60';
  if (val < 70) return 'bg-amber-50 text-amber-700 border-amber-200/60';
  if (val < 85) return 'bg-blue-50 text-blue-700 border-blue-200/60';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
}

export default function DescritoresEscolaView({ schools, onGenerateReport }: DescritoresEscolaViewProps) {
  const [search, setSearch] = useState('');

  const filteredSchools = useMemo(() => {
    return schools.map((s, idx) => ({
      ...s,
      originalIndex: idx + 1,
      displayName: getSchoolDisplayName(s.nomeEscola)
    })).filter(s => 
      s.displayName.toLowerCase().includes(search.toLowerCase()) ||
      s.nomeEscola.toLowerCase().includes(search.toLowerCase())
    );
  }, [schools, search]);

  // Network averages for descriptors
  const networkAverages = useMemo(() => {
    const counts: Record<string, number> = {};
    const sums: Record<string, number> = {};
    
    // Default network averages in case schools are empty or filtered
    const defaults = {
      'D001_J': 88,
      'D002_J': 91,
      'D003_J': 92,
      'D004_J': 78,
      'D005_J': 79,
      'D006_J': 80,
      'D007_J': 71
    };

    if (schools.length === 0) return defaults;

    schools.forEach(s => {
      Object.entries(s.descritores).forEach(([id, val]) => {
        if (val !== null && val !== undefined) {
          sums[id] = (sums[id] || 0) + val;
          counts[id] = (counts[id] || 0) + 1;
        }
      });
    });

    const avgs: Record<string, number> = {};
    Object.keys(defaults).forEach(id => {
      avgs[id] = counts[id] ? Math.round(sums[id] / counts[id]) : defaults[id as keyof typeof defaults];
    });

    return avgs;
  }, [schools]);

  return (
    <div id="descritores-escola-view" className="space-y-6 animate-fadeIn">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Visão por Descritor
          </span>
          <h1 className="text-2xl font-bold text-slate-800 font-display mt-1">
            Descritores por Escola (Matemática)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Aproveitamento percentual médio nos descritores essenciais (D001_J a D007_J)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar escola..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white text-slate-700 font-medium"
            />
          </div>

          <button
            onClick={onGenerateReport}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <span>Gerar relatório — Descritores</span>
          </button>
        </div>
      </div>

      {/* Legend Card */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap gap-x-6 gap-y-2 items-center text-xs font-semibold text-slate-600">
        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Legenda de Alerta:</span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-100 border border-red-300"></span> Crítico (&lt; 50%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-amber-100 border border-amber-300"></span> Atenção (50% - 69%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-blue-100 border border-blue-300"></span> Intermediário (70% - 84%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-emerald-100 border border-emerald-300"></span> Consolidado (&ge; 85%)
        </span>
      </div>

      {/* Main Grid View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 text-center">#</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Escola</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider text-center font-mono bg-slate-100/30 w-24">D001</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider text-center font-mono bg-slate-100/30 w-24">D002</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider text-center font-mono bg-slate-100/30 w-24">D003</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider text-center font-mono bg-slate-100/30 w-24">D004</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider text-center font-mono bg-slate-100/30 w-24">D005</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider text-center font-mono bg-slate-100/30 w-24">D006</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider text-center font-mono bg-slate-100/30 w-24">D007</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchools.map((school) => (
                <tr key={school.nomeEscola} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-xs font-mono font-bold text-slate-400 text-center">
                    {String(school.originalIndex).padStart(2, '0')}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-bold text-slate-800 tracking-wide">
                      {school.displayName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {school.nomeEscola}
                    </div>
                  </td>
                  
                  {/* Descriptors cells */}
                  <td className="px-4 py-3.5 text-center bg-slate-50/10">
                    <span className={`inline-block px-2.5 py-1 text-sm font-bold font-mono rounded-md border ${getCellBadgeStyle(school.descritores['D001_J'])}`}>
                      {school.descritores['D001_J'] !== null && school.descritores['D001_J'] !== undefined ? `${school.descritores['D001_J']}%` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center bg-slate-50/10">
                    <span className={`inline-block px-2.5 py-1 text-sm font-bold font-mono rounded-md border ${getCellBadgeStyle(school.descritores['D002_J'])}`}>
                      {school.descritores['D002_J'] !== null && school.descritores['D002_J'] !== undefined ? `${school.descritores['D002_J']}%` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center bg-slate-50/10">
                    <span className={`inline-block px-2.5 py-1 text-sm font-bold font-mono rounded-md border ${getCellBadgeStyle(school.descritores['D003_J'])}`}>
                      {school.descritores['D003_J'] !== null && school.descritores['D003_J'] !== undefined ? `${school.descritores['D003_J']}%` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center bg-slate-50/10">
                    <span className={`inline-block px-2.5 py-1 text-sm font-bold font-mono rounded-md border ${getCellBadgeStyle(school.descritores['D004_J'])}`}>
                      {school.descritores['D004_J'] !== null && school.descritores['D004_J'] !== undefined ? `${school.descritores['D004_J']}%` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center bg-slate-50/10">
                    <span className={`inline-block px-2.5 py-1 text-sm font-bold font-mono rounded-md border ${getCellBadgeStyle(school.descritores['D005_J'])}`}>
                      {school.descritores['D005_J'] !== null && school.descritores['D005_J'] !== undefined ? `${school.descritores['D005_J']}%` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center bg-slate-50/10">
                    <span className={`inline-block px-2.5 py-1 text-sm font-bold font-mono rounded-md border ${getCellBadgeStyle(school.descritores['D006_J'])}`}>
                      {school.descritores['D006_J'] !== null && school.descritores['D006_J'] !== undefined ? `${school.descritores['D006_J']}%` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center bg-slate-50/10">
                    <span className={`inline-block px-2.5 py-1 text-sm font-bold font-mono rounded-md border ${getCellBadgeStyle(school.descritores['D007_J'])}`}>
                      {school.descritores['D007_J'] !== null && school.descritores['D007_J'] !== undefined ? `${school.descritores['D007_J']}%` : '—'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredSchools.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-sm text-slate-400 font-medium">
                    Nenhuma escola encontrada correspondente aos critérios de busca.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-slate-100 font-mono font-bold text-xs uppercase tracking-wider">
                <td colSpan={2} className="px-5 py-4 text-left">
                  MÉDIA CONSOLIDADA DA REDE
                </td>
                <td className="px-4 py-4 text-center font-extrabold text-white text-sm bg-slate-800">
                  {networkAverages['D001_J']}%
                </td>
                <td className="px-4 py-4 text-center font-extrabold text-white text-sm bg-slate-800">
                  {networkAverages['D002_J']}%
                </td>
                <td className="px-4 py-4 text-center font-extrabold text-white text-sm bg-slate-800">
                  {networkAverages['D003_J']}%
                </td>
                <td className="px-4 py-4 text-center font-extrabold text-white text-sm bg-slate-800">
                  {networkAverages['D004_J']}%
                </td>
                <td className="px-4 py-4 text-center font-extrabold text-white text-sm bg-slate-800">
                  {networkAverages['D005_J']}%
                </td>
                <td className="px-4 py-4 text-center font-extrabold text-white text-sm bg-slate-800">
                  {networkAverages['D006_J']}%
                </td>
                <td className="px-4 py-4 text-center font-extrabold text-white text-sm bg-slate-800">
                  {networkAverages['D007_J']}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Pedagogical Description Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-blue-600" />
          Relação de Habilidades dos Descritores (Matemática 2º ano)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
            <strong className="text-slate-800 block font-bold mb-1">D001: Números Diários</strong>
            <span className="text-slate-500">Reconhecer e identificar números naturais no contexto diário (leitura, ordens e grandezas).</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
            <strong className="text-slate-800 block font-bold mb-1">D002: Escrita e Comparação</strong>
            <span className="text-slate-500">Escrever, comparar e ordenar números naturais em sequências e retas numéricas.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
            <strong className="text-slate-800 block font-bold mb-1">D003: Adição do Cotidiano</strong>
            <span className="text-slate-500">Resolver problemas do cotidiano envolvendo a adição (juntar, acrescentar).</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
            <strong className="text-slate-800 block font-bold mb-1">D004: Subtração do Cotidiano</strong>
            <span className="text-slate-500">Resolver problemas do cotidiano envolvendo a subtração (retirar, comparar, completar).</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
            <strong className="text-slate-800 block font-bold mb-1">D005: Geometria</strong>
            <span className="text-slate-500">Identificar propriedades de figuras geométricas planas e espaciais.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
            <strong className="text-slate-800 block font-bold mb-1">D006: Grandezas e Medidas</strong>
            <span className="text-slate-500">Estimar e medir grandezas (comprimento, tempo, massa, capacidade, sistema monetário).</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-150 md:col-span-2 lg:col-span-3">
            <strong className="text-slate-800 block font-bold mb-1">D007: Tabelas e Gráficos</strong>
            <span className="text-slate-500">Ler, interpretar e extrair dados apresentados em tabelas simples e gráficos de barras.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
