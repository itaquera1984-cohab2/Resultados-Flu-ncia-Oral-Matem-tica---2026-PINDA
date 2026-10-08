/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { SchoolData } from '../types';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Search, ArrowUpDown, ChevronDown, Award, TrendingDown, HelpCircle, FileDown } from 'lucide-react';

interface CompareViewProps {
  schools: SchoolData[];
}

type SortField = 'nomeEscola' | 'previstos' | 'avaliados' | 'participacao' | 'parcial' | 'minimo' | 'excedeu' | 'sucesso' | 'avgDesc';
type SortOrder = 'asc' | 'desc';

export default function CompareView({ schools }: CompareViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('sucesso');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Multi-column sorting & filtering
  const processedSchools = useMemo(() => {
    return schools.map(sch => {
      // Calculate average of 7 descriptors
      const descValues = Object.values(sch.descritores);
      const avgDesc = Math.round(descValues.reduce((acc, curr) => acc + curr, 0) / descValues.length);
      return {
        ...sch,
        avgDesc
      };
    });
  }, [schools]);

  const filteredSchools = useMemo(() => {
    return processedSchools.filter(sch =>
      sch.nomeEscola.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        const numA = valA as number;
        const numB = valB as number;
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }
    });
  }, [processedSchools, searchTerm, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Top 10 and Bottom 10 Schools based on Success Indicator
  const sortedBySuccess = useMemo(() => {
    return [...processedSchools].sort((a, b) => b.sucesso - a.sucesso);
  }, [processedSchools]);

  const top10 = useMemo(() => sortedBySuccess.slice(0, 10), [sortedBySuccess]);
  const bottom10 = useMemo(() => [...sortedBySuccess].slice(-10).reverse(), [sortedBySuccess]); // worst on top

  // Scatter Plot Data
  const scatterData = useMemo(() => {
    return processedSchools.map(sch => ({
      name: sch.nomeEscola,
      x: sch.participacao,
      y: sch.sucesso,
      z: sch.avaliados
    }));
  }, [processedSchools]);

  const exportFilteredCsv = () => {
    const delimiter = ';';
    const headers = ['Escola', 'Previstos', 'Avaliados', 'Participação (%)', 'Atingiu Parcialmente (%)', 'Atingiu Mínimo (%)', 'Excedeu Mínimo (%)', 'Indicador Sucesso (%)', 'Média dos Descritores (%)'];
    const rows = filteredSchools.map(sch => [
      sch.nomeEscola,
      sch.previstos.toString(),
      sch.avaliados.toString(),
      `${sch.participacao}%`,
      `${sch.parcial}%`,
      `${sch.minimo}%`,
      `${sch.excedeu}%`,
      `${sch.sucesso}%`,
      `${sch.avgDesc}%`
    ]);

    const csvContent = headers.join(delimiter) + '\n' + rows.map(r => r.join(delimiter)).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Comparativo_Escolas_Matematica_Pinda_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="compare-view" className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 font-display">Comparativo Geral das Escolas</h1>
        <p className="text-sm text-slate-500 mt-0.5">Analise o desempenho relativo de todas as {schools.length} unidades municipais escolares e identifique disparidades</p>
      </div>

      {/* Visual Rankings (Top 10 / Bottom 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 10 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Award className="text-emerald-500" size={18} />
            <span>As 10 Unidades de Maior Sucesso</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Escolas com maiores percentuais agregados de alunos no nível Mínimo + Excedeu</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={10} />
                <YAxis dataKey="nomeEscola" type="category" width={110} fontSize={9} tickFormatter={(v) => v.length > 18 ? `${v.substring(0, 16)}...` : v} />
                <RechartsTooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="sucesso" fill="#10b981" radius={[0, 4, 4, 0]} barSize={10}>
                  {top10.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#10b981" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom 10 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <TrendingDown className="text-red-500" size={18} />
            <span>As 10 Unidades com Maior Desafio Pedagógico</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Unidades com menores indicadores de sucesso (Alta Prioridade de suporte)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bottom10} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={10} />
                <YAxis dataKey="nomeEscola" type="category" width={110} fontSize={9} tickFormatter={(v) => v.length > 18 ? `${v.substring(0, 16)}...` : v} />
                <RechartsTooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="sucesso" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={10}>
                  {bottom10.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#ef4444" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Scatter plot: Participation vs Performance */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-2">
          <span>Relação Participação x Rendimento Educacional</span>
          <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Análise de Equidade</span>
        </h3>
        <p className="text-xs text-slate-400 mb-6">Gráfico de dispersão cruzando a Taxa de Participação (%) com o Indicador de Sucesso (%). Idealmente, as escolas devem estar no quadrante superior-direito.</p>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis type="number" dataKey="x" name="Participação" unit="%" domain={[50, 100]} fontSize={10} />
              <YAxis type="number" dataKey="y" name="Indicador Sucesso" unit="%" domain={[20, 100]} fontSize={10} />
              <RechartsTooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-md border border-slate-200 text-xs font-medium space-y-1">
                        <p className="font-bold text-slate-800">{data.name}</p>
                        <p className="text-blue-600">Participação: <strong className="font-bold">{data.x}%</strong></p>
                        <p className="text-green-600">Sucesso Educativo: <strong className="font-bold">{data.y}%</strong></p>
                        <p className="text-slate-400">Avaliados: {data.z} alunos</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Escolas" data={scatterData} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Large Interactive Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Buscar escola por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm w-full bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={exportFilteredCsv}
            className="shrink-0 bg-white border border-slate-200 text-slate-700 font-semibold text-xs px-4 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <FileDown size={14} />
            <span>Exportar CSV Filtrado</span>
          </button>
        </div>

        {/* Real HTML table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50/50">
              <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider text-left border-b border-slate-200">
                <th onClick={() => handleSort('nomeEscola')} className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none">
                  <div className="flex items-center gap-1">
                    <span>Unidade Escolar</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort('previstos')} className="px-4 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Previstos</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort('avaliados')} className="px-4 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Avaliados</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort('participacao')} className="px-4 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Part. (%)</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort('parcial')} className="px-4 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none text-center text-red-500">
                  <div className="flex items-center justify-center gap-1">
                    <span>Parcial (%)</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort('minimo')} className="px-4 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none text-center text-amber-600">
                  <div className="flex items-center justify-center gap-1">
                    <span>Mínimo (%)</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort('excedeu')} className="px-4 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none text-center text-green-600">
                  <div className="flex items-center justify-center gap-1">
                    <span>Excedeu (%)</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort('sucesso')} className="px-4 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none text-center bg-blue-50 text-blue-800">
                  <div className="flex items-center justify-center gap-1">
                    <span>Sucesso (%)</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort('avgDesc')} className="px-4 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>Méd. Desc (%)</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredSchools.map((sch, index) => {
                const partAlert = sch.participacao < 80;
                const partCritical = sch.participacao < 60;
                const isUnderperforming = sch.sucesso < 70;

                return (
                  <tr key={sch.nomeEscola} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-800 whitespace-nowrap">
                      {sch.nomeEscola}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">{sch.previstos}</td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">{sch.avaliados}</td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        partCritical ? 'bg-red-100 text-red-800' : partAlert ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {sch.participacao}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center text-red-600 whitespace-nowrap font-semibold">{sch.parcial}%</td>
                    <td className="px-4 py-3.5 text-center text-amber-600 whitespace-nowrap">{sch.minimo}%</td>
                    <td className="px-4 py-3.5 text-center text-green-600 whitespace-nowrap">{sch.excedeu}%</td>
                    <td className="px-4 py-3.5 text-center bg-blue-50/50 whitespace-nowrap font-extrabold text-blue-700">{sch.sucesso}%</td>
                    <td className={`px-4 py-3.5 text-center whitespace-nowrap font-bold ${isUnderperforming ? 'text-red-500' : 'text-slate-800'}`}>
                      {sch.avgDesc}%
                    </td>
                  </tr>
                );
              })}
              {filteredSchools.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-slate-400">
                    Nenhuma escola encontrada correspondendo ao filtro de busca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
