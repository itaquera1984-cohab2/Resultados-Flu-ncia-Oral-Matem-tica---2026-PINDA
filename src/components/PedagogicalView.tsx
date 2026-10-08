/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from 'react';
import { SchoolData, ClassData, NetworkData } from '../types';
import { DESCRIPTORS, ITEMS } from '../data';
import { AlertTriangle, ShieldCheck, HelpCircle, FileText, Printer, CheckCircle, Flame, Activity } from 'lucide-react';

interface PedagogicalViewProps {
  schools: SchoolData[];
  classes: ClassData[];
  networkData: NetworkData;
  onGenerateReport?: () => void;
}

export default function PedagogicalView({ schools, classes, networkData, onGenerateReport }: PedagogicalViewProps) {
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Classified Schools based on priorities
  const classifiedSchools = useMemo(() => {
    return schools.map(sch => {
      let priority: 'high' | 'medium' | 'low' = 'low';
      let justification = '';

      if (sch.sucesso < 65 || sch.participacao < 80) {
        priority = 'high';
        justification = sch.sucesso < 65 
          ? `Desempenho crítico (${sch.sucesso}% sucesso)` 
          : `Participação crítica (${sch.participacao}%)`;
      } else if (sch.sucesso < 76) {
        priority = 'medium';
        justification = 'Rendimento intermediário (requer monitoramento)';
      } else {
        priority = 'low';
        justification = 'Nível de excelência consolidado';
      }

      return {
        ...sch,
        priority,
        justification
      };
    });
  }, [schools]);

  const formatSchoolName = (name: string) => {
    if (name.startsWith('E.M.')) return name;
    return `E.M. ${name}`;
  };

  const prioritySchools = useMemo(() => {
    return {
      high: classifiedSchools.filter(s => s.priority === 'high').map(s => s.nomeEscola),
      medium: classifiedSchools.filter(s => s.priority === 'medium').map(s => s.nomeEscola),
      low: classifiedSchools.filter(s => s.priority === 'low').map(s => s.nomeEscola),
    };
  }, [classifiedSchools]);

  const schoolCounts = useMemo(() => {
    return {
      total: classifiedSchools.length,
      high: prioritySchools.high.length,
      medium: prioritySchools.medium.length,
      low: prioritySchools.low.length,
    };
  }, [prioritySchools, classifiedSchools]);

  const filteredClassifiedSchools = useMemo(() => {
    if (priorityFilter === 'all') return classifiedSchools;
    return classifiedSchools.filter(s => s.priority === priorityFilter);
  }, [classifiedSchools, priorityFilter]);

  // Critical elements across the entire network (average < 70%)
  const networkCriticalDescriptors = useMemo(() => {
    return DESCRIPTORS.map(desc => ({
      ...desc,
      value: networkData.descritores[desc.id] || 0
    })).filter(d => d.value < 70);
  }, [networkData]);

  const networkCriticalItems = useMemo(() => {
    return ITEMS.map(it => ({
      ...it,
      value: networkData.itens[it.id] || 0
    })).filter(i => i.value < 70).sort((a, b) => a.value - b.value);
  }, [networkData]);

  // Dynamic pedagogical planning suggestions based on active dataset deficiencies
  const pedagogicalGuidelines = useMemo(() => {
    const suggestions: { title: string; challenge: string; action: string }[] = [];

    const isSubtraçãoCritical = (networkData.descritores['D004_J'] || 0) < 70;
    const isMedidasCritical = (networkData.descritores['D006_J'] || 0) < 70;
    const isAdicaoCritical = (networkData.descritores['D003_J'] || 0) < 70;

    if (isSubtraçãoCritical) {
      suggestions.push({
        title: 'D004_J (Subtração) - Práticas para Retirar e Comparar',
        challenge: `A rede apresenta rendimento crítico de ${networkData.descritores['D004_J']}% em resolução de subtrações.`,
        action: 'Aplicar a metodologia de "Linha do Tempo de Contagem Regressiva" usando barbantes e pregadores na parede da sala. Os alunos devem andar fisicamente para trás ou remover pregadores resolvendo problemas orais cotidianos, promovendo a compreensão tátil da retirada de elementos.'
      });
    }

    if (isMedidasCritical) {
      suggestions.push({
        title: 'D006_J (Grandezas e Medidas) - Estimativas Ativas',
        challenge: `A rede apresenta rendimento de ${networkData.descritores['D006_J']}% no manuseio de unidades de medida e sistema monetário.`,
        action: 'Montar um "Mercadinho Matemático" permanente na sala. Usando embalagens reais e dinheirinho de papel, desafiar os alunos a realizar compras de dois produtos, estimar troco de moedas e medir o peso (massa) ou tamanho das caixas utilizando réguas e balanças domésticas manuais.'
      });
    }

    if (isAdicaoCritical) {
      suggestions.push({
        title: 'D003_J (Adição) - Desafio das Três Parcelas',
        challenge: `Média de ${networkData.descritores['D003_J']}% em adição com múltiplas parcelas ou transporte decimal.`,
        action: 'Utilizar o jogo "Trilha de Dados Multiplicados": cada estudante joga três dados de seis lados de uma vez, devendo realizar a somatória oral rápida de todas as três faces. Caso explique corretamente o método de agrupamento (ex: juntar os que formam dez primeiro), o aluno avança duas casas.'
      });
    }

    // Default general suggestion
    suggestions.push({
      title: 'D007_J (Leitura de Dados) - Gráficos de Chamada Diária',
      challenge: 'Garantir que os alunos consolidem a leitura de tabelas de dupla entrada e gráficos simples.',
      action: 'Transformar a chamada diária da sala em um gráfico de barras vivo. Todo dia, os alunos colam seus nomes (presença) divididos em colunas de meninos e meninas. No final da semana, realizam as perguntas orais: "Qual dia teve mais presença?", "Qual a diferença entre presenças de ontem e hoje?".'
    });

    return suggestions;
  }, [networkData]);

  // Direct native print call
  const triggerPrint = () => {
    window.print();
  };

  return (
    <div id="pedagogical-view" className="space-y-8 animate-fadeIn print:bg-white print:p-4">
      {/* Title Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-5 rounded-xl border border-slate-150 print:border-none print:bg-transparent">
        <div>
          <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Painel Pedagógico de Equidade</span>
          <h1 className="text-2xl font-bold text-slate-800 font-display mt-1">Diagnóstico & Priorização Pedagógica 2026</h1>
          <p className="text-sm text-slate-500 mt-0.5">Ferramenta estratégica para alocação de recursos pedagógicos, focado em equidade escolar</p>
        </div>
        <button
          onClick={onGenerateReport}
          className="shrink-0 bg-blue-600 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 print:hidden"
        >
          <FileText size={15} />
          <span>Gerar relatório de Priorização Pedagógica</span>
        </button>
      </div>

      {/* Network critical areas summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
        {/* Critical descriptors */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <AlertTriangle className="text-red-500 animate-pulse" size={17} />
            <span>Descritores Críticos Globais (&lt; 70%)</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Competências abaixo do rendimento ideal na média de todas as escolas da rede</p>
          
          <div className="space-y-3">
            {networkCriticalDescriptors.map(d => (
              <div key={d.id} className="p-3 bg-red-50 rounded-lg border border-red-100 flex justify-between items-center text-xs">
                <div className="max-w-[80%]">
                  <span className="font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded mr-2">{d.id}</span>
                  <span className="text-slate-700 font-medium leading-relaxed">{d.description}</span>
                </div>
                <span className="font-black text-red-600 text-sm">{d.value}%</span>
              </div>
            ))}
            {networkCriticalDescriptors.length === 0 && (
              <div className="p-4 text-center bg-green-50 text-green-700 border border-green-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-2">
                <ShieldCheck size={16} />
                <span>Nenhum descritor encontra-se em patamar crítico municipal! Excelência demonstrada.</span>
              </div>
            )}
          </div>
        </div>

        {/* Critical items */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Activity className="text-amber-500" size={17} />
            <span>Itens de Avaliação Mais Críticos na Rede</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Os 6 itens individuais da prova de matemática com menor taxa de acerto municipal</p>
          
          <div className="grid grid-cols-2 gap-3">
            {networkCriticalItems.slice(0, 6).map(it => (
              <div key={it.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs flex justify-between items-center">
                <div className="truncate max-w-[70%]">
                  <span className="font-bold text-slate-700">{it.id}</span>
                  <p className="text-[10px] text-slate-400 truncate font-semibold">{it.theme}</p>
                </div>
                <span className="font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded text-[11px]">{it.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Equity prioritization matrix layout */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-800 mb-2">Classificação por Prioridade Pedagógica (Matriz de Apoio)</h3>
        <p className="text-xs text-slate-500 mb-6">Mapeamento estratégico classificando as escolas em prioridade de ação para coordenação municipal.</p>

        {/* Categories togglers cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 print:hidden">
          <button
            onClick={() => setPriorityFilter('all')}
            className={`p-4 rounded-xl text-left border transition-all ${
              priorityFilter === 'all' ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ver Todas</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{schoolCounts.total}</span>
            <span className="text-xs text-slate-500 font-medium block mt-1">Escolas avaliadas</span>
          </button>

          <button
            onClick={() => setPriorityFilter('high')}
            className={`p-4 rounded-xl text-left border transition-all relative group ${
              priorityFilter === 'high' ? 'bg-red-50 border-red-500 ring-1 ring-red-500/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">Alta Prioridade</span>
              <Flame size={16} className="text-red-500" />
            </div>
            <span className="text-2xl font-black text-red-600 mt-1 block">{schoolCounts.high}</span>
            <span className="text-xs text-slate-500 font-medium block mt-1">Abaixo de 65% sucesso</span>

            {/* Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-slate-900/95 backdrop-blur-sm text-white text-[11px] rounded-xl p-3.5 shadow-2xl z-50 w-64 max-h-48 overflow-y-auto pointer-events-none border border-slate-700/50 font-sans leading-relaxed text-left">
              <div className="font-extrabold text-red-400 uppercase tracking-wider mb-2 text-[10px] border-b border-slate-700/50 pb-1.5 flex justify-between">
                <span>Escolas ({prioritySchools.high.length})</span>
                <span>Alta Prioridade</span>
              </div>
              {prioritySchools.high.length > 0 ? (
                <ul className="list-disc pl-3.5 space-y-1 font-bold text-slate-200">
                  {prioritySchools.high.map(s => (
                    <li key={s} className="truncate">{formatSchoolName(s)}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 italic">Nenhuma escola</p>
              )}
            </div>
          </button>

          <button
            onClick={() => setPriorityFilter('medium')}
            className={`p-4 rounded-xl text-left border transition-all relative group ${
              priorityFilter === 'medium' ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Média Prioridade</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{schoolCounts.medium}</span>
            <span className="text-xs text-slate-500 font-medium block mt-1">Entre 65% e 76% sucesso</span>

            {/* Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-slate-900/95 backdrop-blur-sm text-white text-[11px] rounded-xl p-3.5 shadow-2xl z-50 w-64 max-h-48 overflow-y-auto pointer-events-none border border-slate-700/50 font-sans leading-relaxed text-left">
              <div className="font-extrabold text-amber-400 uppercase tracking-wider mb-2 text-[10px] border-b border-slate-700/50 pb-1.5 flex justify-between">
                <span>Escolas ({prioritySchools.medium.length})</span>
                <span>Média Prioridade</span>
              </div>
              {prioritySchools.medium.length > 0 ? (
                <ul className="list-disc pl-3.5 space-y-1 font-bold text-slate-200">
                  {prioritySchools.medium.map(s => (
                    <li key={s} className="truncate">{formatSchoolName(s)}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 italic">Nenhuma escola</p>
              )}
            </div>
          </button>

          <button
            onClick={() => setPriorityFilter('low')}
            className={`p-4 rounded-xl text-left border transition-all relative group ${
              priorityFilter === 'low' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Baixa Prioridade</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{schoolCounts.low}</span>
            <span className="text-xs text-slate-500 font-medium block mt-1">Superior a 76% sucesso</span>

            {/* Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-slate-900/95 backdrop-blur-sm text-white text-[11px] rounded-xl p-3.5 shadow-2xl z-50 w-64 max-h-48 overflow-y-auto pointer-events-none border border-slate-700/50 font-sans leading-relaxed text-left">
              <div className="font-extrabold text-emerald-400 uppercase tracking-wider mb-2 text-[10px] border-b border-slate-700/50 pb-1.5 flex justify-between">
                <span>Escolas ({prioritySchools.low.length})</span>
                <span>Baixa Prioridade</span>
              </div>
              {prioritySchools.low.length > 0 ? (
                <ul className="list-disc pl-3.5 space-y-1 font-bold text-slate-200">
                  {prioritySchools.low.map(s => (
                    <li key={s} className="truncate">{formatSchoolName(s)}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 italic">Nenhuma escola</p>
              )}
            </div>
          </button>
        </div>

        {/* Priority Filtered Schools Table */}
        <div className="overflow-hidden border border-slate-150 rounded-lg">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 text-xs font-bold text-slate-600 flex justify-between">
            <span>Listagem Classificada: {priorityFilter === 'all' ? 'Todas' : priorityFilter === 'high' ? 'Alta prioridade' : priorityFilter === 'medium' ? 'Média prioridade' : 'Baixa prioridade'}</span>
            <span>{filteredClassifiedSchools.length} registros</span>
          </div>

          <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
            <table className="min-w-full divide-y divide-slate-150 text-xs">
              <thead className="bg-slate-50 sticky top-0">
                <tr className="text-left font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="px-5 py-3">Escola</th>
                  <th className="px-4 py-3 text-center">Part. %</th>
                  <th className="px-4 py-3 text-center">Sucesso %</th>
                  <th className="px-4 py-3 text-center">Prioridade</th>
                  <th className="px-5 py-3">Justificativa da Classificação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredClassifiedSchools.map(sch => (
                  <tr key={sch.nomeEscola} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-bold text-slate-800">{sch.nomeEscola}</td>
                    <td className="px-4 py-3 text-center">{sch.participacao}%</td>
                    <td className="px-4 py-3 text-center text-blue-700 font-black">{sch.sucesso}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        sch.priority === 'high' ? 'bg-red-100 text-red-800' :
                        sch.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {sch.priority === 'high' ? 'Alta' : sch.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 font-normal">{sch.justification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Actionable Pedagogical Plans */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-1.5">
          <FileText className="text-blue-600" size={19} />
          <span>Diretrizes Pedagógicas e Planos de Ação Recomentados</span>
        </h3>
        <p className="text-xs text-slate-400 mb-6">Sugestões dinâmicas elaboradas com base nos principais gargalos observados na rede municipal</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pedagogicalGuidelines.map((gd, idx) => (
            <div key={idx} className="p-5 rounded-xl border border-slate-150 bg-slate-50/30 space-y-3">
              <span className="text-[11px] font-black bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase">
                {gd.title}
              </span>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Desafio Mapeado</span>
                <p className="text-xs text-slate-600 font-bold mt-0.5">{gd.challenge}</p>
              </div>
              <div className="border-t border-slate-100 pt-2">
                <span className="text-[10px] text-blue-600 uppercase font-bold block">Ação Pedagógica Recomendada</span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">{gd.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
