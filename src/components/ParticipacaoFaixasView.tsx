/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { SchoolData } from '../types';
import { Search, Layers, Percent, GraduationCap, Users } from 'lucide-react';

export const SCHOOL_DISPLAY_NAMES: Record<string, string> = {
  "EM PROFA MARIA MADUREIRA SALGADO DONA MINICA": "DONA MINICA",
  "ESCOLA MUN PADRE MARIO ANTONIO BONOTTI REDENTORISTA": "BONOTTI (PADRE MARIO)",
  "ESCOLA MUNICIPAL ABDIAS JUNIOR SANTIAGO E SILVA": "ABDIAS JUNIOR",
  "ESCOLA MUNICIPAL ARTHUR DE ANDRADE": "ARTHUR DE ANDRADE",
  "ESCOLA MUNICIPAL DOUTOR ANGELO PAZ DA SILVA": "ANGELO PAZ",
  "ESCOLA MUNICIPAL DR ANDRE FRANCO MONTORO": "ANDRE FRANCO MONTORO",
  "ESCOLA MUNICIPAL DR FRANCISCO DE ASSIS CESAR": "FRANCISCO DE ASSIS",
  "ESCOLA MUNICIPAL DULCE PEDROSA ROMEIRO GUIMARAES": "DULCE PEDROSA",
  "ESCOLA MUNICIPAL JOAO CESARIO": "JOAO CESARIO",
  "ESCOLA MUNICIPAL JOAO KOLENDA LEMOS": "JOAO KOLENDA",
  "ESCOLA MUNICIPAL JOSE GONCALVES DA SILVA SEU JUQUINHA": "SEU JUQUINHA",
  "ESCOLA MUNICIPAL PADRE ZEZINHO": "PADRE ZEZINHO",
  "ESCOLA MUNICIPAL PROF LAURO VICENTE DE AZEVEDO": "LAURO VICENTE",
  "ESCOLA MUNICIPAL PROFA MADALENA CALTABIANO SALUM BENJAMIM": "MADALENA CALTABIANO",
  "ESCOLA MUNICIPAL PROFA MARIA APARECIDA ARANTES VASQUES": "ARANTES VASQUES",
  "ESCOLA MUNICIPAL PROFA MARIA APARECIDA CAMARGO DE SOUZA": "MARIA APARECIDA CAMARGO",
  "ESCOLA MUNICIPAL PROFA MARIA HELENA RIBEIRO VILELA": "MARIA HELENA RIBEIRO",
  "ESCOLA MUNICIPAL PROFA MARIA ZARA MINE RENOLDI DOS SANTOS": "MARIA ZARA",
  "ESCOLA MUNICIPAL PROFA ODETE CORREA MADUREIRA": "ODETE CORREA",
  "ESCOLA MUNICIPAL PROFA RACHEL DE AGUIAR LOBERTO": "RACHEL DE AGUIAR",
  "ESCOLA MUNICIPAL PROFA REGINA CELIA MADUREIRA DE SOUZA LIMA": "REGINA CELIA",
  "ESCOLA MUNICIPAL PROFESSOR ALEXANDRE MACHADO SALGADO": "ALEXANDRE MACHADO",
  "ESCOLA MUNICIPAL PROFESSOR AUGUSTO CESAR RIBEIRO": "AUGUSTO CESAR",
  "ESCOLA MUNICIPAL PROFESSOR ELIAS BARGIS MATHIAS": "ELIAS BARGIS",
  "ESCOLA MUNICIPAL PROFESSOR FELIX ADIB MIGUEL": "FELIX ADIB",
  "ESCOLA MUNICIPAL PROFESSOR JOAQUIM PEREIRA DA SILVA": "JOAQUIM PEREIRA",
  "ESCOLA MUNICIPAL PROFESSOR MARIO DE ASSIS CESAR": "MARIO DE ASSIS",
  "ESCOLA MUNICIPAL PROFESSOR MOACYR DE ALMEIDA": "MOACYR DE ALMEIDA",
  "ESCOLA MUNICIPAL PROFESSOR ORLANDO PIRES": "ORLANDO PIRES",
  "ESCOLA MUNICIPAL PROFESSOR PAULO FREIRE": "PAULO FREIRE",
  "ESCOLA MUNICIPAL PROFESSORA GILDA PIORINI MOLICA": "GILDA PIORINI",
  "ESCOLA MUNICIPAL PROFESSORA ISABEL DO CARMO NOGUEIRA": "ISABEL DO CARMO",
  "ESCOLA MUNICIPAL PROFESSORA JULIETA REALE VIEIRA": "JULIETA REALE",
  "ESCOLA MUNICIPAL PROFESSORA RUTH AZEVEDO ROMEIRO": "RUTH AZEVEDO",
  "ESCOLA MUNICIPAL PROFESSORA YVONE APPARECIDA ARANTES CORREA": "YVONE ARANTES",
  "ESCOLA MUNICIPAL SERAFIM FERREIRA SR SARA": "SERAFIM FERREIRA",
  "ESCOLA MUNICIPAL VITO ARDITO": "VITO ARDITO"
};

