/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { SchoolData, ClassData, NetworkData } from '../types';
import { DESCRIPTORS, ITEMS } from '../data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, ChevronDown, Award, Users, Percent, GraduationCap, AlertTriangle, FileDown, CheckCircle } from 'lucide-react';
import { formatVulnerabilityPercentage, getClassVulnerability } from '../utils/vulnerability';

interface ClassViewProps {
  schools: SchoolData[];
  classes: ClassData[];
  networkData: NetworkData;
  onGenerateReport?: (schoolName: string, classCode: string) => void;
}

export default function ClassView({ schools, classes, networkData, onGenerateReport }: ClassViewProps) {
  const [selectedSchoolName, setSelectedSchoolName] = useState<string>(schools[0]?.nomeEscola || '');

  // Cascading classes list based on selected school
  const schoolClasses = useMemo(() => {
    return classes.filter(c => c.nomeEscola === selectedSchoolName);
  }, [classes, selectedSchoolName]);

  const [selectedClassCode, setSelectedClassCode] = useState<string>(schoolClasses[0]?.codigoTurma || '');

  // Safety fallback if selectedClassCode is not in the list of schoolClasses
  const activeClass = useMemo(() => {
    let cls = schoolClasses.find(c => c.codigoTurma === selectedClassCode);
    if (!cls && schoolClasses.length > 0) {
      cls = schoolClasses[0];
    }
    return cls;
  }, [schoolClasses, selectedClassCode]);

  const parentSchool = useMemo(() => {
    return schools.find(s => s.nomeEscola === selectedSchoolName);
  }, [schools, selectedSchoolName]);

  // Triple bar comparisons (Class vs School vs Network)
  const descriptorCompareData = useMemo(() => {
    if (!activeClass || !parentSchool) return [];
    return DESCRIPTORS.map(desc => ({
      name: desc.id,
      'Turma (%)': activeClass.descritores[desc.id] || 0,
      'Escola (%)': parentSchool.descritores[desc.id] || 0,
      'Rede (%)': networkData.descritores[desc.id] || 0
    }));
  }, [activeClass, parentSchool, networkData]);

  const itemsCompareData = useMemo(() => {
    if (!activeClass || !parentSchool) return [];
    return ITEMS.map(it => ({
      name: it.id.replace('Item ', 'I'),
      'Turma (%)': activeClass.itens[it.id] || 0,
      'Escola (%)': parentSchool.itens[it.id] || 0,
      'Rede (%)': networkData.itens[it.id] || 0
    }));
  }, [activeClass, parentSchool, networkData]);

  // Alert validations for active class
  const classAlerts = useMemo(() => {
    if (!activeClass) return [];
    const alertsList: { type: 'danger' | 'warning' | 'success'; message: string }[] = [];

    if (activeClass.participacao < 60) {
      alertsList.push({
        type: 'danger',
        message: `Taxa de participação crítica de ${activeClass.participacao}% (Abaixo de 60%). Requer busca ativa presencial urgente!`
      });
    } else if (activeClass.participacao < 80) {
      alertsList.push({
        type: 'warning',
        message: `Taxa de participação sob atenção: ${activeClass.participacao}% (Recomendável ≥ 80%).`
      });
    } else {
      alertsList.push({
        type: 'success',
        message: `Taxa de participação excelente de ${activeClass.participacao}%, dados fidedignos.`
      });
    }

    if (activeClass.parcial > 30) {
      alertsList.push({
        type: 'danger',
        message: `Alta taxa de alunos críticos: ${activeClass.parcial}% no patamar parcial. Nivelamento urgente recomendado.`
      });
    }

    if (activeClass.sucesso >= 80) {
      alertsList.push({
        type: 'success',
        message: `Alto rendimento educativo: ${activeClass.sucesso}% de sucesso na alfabetização matemática!`
      });
    }

    return alertsList;
  }, [activeClass]);

  // Table of all classes across the network
  const [tableSearch, setTableSearch] = useState('');
  const allFilteredClasses = useMemo(() => {
    return classes.filter(c =>
      c.nomeTurma.toLowerCase().includes(tableSearch.toLowerCase()) ||
      c.nomeEscola.toLowerCase().includes(tableSearch.toLowerCase())
    );
  }, [classes, tableSearch]);

  const exportAllClassesCsv = () => {
    const delimiter = ';';
    const headers = ['Código', 'Turma', 'Escola', 'Previstos', 'Avaliados', 'Participação (%)', 'Atingiu Parcialmente (%)', 'Atingiu Mínimo (%)', 'Excedeu Mínimo (%)', 'Sucesso (%)'];
    const rows = allFilteredClasses.map(c => [
      c.codigoTurma,
      c.nomeTurma,
      c.nomeEscola,
      c.previstos.toString(),
      c.avaliados.toString(),
      `${c.participacao}%`,
      `${c.parcial}%`,
      `${c.minimo}%`,
      `${c.excedeu}%`,
      `${c.sucesso}%`
    ]);

    const csvContent = headers.join(delimiter) + '\n' + rows.map(r => r.join(delimiter)).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Mapeamento_Turmas_Matematica_Pinda_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSchoolChange = (schoolName: string) => {
    setSelectedSchoolName(schoolName);
    const related = classes.filter(c => c.nomeEscola === schoolName);
    if (related.length > 0) {
      setSelectedClassCode(related[0].codigoTurma);
    }
  };

  return (
    <div id="class-view" className="space-y-6 animate-fadeIn">
      {/* Cascading selection filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Filtro Hierárquico de Turma</h2>
          <button
            onClick={() => onGenerateReport?.(selectedSchoolName, selectedClassCode || (schoolClasses[0]?.codigoTurma || ''))}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap self-stretch sm:self-auto"
          >
            <span>Gerar relatório da Turma</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Passo 1 – Selecione a Escola</label>
            <select
              value={selectedSchoolName}
              onChange={(e) => handleSchoolChange(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {schools.map(sch => (
                <option key={sch.nomeEscola} value={sch.nomeEscola}>
                  {sch.nomeEscola}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Passo 2 – Selecione a Turma</label>
            <select
              value={selectedClassCode}
              onChange={(e) => setSelectedClassCode(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {schoolClasses.map(cls => (
                <option key={cls.codigoTurma} value={cls.codigoTurma}>
                  {cls.nomeTurma} ({cls.codigoTurma})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {activeClass ? (
        <>
          {/* Class Core indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Avaliados / Previstos</span>
              <span className="text-2xl font-black text-slate-800 block mt-1">
                {activeClass.avaliados} <span className="text-xs font-normal text-slate-400">/ {activeClass.previstos}</span>
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Participação Turma</span>
              <span className={`text-2xl font-black block mt-1 ${activeClass.participacao < 80 ? 'text-amber-500' : 'text-slate-800'}`}>
                {activeClass.participacao}%
              </span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Sucesso da Turma</span>
              <span className="text-2xl font-black text-blue-600 block mt-1">{activeClass.sucesso}%</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Parcial (Alunos Críticos)</span>
              <span className="text-2xl font-black text-red-500 block mt-1">{activeClass.parcial}%</span>
            </div>
            <div className="bg-white rounded-xl border border-violet-200 p-5 shadow-sm">
              <span className="text-[10px] font-bold text-violet-500 uppercase">Vulnerabilidade da Turma</span>
              <span className="text-2xl font-black text-violet-700 block mt-1">
                {formatVulnerabilityPercentage(getClassVulnerability(activeClass.nomeEscola, activeClass.nomeTurma, activeClass.previstos).percentage)}
              </span>
              <span className="text-[10px] text-slate-400">
                {getClassVulnerability(activeClass.nomeEscola, activeClass.nomeTurma, activeClass.previstos).count} estudantes
              </span>
            </div>
          </div>

          {/* Active alerts warning box */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Diagnóstico de Alertas Pedagógicos</h3>
            <div className="space-y-2">
              {classAlerts.map((alt, idx) => (
                <div key={idx} className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2.5 ${
                  alt.type === 'danger' ? 'bg-red-50 text-red-800 border-red-100' :
                  alt.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-100' :
                  'bg-emerald-50 text-emerald-800 border-emerald-100'
                }`}>
                  {alt.type === 'danger' ? <AlertTriangle size={15} /> :
                   alt.type === 'warning' ? <AlertTriangle size={15} /> :
                   <CheckCircle size={15} />}
                  <span>{alt.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Triple comparisons (Class vs School vs Network) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Descriptors comparison */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">Descritores: Turma x Escola x Rede</h3>
              <p className="text-xs text-slate-400 mb-4">Comparação tripla de rendimento (%) para diagnosticar desvios entre turmas e a escola</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={descriptorCompareData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis domain={[0, 100]} fontSize={10} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Legend iconSize={8} fontSize={10} wrapperStyle={{ paddingTop: 10 }} />
                    <Bar dataKey="Turma (%)" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Escola (%)" fill="#60a5fa" opacity={0.6} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Rede (%)" fill="#cbd5e1" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Items comparison */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">Itens: Turma x Escola x Rede</h3>
              <p className="text-xs text-slate-400 mb-4">Foco em itens individuais da avaliação: identifique lacunas pontuais da turma</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={itemsCompareData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={9} />
                    <YAxis domain={[0, 100]} fontSize={10} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Legend iconSize={8} fontSize={10} wrapperStyle={{ paddingTop: 10 }} />
                    <Bar dataKey="Turma (%)" fill="#10b981" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Escola (%)" fill="#34d399" opacity={0.6} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Rede (%)" fill="#cbd5e1" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-slate-400">Por favor, selecione uma turma acima para carregar as análises.</div>
      )}

      {/* Complete searchable network class table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Mapeamento Geral de Turmas</h3>
            <p className="text-xs text-slate-400">Consulte os dados das {classes.length} turmas cadastradas na rede de Pindamonhangaba</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar por escola ou turma..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs w-full sm:w-60 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={exportAllClassesCsv}
              className="bg-white border border-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <FileDown size={14} />
              <span>Exportar Turmas</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead>
              <tr className="bg-slate-50/50 text-left font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-3.5">Código</th>
                <th className="px-6 py-3.5">Turma</th>
                <th className="px-6 py-3.5">Escola</th>
                <th className="px-4 py-3.5 text-center">Previstos</th>
                <th className="px-4 py-3.5 text-center">Avaliados</th>
                <th className="px-4 py-3.5 text-center text-violet-600">Vulnerabilidade</th>
                <th className="px-4 py-3.5 text-center">Participação (%)</th>
                <th className="px-4 py-3.5 text-center text-red-500">Parcial (%)</th>
                <th className="px-4 py-3.5 text-center text-amber-500">Mínimo (%)</th>
                <th className="px-4 py-3.5 text-center text-green-500">Excedeu (%)</th>
                <th className="px-6 py-3.5 text-center bg-blue-50 text-blue-800 font-extrabold">Sucesso (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {allFilteredClasses.map(cls => {
                const isUnderperforming = cls.sucesso < 70;
                const isLowParticipation = cls.participacao < 80;
                return (
                  <tr key={cls.codigoTurma} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-mono text-slate-400">{cls.codigoTurma}</td>
                    <td className="px-6 py-3 font-bold text-slate-800">{cls.nomeTurma}</td>
                    <td className="px-6 py-3 text-slate-600 max-w-xs truncate">{cls.nomeEscola}</td>
                    <td className="px-4 py-3 text-center">{cls.previstos}</td>
                    <td className="px-4 py-3 text-center">{cls.avaliados}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                        {formatVulnerabilityPercentage(getClassVulnerability(cls.nomeEscola, cls.nomeTurma, cls.previstos).percentage)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full ${isLowParticipation ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {cls.participacao}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-red-600">{cls.parcial}%</td>
                    <td className="px-4 py-3 text-center text-amber-600">{cls.minimo}%</td>
                    <td className="px-4 py-3 text-center text-green-600">{cls.excedeu}%</td>
                    <td className="px-6 py-3 text-center bg-blue-50/50 font-extrabold text-blue-700">{cls.sucesso}%</td>
                  </tr>
                );
              })}
              {allFilteredClasses.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-6 py-10 text-center text-slate-400">
                    Nenhuma turma correspondente encontrada.
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
