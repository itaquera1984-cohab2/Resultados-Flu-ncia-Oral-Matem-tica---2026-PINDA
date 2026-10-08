import { useMemo, useState } from 'react';
import { AlertTriangle, Award, Search, ShieldAlert, Target, TrendingUp, Users } from 'lucide-react';
import { STUDENT_PERFORMANCE_CLASSES } from '../studentPerformance';
import { STUDENT_RESULTS, PerformanceLevelCode } from '../studentResults';

const levelMeta: Record<PerformanceLevelCode, { label: string; className: string }> = {
  P: { label: 'Atingiu parcialmente o mínimo', className: 'bg-red-50 text-red-700 border-red-200' },
  M: { label: 'Atingiu o mínimo', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  E: { label: 'Excedeu o mínimo', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  N: { label: 'Não avaliado', className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const pct = (value: number | null) => value === null ? '—' : `${value.toFixed(0)}%`;

const priority = (partial: number | null, participation: number, exceeded: number | null) => {
  if (participation < 50) return { label: 'Dados insuficientes', tone: 'slate', score: 200 - participation };
  const score = (partial ?? 0) + Math.max(0, 80 - participation) * 1.5 + Math.max(0, 15 - (exceeded ?? 0)) * 0.7;
  if ((partial ?? 0) >= 60) return { label: 'Intervenção imediata', tone: 'red', score };
  if ((partial ?? 0) >= 45 || participation < 80) return { label: 'Alta prioridade', tone: 'amber', score };
  if ((partial ?? 0) >= 30) return { label: 'Acompanhamento', tone: 'blue', score };
  return { label: 'Consolidado', tone: 'emerald', score };
};

const badge: Record<string, string> = {
  red: 'bg-red-50 text-red-700 border-red-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function StudentResultsView() {
  const [search, setSearch] = useState('');
  const [onlyPriority, setOnlyPriority] = useState(true);
  const schoolsWithStudents = useMemo(() => [...new Set(STUDENT_RESULTS.map(item => item.school))].sort(), []);
  const [selectedSchool, setSelectedSchool] = useState(schoolsWithStudents[0] ?? '');
  const classesWithStudents = useMemo(
    () => STUDENT_RESULTS.filter(item => item.school === selectedSchool),
    [selectedSchool],
  );
  const [selectedClass, setSelectedClass] = useState('');
  const activeStudentGroup = classesWithStudents.find(item => item.className === selectedClass) ?? classesWithStudents[0];
  const studentCounts = useMemo(() => {
    const counts: Record<PerformanceLevelCode, number> = { P: 0, M: 0, E: 0, N: 0 };
    activeStudentGroup?.students.forEach(([, level]) => { counts[level] += 1; });
    return counts;
  }, [activeStudentGroup]);

  const rows = useMemo(() => STUDENT_PERFORMANCE_CLASSES.map(item => {
    const participation = item.expected ? item.evaluated / item.expected * 100 : 0;
    return { ...item, participation, priority: priority(item.partial, participation, item.exceeded) };
  }), []);

  const ranked = useMemo(() => rows
    .filter(row => row.evaluated > 0)
    .sort((a, b) => b.priority.score - a.priority.score), [rows]);

  const filtered = useMemo(() => rows.filter(row => {
    const matches = `${row.school} ${row.className}`.toLowerCase().includes(search.toLowerCase());
    const isPriority = ['Intervenção imediata', 'Alta prioridade', 'Dados insuficientes'].includes(row.priority.label);
    return matches && (!onlyPriority || isPriority);
  }).sort((a, b) => b.priority.score - a.priority.score), [rows, search, onlyPriority]);

  const schoolRanking = useMemo(() => {
    const map = new Map<string, { evaluated: number; partial: number; minimum: number; exceeded: number }>();
    rows.forEach(row => {
      if (!row.evaluated || row.partial === null || row.minimum === null || row.exceeded === null) return;
      const current = map.get(row.school) ?? { evaluated: 0, partial: 0, minimum: 0, exceeded: 0 };
      current.evaluated += row.evaluated;
      current.partial += row.evaluated * row.partial / 100;
      current.minimum += row.evaluated * row.minimum / 100;
      current.exceeded += row.evaluated * row.exceeded / 100;
      map.set(row.school, current);
    });
    return [...map.entries()].map(([school, value]) => ({
      school,
      evaluated: value.evaluated,
      partial: value.partial / value.evaluated * 100,
      minimum: value.minimum / value.evaluated * 100,
      exceeded: value.exceeded / value.evaluated * 100,
    })).sort((a, b) => b.partial - a.partial);
  }, [rows]);

  const immediate = rows.filter(row => row.priority.label === 'Intervenção imediata').length;
  const lowParticipation = rows.filter(row => row.participation < 80).length;
  const highExceeded = rows.filter(row => (row.exceeded ?? 0) >= 50 && row.participation >= 80).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-xl p-6 text-white shadow-sm">
        <span className="text-[10px] font-black tracking-widest uppercase text-blue-200">Resultados por estudante • CAEd 2026</span>
        <h1 className="text-2xl font-black mt-2">Mapa de Intervenção por Nível de Desempenho</h1>
        <p className="text-sm text-slate-300 mt-2 max-w-4xl">Análise gerencial das 102 turmas, construída a partir da classificação individual dos estudantes. A visualização prioriza equidade, confiabilidade da participação e direcionamento pedagógico, com consulta nominal por escola e turma.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Avaliados na rede', value: '1.716', detail: 'de 1.881 previstos', color: 'blue' },
          { icon: ShieldAlert, label: 'Atingiram parcialmente', value: '492 • 29%', detail: 'foco principal de intervenção', color: 'red' },
          { icon: Target, label: 'Atingiram o mínimo', value: '758 • 44%', detail: 'aprendizagem essencial', color: 'amber' },
          { icon: Award, label: 'Excederam o mínimo', value: '466 • 27%', detail: 'potencial de práticas de referência', color: 'emerald' },
        ].map(({ icon: Icon, label, value, detail, color }) => (
          <div key={label} className={`bg-white rounded-xl border border-${color}-200 p-5 shadow-sm`}>
            <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span><Icon size={18} className={`text-${color}-500`} /></div>
            <strong className={`text-2xl text-${color}-700 block mt-2`}>{value}</strong>
            <span className="text-[11px] text-slate-400">{detail}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 text-red-700"><AlertTriangle size={18}/><strong className="text-sm">{immediate} turmas em intervenção imediata</strong></div>
          <p className="text-xs text-red-700/80 mt-2">Turmas com 60% ou mais dos avaliados no nível “Atingiu parcialmente o mínimo”. Recomendação: plano intensivo, reagrupamentos temporários e monitoramento quinzenal.</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-2 text-amber-700"><ShieldAlert size={18}/><strong className="text-sm">{lowParticipation} turmas com baixa participação</strong></div>
          <p className="text-xs text-amber-700/80 mt-2">Resultados abaixo de 80% de participação exigem cautela. Recomenda-se completar a avaliação antes de decisões definitivas sobre aprendizagem.</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <div className="flex items-center gap-2 text-emerald-700"><TrendingUp size={18}/><strong className="text-sm">{highExceeded} turmas de referência</strong></div>
          <p className="text-xs text-emerald-700/80 mt-2">Turmas com ao menos 50% em “Excedeu o mínimo” e participação representativa. Indicação: mapear práticas docentes e promover intercâmbio pedagógico.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100"><h2 className="font-black text-slate-800">Turmas que mais demandam intervenção</h2><p className="text-xs text-slate-400 mt-1">Ranking considera desempenho e participação; baixa participação é sinalizada separadamente.</p></div>
          <div className="divide-y divide-slate-100">
            {ranked.slice(0, 8).map((row, index) => <div key={`${row.school}-${row.className}`} className="p-4 flex gap-3 items-center">
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">{index + 1}</span>
              <div className="min-w-0 flex-1"><strong className="text-xs text-slate-800 block truncate">{row.school}</strong><span className="text-[11px] text-slate-400">{row.className} • {row.evaluated} avaliados</span></div>
              <div className="text-right"><strong className="text-red-600">{pct(row.partial)}</strong><span className="block text-[9px] uppercase text-slate-400">parcial</span></div>
              <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${badge[row.priority.tone]}`}>{row.priority.label}</span>
            </div>)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100"><h2 className="font-black text-slate-800">Escolas com maior proporção no nível parcial</h2><p className="text-xs text-slate-400 mt-1">Consolidado ponderado pelos estudantes avaliados em cada turma.</p></div>
          <div className="p-5 space-y-4">
            {schoolRanking.slice(0, 8).map((school, index) => <div key={school.school}>
              <div className="flex justify-between gap-3 text-xs"><span className="font-bold text-slate-700 truncate">{index + 1}. {school.school}</span><strong className="text-red-600">{school.partial.toFixed(1)}%</strong></div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1"><div className="h-full bg-red-500 rounded-full" style={{ width: `${school.partial}%` }} /></div>
            </div>)}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase text-blue-600">Visão detalhada</span>
              <h2 className="font-black text-slate-800 mt-1">Estudantes por escola e turma</h2>
              <p className="text-xs text-slate-400 mt-1">Classificação nominal obtida diretamente na visão detalhada do CAEd.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0 xl:w-[620px]">
              <label className="text-[10px] font-bold uppercase text-slate-500">
                Escola
                <select
                  value={selectedSchool}
                  onChange={event => { setSelectedSchool(event.target.value); setSelectedClass(''); }}
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs normal-case text-slate-700"
                >
                  {schoolsWithStudents.map(school => <option key={school} value={school}>{school}</option>)}
                </select>
              </label>
              <label className="text-[10px] font-bold uppercase text-slate-500">
                Turma
                <select
                  value={activeStudentGroup?.className ?? ''}
                  onChange={event => setSelectedClass(event.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs normal-case text-slate-700"
                >
                  {classesWithStudents.map(item => <option key={item.className} value={item.className}>{item.className}</option>)}
                </select>
              </label>
            </div>
          </div>
        </div>

        {activeStudentGroup && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border-b border-slate-200">
              {(Object.keys(levelMeta) as PerformanceLevelCode[]).map(level => (
                <div key={level} className="bg-white p-4 text-center">
                  <strong className="text-xl text-slate-800 block">{studentCounts[level]}</strong>
                  <span className="text-[10px] text-slate-500">{levelMeta[level].label}</span>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase sticky top-0">
                  <tr><th className="text-left px-5 py-3">Estudante</th><th className="text-left px-5 py-3 w-72">Classificação</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeStudentGroup.students.map(([name, level]) => (
                    <tr key={name} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-700">{name}</td>
                      <td className="px-5 py-3"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${levelMeta[level].className}`}>{levelMeta[level].label}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div><h2 className="font-black text-slate-800">Mapa completo das turmas</h2><p className="text-xs text-slate-400">Ordenado por necessidade de atenção pedagógica.</p></div>
          <div className="flex gap-3"><label className="relative"><Search size={15} className="absolute left-3 top-2.5 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar escola ou turma" className="pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg w-56"/></label><button onClick={()=>setOnlyPriority(v=>!v)} className={`px-3 py-2 rounded-lg text-xs font-bold border ${onlyPriority?'bg-red-50 text-red-700 border-red-200':'bg-white text-slate-600 border-slate-200'}`}>{onlyPriority?'Somente prioridades':'Todas as turmas'}</button></div>
        </div>
        <div className="overflow-x-auto"><table className="min-w-full text-xs"><thead className="bg-slate-50 text-slate-500 uppercase"><tr><th className="text-left px-4 py-3">Escola / Turma</th><th className="px-3 py-3">Participação</th><th className="px-3 py-3 text-red-600">Parcial</th><th className="px-3 py-3 text-amber-600">Mínimo</th><th className="px-3 py-3 text-emerald-600">Excedeu</th><th className="px-4 py-3">Sinalização</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map(row=><tr key={`${row.school}-${row.className}`} className="hover:bg-slate-50"><td className="px-4 py-3"><strong className="text-slate-800 block">{row.school}</strong><span className="text-slate-400">{row.className} • {row.evaluated}/{row.expected} avaliados</span></td><td className="text-center font-bold">{row.participation.toFixed(0)}%</td><td className="text-center font-black text-red-600">{pct(row.partial)}</td><td className="text-center font-bold text-amber-600">{pct(row.minimum)}</td><td className="text-center font-bold text-emerald-600">{pct(row.exceeded)}</td><td className="px-4 py-3 text-center"><span className={`inline-block text-[9px] font-bold px-2 py-1 rounded-full border ${badge[row.priority.tone]}`}>{row.priority.label}</span></td></tr>)}</tbody></table></div>
      </div>
    </div>
  );
}
