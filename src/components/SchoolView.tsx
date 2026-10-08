/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, Fragment } from 'react';
import { SchoolData, ClassData, NetworkData } from '../types';
import { DESCRIPTORS, ITEMS } from '../data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, GraduationCap, School, Percent, AlertTriangle, Sparkles, Brain, Loader2 } from 'lucide-react';
import { formatSchoolName } from '../utils/schoolNames';
import { formatVulnerabilityPercentage, getClassVulnerability, getSchoolVulnerability } from '../utils/vulnerability';

interface SchoolViewProps {
  schools: SchoolData[];
  classes: ClassData[];
  networkData: NetworkData;
  onGenerateReport?: (schoolName: string) => void;
}

function getClassCellBadgeStyle(val: number | null | undefined): string {
  if (val === null || val === undefined) return 'text-slate-300 bg-slate-50 border-slate-200/40';
  if (val < 50) return 'bg-red-50 text-red-700 border-red-200/60';
  if (val < 70) return 'bg-amber-50 text-amber-700 border-amber-200/60';
  if (val < 85) return 'bg-blue-50 text-blue-700 border-blue-200/60';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
}

export default function SchoolView({ schools, classes, networkData, onGenerateReport }: SchoolViewProps) {
  const [selectedSchoolName, setSelectedSchoolName] = useState<string>(schools[0]?.nomeEscola || '');
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('' );

  const selectedSchool = useMemo(() => {
    return schools.find(s => s.nomeEscola === selectedSchoolName);
  }, [schools, selectedSchoolName]);

  const schoolClasses = useMemo(() => {
    return classes.filter(c => c.nomeEscola === selectedSchoolName);
  }, [classes, selectedSchoolName]);

  // Dual Bar Data for Descriptors (School vs Network)
  const descriptorChartData = useMemo(() => {
    if (!selectedSchool) return [];
    return DESCRIPTORS.map(desc => ({
      name: desc.id,
      'Escola (%)': selectedSchool.descritores[desc.id] || 0,
      'Rede (%)': networkData.descritores[desc.id] || 0
    }));
  }, [selectedSchool, networkData]);

  // Dual Bar Data for Items (School vs Network)
  const itemsChartData = useMemo(() => {
    if (!selectedSchool) return [];
    return ITEMS.map(item => ({
      name: item.id.replace('Item ', 'I'),
      'Escola (%)': selectedSchool.itens[item.id] || 0,
      'Rede (%)': networkData.itens[item.id] || 0
    }));
  }, [selectedSchool, networkData]);

  // Identify top 3 weaknesses of the school compared to the network average
  const topWeaknesses = useMemo(() => {
    if (!selectedSchool) return [];
    const gaps = DESCRIPTORS.map(desc => {
      const schVal = selectedSchool.descritores[desc.id] || 0;
      const netVal = networkData.descritores[desc.id] || 0;
      return {
        id: desc.id,
        description: desc.description,
        schVal,
        netVal,
        gap: schVal - netVal // negative gap means school is below network
      };
    });

    // Sort by gap ascending (largest negative gap first)
    return gaps.sort((a, b) => a.gap - b.gap).slice(0, 3);
  }, [selectedSchool, networkData]);

  // Trigger Gemini API for specific school report
  const fetchSchoolAiInsight = async () => {
    if (!selectedSchool) return;
    setLoadingAi(true);
    setAiError('');
    try {
      const response = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityName: selectedSchool.nomeEscola,
          entityType: 'Escola',
          performance: {
            participacao: selectedSchool.participacao,
            previstos: selectedSchool.previstos,
            avaliados: selectedSchool.avaliados,
            parcial: selectedSchool.parcial,
            minimo: selectedSchool.minimo,
            excedeu: selectedSchool.excedeu,
            sucesso: selectedSchool.sucesso,
            descritores: selectedSchool.descritores,
            itens: selectedSchool.itens
          },
          networkAvg: networkData
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao acionar servidor de inteligência artificial.');
      }

      const data = await response.json();
      setAiInsight(data.text);
    } catch (err: any) {
      setAiError(err.message || 'Erro ao carregar o relatório de IA.');
    } finally {
      setLoadingAi(false);
    }
  };

  // Pre-load dynamic static report when school changes
  useEffect(() => {
    if (!selectedSchool) return;
    const isWorse = selectedSchool.sucesso < networkAvgSuccess;
    const diff = Math.abs(selectedSchool.sucesso - networkAvgSuccess);
    const primaryWeakness = topWeaknesses[0];

    let fallbackText = `### Análise Pedagógica Preliminar - ${selectedSchool.nomeEscola}\n\n`;
    fallbackText += `A escola **${selectedSchool.nomeEscola}** apresenta uma taxa de participação de **${selectedSchool.participacao}%**, o que está **${selectedSchool.participacao >= 80 ? 'dentro' : 'abaixo'}** das metas de fidedignidade de dados. `;
    fallbackText += `O índice de sucesso geral é de **${selectedSchool.sucesso}%**, operando **${isWorse ? `${diff} p.p. abaixo` : `${diff} p.p. acima`}** da média agregada do município de Pindamonhangaba (${networkAvgSuccess}%).\n\n`;

    if (primaryWeakness && primaryWeakness.gap < 0) {
      fallbackText += `**Prioridade Pedagógica Focada:** A maior lacuna em relação à rede está associada ao descritor **${primaryWeakness.id}** (${primaryWeakness.description}), onde a escola registra **${primaryWeakness.schVal}%** de acertos vs **${primaryWeakness.netVal}%** da média municipal (uma diferença de **${Math.abs(primaryWeakness.gap)} p.p.**). `;
      fallbackText += `Focar esforços imediatos em materiais concretos e revisões desta habilidade é vital para equilibrar o aprendizado da turma.\n\n`;
    } else {
      fallbackText += `**Pontos Fortes:** A unidade apresenta consistência pedagógica exemplar. Todos os descritores encontram-se emparelhados ou acima do consolidado da rede municipal, mostrando maturidade do plano de ensino local.\n\n`;
    }

    fallbackText += `**Próximo Passo Recomendado:** Reúna os professores das **${schoolClasses.length} turmas** mapeadas abaixo para alinhar estratégias orais e acompanhamento individualizado de alunos no patamar parcial (atualmente em **${selectedSchool.parcial}%**).`;

    setAiInsight(fallbackText);
  }, [selectedSchoolName, selectedSchool, topWeaknesses]);

  const networkAvgSuccess = networkData.sucesso;

  const renderComparisonValue = (schValue: number, netValue: number) => {
    const diff = schValue - netValue;
    const isPositive = diff >= 0;
    return (
      <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        <span>{isPositive ? '+' : ''}{diff} p.p. vs Rede</span>
      </div>
    );
  };

  if (!selectedSchool) {
    return <div className="text-center p-8 text-slate-500">Nenhuma escola cadastrada ou dados ausentes.</div>;
  }

  return (
    <div id="school-view" className="space-y-6 animate-fadeIn">
      {/* Selector controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <School size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Drill-Down Individual</span>
            <h2 className="text-lg font-bold text-slate-800 font-display">Selecione uma Escola da Rede</h2>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
          <div className="w-full sm:w-72">
            <select
              value={selectedSchoolName}
              onChange={(e) => setSelectedSchoolName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {schools.map(sch => (
                <option key={sch.nomeEscola} value={sch.nomeEscola}>
                  {sch.nomeEscola}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => onGenerateReport?.(selectedSchoolName)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <span>Gerar relatório da Escola</span>
          </button>
        </div>
      </div>

      {/* Título Principal da Escola Selecionada */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <span className="text-[10px] font-black tracking-wider text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-md">
          Escola Selecionada
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight font-display mt-3">
          {formatSchoolName(selectedSchool.nomeEscola)}
        </h1>
        <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
          Abaixo estão consolidados os indicadores de participação, sucesso geral, descritores de habilidade e itens pedagógicos da avaliação oral de matemática para esta unidade escolar em 2026.
        </p>
      </div>

      {/* School KPIs comparing to Network */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* KPI 1 - Previstos */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estudantes Previstos</span>
            <Users size={16} className="text-slate-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-800">{selectedSchool.previstos}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Total matriculado no 2º ano</p>
          </div>
        </div>

        {/* KPI 2 - Participação */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taxa de Participação</span>
            <Percent size={16} className="text-slate-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-800">{selectedSchool.participacao}%</span>
            {renderComparisonValue(selectedSchool.participacao, networkData.participacao)}
          </div>
        </div>

        {/* KPI 3 - Sucesso */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Indicador de Sucesso</span>
            <GraduationCap size={16} className="text-slate-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-800">{selectedSchool.sucesso}%</span>
            {renderComparisonValue(selectedSchool.sucesso, networkData.sucesso)}
          </div>
        </div>

        {/* KPI 4 - Parcial */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nível Parcial (Crítico)</span>
            <AlertTriangle size={16} className="text-red-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-red-500">{selectedSchool.parcial}%</span>
            {renderComparisonValue(selectedSchool.parcial, networkData.parcial)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-violet-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-violet-500 uppercase tracking-wider">Vulnerabilidade</span>
            <Users size={16} className="text-violet-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-violet-700">
              {formatVulnerabilityPercentage(getSchoolVulnerability(selectedSchool.nomeEscola, classes, selectedSchool.previstos).percentage)}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {getSchoolVulnerability(selectedSchool.nomeEscola, classes, selectedSchool.previstos).count} estudantes
            </p>
          </div>
        </div>
      </div>

      {/* Dual Charts block: Descriptors & Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Descriptors comparisons */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">Descritores: Escola x Rede</h3>
          <p className="text-xs text-slate-400 mb-4">Rendimento em percentual de acerto por habilidade comparado ao consolidado municipal</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={descriptorChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis domain={[0, 100]} fontSize={10} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend iconSize={10} fontSize={11} wrapperStyle={{ paddingTop: 10 }} />
                <Bar dataKey="Escola (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Rede (%)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Items comparisons */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">Itens de Avaliação: Escola x Rede</h3>
          <p className="text-xs text-slate-400 mb-4">Taxa de acerto nos 27 itens da prova individual de matemática (I1 a I27)</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={itemsChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={9} interval={0} />
                <YAxis domain={[0, 100]} fontSize={10} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend iconSize={10} fontSize={11} wrapperStyle={{ paddingTop: 10 }} />
                <Bar dataKey="Escola (%)" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Rede (%)" fill="#e2e8f0" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weaknesses Highlight & AI Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 3 greatest weaknesses */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1">
              <AlertTriangle className="text-red-500" size={16} />
              <span>Maiores Fragilidades Pedagógicas</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Habilidades prioritárias para intervenção, identificadas com base na diferença negativa com a rede</p>
          </div>

          <div className="space-y-4 my-2 flex-1 flex flex-col justify-center">
            {topWeaknesses.map(wk => {
              const hasNegativeGap = wk.gap < 0;
              return (
                <div key={wk.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-3">
                  <div className={`p-1.5 rounded-md font-bold text-xs shrink-0 ${hasNegativeGap ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'}`}>
                    {wk.id}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800 leading-tight">{wk.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold">
                      <span>Escola: <strong className="text-slate-800">{wk.schVal}%</strong></span>
                      <span>Rede: <strong className="text-slate-800">{wk.netVal}%</strong></span>
                      <span className={hasNegativeGap ? 'text-red-500' : 'text-green-600'}>
                        Diferença: {wk.gap > 0 ? '+' : ''}{wk.gap} p.p.
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI School Report */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-50 to-blue-50/20 rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-start">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-2">
              <Brain className="text-blue-600" size={20} />
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-display">Diagnóstico Local da Unidade</h3>
                <p className="text-[11px] text-slate-400">Análise de rendimento e sugestões direcionadas</p>
              </div>
            </div>
            <button
              onClick={fetchSchoolAiInsight}
              disabled={loadingAi}
              className="bg-blue-600 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg hover:bg-blue-700 active:scale-95 disabled:bg-blue-300 transition-all flex items-center gap-1"
            >
              {loadingAi ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              <span>Consultar Gemini</span>
            </button>
          </div>

          {aiError && (
            <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold mb-2">
              {aiError}
            </div>
          )}

          <div className="bg-white rounded-lg p-3.5 border border-slate-150 text-slate-700 text-[11px] sm:text-[11.5px] leading-relaxed h-auto overflow-visible shadow-inner flex-1 mt-0.5">
            <div className="markdown-body space-y-2 whitespace-pre-wrap">
              {aiInsight.split('\n\n').map((paragraph, pIdx) => {
                const cleanP = paragraph.replace(/\*\*/g, '');
                return (
                  <p key={pIdx}>
                    {paragraph.startsWith('###') ? (
                      <span className="font-bold text-slate-800 text-xs sm:text-sm block mt-1.5 mb-1">{cleanP.replace('###', '')}</span>
                    ) : paragraph.startsWith('1.') || paragraph.startsWith('2.') ? (
                      <span className="block pl-2 border-l-2 border-blue-500 font-medium text-slate-600">{paragraph}</span>
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

      {/* Embedded Table of Classes for this school */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Mapeamento de Turmas da Unidade</h3>
          <p className="text-xs text-slate-400 mt-0.5">Visão micro de desempenho de todas as {schoolClasses.length} turmas vinculadas a esta escola</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead>
              <tr className="bg-slate-50 text-left font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Código Turma</th>
                <th className="px-6 py-3">Nome da Turma</th>
                <th className="px-4 py-3 text-center">Previstos</th>
                <th className="px-4 py-3 text-center">Avaliados</th>
                <th className="px-4 py-3 text-center text-violet-600">Vulnerabilidade</th>
                <th className="px-4 py-3 text-center">Participação (%)</th>
                <th className="px-4 py-3 text-center text-red-500">Parcial (%)</th>
                <th className="px-4 py-3 text-center text-amber-500">Mínimo (%)</th>
                <th className="px-4 py-3 text-center text-green-500">Excedeu (%)</th>
                <th className="px-6 py-3 text-center bg-blue-50 text-blue-800 font-extrabold">Sucesso (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {schoolClasses.map(cls => {
                const partAlert = cls.participacao < 80;
                return (
                  <tr key={cls.codigoTurma} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-mono text-slate-400">{cls.codigoTurma}</td>
                    <td className="px-6 py-3 font-bold text-slate-800">{cls.nomeTurma}</td>
                    <td className="px-4 py-3 text-center">{cls.previstos}</td>
                    <td className="px-4 py-3 text-center">{cls.avaliados}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-violet-50 text-violet-700 border border-violet-200">
                        {formatVulnerabilityPercentage(getClassVulnerability(cls.nomeEscola, cls.nomeTurma, cls.previstos).percentage)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${partAlert ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {cls.participacao}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-red-600">{cls.parcial}%</td>
                    <td className="px-4 py-3 text-center text-amber-600">{cls.minimo}%</td>
                    <td className="px-4 py-3 text-center text-green-600">{cls.excedeu}%</td>
                    <td className="px-6 py-3 text-center bg-blue-50/30 font-extrabold text-blue-700">{cls.sucesso}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção Nova: Descritores da turma */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Descritores da turma</h3>
          <p className="text-xs text-slate-400 mt-0.5">Aproveitamento percentual nos 7 descritores essenciais (D001_J a D007_J) por turma</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs text-center">
            <thead>
              <tr className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-3.5 text-left w-1/4">Turma</th>
                <th className="px-4 py-3.5 font-mono bg-slate-100/30 w-24">D001</th>
                <th className="px-4 py-3.5 font-mono bg-slate-100/30 w-24">D002</th>
                <th className="px-4 py-3.5 font-mono bg-slate-100/30 w-24">D003</th>
                <th className="px-4 py-3.5 font-mono bg-slate-100/30 w-24">D004</th>
                <th className="px-4 py-3.5 font-mono bg-slate-100/30 w-24">D005</th>
                <th className="px-4 py-3.5 font-mono bg-slate-100/30 w-24">D006</th>
                <th className="px-4 py-3.5 font-mono bg-slate-100/30 w-24">D007</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {schoolClasses.map(cls => {
                const d1 = cls.descritores['D001_J'];
                const d2 = cls.descritores['D002_J'];
                const d3 = cls.descritores['D003_J'];
                const d4 = cls.descritores['D004_J'];
                const d5 = cls.descritores['D005_J'];
                const d6 = cls.descritores['D006_J'];
                const d7 = cls.descritores['D007_J'];

                return (
                  <tr key={cls.codigoTurma} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 text-left font-bold text-slate-800">
                      <div>{cls.nomeTurma}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{cls.codigoTurma} ({cls.avaliados} avaliados)</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold font-mono rounded-md border ${getClassCellBadgeStyle(d1)}`}>
                        {d1 !== null && d1 !== undefined ? `${d1}%` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold font-mono rounded-md border ${getClassCellBadgeStyle(d2)}`}>
                        {d2 !== null && d2 !== undefined ? `${d2}%` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold font-mono rounded-md border ${getClassCellBadgeStyle(d3)}`}>
                        {d3 !== null && d3 !== undefined ? `${d3}%` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold font-mono rounded-md border ${getClassCellBadgeStyle(d4)}`}>
                        {d4 !== null && d4 !== undefined ? `${d4}%` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold font-mono rounded-md border ${getClassCellBadgeStyle(d5)}`}>
                        {d5 !== null && d5 !== undefined ? `${d5}%` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold font-mono rounded-md border ${getClassCellBadgeStyle(d6)}`}>
                        {d6 !== null && d6 !== undefined ? `${d6}%` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold font-mono rounded-md border ${getClassCellBadgeStyle(d7)}`}>
                        {d7 !== null && d7 !== undefined ? `${d7}%` : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção Nova: Itens da turma */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Itens da turma</h3>
          <p className="text-xs text-slate-400 mt-0.5">Aproveitamento percentual nos 27 itens avaliados (divididos em duas linhas para melhor visualização sem barra de rolagem)</p>
        </div>
        <div className="p-5 space-y-6">
          {schoolClasses.map(cls => {
            return (
              <div key={cls.codigoTurma} className="bg-slate-50/30 rounded-xl border border-slate-200 p-4 shadow-sm">
                {/* Turma Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm md:text-base">{cls.nomeTurma}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Código da turma: {cls.codigoTurma}</p>
                  </div>
                  <div className="text-xs font-semibold text-blue-700 bg-blue-50/80 border border-blue-100 px-3 py-1 rounded-full w-fit self-start sm:self-center">
                    {cls.avaliados} alunos avaliados
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Bloco 1: Itens 01 a 14 */}
                  <div>
                    <div className="grid text-center font-bold text-slate-500 uppercase text-[10px] bg-slate-100/60 border border-slate-200 rounded-t-lg divide-x divide-slate-200" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
                      {ITEMS.slice(0, 14).map(item => {
                        const numStr = item.id.replace('Item ', '');
                        return (
                          <div key={item.id} className="py-2 font-mono text-center truncate px-0.5" title={`${item.id}: ${item.theme}`}>
                            I{numStr}
                          </div>
                        );
                      })}
                    </div>
                    <div className="grid text-center font-semibold text-slate-700 border-x border-b border-slate-200 rounded-b-lg divide-x divide-slate-200 bg-white shadow-inner" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
                      {ITEMS.slice(0, 14).map(item => {
                        const val = cls.itens[item.id];
                        return (
                          <div key={item.id} className="py-2.5 flex items-center justify-center">
                            <span className={`inline-block px-1.5 py-0.5 text-xs font-bold font-mono rounded-md border ${getClassCellBadgeStyle(val)}`}>
                              {val !== null && val !== undefined ? `${val}%` : '—'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bloco 2: Itens 15 a 27 */}
                  <div>
                    <div className="grid text-center font-bold text-slate-500 uppercase text-[10px] bg-slate-100/60 border border-slate-200 rounded-t-lg divide-x divide-slate-200" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
                      {ITEMS.slice(14).map(item => {
                        const numStr = item.id.replace('Item ', '');
                        return (
                          <div key={item.id} className="py-2 font-mono text-center truncate px-0.5" title={`${item.id}: ${item.theme}`}>
                            I{numStr}
                          </div>
                        );
                      })}
                      {/* Empty item placeholder cell to make it 14 columns */}
                      <div className="bg-slate-100/60 py-2"></div>
                    </div>
                    <div className="grid text-center font-semibold text-slate-700 border-x border-b border-slate-200 rounded-b-lg divide-x divide-slate-200 bg-white shadow-inner" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
                      {ITEMS.slice(14).map(item => {
                        const val = cls.itens[item.id];
                        return (
                          <div key={item.id} className="py-2.5 flex items-center justify-center">
                            <span className={`inline-block px-1.5 py-0.5 text-xs font-bold font-mono rounded-md border ${getClassCellBadgeStyle(val)}`}>
                              {val !== null && val !== undefined ? `${val}%` : '—'}
                            </span>
                          </div>
                        );
                      })}
                      {/* Empty cell to fill the 14 columns */}
                      <div className="py-2.5"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
