/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, AlertCircle, HelpCircle, Award, Target, FileSpreadsheet } from 'lucide-react';
import { DESCRIPTORS } from '../data';

export default function InstructionsView() {
  return (
    <div id="instructions-view" className="space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white shadow-md">
        <h1 className="text-3xl font-extrabold font-display leading-tight mb-2">Guia Pedagógico de Interpretação</h1>
        <p className="text-blue-100 max-w-2xl text-lg">
          Entenda a metodologia, as métricas e as diretrizes curriculares que orientam a Avaliação Oral de Matemática de 2026.
        </p>
      </div>

      {/* 2-Column Core concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Níveis de Desempenho */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Award className="text-blue-600" size={20} />
            <span>Níveis de Desempenho da Avaliação</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex gap-4 p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="w-3 h-3 rounded-full bg-red-500 mt-1 shrink-0" />
              <div>
                <h3 className="font-bold text-red-800 text-sm">Atingiu Parcialmente o Mínimo (Crítico)</h3>
                <p className="text-xs text-red-700 mt-1">
                  O aluno demonstra sérias dificuldades para identificar numerais básicos, resolver operações de adição simples ou compreender enunciados. Requer atenção prioritária e nivelamento urgente.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="w-3 h-3 rounded-full bg-amber-500 mt-1 shrink-0" />
              <div>
                <h3 className="font-bold text-amber-800 text-sm">Atingiu o Mínimo (Intermediário)</h3>
                <p className="text-xs text-amber-700 mt-1">
                  O aluno possui a base operacional e consegue realizar a leitura numérica básica, resolver somas cotidianas e interpretar tabelas simples, porém apresenta lacunas em subtrações complexas ou leitura de medidas.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-1 shrink-0" />
              <div>
                <h3 className="font-bold text-green-800 text-sm">Excedeu o Mínimo (Consolidado)</h3>
                <p className="text-xs text-green-700 mt-1">
                  O aluno domina as competências propostas para o 2º ano, resolvendo adições de três parcelas, extraindo dados de tabelas de dupla entrada e executando subtrações de estimativa com autonomia.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Indicadores de Sucesso e Alertas */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertCircle className="text-blue-600" size={20} />
              <span>Regras de Negócio e Indicadores-Chave</span>
            </h2>

            <div className="space-y-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mb-1">
                  Indicador Principal de Sucesso
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  % (Atingiu o Mínimo + Excedeu o Mínimo)
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Consiste na soma dos níveis Intermediário e Consolidado. É a métrica mais importante para sinalizar que o aluno atingiu o patamar esperado de proficiência em matemática para a idade.
                </p>
              </div>

              <div>
                <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mb-1">
                  Alertas de Participação
                </span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="bg-emerald-50 text-emerald-800 p-2 rounded text-xs border border-emerald-100">
                    <span className="font-bold block">✓ Adequada (≥ 80%)</span> Representatividade sólida dos alunos da turma.
                  </div>
                  <div className="bg-amber-50 text-amber-800 p-2 rounded text-xs border border-amber-100">
                    <span className="font-bold block">⚠ Alerta (60% - 79%)</span> Requer busca ativa por evasão ou faltosos.
                  </div>
                  <div className="bg-red-50 text-red-800 p-2 rounded text-xs border border-red-100 col-span-2">
                    <span className="font-bold block">🚨 Crítica (&lt; 60%)</span> Dados estatisticamente frágeis. Intervenção imediata da equipe diretiva.
                  </div>
                </div>
              </div>

              <div>
                <span className="inline-block px-2.5 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded-full mb-1">
                  Nível Crítico Pedagógico
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Qualquer descritor de habilidade ou item individual com rendimento médio <span className="font-bold text-red-600">abaixo de 70%</span> é considerado um foco crítico de intervenção.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Descritores de Habilidade */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BookOpen className="text-blue-600" size={20} />
          <span>Matriz de Descritores da Avaliação Oral (2º Ano)</span>
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          A avaliação está baseada nas diretrizes curriculares nacionais (BNCC) para a alfabetização matemática inicial. Cada descritor engloba um grupo de itens específicos:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DESCRIPTORS.map((d, index) => (
            <div key={d.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">{d.id}</span>
                  <span className="text-[11px] text-slate-400 font-medium">Habilidade {index + 1}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {d.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Matriz de Priorização explanation */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Target className="text-blue-600" size={20} />
          <span>Matriz de Priorização (Foco em Equidade)</span>
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          Para auxiliar a supervisão de ensino a destinar recursos pedagógicos e horas de reforço escolar às unidades mais necessitadas, o sistema classifica automaticamente as escolas e turmas em três níveis de prioridade pedagógica:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border-l-4 border-l-red-500 shadow-sm">
            <h3 className="font-bold text-red-800 text-sm mb-1">Alta Prioridade</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Escolas/Turmas que apresentam o indicador de sucesso abaixo de 60% OU taxa de participação crítica abaixo de 80%. Necessita de apoio presencial imediato do formador e reestruturação de conteúdo.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border-l-4 border-l-amber-500 shadow-sm">
            <h3 className="font-bold text-amber-800 text-sm mb-1">Média Prioridade</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Escolas/Turmas com indicador de sucesso entre 60% e 75% e participação acima de 80%. Necessitam de acompanhamento preventivo, plantões de dúvidas estruturados e material de reforço específico.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border-l-4 border-l-emerald-500 shadow-sm">
            <h3 className="font-bold text-emerald-800 text-sm mb-1">Baixa Prioridade</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Escolas/Turmas que atingiram rendimento de sucesso superior a 75%. Estão no caminho certo e servem de modelo pedagógico (boas práticas) para as demais escolas da rede.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
