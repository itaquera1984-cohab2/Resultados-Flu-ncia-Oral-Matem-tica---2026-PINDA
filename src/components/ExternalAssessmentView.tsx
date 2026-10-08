import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  HelpCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  BarChart4,
  Check,
  Building,
  GraduationCap,
  Users,
  Search,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import { ExternalAssessmentState, NetworkData, ResultadoAvaliacao } from '../types';
import * as XLSX from 'xlsx';
import { DESCRIPTORS, ITEMS } from '../data';

interface ExternalAssessmentViewProps {
  externalData: ExternalAssessmentState;
  networkData: NetworkData;
  onClear: () => void;
}

type SortField = 'escola' | 'previstos' | 'avaliados' | 'avaliados_pct' | 'parcial_pct' | 'minimo_pct' | 'excedeu_pct' | 'sucesso';
type SortDirection = 'asc' | 'desc';

export default function ExternalAssessmentView({ externalData, networkData, onClear }: ExternalAssessmentViewProps) {
  const { municipio, escolas, dataCarga } = externalData;

  // Local navigation tab: 'rede' (Municipal overview) or 'escolas' (Detailed schools analytical dashboard)
  const [activeSubTab, setActiveSubTab] = useState<'rede' | 'escolas'>('rede');
  const [selectedSchoolName, setSelectedSchoolName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // School list sorting state
  const [sortField, setSortField] = useState<SortField>('escola');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Initialize selected school if none selected
  useMemo(() => {
    if (escolas.length > 0 && !selectedSchoolName) {
      // Find Maria Aparecida Arantes Vasques by default as a great benchmark
      const arantes = escolas.find(e => e.escola?.toUpperCase().includes('ARANTES VASQUES'));
      if (arantes) {
        setSelectedSchoolName(arantes.escola || '');
      } else {
        setSelectedSchoolName(escolas[0].escola || '');
      }
    }
  }, [escolas, selectedSchoolName]);

  // Get active selected school object
  const selectedSchool = useMemo(() => {
    return escolas.find(e => e.escola === selectedSchoolName) || null;
  }, [escolas, selectedSchoolName]);

  // Handle header sorting click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending for numbers
    }
  };

  // Filter and sort schools
  const filteredAndSortedSchools = useMemo(() => {
    let result = [...escolas];

    // Filter by search
    if (searchTerm) {
      const cleanSearch = searchTerm.toLowerCase();
      result = result.filter(e => e.escola?.toLowerCase().includes(cleanSearch));
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any = '';
      let bVal: any = '';

      if (sortField === 'escola') {
        aVal = a.escola || '';
        bVal = b.escola || '';
      } else if (sortField === 'sucesso') {
        aVal = a.minimo_pct + a.excedeu_pct;
        bVal = b.minimo_pct + b.excedeu_pct;
      } else {
        aVal = a[sortField] || 0;
        bVal = b[sortField] || 0;
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [escolas, searchTerm, sortField, sortDirection]);

  // Find best/worst descriptors factually (MUNICIPALITY)
  const municipalDescriptorHighlights = useMemo(() => {
    if (!municipio) return { best: null, worst: null };
    const entries = Object.entries(municipio.descritores).filter(([_, v]) => v !== null) as [string, number][];
    if (entries.length === 0) return { best: null, worst: null };
    
    let best = entries[0];
    let worst = entries[0];
    
    entries.forEach(entry => {
      if (entry[1] > best[1]) best = entry;
      if (entry[1] < worst[1]) worst = entry;
    });

    const bestDesc = DESCRIPTORS.find(d => d.id === best[0])?.description || '';
    const worstDesc = DESCRIPTORS.find(d => d.id === worst[0])?.description || '';

    return {
      best: { id: best[0], val: best[1], label: bestDesc },
      worst: { id: worst[0], val: worst[1], label: worstDesc }
    };
  }, [municipio]);

  // Find best/worst items factually (MUNICIPALITY)
  const municipalItemHighlights = useMemo(() => {
    if (!municipio) return { best: null, worst: null };
    const entries = Object.entries(municipio.itens).filter(([_, v]) => v !== null) as [string, number][];
    if (entries.length === 0) return { best: null, worst: null };
    
    let best = entries[0];
    let worst = entries[0];
    
    entries.forEach(entry => {
      if (entry[1] > best[1]) best = entry;
      if (entry[1] < worst[1]) worst = entry;
    });

    const bestTheme = ITEMS.find(it => it.id === best[0])?.theme || '';
    const worstTheme = ITEMS.find(it => it.id === worst[0])?.theme || '';

    return {
      best: { id: best[0], val: best[1], label: bestTheme },
      worst: { id: worst[0], val: worst[1], label: worstTheme }
    };
  }, [municipio]);

  // Export multi-sheet Excel with 100% data fidelity
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // SHEET 1: MUNICIPIO (1 line)
    if (municipio) {
      const munRow: Record<string, any> = {
        'Avaliação': 'Avaliação Oral de Matemática 2026',
        'Rede': 'Municipal',
        'Ano Escolar': '2º ano',
        'Componente Curricular': 'Matemática Oral',
        'Estado': 'SP',
        'Regional': 'Pindamonhangaba',
        'Município': 'Pindamonhangaba',
        'Previstos': municipio.previstos,
        'Avaliados': municipio.avaliados,
        'Avaliados (%)': municipio.avaliados_pct,
        'Atingiu parcialmente o mínimo (%)': municipio.parcial_pct,
        'Atingiu o mínimo (%)': municipio.minimo_pct,
        'Excedeu o mínimo (%)': municipio.excedeu_pct,
      };

      DESCRIPTORS.forEach(d => {
        munRow[`${d.id} (%)`] = municipio.descritores[d.id] !== null ? municipio.descritores[d.id] : '';
      });

      ITEMS.forEach(it => {
        munRow[`${it.id} (%)`] = municipio.itens[it.id] !== null ? municipio.itens[it.id] : '';
      });

      const wsMun = XLSX.utils.json_to_sheet([munRow]);
      XLSX.utils.book_append_sheet(wb, wsMun, 'Municipio');
    }

    // SHEET 2: ESCOLAS (37 lines)
    const escolaRows = escolas.map(esc => {
      const row: Record<string, any> = {
        'Escola': esc.escola,
        'Previstos': esc.previstos,
        'Avaliados': esc.avaliados,
        'Avaliados (%)': esc.avaliados_pct,
        'Atingiu parcialmente o mínimo (%)': esc.parcial_pct,
        'Atingiu o mínimo (%)': esc.minimo_pct,
        'Excedeu o mínimo (%)': esc.excedeu_pct
      };
      
      DESCRIPTORS.forEach(d => {
        row[`${d.id} (%)`] = esc.descritores[d.id] !== null ? esc.descritores[d.id] : '';
      });

      ITEMS.forEach(it => {
        row[`${it.id} (%)`] = esc.itens[it.id] !== null ? esc.itens[it.id] : '';
      });

      return row;
    });

    const wsEsc = XLSX.utils.json_to_sheet(escolaRows);
    XLSX.utils.book_append_sheet(wb, wsEsc, 'Escolas');

    // SHEET 3: DESCRITORES_LONG (Format longo)
    const descLongRows: any[] = [];
    if (municipio) {
      DESCRIPTORS.forEach(d => {
        descLongRows.push({
          'Unidade': 'CONSOLIDADO MUNICÍPIO',
          'Nível': 'MUNICIPIO',
          'Descritor': d.id,
          'Descrição Curricular': d.description,
          'Resultado (%)': municipio.descritores[d.id] !== null ? municipio.descritores[d.id] : ''
        });
      });
    }
    escolas.forEach(esc => {
      DESCRIPTORS.forEach(d => {
        descLongRows.push({
          'Unidade': esc.escola,
          'Nível': 'ESCOLA',
          'Descritor': d.id,
          'Descrição Curricular': d.description,
          'Resultado (%)': esc.descritores[d.id] !== null ? esc.descritores[d.id] : ''
        });
      });
    });

    const wsDescLong = XLSX.utils.json_to_sheet(descLongRows);
    XLSX.utils.book_append_sheet(wb, wsDescLong, 'Descritores_long');

    // SHEET 4: ITENS_LONG (Format longo)
    const itensLongRows: any[] = [];
    if (municipio) {
      ITEMS.forEach(it => {
        itensLongRows.push({
          'Unidade': 'CONSOLIDADO MUNICÍPIO',
          'Nível': 'MUNICIPIO',
          'Item': it.id,
          'Habilidade Avaliada': it.theme,
          'Descritor Relacionado': it.descriptorId,
          'Acerto (%)': municipio.itens[it.id] !== null ? municipio.itens[it.id] : ''
        });
      });
    }
    escolas.forEach(esc => {
      ITEMS.forEach(it => {
        itensLongRows.push({
          'Unidade': esc.escola,
          'Nível': 'ESCOLA',
          'Item': it.id,
          'Habilidade Avaliada': it.theme,
          'Descritor Relacionado': it.descriptorId,
          'Acerto (%)': esc.itens[it.id] !== null ? esc.itens[it.id] : ''
        });
      });
    });

    const wsItensLong = XLSX.utils.json_to_sheet(itensLongRows);
    XLSX.utils.book_append_sheet(wb, wsItensLong, 'Itens_long');

    // Trigger Excel download
    XLSX.writeFile(wb, `Avaliacao_Oral_Matematica_Pinda_2026_Relatorio_Completo.xlsx`);
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="external-assessment-view">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            <Layers size={13} />
            <span>Módulo de Avaliação Externa — Rede Municipal</span>
          </div>
          <h2 className="text-xl font-black mt-1 font-display tracking-tight text-white uppercase">
            AVALIAÇÃO ORAL DE MATEMÁTICA 2026
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 mt-2 font-medium">
            <span>Rede: <strong className="text-slate-200">Municipal (Pindamonhangaba)</strong></span>
            <span className="text-slate-600">•</span>
            <span>Escolas Ativas: <strong className="text-slate-200">37 Unidades</strong></span>
            <span className="text-slate-600">•</span>
            <span>Carga da Base: <strong className="text-slate-200">{dataCarga}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 flex shrink-0">
            <button
              onClick={() => setActiveSubTab('rede')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeSubTab === 'rede' ? 'bg-blue-600 text-white font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Visão Rede
            </button>
            <button
              onClick={() => setActiveSubTab('escolas')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeSubTab === 'escolas' ? 'bg-blue-600 text-white font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Análise Escolas
            </button>
          </div>

          <button
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Exportar dados consolidados em formato de quatro abas oficiais"
          >
            <FileSpreadsheet size={14} />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={onClear}
            className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-lg transition-all active:scale-95 cursor-pointer"
          >
            Remover Carga
          </button>
        </div>
      </div>

      {activeSubTab === 'rede' ? (
        /* ================= SUBTAB 1: MUNICIPAL CONSOLDATED VIEW ================= */
        <div className="space-y-8">
          
          {/* Key KPIs (Participation & performance bands side-by-side) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* KPI 1: Participation */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Participação</span>
                <div className="text-3xl font-black text-slate-900 mt-2 font-mono">
                  {municipio ? `${municipio.avaliados_pct}%` : '91%'}
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: municipio ? `${municipio.avaliados_pct}%` : '91%' }}></div>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase flex justify-between">
                <span>Previstos: {municipio?.previstos ?? 1881}</span>
                <span>Avaliados: {municipio?.avaliados ?? 1716}</span>
              </div>
            </div>

            {/* KPI 2: Parcial */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between border-l-4 border-l-amber-400">
              <div>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block">Parcial</span>
                <div className="text-3xl font-black text-slate-900 mt-2 font-mono">
                  {municipio ? `${municipio.parcial_pct}%` : '29%'}
                </div>
                <p className="text-[10px] text-slate-400 mt-2.5 font-semibold">Alunos que atingiram parcialmente o nível mínimo.</p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-extrabold uppercase">
                Alerta Pedagógico
              </div>
            </div>

            {/* KPI 3: Minimo */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between border-l-4 border-l-emerald-400">
              <div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">Mínimo</span>
                <div className="text-3xl font-black text-slate-900 mt-2 font-mono">
                  {municipio ? `${municipio.minimo_pct}%` : '44%'}
                </div>
                <p className="text-[10px] text-slate-400 mt-2.5 font-semibold">Alunos que atingiram exatamente o nível mínimo estabelecido.</p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 text-[10px] text-emerald-600 font-extrabold uppercase">
                Atingiu o Esperado
              </div>
            </div>

            {/* KPI 4: Excedeu */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between border-l-4 border-l-indigo-400">
              <div>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Excedeu</span>
                <div className="text-3xl font-black text-slate-900 mt-2 font-mono">
                  {municipio ? `${municipio.excedeu_pct}%` : '27%'}
                </div>
                <p className="text-[10px] text-slate-400 mt-2.5 font-semibold">Alunos que superaram a expectativa de desempenho mínimo.</p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 text-[10px] text-indigo-600 font-extrabold uppercase">
                Desempenho Elevado
              </div>
            </div>

          </div>

          {/* Performance Horizontal Distribution Bar Chart */}
          {municipio && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block">Distribuição do Desempenho na Rede (% das Faixas)</span>
              
              <div className="h-7 w-full rounded-lg overflow-hidden flex font-mono text-[10px] font-black text-white text-center shadow-xs">
                <div 
                  className="bg-amber-500 flex items-center justify-center transition-all duration-500 hover:opacity-90" 
                  style={{ width: `${municipio.parcial_pct}%` }}
                  title={`Parcial: ${municipio.parcial_pct}%`}
                >
                  Parcial: {municipio.parcial_pct}%
                </div>
                <div 
                  className="bg-emerald-500 flex items-center justify-center transition-all duration-500 hover:opacity-90" 
                  style={{ width: `${municipio.minimo_pct}%` }}
                  title={`Mínimo: ${municipio.minimo_pct}%`}
                >
                  Mínimo: {municipio.minimo_pct}%
                </div>
                <div 
                  className="bg-indigo-600 flex items-center justify-center transition-all duration-500 hover:opacity-90" 
                  style={{ width: `${municipio.excedeu_pct}%` }}
                  title={`Excedeu: ${municipio.excedeu_pct}%`}
                >
                  Excedeu: {municipio.excedeu_pct}%
                </div>
              </div>
              
              <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 pt-1 font-bold">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500"></span>Atingiu Parcialmente o Mínimo ({municipio.parcial_pct}%)</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span>Atingiu o Mínimo ({municipio.minimo_pct}%)</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-600"></span>Excedeu o Mínimo ({municipio.excedeu_pct}%)</span>
              </div>
            </div>
          )}

          {/* Highlights Card */}
          {municipio && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider font-display">
                Análise Factual de Resultados (Município Consolidado)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Positives */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Maior Desempenho</span>
                  
                  {municipalDescriptorHighlights.best && (
                    <div className="bg-white rounded-lg p-4 border border-slate-150 shadow-3xs flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase">
                          Descritor {municipalDescriptorHighlights.best.id}
                        </span>
                        <p className="text-xs font-semibold text-slate-600 mt-2 truncate" title={municipalDescriptorHighlights.best.label}>
                          {municipalDescriptorHighlights.best.label}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xl font-black text-slate-950">{municipalDescriptorHighlights.best.val}%</span>
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-0.5">Acerto</p>
                      </div>
                    </div>
                  )}

                  {municipalItemHighlights.best && (
                    <div className="bg-white rounded-lg p-4 border border-slate-150 shadow-3xs flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase">
                          {municipalItemHighlights.best.id}
                        </span>
                        <p className="text-xs font-semibold text-slate-600 mt-2 truncate" title={municipalItemHighlights.best.label}>
                          {municipalItemHighlights.best.label}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xl font-black text-slate-950">{municipalItemHighlights.best.val}%</span>
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-0.5">Acerto</p>
                      </div>
                    </div>
                  )}

                </div>

                {/* Challenges */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Menor Desempenho</span>

                  {municipalDescriptorHighlights.worst && (
                    <div className="bg-white rounded-lg p-4 border border-slate-150 shadow-3xs flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full uppercase">
                          Descritor {municipalDescriptorHighlights.worst.id}
                        </span>
                        <p className="text-xs font-semibold text-slate-600 mt-2 truncate" title={municipalDescriptorHighlights.worst.label}>
                          {municipalDescriptorHighlights.worst.label}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xl font-black text-slate-950">{municipalDescriptorHighlights.worst.val}%</span>
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-0.5">Acerto</p>
                      </div>
                    </div>
                  )}

                  {municipalItemHighlights.worst && (
                    <div className="bg-white rounded-lg p-4 border border-slate-150 shadow-3xs flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full uppercase">
                          {municipalItemHighlights.worst.id}
                        </span>
                        <p className="text-xs font-semibold text-slate-600 mt-2 truncate" title={municipalItemHighlights.worst.label}>
                          {municipalItemHighlights.worst.label}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xl font-black text-slate-950">{municipalItemHighlights.worst.val}%</span>
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-0.5">Acerto</p>
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* Descriptors & Items side-by-side comparative views */}
          {municipio && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* DESCRIPTORS */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider font-display">
                    Acertos por Descritor (Mapeamento Geral)
                  </h3>
                </div>

                <div className="p-5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="py-2">Métrica</th>
                          <th className="py-2">Habilidade Curricular</th>
                          <th className="py-2 text-right">Acerto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                        {DESCRIPTORS.map(desc => {
                          const val = municipio.descritores[desc.id];
                          if (val === null) return null;
                          return (
                            <tr key={desc.id} className="hover:bg-slate-50/20">
                              <td className="py-2.5 font-bold font-mono">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 border border-slate-200/50">
                                  {desc.id}
                                </span>
                              </td>
                              <td className="py-2.5 max-w-xs truncate text-[11px] font-normal text-slate-500" title={desc.description}>
                                {desc.description}
                              </td>
                              <td className="py-2.5 text-right font-black text-slate-900 text-sm">{val}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ITEMS LIST */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider font-display">
                    Acertos por Item de Avaliação
                  </h3>
                </div>

                <div className="p-5">
                  <div className="max-h-[360px] overflow-y-auto pr-1">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-white z-10 border-b border-slate-100 text-slate-400 uppercase font-bold">
                        <tr>
                          <th className="py-1.5 bg-white">Item</th>
                          <th className="py-1.5 bg-white">Habilidade Avaliada</th>
                          <th className="py-1.5 bg-white text-right">Resultado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                        {ITEMS.map(it => {
                          const val = municipio.itens[it.id];
                          if (val === null) return null;
                          return (
                            <tr key={it.id} className="hover:bg-slate-50/20">
                              <td className="py-2 font-black font-mono text-slate-900">{it.id}</td>
                              <td className="py-2 max-w-[220px] truncate text-[11px] font-normal text-slate-500" title={it.theme}>{it.theme}</td>
                              <td className="py-2 text-right font-black text-slate-800 text-sm">{val}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      ) : (
        /* ================= SUBTAB 2: DETAILED SCHOOLS DASHBOARD ================= */
        <div className="space-y-8 animate-fadeIn">
          
          {/* Main layout grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column (Dropdown selector & side-by-side comparison with network) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Dropdown Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Selecione uma Escola para Análise
                </label>
                
                <select
                  value={selectedSchoolName}
                  onChange={(e) => setSelectedSchoolName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs font-extrabold text-slate-800 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-hidden"
                >
                  {escolas.map((esc, idx) => (
                    <option key={idx} value={esc.escola || ''}>
                      {esc.escola}
                    </option>
                  ))}
                </select>
                
                <p className="text-[10px] text-slate-400 font-medium">
                  Selecione qualquer uma das 37 unidades para avaliar individualmente os descritores e itens informados.
                </p>
              </div>

              {/* SIDE-BY-SIDE ANALYTICS */}
              {selectedSchool && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider font-display flex items-center gap-2">
                      <Building size={14} className="text-blue-500" />
                      <span>Análise Comparativa</span>
                    </h3>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase">Escola × Município</span>
                  </div>

                  <div className="p-5 space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 truncate mb-3" title={selectedSchool.escola || ''}>
                        {selectedSchool.escola}
                      </h4>
                      
                      <div className="grid grid-cols-3 gap-3 text-center mb-5">
                        <div className="bg-slate-50/60 p-2.5 rounded-lg border border-slate-150/60">
                          <span className="text-[9px] font-black text-slate-400 uppercase block">Previstos</span>
                          <span className="text-sm font-black text-slate-900 mt-1 block font-mono">{selectedSchool.previstos}</span>
                        </div>
                        <div className="bg-slate-50/60 p-2.5 rounded-lg border border-slate-150/60">
                          <span className="text-[9px] font-black text-slate-400 uppercase block">Avaliados</span>
                          <span className="text-sm font-black text-slate-900 mt-1 block font-mono">{selectedSchool.avaliados}</span>
                        </div>
                        <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50">
                          <span className="text-[9px] font-black text-blue-500 uppercase block">Participação</span>
                          <span className="text-sm font-black text-blue-800 mt-1 block font-mono">{selectedSchool.avaliados_pct}%</span>
                        </div>
                      </div>

                      {/* Performance bands side-by-side bars */}
                      <div className="space-y-3.5 border-t border-slate-100 pt-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Níveis de Desempenho</span>
                        
                        {/* Parcial */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-600">Atingiu Parcialmente (Alerta)</span>
                            <div className="flex gap-2">
                              <span className="text-amber-600">Escola: {selectedSchool.parcial_pct}%</span>
                              <span className="text-slate-400">| Rede: {municipio?.parcial_pct}%</span>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            <div className="bg-amber-400 rounded-full" style={{ width: `${selectedSchool.parcial_pct}%` }}></div>
                          </div>
                        </div>

                        {/* Mínimo */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-600">Atingiu o Mínimo</span>
                            <div className="flex gap-2">
                              <span className="text-emerald-600">Escola: {selectedSchool.minimo_pct}%</span>
                              <span className="text-slate-400">| Rede: {municipio?.minimo_pct}%</span>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            <div className="bg-emerald-500 rounded-full" style={{ width: `${selectedSchool.minimo_pct}%` }}></div>
                          </div>
                        </div>

                        {/* Excedeu */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-600">Excedeu o Mínimo</span>
                            <div className="flex gap-2">
                              <span className="text-indigo-600">Escola: {selectedSchool.excedeu_pct}%</span>
                              <span className="text-slate-400">| Rede: {municipio?.excedeu_pct}%</span>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            <div className="bg-indigo-600 rounded-full" style={{ width: `${selectedSchool.excedeu_pct}%` }}></div>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column (Descriptors and Items comparison lists) */}
            <div className="lg:col-span-7 space-y-6">
              
              {selectedSchool && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs p-5">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider font-display mb-4">
                    Comparativo Detalhado de Descritores e Itens (Escola × Município)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Descritores Escola x Rede */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Acertos por Descritor</span>
                      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                        {DESCRIPTORS.map(d => {
                          const sVal = selectedSchool.descritores[d.id];
                          const mVal = municipio ? municipio.descritores[d.id] : null;
                          const hasValue = sVal !== null && sVal !== undefined;

                          return (
                            <div key={d.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/40 text-[11px] font-bold">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-mono bg-slate-200/60 px-1.5 py-0.5 rounded text-[9px]">{d.id}</span>
                                <div className="flex gap-2 font-mono">
                                  <span className="text-slate-800">Escola: <strong className={hasValue ? "text-slate-900" : "text-slate-400"}>{hasValue ? `${sVal}%` : '-'}</strong></span>
                                  {mVal !== null && <span className="text-slate-400">Rede: {mVal}%</span>}
                                </div>
                              </div>
                              <p className="text-[10px] font-normal text-slate-400 truncate" title={d.description}>{d.description}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Itens Escola x Rede */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Acertos por Item de Prova</span>
                      <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                        {ITEMS.map(it => {
                          const sVal = selectedSchool.itens[it.id];
                          const mVal = municipio ? municipio.itens[it.id] : null;
                          const hasValue = sVal !== null && sVal !== undefined;

                          return (
                            <div key={it.id} className="bg-slate-50 p-2 rounded border border-slate-200/30 text-[10px] font-bold flex items-center justify-between">
                              <span className="font-mono text-slate-900">{it.id}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-slate-600 font-mono">
                                  Escola: <strong className={hasValue ? "text-slate-950 font-black" : "text-slate-400 font-normal"}>
                                    {hasValue ? `${sVal}%` : '-'}
                                  </strong>
                                </span>
                                {mVal !== null && (
                                  <span className="text-slate-400 font-mono text-[9px]">
                                    Rede: {mVal}%
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>

          </div>

          {/* DATATABLE RANKING OF ALL 37 SCHOOLS */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider font-display">
                  Tabela Completa de Desempenho e Ranking (37 Escolas)
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold">Os dados exibidos refletem exatamente os percentuais contidos no arquivo oficial.</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar escola pelo nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-hidden"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/30">
                    <th onClick={() => handleSort('escola')} className="py-3 px-5 cursor-pointer hover:bg-slate-150/50 select-none">
                      <div className="flex items-center gap-1.5">
                        <span>Unidade Escolar</span>
                        <ArrowUpDown size={11} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('previstos')} className="py-3 px-4 text-right cursor-pointer hover:bg-slate-150/50 select-none">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span>Prev</span>
                        <ArrowUpDown size={11} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('avaliados')} className="py-3 px-4 text-right cursor-pointer hover:bg-slate-150/50 select-none">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span>Aval</span>
                        <ArrowUpDown size={11} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('avaliados_pct')} className="py-3 px-4 text-right cursor-pointer hover:bg-slate-150/50 select-none text-blue-600">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span>Part (%)</span>
                        <ArrowUpDown size={11} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('parcial_pct')} className="py-3 px-4 text-right cursor-pointer hover:bg-slate-150/50 select-none text-amber-600">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span>Parcial (%)</span>
                        <ArrowUpDown size={11} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('minimo_pct')} className="py-3 px-4 text-right cursor-pointer hover:bg-slate-150/50 select-none text-emerald-600">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span>Mínimo (%)</span>
                        <ArrowUpDown size={11} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('excedeu_pct')} className="py-3 px-4 text-right cursor-pointer hover:bg-slate-150/50 select-none text-indigo-600">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span>Excedeu (%)</span>
                        <ArrowUpDown size={11} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('sucesso')} className="py-3 px-5 text-right cursor-pointer hover:bg-slate-150/50 select-none bg-blue-50/50 font-extrabold text-blue-700">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span>Sucesso (%)</span>
                        <ArrowUpDown size={11} />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredAndSortedSchools.map((esc, idx) => {
                    const isSelected = esc.escola === selectedSchoolName;
                    const sucesso = esc.minimo_pct + esc.excedeu_pct;
                    
                    return (
                      <tr 
                        key={idx} 
                        onClick={() => setSelectedSchoolName(esc.escola || '')}
                        className={`hover:bg-slate-50 transition-all cursor-pointer ${
                          isSelected ? 'bg-blue-50/30 font-extrabold border-l-4 border-l-blue-600' : ''
                        }`}
                      >
                        <td className="py-3 px-5 text-slate-900 font-extrabold truncate max-w-sm">{esc.escola}</td>
                        <td className="py-3 px-4 text-right font-mono">{esc.previstos}</td>
                        <td className="py-3 px-4 text-right font-mono">{esc.avaliados}</td>
                        <td className="py-3 px-4 text-right font-mono text-blue-700">{esc.avaliados_pct}%</td>
                        <td className="py-3 px-4 text-right font-mono text-amber-700">{esc.parcial_pct}%</td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-700">{esc.minimo_pct}%</td>
                        <td className="py-3 px-4 text-right font-mono text-indigo-700">{esc.excedeu_pct}%</td>
                        <td className="py-3 px-5 text-right font-mono text-blue-900 font-black bg-blue-50/10">{sucesso}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredAndSortedSchools.length === 0 && (
              <div className="p-8 text-center text-slate-400 font-semibold">
                Nenhuma escola encontrada correspondendo ao filtro de busca "{searchTerm}".
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