export function getSchoolDisplayName(fullName: string): string {
  if (SCHOOL_DISPLAY_NAMES[fullName]) return SCHOOL_DISPLAY_NAMES[fullName];

  // Robust fallback lookup by comparing normalized characters
  const norm = (s: string) => s.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9]/g, '').replace('ESCOLAMUNICIPAL', '').replace('ESCOLAMUN', '').replace('EM', '');
  const targetNorm = norm(fullName);

  for (const [key, val] of Object.entries(SCHOOL_DISPLAY_NAMES)) {
    if (norm(key) === targetNorm || key.includes(fullName) || fullName.includes(key)) {
      return val;
    }
  }

  return fullName;
}

interface ParticipacaoFaixasViewProps {
  schools: SchoolData[];
  onGenerateReport?: () => void;
}

export default function ParticipacaoFaixasView({ schools, onGenerateReport }: ParticipacaoFaixasViewProps) {
  const [search, setSearch] = useState('');

  // Calculate totals for footer confirmation
  const totals = useMemo(() => {
    let sumPrevistos = 0;
    let sumAvaliados = 0;
    schools.forEach(s => {
      sumPrevistos += s.previstos;
      sumAvaliados += s.avaliados;
    });
    return {
      sumPrevistos,
      sumAvaliados,
      count: schools.length
    };
  }, [schools]);

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

  return (
    <div id="participacao-faixas-view" className="space-y-6 animate-fadeIn">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Monitoramento de Cobertura
          </span>
          <h1 className="text-2xl font-bold text-slate-800 font-display mt-1">
            Participação e Faixas de Aprendizagem
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Participação fidedigna por escola e percentuais de alunos em cada patamar de proficiência
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          {/* Search input to assist audit */}
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
            <span>Gerar relatório — Participação e Faixas</span>
          </button>
        </div>
      </div>

      {/* Main Table Grid Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 text-center">#</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Escola</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-24">Previstos</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-24">Avaliados</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-28">Avaliados (%)</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right text-red-600 bg-red-50/20 w-32">
                  Parcial (%)
                </th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right text-amber-600 bg-amber-50/20 w-32">
                  Mínimo (%)
                </th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right text-emerald-600 bg-emerald-50/20 w-32">
                  Excedeu (%)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchools.map((school) => (
                <tr 
                  key={school.nomeEscola} 
                  className="hover:bg-slate-50/50 transition-colors"
                >
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
                  <td className="px-4 py-3.5 text-sm font-mono text-slate-600 text-right font-medium">
                    {school.previstos}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-mono text-slate-600 text-right font-medium">
                    {school.avaliados}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center justify-end px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                      {school.participacao}%
                    </span>
                  </td>
                  {/* Parcial */}
                  <td className="px-4 py-3.5 text-right bg-red-50/10">
                    <span className="text-sm font-bold font-mono text-red-600">
                      {school.parcial}%
                    </span>
                  </td>
                  {/* Minimo */}
                  <td className="px-4 py-3.5 text-right bg-amber-50/10">
                    <span className="text-sm font-bold font-mono text-amber-600">
                      {school.minimo}%
                    </span>
                  </td>
                  {/* Excedeu */}
                  <td className="px-4 py-3.5 text-right bg-emerald-50/10">
                    <span className="text-sm font-bold font-mono text-emerald-600">
                      {school.excedeu}%
                    </span>
                  </td>
                </tr>
              ))}
              {filteredSchools.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-400 font-medium">
                    Nenhuma escola encontrada correspondente aos critérios de busca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Obligatory Footer Summary Row */}
        <div className="bg-slate-900 text-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-800 text-xs font-mono font-bold uppercase tracking-wider">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-blue-400"></span>
              Soma Previstos = <strong className="text-white font-extrabold text-sm">{totals.sumPrevistos}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              Soma Avaliados = <strong className="text-white font-extrabold text-sm">{totals.sumAvaliados}</strong>
            </span>
            <span className="text-slate-400">
              Média de Participação = <span className="text-white font-extrabold text-sm">{Math.round((totals.sumAvaliados / totals.sumPrevistos) * 100)}%</span>
            </span>
          </div>
          <div className="text-blue-400">
            N = {totals.count} escolas
          </div>
        </div>
      </div>
    </div>
  );
}
