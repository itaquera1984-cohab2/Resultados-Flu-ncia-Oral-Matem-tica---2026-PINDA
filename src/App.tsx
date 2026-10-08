/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { generateSystemData } from './data';
import { NetworkData, SchoolData, ClassData, ExternalAssessmentState } from './types';
import NetworkView from './components/NetworkView';
import ParticipacaoFaixasView from './components/ParticipacaoFaixasView';
import DescritoresEscolaView from './components/DescritoresEscolaView';
import ItensEscolaView from './components/ItensEscolaView';
import SchoolView from './components/SchoolView';
import SetoresView from './components/SetoresView';
import CsvUploader from './components/CsvUploader';
import ExternalAssessmentView from './components/ExternalAssessmentView';
import ClassView from './components/ClassView';
import PedagogicalView from './components/PedagogicalView';
import StudentResultsView from './components/StudentResultsView';
import ReportModal from './components/ReportModal';
import { 
  LayoutDashboard, 
  BarChart3, 
  School, 
  Users, 
  BookOpen, 
  HelpCircle, 
  Upload, 
  RotateCcw, 
  ChevronDown,
  Sparkles,
  Info,
  Layers,
  Database,
  List,
  Building2,
  FileText,
  Activity
  ,UserRoundSearch
} from 'lucide-react';

type TabType = 'rede' | 'resultados_alunos' | 'participacao_faixas' | 'descritores_escola' | 'itens_escola' | 'setores' | 'escola_drill' | 'turma_drill' | 'pedagogico' | 'avaliacao_externa';

