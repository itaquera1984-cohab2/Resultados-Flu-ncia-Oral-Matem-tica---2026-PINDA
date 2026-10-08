/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { NetworkData, Descriptor, ItemDetail, ClassData } from '../types';
import { DESCRIPTORS, ITEMS } from '../data';
import { formatVulnerabilityPercentage, getNetworkVulnerability } from '../utils/vulnerability';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { 
  Users, 
  GraduationCap, 
  Percent, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Brain, 
  Sparkles, 
  Loader2,
  ArrowUpDown,
  Search,
  BookOpen,
  Lightbulb,
  ClipboardCheck,
  ArrowRight,
  Filter,
  BarChart3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface NetworkViewProps {
  networkData: NetworkData;
  classes: ClassData[];
  onGenerateReport?: () => void;
}

export default function NetworkView({ networkData, classes, onGenerateReport }: NetworkViewProps) {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');

  // BI and Item-by-item states
  const [searchTerm, setSearchTerm] = useState('');
  const [perfFilter, setPerfFilter] = useState<'all' | 'critical' | 'attention' | 'consolidated'>('all');
  const [descFilter, setDescFilter] = useState('all');
  const [sortField, setSortField] = useState<'id' | 'value' | 'descriptorId'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activePedTab, setActivePedTab] = useState<'diagnostico' | 'contraste' | 'roteiro'>('diagnostico');

  // 1. Sort descriptors from strongest to weakest
  const sortedDescriptors = [...DESCRIPTORS].map(desc => ({
    ...desc,
    value: networkData.descritores[desc.id] || 0
  })).sort((a, b) => b.value - a.value);

  // 2. Sort items to find top 5 and bottom 5
  const sortedItems = [...ITEMS].map(item => ({
    ...item,
    value: networkData.itens[item.id] || 0
  })).sort((a, b) => b.value - a.value);

  const top5Items = sortedItems.slice(0, 5);
  const bottom5Items = sortedItems.slice(-5).reverse(); // lowest scores first

  // Process all 27 items with values and state
  const itemsWithValues = ITEMS.map(item => {
    const val = networkData.itens[item.id] || 0;
    let status: 'critical' | 'attention' | 'consolidated' = 'attention';
    if (val < 70) status = 'critical';
    else if (val >= 80) status = 'consolidated';
    
    return {
      ...item,
      value: val,
      status,
      descriptorDesc: DESCRIPTORS.find(d => d.id === item.descriptorId)?.description || ''
    };
  });

  const filteredItems = itemsWithValues.filter(item => {
    const matchesSearch = item.theme.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.descriptorId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPerf = perfFilter === 'all' || item.status === perfFilter;
    const matchesDesc = descFilter === 'all' || item.descriptorId === descFilter;

    return matchesSearch && matchesPerf && matchesDesc;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortField === 'id') {
      comparison = a.id.localeCompare(b.id, undefined, { numeric: true });
    } else if (sortField === 'value') {
      comparison = a.value - b.value;
    } else if (sortField === 'descriptorId') {
      comparison = a.descriptorId.localeCompare(b.descriptorId);
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: 'id' | 'value' | 'descriptorId') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // default to descending on new field
    }
  };

  // Recharts Pie Data
  const pieData = [
    { name: 'Atingiu Parcialmente (Crítico)', value: networkData.parcial, color: '#ef4444' },
    { name: 'Atingiu o Mínimo (Intermediário)', value: networkData.minimo, color: '#f59e0b' },
    { name: 'Excedeu o Mínimo (Consolidado)', value: networkData.excedeu, color: '#10b981' }
  ];

  // Fetch AI insights from our Express server
  const fetchAiInsight = async () => {
    setLoadingAi(true);
    setAiError('');
    try {
      const response = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityName: 'Rede Municipal de Pindamonhangaba',
          entityType: 'Rede',
          performance: {
            participacao: networkData.participacao,
            previstos: networkData.previstos,
            avaliados: networkData.avaliados,
            parcial: networkData.parcial,
            minimo: networkData.minimo,
            excedeu: networkData.excedeu,
            sucesso: networkData.sucesso,
            descritores: networkData.descritores,
            itens: networkData.itens
          },
          networkAvg: networkData // same for rede level
        })
      });

      if (!response.ok) {
        throw new Error('Não foi possível gerar os insights com a IA neste momento.');
      }

      const data = await response.json();
      setAiInsight(data.text);
    } catch (err: any) {
      setAiError(err.message || 'Erro de conexão.');
    } finally {
      setLoadingAi(false);
    }
  };

  // Generate a brief static preview insight on mount
  useEffect(() => {
    const criticalD = Object.entries(networkData.descritores)
      .filter(([_, val]) => val < 70)
      .map(([k]) => k);
    
    let summary = `A Rede Municipal obteve **${networkData.sucesso}%** de sucesso educativo (Alunos que atingiram ou excederam o mínimo). `;
    summary += `A participação de **${networkData.participacao}%** é altamente fidedigna. `;
    if (criticalD.length > 0) {
      summary += `Entretanto, existem **${criticalD.length} descritores críticos** abaixo do patamar de 70% de acertos, sendo o mais fragilizado o **${sortedDescriptors[sortedDescriptors.length - 1].id}** com **${sortedDescriptors[sortedDescriptors.length - 1].value}%**.`;
    } else {
      summary += `Todos os descritores encontram-se acima da linha crítica de 70%, sugerindo um bom rendimento homogêneo.`;
    }
    setAiInsight(summary);
  }, [networkData]);

  return (
    <div id="network-view" className="space-y-6 animate-fadeIn">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
        <div>
          <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Consolidado Geral</span>
          <h1 className="text-2xl font-bold text-slate-800 font-display mt-1">Desempenho Municipal de Pindamonhangaba (SP)</h1>
          <p className="text-sm text-slate-500 mt-0.5">Visão unificada das 37 escolas e 102 turmas da rede no 2º Ano do Ensino Fundamental</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium bg-white px-3 py-2.5 rounded-lg border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Atualizado: Matemática 2026</span>
          </div>
          <button
            onClick={onGenerateReport}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap animate-pulse hover:animate-none"
          >
            <span>Relatório Executivo Consolidado</span>
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 transition-colors flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Estudantes Avaliados</span>
            <span className="text-2xl font-extrabold text-slate-800 block">
              {networkData.avaliados} <span className="text-xs font-normal text-slate-400">/ {networkData.previstos}</span>
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-emerald-300 transition-colors flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Percent size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Participação da Rede</span>
            <span className="text-2xl font-extrabold text-slate-800 block">
              {networkData.participacao}%
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-green-300 transition-colors flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <GraduationCap size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sucesso Educacional</span>
            <span className="text-2xl font-extrabold text-slate-800 block">
              {networkData.sucesso}%
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-red-300 transition-colors flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Nível Crítico (Parcial)</span>
            <span className="text-2xl font-extrabold text-slate-800 block text-red-600">
              {networkData.parcial}%
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-violet-200 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-lg"><Users size={24} /></div>
          <div>
            <span className="text-[11px] font-bold text-violet-500 uppercase tracking-wider block">Vulnerabilidade da Rede</span>
            <span className="text-2xl font-extrabold text-violet-700 block">
              {formatVulnerabilityPercentage(getNetworkVulnerability(classes, networkData.previstos).percentage)}
            </span>
            <span className="text-[10px] text-slate-400">{getNetworkVulnerability(classes, networkData.previstos).count} estudantes</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pie Chart of Performance Levels */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">Níveis de Desempenho</h3>
            <p className="text-xs text-slate-400 mb-4">Divisão percentual de proficiência dos estudantes avaliados no município</p>
          </div>
          <div className="h-60 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-3xl font-black text-slate-800 block">{networkData.sucesso}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Sucesso</span>
            </div>
          </div>
          <div className="space-y-2 mt-4 border-t border-slate-100 pt-3">
            {pieData.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-600 font-medium">{entry.name}</span>
                </div>
                <span className="font-extrabold text-slate-800">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Descriptors Performance */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">Ranking de Descritores</h3>
            <p className="text-xs text-slate-400 mb-4">Média de acertos da rede municipal por descritor de habilidade (do mais forte ao mais fraco)</p>
          </div>

          <div className="space-y-3.5 flex-1 flex flex-col justify-center">
            {sortedDescriptors.map((desc, index) => {
              const isCritical = desc.value < 70;
              return (
                <div key={desc.id} className="group">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700 truncate max-w-[80%]" title={`${desc.id}: ${desc.description}`}>
                      <span className="font-bold text-blue-600 mr-1.5">{desc.id}</span>
                      {desc.description}
                    </span>
                    <span className={`font-bold ${isCritical ? 'text-red-500' : 'text-slate-800'}`}>{desc.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical ? 'bg-red-500' : desc.value >= 80 ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${desc.value}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Highlighting specific items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 5 consolidated items */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <CheckCircle className="text-emerald-500" size={18} />
            <span>5 Itens Mais Consolidados</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Pontos fortes da rede de ensino: maiores percentuais de acerto na prova</p>
          
          <div className="divide-y divide-slate-100">
            {top5Items.map((item, idx) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                <div className="max-w-[75%]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700">{item.id}</span>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                      {item.descriptorId}
                    </span>
                  </div>
                  <p className="text-slate-500 truncate mt-0.5">{item.theme}</p>
                </div>
                <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom 5 critical items */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <AlertTriangle className="text-red-500" size={18} />
            <span>5 Itens Mais Críticos (Foco Pedagógico)</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Gargalos de aprendizagem: menores médias de acerto na rede (exigem reforço imediato)</p>

          <div className="divide-y divide-slate-100">
            {bottom5Items.map((item, idx) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                <div className="max-w-[75%]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700">{item.id}</span>
                    <span className="text-[10px] font-bold bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                      {item.descriptorId}
                    </span>
                  </div>
                  <p className="text-slate-500 truncate mt-0.5">{item.theme}</p>
                </div>
                <span className="font-extrabold text-red-600 bg-red-50 px-2.5 py-1 rounded">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive BI Dashboard: 27 Items Analysis */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Mapeamento Geral BI</span>
          <h2 className="text-lg font-bold text-slate-800 font-display mt-1.5">Painel Analítico de Itens da Rede</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">Visão detalhada e interativa das taxas de acerto nos 27 itens da avaliação para orientar as equipes pedagógicas</p>
        </div>

        {/* Filters and Controls Bar */}
        <div className="flex flex-col xl:flex-row gap-4 justify-between bg-slate-50 p-4 rounded-lg border border-slate-150">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Buscar por item, descritor ou habilidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
            />
          </div>

          {/* Performance filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Filter size={12} />
              <span>Desempenho:</span>
            </span>
            <button
              onClick={() => setPerfFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                perfFilter === 'all'
                  ? 'bg-slate-850 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Todos ({itemsWithValues.length})
            </button>
            <button
              onClick={() => setPerfFilter('critical')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                perfFilter === 'critical'
                  ? 'bg-red-650 text-white shadow-sm'
                  : 'bg-white text-red-600 hover:bg-red-50 border border-red-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Críticos ({itemsWithValues.filter(i => i.status === 'critical').length})
            </button>
            <button
              onClick={() => setPerfFilter('attention')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                perfFilter === 'attention'
                  ? 'bg-blue-650 text-white shadow-sm'
                  : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Intermediários ({itemsWithValues.filter(i => i.status === 'attention').length})
            </button>
            <button
              onClick={() => setPerfFilter('consolidated')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                perfFilter === 'consolidated'
                  ? 'bg-emerald-650 text-white shadow-sm'
                  : 'bg-white text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Consolidados ({itemsWithValues.filter(i => i.status === 'consolidated').length})
            </button>
          </div>

          {/* Descriptor filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Descritor:</span>
            <select
              value={descFilter}
              onChange={(e) => setDescFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-750 text-xs rounded-lg p-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os descritores</option>
              {DESCRIPTORS.map(d => (
                <option key={d.id} value={d.id}>{d.id} - {d.description.slice(0, 30)}...</option>
              ))}
            </select>
          </div>
        </div>

        {/* Visual Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interactive Grid Table */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-500 px-1 font-medium">
              <span>Exibindo <strong>{filteredItems.length}</strong> de <strong>27</strong> itens cadastrados</span>
              {filteredItems.length === 0 && <span className="text-red-500 font-bold">Nenhum resultado encontrado</span>}
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm max-h-[500px] overflow-y-auto relative">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition-colors" onClick={() => handleSort('id')}>
                      <div className="flex items-center gap-1">
                        <span>Item</span>
                        <ArrowUpDown size={12} className={sortField === 'id' ? 'text-slate-800' : 'text-slate-300'} />
                      </div>
                    </th>
                    <th className="px-4 py-3">Habilidade / Tema Avaliado</th>
                    <th className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition-colors" onClick={() => handleSort('descriptorId')}>
                      <div className="flex items-center gap-1">
                        <span>Descritor</span>
                        <ArrowUpDown size={12} className={sortField === 'descriptorId' ? 'text-slate-800' : 'text-slate-300'} />
                      </div>
                    </th>
                    <th className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition-colors text-right" onClick={() => handleSort('value')}>
                      <div className="flex items-center gap-1 justify-end">
                        <span>Acerto (%)</span>
                        <ArrowUpDown size={12} className={sortField === 'value' ? 'text-slate-800' : 'text-slate-300'} />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="whitespace-nowrap px-4 py-2.5 font-bold text-slate-800">{item.id}</td>
                      <td className="px-4 py-2.5">
                        <span className="font-semibold text-slate-700 block text-xs leading-tight">{item.theme}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100" title={item.descriptorDesc}>
                          {item.descriptorId}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className={`h-full rounded-full ${
                                item.status === 'critical' ? 'bg-red-500' :
                                item.status === 'attention' ? 'bg-blue-500' :
                                'bg-emerald-500'
                              }`}
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                          <span className={`font-extrabold text-xs px-2 py-0.5 rounded ${
                            item.status === 'critical' ? 'text-red-700 bg-red-50 border border-red-100' :
                            item.status === 'attention' ? 'text-blue-700 bg-blue-50 border border-blue-100' :
                            'text-emerald-700 bg-emerald-50 border border-emerald-100'
                          }`}>
                            {item.value}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: BI Analytical Panels */}
          <div className="lg:col-span-5 bg-slate-50/50 rounded-xl border border-slate-200/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="text-blue-600" size={20} />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Painel Pedagógico de Intervenção</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4 font-normal">Análises detalhadas elaboradas para subsidiar o plano de ação das coordenações de escola.</p>

              {/* Tabs Navigation */}
              <div className="flex border-b border-slate-200 mb-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActivePedTab('diagnostico')}
                  className={`pb-2.5 px-2 -mb-px border-b-2 transition-all flex items-center gap-1 ${
                    activePedTab === 'diagnostico'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <AlertCircle size={14} />
                  <span>Defasagens</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePedTab('contraste')}
                  className={`pb-2.5 px-2 -mb-px border-b-2 transition-all flex items-center gap-1 ${
                    activePedTab === 'contraste'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <BookOpen size={14} />
                  <span>Contraste</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePedTab('roteiro')}
                  className={`pb-2.5 px-2 -mb-px border-b-2 transition-all flex items-center gap-1 ${
                    activePedTab === 'roteiro'
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <ClipboardCheck size={14} />
                  <span>Plano de Ação</span>
                </button>
              </div>

              {/* Tab Content 1: Diagnóstico de Defasagens */}
              {activePedTab === 'diagnostico' && (
                <div className="space-y-4 animate-fadeIn text-xs font-normal">
                  <div className="bg-red-50 border border-red-100 p-3.5 rounded-lg">
                    <span className="font-extrabold text-red-800 text-xs block mb-1">Diagnóstico Geral das Fragilidades</span>
                    <p className="text-red-700 leading-relaxed text-xs">
                      A rede municipal possui <strong className="font-bold text-red-900">7 itens críticos</strong> abaixo do patamar de <strong className="font-bold text-red-900">70%</strong>. O descritor mais impactado é o <strong className="font-bold text-red-900">D007_J (Tratamento da Informação)</strong>, indicando lacunas severas em representação gráfica e tabular.
                    </p>
                  </div>

                  <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-150">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-700">Leitura de Tabelas (Item 25)</span>
                        <span className="bg-red-50 text-red-600 text-[10px] font-black px-1.5 py-0.5 rounded border border-red-100">63%</span>
                      </div>
                      <p className="text-slate-500 leading-normal text-xs">Dificuldade generalizada em ler e localizar valores explícitos em tabelas de jogo de pontuação simples. Esta é a menor média da rede.</p>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-150">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-700">Cruzamento em Tabela Dupla (Item 27)</span>
                        <span className="bg-red-50 text-red-600 text-[10px] font-black px-1.5 py-0.5 rounded border border-red-100">67%</span>
                      </div>
                      <p className="text-slate-500 leading-normal text-xs">Dificuldade em correlacionar variáveis nas colunas com as linhas para encontrar a resposta pedida na tabela.</p>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-150">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-700">Interpretação de Gráficos (Item 26)</span>
                        <span className="bg-red-50 text-red-600 text-[10px] font-black px-1.5 py-0.5 rounded border border-red-100">68%</span>
                      </div>
                      <p className="text-slate-500 leading-normal text-xs">Ler a escala e as colunas em gráficos de barra simples sobre preferências. Alunos confundem a barra com a escala numérica lateral.</p>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-150">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-700">Subtração 'Quanto falta' (Item 16)</span>
                        <span className="bg-red-50 text-red-600 text-[10px] font-black px-1.5 py-0.5 rounded border border-red-100">69%</span>
                      </div>
                      <p className="text-slate-500 leading-normal text-xs">Embora as operações de subtração simples estejam dominadas, o modelo semântico de completar conjuntos gera sobrecarga cognitiva.</p>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-150">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-700">Medição com Régua (Item 24)</span>
                        <span className="bg-red-50 text-red-600 text-[10px] font-black px-1.5 py-0.5 rounded border border-red-100">69%</span>
                      </div>
                      <p className="text-slate-500 leading-normal text-xs">Desafio prático de alinhar a extremidade do objeto à marca do zero na régua graduada.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 2: Contraste Pedagógico */}
              {activePedTab === 'contraste' && (
                <div className="space-y-4 animate-fadeIn text-xs font-normal">
                  <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-lg">
                    <span className="font-extrabold text-blue-800 text-xs block mb-1">Por que há diferença de rendimento?</span>
                    <p className="text-blue-700 leading-relaxed text-xs">
                      Itens de um mesmo descritor revelam sob quais condições os alunos falham. Identificar estes contrastes previne o treino mecânico do algoritmo.
                    </p>
                  </div>

                  <div className="space-y-3.5 max-h-[260px] overflow-y-auto pr-1">
                    {/* Contraste 1 */}
                    <div className="border-l-2 border-slate-300 pl-3 py-1">
                      <div className="flex justify-between text-slate-700 font-bold mb-1">
                        <span>Adição Simples vs Com Reserva</span>
                        <span className="text-slate-500">88% vs 70%</span>
                      </div>
                      <p className="text-slate-500 text-xs leading-normal">
                        <strong className="font-semibold">Item 09 (88%)</strong> requer apenas juntar duas coleções. <strong className="font-semibold">Item 10 (70%)</strong> requer adicionar parcelas que geram transporte. A queda de <strong className="font-semibold">18%</strong> mostra que o conceito do sistema decimal posicional ainda precisa ser melhor consolidado de forma concreta.
                      </p>
                    </div>

                    {/* Contraste 2 */}
                    <div className="border-l-2 border-slate-300 pl-3 py-1">
                      <div className="flex justify-between text-slate-700 font-bold mb-1">
                        <span>Subtração Retirar vs Completar</span>
                        <span className="text-slate-500">85% vs 69%</span>
                      </div>
                      <p className="text-slate-500 text-xs leading-normal">
                        Os alunos respondem bem a retirar elementos (<strong className="font-semibold">Item 13: 85%</strong>), mas a taxa cai bruscamente na ideia de quanto falta para atingir um conjunto (<strong className="font-semibold">Item 16: 69%</strong>). A ideia de complementação requer representações gráficas na reta numérica.
                      </p>
                    </div>

                    {/* Contraste 3 */}
                    <div className="border-l-2 border-slate-300 pl-3 py-1">
                      <div className="flex justify-between text-slate-700 font-bold mb-1">
                        <span>Leitura Digital vs Prática de Medida</span>
                        <span className="text-slate-500">69% vs 69%</span>
                      </div>
                      <p className="text-slate-500 text-xs leading-normal">
                        O relógio digital (<strong className="font-semibold">Item 21: 69%</strong>) e a régua (<strong className="font-semibold">Item 24: 69%</strong>) registram acertos idênticos. Ambas as habilidades exigem associação instrumental prática de instrumentos de medida, o que aponta para a necessidade de vivências com objetos de manipulação.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 3: Plano de Ação */}
              {activePedTab === 'roteiro' && (
                <div className="space-y-3.5 animate-fadeIn text-xs font-normal">
                  <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-lg">
                    <span className="font-extrabold text-emerald-800 text-xs block mb-1">Ações Recomendadas para Intervenção</span>
                    <p className="text-emerald-700 leading-relaxed text-xs">
                      Diretrizes práticas estruturadas com foco no plano de aula e no fortalecimento das competências matemáticas dos docentes e alunos.
                    </p>
                  </div>

                  <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                    <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-150">
                      <div className="p-1 bg-emerald-50 text-emerald-600 rounded mt-0.5">
                        <CheckCircle2 size={12} />
                      </div>
                      <div>
                        <strong className="text-slate-700 block font-bold">Oficina de QVL (Quadro Valor de Lugar)</strong>
                        <span className="text-slate-500 leading-normal text-[11px] block mt-0.5">Utilizar material dourado de madeira para simular reagrupamentos ordinais com os alunos para sanar o Item 10 (Adição com reserva).</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-150">
                      <div className="p-1 bg-emerald-50 text-emerald-600 rounded mt-0.5">
                        <CheckCircle2 size={12} />
                      </div>
                      <div>
                        <strong className="text-slate-700 block font-bold">Reta Numérica Dinâmica no Chão</strong>
                        <span className="text-slate-500 leading-normal text-[11px] block mt-0.5">Criar retas adesivas nas salas para os estudantes caminharem para frente e para trás para interiorizar 'adição', 'subtração' e 'quanto falta'.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-150">
                      <div className="p-1 bg-emerald-50 text-emerald-600 rounded mt-0.5">
                        <CheckCircle2 size={12} />
                      </div>
                      <div>
                        <strong className="text-slate-700 block font-bold">Uso Frequente de Minipesquisas de Rotina</strong>
                        <span className="text-slate-500 leading-normal text-[11px] block mt-0.5">Fazer os alunos coletarem dados da turma (lanche predileto, aniversário) e transformá-los coletivamente em tabelas e gráficos simples para sanar o D007_J.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Performance Status Summary */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Níveis de Alerta da Rede</span>
              <div className="flex gap-3">
                <span className="flex items-center gap-1 font-semibold"><span className="w-2 h-2 rounded-full bg-red-500" /> &lt;70% Crítico</span>
                <span className="flex items-center gap-1 font-semibold"><span className="w-2 h-2 rounded-full bg-blue-500" /> 70-79% Médio</span>
                <span className="flex items-center gap-1 font-semibold"><span className="w-2 h-2 rounded-full bg-emerald-500" /> &ge;80% Forte</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* AI Pedagogical Diagnostics */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/20 rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Brain className="text-blue-600 shrink-0" size={22} />
            <div>
              <h3 className="text-base font-bold text-slate-800 font-display">Diagnóstico Interpretativo Automático</h3>
              <p className="text-xs text-slate-500">Gere análises pedagógicas aprofundadas com inteligência artificial para subsidiar tomadas de decisão</p>
            </div>
          </div>
          <button
            onClick={fetchAiInsight}
            disabled={loadingAi}
            className="shrink-0 bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 active:scale-95 disabled:bg-blue-300 disabled:scale-100 transition-all flex items-center gap-1.5"
          >
            {loadingAi ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Analisando Rede...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Gerar Análise IA (Gemini)</span>
              </>
            )}
          </button>
        </div>

        {aiError && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-semibold mb-3">
            {aiError}
          </div>
        )}

        <div className="bg-white rounded-lg p-5 border border-slate-150 text-slate-700 text-sm leading-relaxed shadow-inner font-normal">
          <div className="markdown-body space-y-3 white-space-pre-wrap">
            {aiInsight.split('\n\n').map((paragraph, pIdx) => {
              // Simple markup converter for bold markers **
              const cleanP = paragraph.replace(/\*\*/g, '');
              return (
                <p key={pIdx}>
                  {paragraph.startsWith('###') ? (
                    <span className="font-extrabold text-slate-800 text-base block mt-2 mb-1">{cleanP.replace('###', '')}</span>
                  ) : paragraph.startsWith('-') || paragraph.match(/^\d+\./) ? (
                    <span className="block pl-3 border-l-2 border-blue-500 my-1 font-medium text-slate-600">{paragraph}</span>
                  ) : (
                    paragraph.split('**').map((chunk, cIdx) => 
                      cIdx % 2 === 1 ? <strong key={cIdx} className="font-bold text-slate-900">{chunk}</strong> : chunk
                    )
                  )}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