export default function App() {
  // 1. Core dataset states pre-seeded with municipal statistics of Pindamonhangaba
  const defaultData = useMemo(() => generateSystemData(), []);
  
  const [networkData, setNetworkData] = useState<NetworkData>(() => {
    try {
      const saved = localStorage.getItem('pinda_2026_network_data');
      return saved ? JSON.parse(saved) : defaultData.network;
    } catch (e) {
      return defaultData.network;
    }
  });

  const [externalAssessment, setExternalAssessment] = useState<ExternalAssessmentState | null>(() => {
    try {
      const saved = localStorage.getItem('pinda_2026_external_assessment');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [schools, setSchools] = useState<SchoolData[]>(() => {
    try {
      const saved = localStorage.getItem('pinda_2026_schools');
      return saved ? JSON.parse(saved) : defaultData.schools;
    } catch (e) {
      return defaultData.schools;
    }
  });

  const [classes, setClasses] = useState<ClassData[]>(() => {
    try {
      const saved = localStorage.getItem('pinda_2026_classes');
      return saved ? JSON.parse(saved) : defaultData.classes;
    } catch (e) {
      return defaultData.classes;
    }
  });

  const [isDataCustomized, setIsDataCustomized] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pinda_2026_is_customized') === 'true';
    } catch (e) {
      return false;
    }
  });

  // 2. Navigation states
  const [activeTab, setActiveTab] = useState<TabType>('rede');
  const [showUploader, setShowUploader] = useState<boolean>(false);

  // Report Modal states
  const [activeReportType, setActiveReportType] = useState<'participacao_faixas' | 'descritores' | 'itens' | 'escola' | 'turma' | 'executivo' | 'pedagogico' | 'setores' | null>(null);
  const [reportSchoolName, setReportSchoolName] = useState<string | undefined>(undefined);
  const [reportClassCode, setReportClassCode] = useState<string | undefined>(undefined);

  const triggerReport = (
    type: 'participacao_faixas' | 'descritores' | 'itens' | 'escola' | 'turma' | 'executivo' | 'pedagogico' | 'setores',
    schoolName?: string,
    classCode?: string
  ) => {
    setActiveReportType(type);
    setReportSchoolName(schoolName);
    setReportClassCode(classCode);
  };

  // 3. Handle customized uploaded data
  const handleDataLoaded = (uploaded: {
    network: NetworkData;
    schools: SchoolData[];
    classes: ClassData[];
  }) => {
    setNetworkData(uploaded.network);
    setSchools(uploaded.schools);
    setClasses(uploaded.classes);
    setIsDataCustomized(true);
    setShowUploader(false); // Close drawer after applying

    try {
      localStorage.setItem('pinda_2026_network_data', JSON.stringify(uploaded.network));
      localStorage.setItem('pinda_2026_schools', JSON.stringify(uploaded.schools));
      localStorage.setItem('pinda_2026_classes', JSON.stringify(uploaded.classes));
      localStorage.setItem('pinda_2026_is_customized', 'true');
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  };

  const handleExternalDataLoaded = (data: ExternalAssessmentState) => {
    setExternalAssessment(data);
    setActiveTab('avaliacao_externa');
    setShowUploader(false);

    try {
      localStorage.setItem('pinda_2026_external_assessment', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save external assessment to localStorage:', e);
    }
  };

  const handleClearExternalData = () => {
    setExternalAssessment(null);
    setActiveTab('rede');
    try {
      localStorage.removeItem('pinda_2026_external_assessment');
    } catch (e) {
      console.error('Failed to clear external assessment:', e);
    }
  };

  // 4. Restore original dataset
  const restoreOriginalData = () => {
    setNetworkData(defaultData.network);
    setSchools(defaultData.schools);
    setClasses(defaultData.classes);
    setIsDataCustomized(false);

    try {
      localStorage.removeItem('pinda_2026_network_data');
      localStorage.removeItem('pinda_2026_schools');
      localStorage.removeItem('pinda_2026_classes');
      localStorage.removeItem('pinda_2026_is_customized');
    } catch (e) {
      console.error('Failed to clear state from localStorage:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h1 className="text-white font-bold text-base leading-tight uppercase tracking-wider font-display">Pindamonhangaba</h1>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Avaliação Oral Matemática 2026</p>
        </div>
        
        <nav className="flex-1 py-6 space-y-1">
          <button
            onClick={() => setActiveTab('rede')}
            className={`w-full flex items-center px-6 py-3 text-xs font-bold transition-all text-left ${
              activeTab === 'rede' 
                ? 'bg-blue-600 text-white font-extrabold border-r-4 border-blue-400' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={15} className="mr-3" />
            <span>Visão Executiva (Rede)</span>
          </button>

          <button
            onClick={() => setActiveTab('resultados_alunos')}
            className={`w-full flex items-center px-6 py-3 text-xs font-bold transition-all text-left ${
              activeTab === 'resultados_alunos'
                ? 'bg-blue-600 text-white font-extrabold border-r-4 border-blue-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <UserRoundSearch size={15} className="mr-3" />
            <span>Resultados por Aluno</span>
          </button>

          <button
            onClick={() => setActiveTab('participacao_faixas')}
            className={`w-full flex items-center px-6 py-3 text-xs font-bold transition-all text-left ${
              activeTab === 'participacao_faixas' 
                ? 'bg-blue-600 text-white font-extrabold border-r-4 border-blue-400' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers size={15} className="mr-3" />
            <span>Participação e Faixas</span>
          </button>

          <button
            onClick={() => setActiveTab('descritores_escola')}
            className={`w-full flex items-center px-6 py-3 text-xs font-bold transition-all text-left ${
              activeTab === 'descritores_escola' 
                ? 'bg-blue-600 text-white font-extrabold border-r-4 border-blue-400' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen size={15} className="mr-3" />
            <span>Descritores por Escola</span>
          </button>

          <button
            onClick={() => setActiveTab('itens_escola')}
            className={`w-full flex items-center px-6 py-3 text-xs font-bold transition-all text-left ${
              activeTab === 'itens_escola' 
                ? 'bg-blue-600 text-white font-extrabold border-r-4 border-blue-400' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <List size={15} className="mr-3" />
            <span>Itens por Escola</span>
          </button>

          <button
            onClick={() => setActiveTab('setores')}
            className={`w-full flex items-center px-6 py-3 text-xs font-bold transition-all text-left ${
              activeTab === 'setores' 
                ? 'bg-blue-600 text-white font-extrabold border-r-4 border-blue-400' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Building2 size={15} className="mr-3" />
            <span>Análises por setores</span>
          </button>

          <button
            onClick={() => setActiveTab('escola_drill')}
            className={`w-full flex items-center px-6 py-3 text-xs font-bold transition-all text-left ${
              activeTab === 'escola_drill' 
                ? 'bg-blue-600 text-white font-extrabold border-r-4 border-blue-400' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <School size={15} className="mr-3" />
            <span>Análise por Escola</span>
          </button>

          <button
            onClick={() => setActiveTab('turma_drill')}
            className={`w-full flex items-center px-6 py-3 text-xs font-bold transition-all text-left ${
              activeTab === 'turma_drill' 
                ? 'bg-blue-600 text-white font-extrabold border-r-4 border-blue-400' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users size={15} className="mr-3" />
            <span>Análise por Turma</span>
          </button>

          <button
            onClick={() => setActiveTab('pedagogico')}
            className={`w-full flex items-center px-6 py-3 text-xs font-bold transition-all text-left ${
              activeTab === 'pedagogico' 
                ? 'bg-blue-600 text-white font-extrabold border-r-4 border-blue-400' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Activity size={15} className="mr-3" />
            <span>Diagnóstico & Priorização</span>
          </button>

          {externalAssessment && (
            <button
              onClick={() => setActiveTab('avaliacao_externa')}
              className={`w-full flex items-center px-6 py-3 text-xs font-bold transition-all text-left ${
                activeTab === 'avaliacao_externa' 
                  ? 'bg-blue-600 text-white font-extrabold border-r-4 border-blue-400 animate-pulse' 
                  : 'text-emerald-400 hover:bg-slate-800 hover:text-white font-extrabold'
              }`}
            >
              <Layers size={15} className="mr-3" />
              <span>Avaliação Externa</span>
            </button>
          )}
        </nav>

        {/* Status widget from the design concept */}
        <div className="p-6 bg-slate-950/40 border-t border-slate-800">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Status da Rede</div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] font-semibold text-white italic">Participação</span>
            </div>
            <span className="text-xs font-bold text-emerald-400">{networkData.participacao}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${networkData.participacao}%` }}></div>
          </div>
        </div>
      </aside>

      {/* Main Content Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Global Controls / Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md border border-slate-200 font-mono">
              Secretaria Municipal de Educação de Pindamonhangaba
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Toggle Uploader Trigger */}
            <button
              onClick={() => setShowUploader(prev => !prev)}
              className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                showUploader 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Upload size={14} />
              <span>{showUploader ? 'Fechar Carregador' : 'Carregar CSVs'}</span>
            </button>

            {/* Restore Default Dataset Button */}
            {isDataCustomized && (
              <button
                onClick={restoreOriginalData}
                className="bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                title="Restaurar dados originais de Pindamonhangaba"
              >
                <RotateCcw size={14} />
                <span>Restaurar Base</span>
              </button>
            )}
          </div>
        </header>

        {/* Drawer for CSV Uploader */}
        {showUploader && (
          <div className="bg-slate-100 border-b border-slate-200 animate-slideDown">
            <div className="px-8 py-4">
              <CsvUploader 
                onDataLoaded={handleDataLoaded} 
                onExternalDataLoaded={handleExternalDataLoaded}
                currentSchools={schools}
                currentClasses={classes}
              />
            </div>
          </div>
        )}

        {/* Active Tab Notification Bar */}
        {isDataCustomized && (
          <div className="bg-amber-500/10 border-b border-amber-500/10 text-amber-800 px-8 py-2.5 text-xs font-semibold flex items-center gap-2">
            <Info size={14} className="text-amber-600 shrink-0" />
            <span>Você está visualizando uma base de dados personalizada importada via arquivos CSV.</span>
          </div>
        )}

        {/* Scrollable Dashboard Viewport */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeTab === 'rede' && (
              <NetworkView networkData={networkData} classes={classes} onGenerateReport={() => triggerReport('executivo')} />
            )}

            {activeTab === 'resultados_alunos' && <StudentResultsView />}

            {activeTab === 'participacao_faixas' && (
              <ParticipacaoFaixasView schools={schools} onGenerateReport={() => triggerReport('participacao_faixas')} />
            )}

            {activeTab === 'descritores_escola' && (
              <DescritoresEscolaView schools={schools} onGenerateReport={() => triggerReport('descritores')} />
            )}

            {activeTab === 'itens_escola' && (
              <ItensEscolaView schools={schools} onGenerateReport={() => triggerReport('itens')} />
            )}

            {activeTab === 'setores' && (
              <SetoresView schools={schools} networkData={networkData} onGenerateReport={(sec) => triggerReport('setores', sec)} />
            )}

            {activeTab === 'escola_drill' && (
              <SchoolView schools={schools} classes={classes} networkData={networkData} onGenerateReport={(sch) => triggerReport('escola', sch)} />
            )}

            {activeTab === 'turma_drill' && (
              <ClassView schools={schools} classes={classes} networkData={networkData} onGenerateReport={(sch, cls) => triggerReport('turma', sch, cls)} />
            )}

            {activeTab === 'pedagogico' && (
              <PedagogicalView schools={schools} classes={classes} networkData={networkData} onGenerateReport={() => triggerReport('pedagogico')} />
            )}

            {activeTab === 'avaliacao_externa' && externalAssessment && (
              <ExternalAssessmentView 
                externalData={externalAssessment} 
                networkData={networkData}
                onClear={handleClearExternalData}
              />
            )}
          </div>
        </main>

        {/* Sleek Footer */}
        <footer className="bg-white border-t border-slate-200 py-3 px-8 text-center text-[10px] text-slate-400 font-medium shrink-0">
          <p>© 2026 Rede Municipal de Ensino de Pindamonhangaba (SP) • Sistema de Monitoramento de Matemática 2º Ano</p>
        </footer>
      </div>

      {activeReportType && (
        <ReportModal
          reportType={activeReportType}
          schoolName={reportSchoolName}
          classCode={reportClassCode}
          schools={schools}
          classes={classes}
          networkData={networkData}
          onClose={() => {
            setActiveReportType(null);
            setReportSchoolName(undefined);
            setReportClassCode(undefined);
          }}
        />
      )}
    </div>
  );
}
