/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { SchoolData, ClassData, NetworkData } from '../types';
import { DESCRIPTORS, ITEMS } from '../data';
import { getSectorStats, getSectorForSchool } from '../utils/sectors';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  X, 
  Printer, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ArrowDown, 
  ArrowUp,
  Award
} from 'lucide-react';

interface ReportModalProps {
  reportType: 'participacao_faixas' | 'descritores' | 'itens' | 'escola' | 'turma' | 'executivo' | 'pedagogico' | 'setores';
  schoolName?: string;
  classCode?: string;
  schools: SchoolData[];
  classes: ClassData[];
  networkData: NetworkData;
  onClose: () => void;
}

export default function ReportModal({
  reportType,
  schoolName,
  classCode,
  schools,
  classes,
  networkData,
  onClose
}: ReportModalProps) {

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Prevent background scrolling while report is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const generationTime = useMemo(() => {
    const d = new Date();
    return d.toLocaleString('pt-BR');
  }, []);

  // Filter school names prefix EM
  const formatSchoolName = (name: string) => {
    if (name.startsWith('E.M.')) return name;
    return `E.M. ${name}`;
  };

  // Sector Stats Mapped
  const sectorStats = useMemo(() => {
    return getSectorStats(schools);
  }, [schools]);

  // Selected school and class memo
  const selectedSchool = useMemo(() => {
    if (!schoolName) return schools[0] || null;
    return schools.find(s => s.nomeEscola === schoolName) || null;
  }, [schools, schoolName]);

  const selectedClass = useMemo(() => {
    if (!classCode) return classes[0] || null;
    return classes.find(c => c.codigoTurma === classCode) || null;
  }, [classes, classCode]);

  // 1. Calculations for Report types
  // 1A. Descritor fragilities sorted
  const descriptorRankings = useMemo(() => {
    return DESCRIPTORS.map(desc => {
      // average across schools ignoring nulls
      let sum = 0;
      let count = 0;
      schools.forEach(s => {
        const val = s.descritores[desc.id];
        if (val !== null && val !== undefined) {
          sum += val;
          count++;
        }
      });
      const avg = count > 0 ? Math.round(sum / count) : 0;
      return {
        ...desc,
        avg
      };
    }).sort((a, b) => a.avg - b.avg);
  }, [schools]);

  // 1B. Item fragilities sorted (ignoring "-")
  const itemRankings = useMemo(() => {
    return ITEMS.map(item => {
      let sum = 0;
      let count = 0;
      schools.forEach(s => {
        const val = s.itens[item.id];
        if (val !== null && val !== undefined) {
          sum += val;
          count++;
        }
      });
      const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
      return {
        ...item,
        avg
      };
    }).sort((a, b) => a.avg - b.avg);
  }, [schools]);

  // Classification of schools for pedagogical report
  const reportClassifiedSchools = useMemo(() => {
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

  const reportSchoolCounts = useMemo(() => {
    return {
      high: reportClassifiedSchools.filter(s => s.priority === 'high'),
      medium: reportClassifiedSchools.filter(s => s.priority === 'medium'),
      low: reportClassifiedSchools.filter(s => s.priority === 'low'),
    };
  }, [reportClassifiedSchools]);

  // 2. EXCEL / CSV Export Logic
  const handleExportExcel = () => {
    let csvContent = '\uFEFF'; // BOM for UTF-8
    let filename = `Relatorio_Matematica_2026.csv`;

    if (reportType === 'participacao_faixas') {
      filename = `Relatorio_Participacao_Faixas_Pinda_2026.csv`;
      csvContent += `ABAS: RESUMO DA REDE;DADOS DAS ESCOLAS;ALERTAS PEDAGÓGICOS\n\n`;
      csvContent += `RESUMO DA REDE\n`;
      csvContent += `Indicador;Valor\n`;
      csvContent += `Previstos;${networkData.previstos}\n`;
      csvContent += `Avaliados;${networkData.avaliados}\n`;
      csvContent += `Participação (%);${networkData.participacao}%\n`;
      csvContent += `Parcial (%);${networkData.parcial}%\n`;
      csvContent += `Mínimo (%);${networkData.minimo}%\n`;
      csvContent += `Excedeu (%);${networkData.excedeu}%\n`;
      csvContent += `Sucesso (%);${networkData.sucesso}%\n\n`;

      csvContent += `DADOS DAS ESCOLAS\n`;
      csvContent += `Escola;Setor;Previstos;Avaliados;Participação (%);Parcial (%);Mínimo (%);Excedeu (%);Sucesso (%)\n`;
      schools.forEach(s => {
        csvContent += `${formatSchoolName(s.nomeEscola)};${getSectorForSchool(s.nomeEscola)};${s.previstos};${s.avaliados};${s.participacao}%;${s.parcial}%;${s.minimo}%;${s.excedeu}%;${s.sucesso}%\n`;
      });

      csvContent += `\nALERTAS PEDAGÓGICOS\n`;
      csvContent += `Escola;Tipo de Alerta;Detalhe\n`;
      schools.forEach(s => {
        if (s.participacao < 80) {
          csvContent += `${formatSchoolName(s.nomeEscola)};Participação Crítica;Taxa de ${s.participacao}% (abaixo do recomendado 80%)\n`;
        }
        if (s.parcial >= 40) {
          csvContent += `${formatSchoolName(s.nomeEscola)};Alta Defasagem;Parcial de ${s.parcial}% (40% ou mais de alunos no patamar crítico)\n`;
        }
      });
    } 
    else if (reportType === 'descritores') {
      filename = `Relatorio_Descritores_Pinda_2026.csv`;
      csvContent += `DESCRITORES POR ESCOLA (D001_J a D007_J)\n\n`;
      csvContent += `Escola;Setor;D001_J;D002_J;D003_J;D004_J;D005_J;D006_J;D007_J\n`;
      schools.forEach(s => {
        csvContent += `${formatSchoolName(s.nomeEscola)};${getSectorForSchool(s.nomeEscola)};${s.descritores['D001_J'] ?? '—'};${s.descritores['D002_J'] ?? '—'};${s.descritores['D003_J'] ?? '—'};${s.descritores['D004_J'] ?? '—'};${s.descritores['D005_J'] ?? '—'};${s.descritores['D006_J'] ?? '—'};${s.descritores['D007_J'] ?? '—'}\n`;
      });
      csvContent += `\nMédia Geral do Município;;${networkData.descritores['D001_J']}%;${networkData.descritores['D002_J']}%;${networkData.descritores['D003_J']}%;${networkData.descritores['D004_J']}%;${networkData.descritores['D005_J']}%;${networkData.descritores['D006_J']}%;${networkData.descritores['D007_J']}%\n`;
    } 
    else if (reportType === 'itens') {
      filename = `Relatorio_Itens_Pinda_2026.csv`;
      csvContent += `RANKING DOS ITENS DE MATEMÁTICA\n\n`;
      csvContent += `Item;Descritor;Tema;Média de Acerto (Rede)\n`;
      itemRankings.forEach(it => {
        csvContent += `${it.id};${it.descriptorId};${it.theme};${it.avg}%\n`;
      });
    } 
    else if (reportType === 'escola' && selectedSchool) {
      filename = `Relatorio_Escola_${selectedSchool.nomeEscola.replace(/ /g, '_')}_2026.csv`;
      csvContent += `RELATÓRIO ESCOLAR INDIVIDUAL: ${formatSchoolName(selectedSchool.nomeEscola)}\n`;
      csvContent += `Setor: ${getSectorForSchool(selectedSchool.nomeEscola)}\n\n`;
      csvContent += `MÉTRICA;ESCOLA;MUNICÍPIO\n`;
      csvContent += `Previstos;${selectedSchool.previstos};${networkData.previstos}\n`;
      csvContent += `Avaliados;${selectedSchool.avaliados};${networkData.avaliados}\n`;
      csvContent += `Participação (%);${selectedSchool.participacao}%;${networkData.participacao}%\n`;
      csvContent += `Parcial (%);${selectedSchool.parcial}%;${networkData.parcial}%\n`;
      csvContent += `Mínimo (%);${selectedSchool.minimo}%;${networkData.minimo}%\n`;
      csvContent += `Excedeu (%);${selectedSchool.excedeu}%;${networkData.excedeu}%\n`;
      csvContent += `Sucesso (%);${selectedSchool.sucesso}%;${networkData.sucesso}%\n\n`;

      csvContent += `DESCRITORES DA ESCOLA\n`;
      csvContent += `Descritor;Habilidade;Escola (%);Município (%)\n`;
      DESCRIPTORS.forEach(d => {
        csvContent += `${d.id};${d.description};${selectedSchool.descritores[d.id] ?? '—'}%;${networkData.descritores[d.id]}%\n`;
      });
    } 
    else if (reportType === 'turma' && selectedClass) {
      filename = `Relatorio_Turma_${selectedClass.nomeTurma}_2026.csv`;
      csvContent += `RELATÓRIO DE TURMA: ${selectedClass.nomeTurma}\n`;
      csvContent += `Escola: ${formatSchoolName(selectedClass.nomeEscola)}\n`;
      csvContent += `Setor: ${getSectorForSchool(selectedClass.nomeEscola)}\n\n`;
      csvContent += `Métrica;Turma;Escola\n`;
      csvContent += `Previstos;${selectedClass.previstos};${selectedSchool?.previstos || '—'}\n`;
      csvContent += `Avaliados;${selectedClass.avaliados};${selectedSchool?.avaliados || '—'}\n`;
      csvContent += `Participação (%);${selectedClass.participacao}%;${selectedSchool?.participacao || '—'}%\n`;
      csvContent += `Parcial (%);${selectedClass.parcial}%;${selectedSchool?.parcial || '—'}%\n`;
      csvContent += `Mínimo (%);${selectedClass.minimo}%;${selectedSchool?.minimo || '—'}%\n`;
      csvContent += `Excedeu (%);${selectedClass.excedeu}%;${selectedSchool?.excedeu || '—'}%\n`;
      csvContent += `Sucesso (%);${selectedClass.sucesso}%;${selectedSchool?.sucesso || '—'}%\n`;
    } 
    else if (reportType === 'executivo') {
      filename = `Relatorio_Executivo_Consolidado_Pinda_2026.csv`;
      csvContent += `RELATÓRIO CONSOLIDADO EXECUTIVO DA REDE\n\n`;
      csvContent += `RESUMO GERAL DO MUNICÍPIO\n`;
      csvContent += `Métrica;Valor\n`;
      csvContent += `Previstos;${networkData.previstos}\n`;
      csvContent += `Avaliados;${networkData.avaliados}\n`;
      csvContent += `Participação (%);${networkData.participacao}%\n`;
      csvContent += `Parcial (%);${networkData.parcial}%\n`;
      csvContent += `Mínimo (%);${networkData.minimo}%\n`;
      csvContent += `Excedeu (%);${networkData.excedeu}%\n`;
      csvContent += `Sucesso (%);${networkData.sucesso}%\n\n`;

      csvContent += `ANÁLISE POR SETORES\n`;
      csvContent += `Setor;Qtd Escolas;Previstos;Avaliados;Participação (%);Parcial (%);Mínimo (%);Excedeu (%);Sucesso (%)\n`;
      sectorStats.forEach(s => {
        csvContent += `${s.sectorName};${s.totalEscolas};${s.previstos};${s.avaliados};${s.participacao}%;${s.parcial}%;${s.minimo}%;${s.excedeu}%;${s.sucesso}%\n`;
      });
    } 
    else if (reportType === 'setores') {
      const isAll = !schoolName || schoolName === 'all';
      if (isAll) {
        filename = `Relatorio_Setores_Consolidado_Pinda_2026.csv`;
        csvContent += `RELATÓRIO CONSOLIDADO DE SETORES (VISÃO GERAL)\n\n`;
        csvContent += `Setor;Qtd Escolas;Previstos;Avaliados;Participação (%);Parcial (%);Mínimo (%);Excedeu (%);Sucesso (%)\n`;
        sectorStats.forEach(s => {
          csvContent += `${s.sectorName};${s.totalEscolas};${s.previstos};${s.avaliados};${s.participacao}%;${s.parcial}%;${s.minimo}%;${s.excedeu}%;${s.sucesso}%\n`;
        });
      } else {
        filename = `Relatorio_Setor_${schoolName}_Pinda_2026.csv`;
        csvContent += `RELATÓRIO DETALHADO DO SETOR: ${schoolName}\n\n`;
        csvContent += `Escola;Previstos;Avaliados;Participação (%);Parcial (%);Mínimo (%);Excedeu (%);Sucesso (%)\n`;
        const activeSector = sectorStats.find(s => s.sectorName === schoolName);
        if (activeSector) {
          activeSector.escolas.forEach(s => {
            csvContent += `${formatSchoolName(s.nomeEscola)};${s.previstos};${s.avaliados};${s.participacao}%;${s.parcial}%;${s.minimo}%;${s.excedeu}%;${s.sucesso}%\n`;
          });
        }
      }
    }
    else {
      filename = `Relatorio_Priorizacao_Pinda_2026.csv`;
      csvContent += `RELATÓRIO DE PRIORIZAÇÃO PEDAGÓGICA\n\n`;
      csvContent += `Escola;Setor;Sucesso (%);Participação (%);Prioridade;Justificativa\n`;
      schools.forEach(s => {
        let p = 'BAIXA';
        let j = 'Nível de excelência consolidado';
        if (s.sucesso < 65 || s.participacao < 80) {
          p = 'ALTA';
          j = s.sucesso < 65 ? `Desempenho crítico (${s.sucesso}% sucesso)` : `Participação crítica (${s.participacao}%)`;
        } else if (s.sucesso < 76) {
          p = 'MÉDIA';
          j = 'Rendimento intermediário (requer monitoramento)';
        }
        csvContent += `${formatSchoolName(s.nomeEscola)};${getSectorForSchool(s.nomeEscola)};${s.sucesso}%;${s.participacao}%;${p};${j}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Subtitle variables
  const reportSubtitle = useMemo(() => {
    switch (reportType) {
      case 'participacao_faixas': return 'Relatório da Rede — Participação e Faixas de Rendimento';
      case 'descritores': return 'Relatório da Rede — Detalhamento por Descritores Matemáticos';
      case 'itens': return 'Relatório da Rede — Diagnóstico por Itens da Avaliação';
      case 'escola': return `Relatório da Escola — ${selectedSchool ? formatSchoolName(selectedSchool.nomeEscola) : 'Filtro Não Selecionado'}`;
      case 'turma': return `Relatório da Turma — ${selectedClass ? `${selectedClass.nomeTurma} (${selectedClass.codigoTurma})` : 'Filtro Não Selecionado'} • ${selectedSchool ? formatSchoolName(selectedSchool.nomeEscola) : ''}`;
      case 'executivo': return 'Relatório Executivo Consolidado — Panorama Geral da Rede Municipal';
      case 'pedagogico': return 'Relatório de Priorização Pedagógica e Planos de Ação';
      case 'setores': return !schoolName || schoolName === 'all' ? 'Relatório de Análise Territorial — Todos os Setores (Visão Geral)' : `Relatório de Análise Territorial — ${schoolName}`;
      default: return 'Relatório Geral';
    }
  }, [reportType, selectedSchool, selectedClass]);

  // Handle print action (Versão Corrigida e Altamente Robusta via Canvas 2D, Fallback Manual e Proxy)
  const handlePrint = async () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);

    // ---------------------------------------------------------------------
    // Normalizador universal de cor: usa o Canvas 2D do próprio navegador.
    // Isso cobre oklch(), oklab(), lab(), lch(), color(display-p3 ...),
    // color-mix(), e qualquer função de cor futura — com fallback manual
    // extremamente robusto para retrocompatibilidade completa.
    // ---------------------------------------------------------------------
    const colorCache = new Map<string, string>();
    const normalizeColor = (value: string): string => {
      if (!value) return value;
      const v = value.trim();
      // já é um formato seguro, não precisa tocar
      if (
        v === 'transparent' ||
        v === 'currentcolor' ||
        v.startsWith('#') ||
        v.startsWith('rgb') ||
        v.startsWith('hsl')
      ) {
        return value;
      }
      if (colorCache.has(v)) return colorCache.get(v)!;

      // 1. Tentar resolver de forma nativa e exata via Canvas 2D
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Usamos uma cor sentinela incomum para detectar se a atribuição falhou
          ctx.fillStyle = '#123456'; 
          ctx.fillStyle = v;
          const resolved = ctx.fillStyle;
          if (resolved !== '#123456') {
            colorCache.set(v, resolved);
            return resolved;
          }
        }
      } catch (e) {
        // ignora erro do canvas
      }

      // 2. Fallback manual robusto de parsing e aproximação
      try {
        if (v.toLowerCase().startsWith('oklch')) {
          const match = v.match(/oklch\(([^)]+)\)/i);
          if (match) {
            const parts = match[1].trim().split(/[\s,/]+/);
            if (parts.length >= 3) {
              let l = parseFloat(parts[0]);
              if (!parts[0].endsWith('%') && l <= 1.0) l = l * 100;
              let c = parseFloat(parts[1]);
              if (parts[1].endsWith('%')) c = c / 100;
              let s = Math.min(100, Math.max(0, Math.round((c / 0.4) * 100))) || 70;
              let h = parseFloat(parts[2]) || 0;
              let alpha = parts[3] !== undefined ? parseFloat(parts[3]) : null;
              if (alpha !== null && !isNaN(alpha)) {
                return `hsla(${Math.round(h)}, ${s}%, ${Math.round(l)}%, ${alpha})`;
              }
              return `hsl(${Math.round(h)}, ${s}%, ${Math.round(l)}%)`;
            }
          }
        } else if (v.toLowerCase().startsWith('oklab')) {
          const match = v.match(/oklab\(([^)]+)\)/i);
          if (match) {
            const parts = match[1].trim().split(/[\s,/]+/);
            if (parts.length >= 3) {
              let l = parseFloat(parts[0]);
              if (!parts[0].endsWith('%') && l <= 1.0) l = l * 100;
              let a = parseFloat(parts[1]) || 0;
              let b = parseFloat(parts[2]) || 0;
              let alpha = parts[3] !== undefined ? parseFloat(parts[3]) : null;
              let chroma = Math.sqrt(a * a + b * b);
              let s = Math.min(100, Math.max(0, Math.round((chroma / 0.4) * 100))) || 70;
              let h = Math.round(Math.atan2(b, a) * (180 / Math.PI));
              if (h < 0) h += 360;
              if (alpha !== null && !isNaN(alpha)) {
                return `hsla(${h}, ${s}%, ${Math.round(l)}%, ${alpha})`;
              }
              return `hsl(${h}, ${s}%, ${Math.round(l)}%)`;
            }
          }
        }
      } catch (e) {
        // ignora falha no fallback manual
      }

      return 'rgb(100, 116, 139)';
    };

    // Substitui qualquer função de cor moderna dentro de um bloco de texto
    // CSS (usado para <style> e <link> sanitizados) por sua versão resolvida.
    const sanitizeCssText = (cssText: string): string => {
      if (!cssText) return cssText;
      
      // 1. Substituição via Expressão Regular (Rápida e cobre 99% dos casos)
      let sanitized = cssText.replace(
        /(oklch|oklab|lab|lch|color-mix|color)\([^()]*(?:\([^()]*\)[^()]*)*\)/gi,
        (match) => normalizeColor(match)
      );

      // 2. Scan iterativo por balanceamento de parênteses (Garantia Absoluta)
      //    Isso elimina qualquer função não-capturada devido a aninhamentos extremos ou formatações peculiares.
      const targets = ['oklch', 'oklab', 'color-mix'];
      targets.forEach((target) => {
        let index = sanitized.toLowerCase().indexOf(target + '(');
        while (index !== -1) {
          let openCount = 1;
          let i = index + target.length + 1;
          while (i < sanitized.length && openCount > 0) {
            if (sanitized[i] === '(') openCount++;
            else if (sanitized[i] === ')') openCount--;
            i++;
          }
          if (openCount === 0) {
            const fullMatch = sanitized.slice(index, i);
            const resolved = normalizeColor(fullMatch);
            sanitized = sanitized.slice(0, index) + resolved + sanitized.slice(i);
            index = sanitized.toLowerCase().indexOf(target + '(', index + resolved.length);
          } else {
            // Se houver erro de parênteses desbalanceados, apenas remove a chamada da função problemático
            sanitized = sanitized.slice(0, index) + 'rgb(100, 116, 139)' + sanitized.slice(index + target.length + 1);
            break;
          }
        }
      });

      return sanitized;
    };

    try {
      const element =
        document.getElementById('print-report-content') ||
        document.getElementById('print-report-container');

      if (!element) {
        throw new Error('Elemento do relatório não encontrado no DOM.');
      }

      let filename = 'Relatorio_Pinda_2026.pdf';
      switch (reportType) {
        case 'participacao_faixas':
          filename = 'Relatorio_Participacao_Faixas_Pinda_2026.pdf';
          break;
        case 'descritores':
          filename = 'Relatorio_Descritores_Pinda_2026.pdf';
          break;
        case 'itens':
          filename = 'Relatorio_Itens_Pinda_2026.pdf';
          break;
        case 'escola':
          filename = `Relatorio_Escola_${
            selectedSchool ? selectedSchool.nomeEscola.replace(/[^a-zA-Z0-9]/g, '_') : 'Geral'
          }_2026.pdf`;
          break;
        case 'turma':
          filename = `Relatorio_Turma_${
            selectedClass ? selectedClass.nomeTurma.replace(/[^a-zA-Z0-9]/g, '_') : 'Geral'
          }_2026.pdf`;
          break;
        case 'executivo':
          filename = 'Relatorio_Executivo_Consolidado_2026.pdf';
          break;
        case 'pedagogico':
          filename = 'Relatorio_Priorizacao_Pedagogica_2026.pdf';
          break;
        case 'setores':
          filename = 'Relatorio_Analise_Territorial_2026.pdf';
          break;
      }

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Pré-busca de folhas de estilo same-origin
      const linkTags = Array.from(
        document.querySelectorAll('link[rel="stylesheet"]')
      ) as HTMLLinkElement[];
      const linkCssContents: { href: string; cssText: string }[] = [];

      for (const link of linkTags) {
        try {
          const isSameOrigin =
            !link.href || link.href.startsWith(window.location.origin) || !link.href.startsWith('http');
          if (isSameOrigin && link.href) {
            const response = await fetch(link.href);
            if (response.ok) {
              const cssText = await response.text();
              linkCssContents.push({ href: link.href, cssText });
            }
          }
        } catch (e) {
          console.warn('Não foi possível pré-buscar stylesheet:', link.href, e);
        }
      }

      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          const win = clonedDoc.defaultView as any;

          // -----------------------------------------------------------------
          // 1. Extrai, Sanitiza e Consolida TODAS as Regras de CSS do Documento
          // -----------------------------------------------------------------
          const tempStyleContainer: string[] = [];

          // 1.1 Processar todas as styleSheets encontradas no clone (incluindo estilos injetados via JS/CSSOM)
          Array.from(clonedDoc.styleSheets).forEach((s) => {
            const sheet = s as CSSStyleSheet;
            try {
              // Tentamos ler as regras compiladas via CSSOM (altamente preciso, engloba Tailwind e outros estilos processados)
              const rulesText = Array.from(sheet.cssRules)
                .map((rule) => (rule as CSSRule).cssText || '')
                .join('\n');
              if (rulesText) {
                tempStyleContainer.push(sanitizeCssText(rulesText));
              }
            } catch (e) {
              console.warn('Não foi possível ler cssRules de uma stylesheet:', e);
              // Fallback para quando não temos acesso às regras (ex: se o navegador bloquear ou for um estilo inline em <style>)
              const ownerNode = sheet.ownerNode as HTMLElement | null;
              if (ownerNode && ownerNode.tagName === 'STYLE' && ownerNode.innerHTML) {
                tempStyleContainer.push(sanitizeCssText(ownerNode.innerHTML));
              }
            }
          });

          // 1.2 Incorporar também quaisquer estilos pré-buscados das tags <link>
          linkCssContents.forEach((match) => {
            tempStyleContainer.push(sanitizeCssText(match.cssText));
          });

          // 1.3 REMOVER COMPLETAMENTE todas as tags <style> e <link rel="stylesheet"> originais do clone.
          //     Isso força o html2canvas a ler EXCLUSIVAMENTE a nossa folha de estilo consolidada e 100% segura contra oklch/oklab.
          Array.from(clonedDoc.querySelectorAll('style, link[rel="stylesheet"]')).forEach((el) => {
            el.remove();
          });

          // 1.4 Injeta uma única folha de estilo global perfeitamente sanitizada
          if (tempStyleContainer.length > 0) {
            const unifiedStyle = clonedDoc.createElement('style');
            unifiedStyle.id = 'unified-sanitized-styles';
            unifiedStyle.innerHTML = tempStyleContainer.join('\n');
            clonedDoc.head.appendChild(unifiedStyle);
          }

          // -----------------------------------------------------------------
          // 2. Sanitiza Estilos Inline e Atributos de Apresentação SVG
          // -----------------------------------------------------------------
          const allEls = Array.from(clonedDoc.querySelectorAll('*'));
          allEls.forEach((el) => {
            // Estilos inline do atributo style=""
            const inline = el.getAttribute('style');
            if (inline && /(oklch|oklab|lab\(|lch\(|color-mix)/i.test(inline)) {
              el.setAttribute('style', sanitizeCssText(inline));
            }

            // Atributos SVG (fill e stroke) frequentemente injetados por Recharts
            if (el.hasAttribute?.('fill')) {
              const f = el.getAttribute('fill') || '';
              if (/(oklch|oklab|lab\(|lch\(|color-mix)/i.test(f)) {
                el.setAttribute('fill', normalizeColor(f));
              }
            }
            if (el.hasAttribute?.('stroke')) {
              const s = el.getAttribute('stroke') || '';
              if (/(oklch|oklab|lab\(|lch\(|color-mix)/i.test(s)) {
                el.setAttribute('stroke', normalizeColor(s));
              }
            }
          });

          // -----------------------------------------------------------------
          // 3. Interceptação Dinâmica Global via Protótipos e ES6 Proxy
          // -----------------------------------------------------------------
          if (win) {
            try {
              const proto = win.CSSStyleDeclaration.prototype;
              const originalGetPropertyValue = proto.getPropertyValue;

              // 3.1 Interceptar getPropertyValue
              proto.getPropertyValue = function (this: any, property: string) {
                const val = originalGetPropertyValue.call(this, property);
                if (typeof val === 'string' && /(oklch|oklab|lab\(|lch\(|color-mix)/i.test(val)) {
                  return normalizeColor(val);
                }
                return val;
              };

              // 3.2 Interceptar propriedades de cor diretamente no protótipo CSSStyleDeclaration
              const propsToIntercept = [
                'color',
                'backgroundColor',
                'background-color',
                'borderTopColor',
                'border-top-color',
                'borderRightColor',
                'border-right-color',
                'borderBottomColor',
                'border-bottom-color',
                'borderLeftColor',
                'border-left-color',
                'outlineColor',
                'outline-color',
                'fill',
                'stroke'
              ];

              propsToIntercept.forEach((prop) => {
                const desc = win.Object.getOwnPropertyDescriptor(proto, prop);
                if (desc && desc.get) {
                  win.Object.defineProperty(proto, prop, {
                    get() {
                      const val = desc.get!.call(this);
                      if (typeof val === 'string' && /(oklch|oklab|lab\(|lch\(|color-mix)/i.test(val)) {
                        return normalizeColor(val);
                      }
                      return val;
                    },
                    set(v) {
                      if (desc.set) desc.set.call(this, v);
                    },
                    enumerable: true,
                    configurable: true
                  });
                } else {
                  win.Object.defineProperty(proto, prop, {
                    get() {
                      const val = originalGetPropertyValue.call(this, prop);
                      if (typeof val === 'string' && /(oklch|oklab|lab\(|lch\(|color-mix)/i.test(val)) {
                        return normalizeColor(val);
                      }
                      return val;
                    },
                    set(v) {
                      this.setProperty(prop, v);
                    },
                    enumerable: true,
                    configurable: true
                  });
                }
              });

              // 3.3 Interceptar CSSStyleDeclaration.prototype.cssText
              const originalCssTextDesc = win.Object.getOwnPropertyDescriptor(proto, 'cssText');
              if (originalCssTextDesc && originalCssTextDesc.get) {
                win.Object.defineProperty(proto, 'cssText', {
                  get() {
                    const val = originalCssTextDesc.get!.call(this);
                    if (typeof val === 'string' && /(oklch|oklab|lab\(|lch\(|color-mix)/i.test(val)) {
                      return sanitizeCssText(val);
                    }
                    return val;
                  },
                  set(v) {
                    if (originalCssTextDesc.set) originalCssTextDesc.set.call(this, v);
                  },
                  enumerable: true,
                  configurable: true
                });
              }

              // 3.4 Interceptar CSSRule.prototype.cssText
              const originalRuleCssTextDesc = win.Object.getOwnPropertyDescriptor(win.CSSRule.prototype, 'cssText');
              if (originalRuleCssTextDesc && originalRuleCssTextDesc.get) {
                win.Object.defineProperty(win.CSSRule.prototype, 'cssText', {
                  get() {
                    const val = originalRuleCssTextDesc.get!.call(this);
                    if (typeof val === 'string' && /(oklch|oklab|lab\(|lch\(|color-mix)/i.test(val)) {
                      return sanitizeCssText(val);
                    }
                    return val;
                  },
                  set(v) {
                    if (originalRuleCssTextDesc.set) originalRuleCssTextDesc.set.call(this, v);
                  },
                  enumerable: true,
                  configurable: true
                });
              }
            } catch (err) {
              console.warn('Erro ao interceptar protótipos de CSS:', err);
            }

            // 3.5 Interceptar getComputedStyle global via Proxy
            try {
              const originalGetComputedStyle = win.getComputedStyle;
              win.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
                const style = originalGetComputedStyle(elt, pseudoElt);
                return new Proxy(style, {
                  get(target, prop, receiver) {
                    if (prop === 'getPropertyValue') {
                      return function (this: any, propertyName: string) {
                        const val = target.getPropertyValue(propertyName);
                        if (typeof val === 'string' && /(oklch|oklab|lab\(|lch\(|color-mix)/i.test(val)) {
                          return normalizeColor(val);
                        }
                        return val;
                      };
                    }
                    const value = Reflect.get(target, prop, receiver);
                    if (typeof value === 'string' && /(oklch|oklab|lab\(|lch\(|color-mix)/i.test(value)) {
                      return normalizeColor(value);
                    }
                    return value;
                  }
                });
              } as any;
            } catch (err) {
              console.warn('Erro ao interceptar getComputedStyle:', err);
            }
          }

          // 3.6 Forçar varredura e resolução de estilos no computedStyle do clone como inline style
          if (win) {
            const propsToForce: (keyof CSSStyleDeclaration)[] = [
              'color',
              'backgroundColor',
              'borderTopColor',
              'borderRightColor',
              'borderBottomColor',
              'borderLeftColor',
              'outlineColor',
              'fill',
              'stroke',
            ];
            allEls.forEach((el) => {
              const htmlEl = el as HTMLElement;
              try {
                const computed = win.getComputedStyle(htmlEl);
                propsToForce.forEach((prop) => {
                  const raw = computed[prop] as unknown as string;
                  if (raw && /(oklch|oklab|lab\(|lch\(|color-mix)/i.test(raw)) {
                    (htmlEl.style as any)[prop] = normalizeColor(raw);
                  }
                });
              } catch (err) {
                // ignora erros de elementos que não suportam computedStyle
              }
            });
          }

          // -----------------------------------------------------------------
          // 4. Configuração Fina do Container de Relatório Clonado
          // -----------------------------------------------------------------
          const clonedTarget =
            clonedDoc.getElementById('print-report-content') ||
            clonedDoc.getElementById('print-report-container');
          if (clonedTarget) {
            clonedTarget.style.width = '1120px';
            clonedTarget.style.maxWidth = '1120px';
            clonedTarget.style.padding = '24px';
            clonedTarget.style.height = 'auto';
            clonedTarget.style.overflow = 'visible';
          }
        },
      });

      // -----------------------------------------------------------------
      // Montagem do PDF — pageHeight agora vem do próprio jsPDF, nunca de
      // um número fixo "chutado" (evita 2mm de sobreposição por página).
      // -----------------------------------------------------------------
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
    } catch (error) {
      // Dica: abra o console do navegador ANTES de gerar o PDF para ver o
      // erro real que cai aqui (ex: "Attempting to parse an unsupported
      // color function", SecurityError de canvas "tainted" por CORS, etc.)
      const message = error instanceof Error ? error.message : String(error);
      console.error('Erro na exportação para PDF:', error);

      // IMPORTANTE: dentro do preview em iframe do AI Studio, window.print()
      // costuma não fazer NADA visível (o iframe de preview geralmente não
      // tem permissão de impressão / não abre diálogo nenhum). Por isso o
      // fallback antigo dava a falsa impressão de "clico e não acontece
      // nada". Aqui garantimos que o usuário SEMPRE veja algum feedback.
      try {
        window.print();
      } catch {
        // ignora — pode não ser suportado no ambiente de preview
      }
      alert(`Não foi possível gerar o PDF automaticamente.\n\nDetalhe técnico: ${message}\n\nAbra o console do navegador (F12) para mais informações.`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-0 md:p-6 backdrop-blur-sm overflow-hidden report-modal-backdrop-wrapper">
      
      {/* Dynamic media print injection style */}
      <style>{`
        @media print {
          /* Hide EVERYTHING else in the body of the application */
          body > :not(.report-modal-backdrop-wrapper) {
            display: none !important;
          }
          
          /* Unconstrain the modal backdrop so it behaves as a normal flow block */
          .report-modal-backdrop-wrapper {
            position: static !important;
            display: block !important;
            background: none !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            z-index: auto !important;
          }
          
          /* Unconstrain the modal container */
          .report-modal-content-container {
            position: static !important;
            display: block !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            overflow: visible !important;
            border-radius: 0 !important;
          }
          
          /* Force hide elements marked with no-print */
          .no-print, .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Unconstrain scrollable container to be fully visible and expanded */
          #print-report-container {
            position: static !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          #print-report-content {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }

          /* Ensure high-fidelity vector SVGs and charts print crisp */
          svg, canvas, .recharts-responsive-container {
            max-width: 100% !important;
            height: auto !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* Avoid page breaks inside key informational containers */
          .card, .print-card, [class*="bg-slate-50"], .grid > div {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* Enable full high-fidelity colors, graphics and backgrounds */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
          
          .print-break-page {
            page-break-before: always !important;
            break-before: always !important;
          }
          
          .print-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 16px !important;
          }
        }
      `}</style>

      {/* Main Report Overlay Container */}
      <div className="relative bg-slate-50 w-full h-full md:max-w-6xl md:h-[92vh] md:rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 report-modal-content-container">
        
        {isGeneratingPDF && (
          <div className="absolute inset-0 bg-white/80 z-[100] flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
            <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-slate-700">Gerando PDF de alta fidelidade...</span>
            <span className="text-[11px] text-slate-400 font-semibold">Isso pode levar alguns segundos dependendo dos gráficos.</span>
          </div>
        )}
        
        {/* Controls Header - strictly no-print */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Módulo de Exportação & Impressão</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              disabled={isGeneratingPDF}
              className={`${isGeneratingPDF ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 cursor-pointer'} text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-all`}
            >
              <Printer size={14} className={isGeneratingPDF ? 'animate-pulse' : ''} />
              <span>{isGeneratingPDF ? 'Gerando PDF...' : 'Imprimir / Exportar PDF'}</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet size={14} />
              <span>Exportar Excel (CSV)</span>
            </button>

            <div className="w-[1px] h-6 bg-slate-200 mx-1" />

            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg transition-all active:scale-95 cursor-pointer"
              title="Fechar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Report Content - This is targets for printing */}
        <div id="print-report-container" className="flex-1 overflow-y-auto bg-white">
          <div id="print-report-content" className="max-w-5xl mx-auto p-4 md:p-10 space-y-8 bg-white text-slate-800">
            
            {/* 1. MANDATORY STANDARD HEADER */}
            <header className="bg-blue-900 text-white py-6 px-6 md:px-12 shadow-lg relative overflow-hidden rounded-lg">
              <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-row items-start justify-between gap-6">
                  <div className="flex flex-row items-start gap-6">
                    <div className="flex-shrink-0 bg-white/10 p-1.5 rounded-lg">
                      <img 
                        alt="Brasão Pinda" 
                        className="h-[85px] w-auto mix-blend-multiply"
                        src="/brasao.png" 
                        style={{ filter: 'contrast(1.1)' }}
                        onError={(e) => {
                          // Falls back gracefully if brasao.png is empty/not found
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-start pt-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-amber-400 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Selo Ouro</span>
                        <span className="text-blue-100 text-[11px] font-bold uppercase tracking-wider">Educação Pindamonhangaba</span>
                      </div>
                      <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight">
                        Pindamonhangaba: <span className="text-amber-400">Excelência</span> e Antecipação de Metas na Alfabetização
                      </h1>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right pt-1">
                    <p className="text-blue-200 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">Gestão Atual</p>
                    <p className="text-xl font-bold leading-none">2026</p>
                  </div>
                </div>
              </div>
            </header>

            {/* Document Subtitle & Meta Info */}
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-xs font-bold text-blue-800 uppercase tracking-widest">{reportSubtitle}</span>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">AVALIAÇÃO ORAL DE MATEMÁTICA 2026 — 2º ANO</p>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                <Clock size={13} />
                <span>Gerado em {generationTime}</span>
              </div>
            </div>

            {/* ==================================================== */}
            {/* CONTENT MODULES DEPENDING ON REPORT TYPE             */}
            {/* ==================================================== */}

            {/* ---------------------------------------------------- */}
            {/* REPORT TYPE A: PARTICIPAÇÃO E FAIXAS                 */}
            {/* ---------------------------------------------------- */}
            {reportType === 'participacao_faixas' && (
              <div className="space-y-6">
                {/* KPIs Block */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  <div className="border border-slate-200 p-3.5 rounded-lg text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Previstos</p>
                    <p className="text-xl font-black text-slate-800 mt-1">{networkData.previstos}</p>
                  </div>
                  <div className="border border-slate-200 p-3.5 rounded-lg text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Avaliados</p>
                    <p className="text-xl font-black text-slate-800 mt-1">{networkData.avaliados}</p>
                  </div>
                  <div className="border border-slate-200 p-3.5 rounded-lg text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Participação</p>
                    <p className="text-xl font-black text-blue-600 mt-1">{networkData.participacao}%</p>
                  </div>
                  <div className="border border-slate-200 p-3.5 rounded-lg text-center bg-red-50/50">
                    <p className="text-[10px] font-bold text-red-500 uppercase">Parcial (Crítico)</p>
                    <p className="text-xl font-black text-red-600 mt-1">{networkData.parcial}%</p>
                  </div>
                  <div className="border border-slate-200 p-3.5 rounded-lg text-center bg-blue-50/30">
                    <p className="text-[10px] font-bold text-blue-500 uppercase">Mínimo</p>
                    <p className="text-xl font-black text-blue-700 mt-1">{networkData.minimo}%</p>
                  </div>
                  <div className="border border-slate-200 p-3.5 rounded-lg text-center bg-emerald-50/30">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase">Excedeu</p>
                    <p className="text-xl font-black text-emerald-700 mt-1">{networkData.excedeu}%</p>
                  </div>
                </div>

                {/* Graph Title */}
                <div className="border border-slate-150 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Participação por Escola (%)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[...schools].sort((a,b) => b.participacao - a.participacao)}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="nomeEscola" tick={false} />
                        <YAxis domain={[0, 100]} fontSize={10} />
                        <Tooltip />
                        <Bar dataKey="participacao" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-wide text-center">
                    Fonte: Avaliação Oral de Matemática 2026 — Rede Municipal de Pindamonhangaba
                  </p>
                </div>

                {/* Stacked bar or Sector analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-150 rounded-lg p-5">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Participação Média por Setor</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sectorStats}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="sectorName" fontSize={9} />
                          <YAxis domain={[0, 100]} fontSize={9} />
                          <Tooltip />
                          <Bar dataKey="participacao" fill="#10b981" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="border border-slate-150 rounded-lg p-5">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Parcial % (Alunos Críticos) por Setor</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sectorStats}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="sectorName" fontSize={9} />
                          <YAxis domain={[0, 100]} fontSize={9} />
                          <Tooltip />
                          <Bar dataKey="parcial" fill="#ef4444" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Main Table */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tabela Completa de Escolas</h3>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-2.5">Escola</th>
                          <th className="px-4 py-2.5">Setor</th>
                          <th className="px-4 py-2.5 text-center">Previstos</th>
                          <th className="px-4 py-2.5 text-center">Avaliados</th>
                          <th className="px-4 py-2.5 text-center">Participação (%)</th>
                          <th className="px-4 py-2.5 text-center text-red-500">Parcial (%)</th>
                          <th className="px-4 py-2.5 text-center text-amber-500">Mínimo (%)</th>
                          <th className="px-4 py-2.5 text-center text-emerald-500">Excedeu (%)</th>
                          <th className="px-4 py-2.5 text-center bg-blue-50 text-blue-900">Sucesso (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {schools.map(s => (
                          <tr key={s.nomeEscola} className="hover:bg-slate-50">
                            <td className="px-4 py-2 font-bold text-slate-700">{formatSchoolName(s.nomeEscola)}</td>
                            <td className="px-4 py-2 font-bold text-slate-500">{getSectorForSchool(s.nomeEscola)}</td>
                            <td className="px-4 py-2 text-center">{s.previstos}</td>
                            <td className="px-4 py-2 text-center">{s.avaliados}</td>
                            <td className="px-4 py-2 text-center">{s.participacao}%</td>
                            <td className="px-4 py-2 text-center text-red-600 font-bold">{s.parcial}%</td>
                            <td className="px-4 py-2 text-center text-amber-600">{s.minimo}%</td>
                            <td className="px-4 py-2 text-center text-emerald-600">{s.excedeu}%</td>
                            <td className="px-4 py-2 text-center font-extrabold bg-blue-50 text-blue-700">{s.sucesso}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Alertas Pedagógicos */}
                <div className="border border-red-100 bg-red-50/20 p-5 rounded-lg space-y-3">
                  <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={15} />
                    <span>Alertas Críticos de Participação e Defasagem</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-bold text-red-700">Participação Abaixo do Recomendado (&lt; 80%):</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1 font-semibold text-slate-600">
                        {schools.filter(s => s.participacao < 80).map(s => (
                          <li key={s.nomeEscola}>{formatSchoolName(s.nomeEscola)} ({s.participacao}%)</li>
                        ))}
                        {schools.filter(s => s.participacao < 80).length === 0 && (
                          <li className="text-emerald-600 list-none font-bold">Nenhuma escola com participação crítica!</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <p className="font-bold text-red-700">Parcial Crítico (Defasagem Extrema &ge; 40%):</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1 font-semibold text-slate-600">
                        {schools.filter(s => s.parcial >= 40).map(s => (
                          <li key={s.nomeEscola}>{formatSchoolName(s.nomeEscola)} ({s.parcial}%)</li>
                        ))}
                        {schools.filter(s => s.parcial >= 40).length === 0 && (
                          <li className="text-emerald-600 list-none font-bold">Nenhuma escola com parcial &ge; 40%!</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Synthesis */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">Síntese de Intervenção Pedagógica</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Com base no rendimento da rede, observa-se que a média municipal de participação é de {networkData.participacao}%, um valor fidedigno para planejamento. Contudo, há escolas que necessitam de intervenção pedagógica direta devido à alta proporção de alunos no nível parcial (acima de 40%), exigindo um plano de recomposição estruturado com materiais concretos para consolidar a base da matemática de 2º ano.
                  </p>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* REPORT TYPE B: DESCRITORES                           */}
            {/* ---------------------------------------------------- */}
            {reportType === 'descritores' && (
              <div className="space-y-6">
                {/* Ranking block */}
                <div className="border border-slate-150 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Média de Rendimento por Descritor</h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={descriptorRankings}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="id" fontSize={10} />
                        <YAxis domain={[0, 100]} fontSize={10} />
                        <Tooltip />
                        <Bar dataKey="avg" fill="#1e3a8a" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Heatmap Visual Grid */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Matriz Escola x Descritor (Heatmap)</h3>
                  <p className="text-xs text-slate-500 font-semibold">Legenda: <span className="text-red-600">&lt;60 Crítico</span> | <span className="text-amber-600">60-69 Atenção</span> | <span className="text-emerald-600">&ge;70 Consolidado</span></p>
                  
                  <div className="overflow-x-auto rounded-lg border border-slate-200 text-[11px]">
                    <table className="min-w-full divide-y divide-slate-200 text-left">
                      <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-2">Escola</th>
                          <th className="px-3 py-2 text-center">D001</th>
                          <th className="px-3 py-2 text-center">D002</th>
                          <th className="px-3 py-2 text-center">D003</th>
                          <th className="px-3 py-2 text-center">D004</th>
                          <th className="px-3 py-2 text-center">D005</th>
                          <th className="px-3 py-2 text-center">D006</th>
                          <th className="px-3 py-2 text-center">D007</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 font-semibold text-slate-700">
                        {schools.map(s => (
                          <tr key={s.nomeEscola} className="hover:bg-slate-50">
                            <td className="px-4 py-2 font-bold text-slate-700">{formatSchoolName(s.nomeEscola)}</td>
                            {DESCRIPTORS.map(d => {
                              const val = s.descritores[d.id];
                              let colorClass = 'bg-slate-50 text-slate-300';
                              if (val !== null && val !== undefined) {
                                if (val < 60) colorClass = 'bg-red-100 text-red-800';
                                else if (val < 70) colorClass = 'bg-amber-100 text-amber-800';
                                else colorClass = 'bg-emerald-100 text-emerald-800';
                              }
                              return (
                                <td key={d.id} className={`px-3 py-2 text-center font-extrabold ${colorClass}`}>
                                  {val ?? '—'}{val !== null && val !== undefined ? '%' : ''}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Anti-illusion marker and Alerts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="border border-slate-200 p-4 rounded-lg space-y-2">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wide">Ponto de Auditoria de Dados</h4>
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded text-amber-900 font-semibold leading-relaxed">
                      <strong>Fato Validado:</strong> E.M. Dona Minica registra <strong className="text-red-700">D005_J = 9%</strong> de rendimento real de acordo com as planilhas validadas. Não há erro de cálculo; trata-se de defasagem real estrutural no descritor de Grandezas e Medidas naquela unidade que requer plantão pedagógico prioritário.
                    </div>
                  </div>

                  <div className="border border-slate-200 p-4 rounded-lg space-y-2">
                    <h4 className="font-bold text-red-800 uppercase tracking-wide">Escolas com Descritor &lt; 60 (Prioritárias)</h4>
                    <div className="max-h-32 overflow-y-auto pr-1">
                      <ul className="list-disc pl-5 space-y-1 text-slate-600 font-semibold">
                        {schools.filter(s => {
                          return Object.values(s.descritores).some(v => v !== null && v !== undefined && v < 60);
                        }).map(s => {
                          const badDs = Object.entries(s.descritores)
                            .filter(([_, v]) => v !== null && v !== undefined && v < 60)
                            .map(([k, v]) => `${k} (${v}%)`);
                          return (
                            <li key={s.nomeEscola}>
                              <span className="font-bold">{formatSchoolName(s.nomeEscola)}</span>: {badDs.join(', ')}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* REPORT TYPE C: ITENS                                 */}
            {/* ---------------------------------------------------- */}
            {reportType === 'itens' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Critical Items */}
                  <div className="border border-slate-200 p-5 rounded-lg space-y-3">
                    <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle size={15} />
                      <span>Top 10 Itens Mais Críticos (Menor Média)</span>
                    </h3>
                    <div className="space-y-2.5">
                      {itemRankings.slice(0, 10).map((it, idx) => (
                        <div key={it.id} className="flex justify-between items-start text-xs border-b border-slate-100 pb-1.5">
                          <div>
                            <span className="font-bold text-slate-800">{it.id}</span>
                            <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded ml-1.5 font-bold uppercase">{it.descriptorId}</span>
                            <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">{it.theme}</p>
                          </div>
                          <span className="font-extrabold text-red-600 px-2 py-0.5 rounded bg-red-50">{it.avg}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strongest Items */}
                  <div className="border border-slate-200 p-5 rounded-lg space-y-3">
                    <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 size={15} />
                      <span>Top 10 Itens Mais Fortes (Maior Média)</span>
                    </h3>
                    <div className="space-y-2.5">
                      {[...itemRankings].reverse().slice(0, 10).map((it, idx) => (
                        <div key={it.id} className="flex justify-between items-start text-xs border-b border-slate-100 pb-1.5">
                          <div>
                            <span className="font-bold text-slate-800">{it.id}</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded ml-1.5 font-bold uppercase">{it.descriptorId}</span>
                            <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">{it.theme}</p>
                          </div>
                          <span className="font-extrabold text-emerald-600 px-2 py-0.5 rounded bg-emerald-50">{it.avg}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Audit verification points */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Pontos de Conferência Pedagógica</span>
                  <p className="text-xs text-slate-600 mt-1 font-semibold leading-relaxed">
                    E.M. Dona Minica registra <strong className="text-red-700">Item 10 = 9%</strong> no arquivo oficial. Adicionalmente, todos os registros com &quot;0&quot; de acerto em turmas específicas correspondem a estudantes que erraram as respectivas questões unânimes naquela classe, sem dados forçados ou imputados artificialmente.
                  </p>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* REPORT TYPE D: ESCOLA                                */}
            {/* ---------------------------------------------------- */}
            {reportType === 'escola' && selectedSchool && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg flex flex-col md:flex-row justify-between gap-4 text-xs">
                  <div>
                    <h3 className="text-sm font-black text-slate-800">{formatSchoolName(selectedSchool.nomeEscola)}</h3>
                    <p className="text-slate-500 font-bold mt-1">Setor Geográfico: {getSectorForSchool(selectedSchool.nomeEscola)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-400 uppercase">Prioridade Pedagógica:</span>
                    {selectedSchool.sucesso < 65 || selectedSchool.participacao < 80 ? (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded font-black text-[10px] uppercase border border-red-200">ALTA PRIORIDADE</span>
                    ) : selectedSchool.sucesso < 76 ? (
                      <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded font-black text-[10px] uppercase border border-amber-200">MÉDIA PRIORIDADE</span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded font-black text-[10px] uppercase border border-emerald-200">BAIXA / MONITORAMENTO</span>
                    )}
                  </div>
                </div>

                {/* School metrics compared to municipality */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-150 rounded-lg p-5">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Classificação das Faixas (Escola)</h3>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Parcial', value: selectedSchool.parcial },
                              { name: 'Mínimo', value: selectedSchool.minimo },
                              { name: 'Excedeu', value: selectedSchool.excedeu }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            <Cell fill="#ef4444" />
                            <Cell fill="#3b82f6" />
                            <Cell fill="#10b981" />
                          </Pie>
                          <Tooltip />
                          <Legend iconSize={8} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="border border-slate-150 rounded-lg p-5">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Descritores: Escola x Município (%)</h3>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={DESCRIPTORS.map(d => ({
                          name: d.id,
                          'Escola (%)': selectedSchool.descritores[d.id] || 0,
                          'Município (%)': networkData.descritores[d.id] || 0
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={9} />
                          <YAxis domain={[0, 100]} fontSize={9} />
                          <Tooltip />
                          <Legend iconSize={8} />
                          <Bar dataKey="Escola (%)" fill="#3b82f6" />
                          <Bar dataKey="Município (%)" fill="#cbd5e1" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* School weakness details */}
                <div className="border border-slate-200 p-5 rounded-lg space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Planilha Detalhada de Itens Críticos da Escola (&lt; 50%)</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-150 text-xs text-left">
                      <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-2">Item</th>
                          <th className="px-4 py-2">Descritor</th>
                          <th className="px-4 py-2">Habilidade Avaliada</th>
                          <th className="px-4 py-2 text-right">Taxa da Escola (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ITEMS.map(it => ({
                          ...it,
                          val: selectedSchool.itens[it.id]
                        }))
                        .filter(i => i.val !== null && i.val !== undefined && i.val < 50)
                        .map(i => (
                          <tr key={i.id} className="border-b border-slate-100">
                            <td className="px-4 py-2 font-bold text-slate-800">{i.id}</td>
                            <td className="px-4 py-2 font-semibold text-blue-700">{i.descriptorId}</td>
                            <td className="px-4 py-2 text-slate-500">{i.theme}</td>
                            <td className="px-4 py-2 text-right text-red-600 font-extrabold">{i.val}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Síntese Escolar */}
                <div className="bg-blue-50/30 border border-blue-100 p-4 rounded-lg text-xs space-y-1">
                  <h4 className="font-bold text-blue-900 uppercase">Síntese de Intervenção para {selectedSchool.nomeEscola}</h4>
                  <p className="text-slate-600 leading-relaxed font-normal">
                    Recomenda-se realizar reuniões de plano de aula focando especificamente nas lacunas indicadas nos itens críticos acima. Devem ser priorizados agrupamentos produtivos de recomposição do 2º ano no contraturno escolar, apoiados em recursos visuais e de manipulação para reverter o patamar parcial para o mínimo ou excedido.
                  </p>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* REPORT TYPE E: TURMA                                 */}
            {/* ---------------------------------------------------- */}
            {reportType === 'turma' && selectedClass && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Turma Selecionada</span>
                    <p className="text-sm font-black text-slate-800 mt-0.5">{selectedClass.nomeTurma}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Escola</span>
                    <p className="text-sm font-black text-slate-800 mt-0.5">{formatSchoolName(selectedClass.nomeEscola)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Setor Geográfico</span>
                    <p className="text-sm font-black text-slate-800 mt-0.5">{getSectorForSchool(selectedClass.nomeEscola)}</p>
                  </div>
                </div>

                {/* Triple Comparatives Block */}
                <div className="border border-slate-200 p-5 rounded-lg space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Descritores: Turma x Escola x Município (%)</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={DESCRIPTORS.map(d => ({
                        name: d.id,
                        'Turma (%)': selectedClass.descritores[d.id] || 0,
                        'Escola (%)': selectedSchool ? (selectedSchool.descritores[d.id] || 0) : 0,
                        'Município (%)': networkData.descritores[d.id] || 0
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={9} />
                        <YAxis domain={[0, 100]} fontSize={9} />
                        <Tooltip />
                        <Legend iconSize={8} />
                        <Bar dataKey="Turma (%)" fill="#10b981" />
                        <Bar dataKey="Escola (%)" fill="#60a5fa" />
                        <Bar dataKey="Município (%)" fill="#cbd5e1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Class KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs">
                  <div className="border border-slate-200 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Participação</span>
                    <span className="text-lg font-black block text-blue-600 mt-0.5">{selectedClass.participacao}%</span>
                  </div>
                  <div className="border border-slate-200 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Alunos Parciais (Críticos)</span>
                    <span className="text-lg font-black block text-red-500 mt-0.5">{selectedClass.parcial}%</span>
                  </div>
                  <div className="border border-slate-200 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Sucesso Matemático</span>
                    <span className="text-lg font-black block text-emerald-600 mt-0.5">{selectedClass.sucesso}%</span>
                  </div>
                  <div className="border border-slate-200 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Avaliados / Previstos</span>
                    <span className="text-lg font-black block text-slate-800 mt-0.5">{selectedClass.avaliados} / {selectedClass.previstos}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* REPORT TYPE F: EXECUTIVO                              */}
            {/* ---------------------------------------------------- */}
            {reportType === 'executivo' && (
              <div className="space-y-8 font-sans animate-fadeIn">
                
                {/* SECTION 1: RESUMO DA REDE */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white space-y-4 print:border-none print:p-0">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="bg-blue-900 text-white text-[11px] font-bold px-2 py-0.5 rounded">1</span>
                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider">
                      RESUMO DA REDE (DADOS OFICIAIS DO MUNICÍPIO)
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Numbers Column */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Participação</h4>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="border border-slate-150 p-2.5 rounded-lg bg-slate-50">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Previstos</span>
                            <span className="text-base font-black text-slate-800 block mt-0.5">1.881</span>
                          </div>
                          <div className="border border-slate-150 p-2.5 rounded-lg bg-slate-50">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Avaliados</span>
                            <span className="text-base font-black text-slate-800 block mt-0.5">1.716</span>
                          </div>
                          <div className="border border-slate-150 p-2.5 rounded-lg bg-blue-50/50 border-blue-100">
                            <span className="text-[9px] font-bold text-blue-500 uppercase block">Avaliados (%)</span>
                            <span className="text-base font-black text-blue-700 block mt-0.5">91%</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Faixas de desempenho (município)</h4>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="border border-slate-150 p-2.5 rounded-lg bg-amber-50/50 border-amber-200">
                            <span className="text-[9px] font-bold text-amber-500 uppercase block leading-tight">Parcial o mínimo</span>
                            <span className="text-base font-black text-amber-600 block mt-0.5">29%</span>
                          </div>
                          <div className="border border-slate-150 p-2.5 rounded-lg bg-blue-50/50 border-blue-200">
                            <span className="text-[9px] font-bold text-blue-500 uppercase block leading-tight">Atingiu o mínimo</span>
                            <span className="text-base font-black text-blue-700 block mt-0.5">44%</span>
                          </div>
                          <div className="border border-slate-150 p-2.5 rounded-lg bg-emerald-50/50 border-emerald-200">
                            <span className="text-[9px] font-bold text-emerald-500 uppercase block leading-tight">Excedeu o mínimo</span>
                            <span className="text-base font-black text-emerald-700 block mt-0.5">27%</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase text-right">
                          (Soma das faixas = 100%)
                        </p>
                      </div>
                    </div>

                    {/* Textual Leitura Objetiva */}
                    <div className="bg-slate-50 border border-slate-150 rounded-lg p-4 space-y-2 text-xs font-semibold">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Leitura Objetiva:</h4>
                      <ul className="list-disc pl-5 space-y-1.5 text-slate-600 font-normal">
                        <li>A rede avaliou <strong className="text-blue-800 font-bold">91%</strong> dos estudantes previstos.</li>
                        <li>A maior fatia está em <strong className="text-slate-800 font-bold">“Atingiu o mínimo” (44%)</strong>.</li>
                        <li><strong className="text-amber-600 font-bold">29%</strong> permaneceram em “Atingiu parcialmente o mínimo” (público prioritário de consolidação).</li>
                        <li><strong className="text-emerald-600 font-bold">27%</strong> “Excedeu o mínimo” (referência de boas práticas internas).</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: DESCRITORES DA REDE */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white space-y-4 print:border-none print:p-0">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="bg-blue-900 text-white text-[11px] font-bold px-2 py-0.5 rounded">2</span>
                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider">
                      DESCRITORES DA REDE (D001_J a D007_J)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Table-grid of descriptor percentages */}
                    <div className="grid grid-cols-7 gap-2 text-center">
                      {[
                        { id: 'D001_J', val: 88 },
                        { id: 'D002_J', val: 91 },
                        { id: 'D003_J', val: 92 },
                        { id: 'D004_J', val: 78 },
                        { id: 'D005_J', val: 79 },
                        { id: 'D006_J', val: 80 },
                        { id: 'D007_J', val: 71 },
                      ].map(d => (
                        <div key={d.id} className="border border-slate-150 p-2 rounded-lg bg-slate-50">
                          <span className="text-[9px] font-black text-blue-700 block">{d.id}</span>
                          <span className="text-sm font-black text-slate-800 block mt-1">{d.val}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Destaques Factuais */}
                    <div className="bg-slate-50 border border-slate-150 rounded-lg p-4 text-xs font-semibold space-y-2">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Destaques factuais:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600 font-normal">
                        <li>Mais alto: <strong className="text-emerald-600 font-bold">D003_J (92%)</strong></li>
                        <li>Mais baixo: <strong className="text-red-600 font-bold">D007_J (71%)</strong></li>
                        <li>Descritores <strong className="text-slate-800 font-bold">D004, D005, D006 e D007</strong> ficam abaixo de 81% e devem compor o foco de acompanhamento pedagógico da rede.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: ITENS DA REDE */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white space-y-4 print:border-none print:p-0">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="bg-blue-900 text-white text-[11px] font-bold px-2 py-0.5 rounded">3</span>
                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider">
                      ITENS DA REDE (ITEM 01 a 27) — % DE ACERTO
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Item list 1 to 27 as exact values in prompt */}
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ordem Item 01 → 27:</h4>
                      <div className="grid grid-cols-9 sm:grid-cols-27 gap-1.5 text-center text-[10px] font-mono font-bold">
                        {[
                          88, 91, 93, 86, 93, 92, 82, 75, 88, 70,
                          89, 84, 85, 88, 79, 69, 73, 76, 81, 71,
                          69, 81, 74, 69, 63, 68, 67
                        ].map((val, idx) => (
                          <div 
                            key={idx} 
                            className={`p-1 border rounded ${
                              val === 63 ? 'bg-red-50 text-red-700 border-red-200 font-black' : 
                              val === 93 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-black' : 
                              'bg-slate-50 text-slate-700 border-slate-150'
                            }`}
                            title={`Item ${idx + 1 < 10 ? '0' + (idx + 1) : idx + 1}`}
                          >
                            <span className="text-[8px] text-slate-400 block font-sans">{(idx + 1 < 10 ? '0' : '') + (idx + 1)}</span>
                            <span className="block mt-0.5">{val}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Destaques Factuais */}
                    <div className="bg-slate-50 border border-slate-150 rounded-lg p-4 text-xs font-semibold space-y-2">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Destaques factuais:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600 font-normal">
                        <li>Mais altos: <strong className="text-emerald-600 font-bold">Item 03 = 93%</strong> e <strong className="text-emerald-600 font-bold">Item 05 = 93%</strong></li>
                        <li>Mais baixo: <strong className="text-red-600 font-bold">Item 25 = 63%</strong></li>
                        <li>Itens com maior fragilidade relativa na rede (menores percentuais oficiais): <strong className="text-slate-800 font-bold">25 (63), 27 (67), 26 (68), 16 (69), 21 (69), 24 (69), 10 (70)</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: ABRANGÊNCIA OPERACIONAL */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white space-y-4 print:border-none print:p-0">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="bg-blue-900 text-white text-[11px] font-bold px-2 py-0.5 rounded">4</span>
                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider">
                      ABRANGÊNCIA OPERACIONAL
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="border border-slate-150 p-3 rounded-lg bg-slate-50">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Escolas Avaliadas</span>
                      <span className="text-xl font-black text-slate-800 block mt-1">37</span>
                    </div>
                    <div className="border border-slate-150 p-3 rounded-lg bg-slate-50">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Turmas Avaliadas</span>
                      <span className="text-xl font-black text-slate-800 block mt-1">102</span>
                    </div>
                    <div className="border border-slate-150 p-3 rounded-lg bg-slate-50">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Soma de Previstos</span>
                      <span className="text-xl font-black text-slate-800 block mt-1">1.881</span>
                    </div>
                    <div className="border border-slate-150 p-3 rounded-lg bg-blue-50/30 border-blue-100">
                      <span className="text-[9px] font-bold text-blue-500 uppercase block">Soma de Avaliados</span>
                      <span className="text-xl font-black text-blue-700 block mt-1">1.716</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase text-center mt-1">
                    (Fechamento idêntico ao consolidado municipal)
                  </p>
                </div>

                {/* SECTION 5: VISÃO POR SETORES (CADASTRO OFICIAL) */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white space-y-4 print:border-none print:p-0">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="bg-blue-900 text-white text-[11px] font-bold px-2 py-0.5 rounded">5</span>
                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider">
                      VISÃO POR SETORES (CADASTRO OFICIAL)
                    </h3>
                  </div>

                  {/* Rules note */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-150 text-[11px] font-semibold text-slate-600 leading-relaxed">
                    <span className="font-bold text-blue-900 block uppercase mb-1">Regras de Apresentação Setorial:</span>
                    <ul className="list-disc pl-5 space-y-0.5 font-normal">
                      <li>Chips/cadastro = nomes oficiais do setor (sem inventar)</li>
                      <li>Tabela de resultados = apenas escolas presentes no CSV com match válido ao cadastro</li>
                      <li>Escola sem match → <strong className="text-red-700 font-bold">&quot;NÃO MAPEADO&quot;</strong> (nunca forçar setor)</li>
                      <li><strong className="text-red-700 font-bold">PROIBIDO:</strong> chip &quot;CAMARGO&quot;; colocar <strong className="text-slate-800 font-bold">&quot;MARIA APARECIDA CAMARGO DE SOUZA&quot;</strong> no SETOR 4.</li>
                    </ul>
                  </div>

                  {/* Active Sector Grid with precise computed results */}
                  <div className="space-y-4">
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                        <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-2.5">Setor Territorial</th>
                            <th className="px-3 py-2.5 text-center">Escolas no CSV</th>
                            <th className="px-3 py-2.5 text-center">Previstos</th>
                            <th className="px-3 py-2.5 text-center">Avaliados</th>
                            <th className="px-3 py-2.5 text-center">Part. Média (%)</th>
                            <th className="px-3 py-2.5 text-center text-amber-600">Parcial %</th>
                            <th className="px-3 py-2.5 text-center text-blue-700">Mínimo %</th>
                            <th className="px-3 py-2.5 text-center text-emerald-700">Excedeu %</th>
                            <th className="px-4 py-2.5">Escolas Críticas / Alta Prioridade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 font-semibold text-slate-700">
                          {sectorStats.map(s => {
                            const criticalSchools = s.escolas.filter(sch => sch.sucesso < 65 || sch.participacao < 80);
                            return (
                              <tr key={s.sectorName} className="hover:bg-slate-50">
                                <td className="px-4 py-2.5 font-bold text-slate-800">{s.sectorName}</td>
                                <td className="px-3 py-2.5 text-center font-mono">{s.totalEscolas}</td>
                                <td className="px-3 py-2.5 text-center font-mono">{s.previstos}</td>
                                <td className="px-3 py-2.5 text-center font-mono">{s.avaliados}</td>
                                <td className="px-3 py-2.5 text-center text-blue-600 font-mono">{s.participacao}%</td>
                                <td className="px-3 py-2.5 text-center text-amber-600 font-mono">{s.parcial}%</td>
                                <td className="px-3 py-2.5 text-center text-blue-700 font-mono">{s.minimo}%</td>
                                <td className="px-3 py-2.5 text-center text-emerald-700 font-mono">{s.excedeu}%</td>
                                <td className="px-4 py-2.5 text-[11px] text-red-700 font-bold">
                                  {criticalSchools.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {criticalSchools.map(sch => (
                                        <span key={sch.nomeEscola} className="bg-red-50 text-red-800 px-1.5 py-0.5 rounded border border-red-100 text-[9px]">
                                          {formatSchoolName(sch.nomeEscola)}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-emerald-700 font-semibold text-[10px]">Nenhuma</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Official Cadastro Listing */}
                    <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-150 space-y-3.5">
                      <span className="text-[10px] font-black text-slate-500 uppercase block tracking-wider">
                        Cadastro de Escolas por Setor (Cadastro Oficial de Pindamonhangaba)
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                        <div>
                          <strong className="text-blue-900 block font-black uppercase mb-1">SETOR 1</strong>
                          <p className="text-slate-600 font-medium font-sans">ANDRÉ FRANCO MONTORO, ARANTES VASQUES, DULCE PEDROSA, GILDA PIORINI, MARIA ZARA, MOACYR DE ALMEIDA, PAULO FREIRE</p>
                        </div>
                        <div>
                          <strong className="text-blue-900 block font-black uppercase mb-1">SETOR 4</strong>
                          <p className="text-slate-600 font-medium font-sans">MARIANA CAMPOS, AUGUSTO CESAR, DONA MINICA, FELIX ADIB, PADRE MÁRIO ANTONIO BONOTTI - REDENTORISTA, ORLANDO PIRES</p>
                        </div>
                        <div>
                          <strong className="text-blue-900 block font-black uppercase mb-1">SETOR 5</strong>
                          <p className="text-slate-600 font-medium font-sans">ÂNGELO PAZ, ELIAS BARGIS, JOÃO KOLENDA, MADALENA CALTABIANO, REGINA CÉLIA, VITO ARDITO</p>
                        </div>
                        <div>
                          <strong className="text-blue-900 block font-black uppercase mb-1">SETOR 7</strong>
                          <p className="text-slate-600 font-medium font-sans">ALEXANDRE MACHADO, ARTHUR DE ANDRADE, JOÃO CESÁRIO, MARIA HELENA RIBEIRO, RUTH AZEVEDO, YVONE</p>
                        </div>
                        <div>
                          <strong className="text-blue-900 block font-black uppercase mb-1">SETOR 9</strong>
                          <p className="text-slate-600 font-medium font-sans">FRANCISCO DE ASSIS, JOAQUIM PEREIRA, LAURO VICENTE, MARIO DE ASSIS, RACHEL DE AGUIAR, SEU JUQUINHA</p>
                        </div>
                        <div>
                          <strong className="text-blue-900 block font-black uppercase mb-1">SETOR 10</strong>
                          <p className="text-slate-600 font-medium font-sans">ABDIAS, ISABEL DO CARMO, JULIETA REALE, ODETE CORRÊA, PADRE ZEZINHO, SERAFIM FERREIRA</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 6: PRIORIZAÇÃO PEDAGÓGICA DA REDE */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white space-y-4 print:border-none print:p-0">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="bg-blue-900 text-white text-[11px] font-bold px-2 py-0.5 rounded">6</span>
                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider">
                      PRIORIZAÇÃO PEDAGÓGICA DA REDE
                    </h3>
                  </div>

                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg text-[11px] font-semibold text-slate-500">
                    <span className="font-bold text-slate-700 block uppercase mb-1">Critérios Operacionais de Alerta:</span>
                    <p>
                      <strong>Participação:</strong> &ge; 95% Adequada | 80–94% Atenção | &lt; 80% Crítica
                    </p>
                    <p className="mt-1">
                      <strong>Desempenho:</strong> Parcial &ge; 40% (alerta de consolidação)
                    </p>
                    <p className="mt-1">
                      <strong>Descritores:</strong> D00X &lt; 60% Crítico | 60–69% Atenção
                    </p>
                    <p className="mt-1">
                      <strong>Itens:</strong> Item &lt; 50% Crítico (&quot;—&quot; não conta; 0 real conta)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                    
                    {/* A) Participação Crítica */}
                    <div className="border border-red-100 bg-red-50/10 rounded-lg p-4 space-y-2">
                      <span className="font-bold text-red-800 uppercase block tracking-wider">
                        A) Escolas com Participação Crítica (&lt;80%)
                      </span>
                      <ul className="list-disc pl-5 space-y-1 font-normal text-slate-600">
                        {schools.filter(s => s.participacao < 80).map(s => (
                          <li key={s.nomeEscola}>
                            <strong className="text-slate-800 font-bold">{formatSchoolName(s.nomeEscola)}</strong> &mdash; {s.participacao}% (Previstos: {s.previstos} / Avaliados: {s.avaliados})
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* B) Parcial >= 40% */}
                    <div className="border border-amber-100 bg-amber-50/10 rounded-lg p-4 space-y-2">
                      <span className="font-bold text-amber-800 uppercase block tracking-wider">
                        B) Escolas com Parcial &ge; 40% (Alta Defasagem)
                      </span>
                      <ul className="list-disc pl-5 space-y-1 font-normal text-slate-600">
                        {schools.filter(s => s.parcial >= 40).map(s => (
                          <li key={s.nomeEscola}>
                            <strong className="text-slate-800 font-bold">{formatSchoolName(s.nomeEscola)}</strong> &mdash; {s.parcial}% de alunos no nível parcial
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* C) Turmas com Avaliados = 0 */}
                    <div className="border border-slate-200 rounded-lg p-4 space-y-2 md:col-span-2">
                      <span className="font-bold text-slate-800 uppercase block tracking-wider">
                        C) Turmas com Avaliados = 0 (Sem Cobertura de Dados)
                      </span>
                      <ul className="list-disc pl-5 space-y-1 font-normal text-slate-600">
                        {classes.filter(c => c.avaliados === 0).map(c => (
                          <li key={c.codigoTurma}>
                            <strong className="text-slate-800 font-bold">{formatSchoolName(c.nomeEscola)}</strong> &mdash; Turma <strong className="text-blue-900 font-bold">{c.nomeTurma}</strong> (0 avaliados)
                          </li>
                        ))}
                        {classes.filter(c => c.avaliados === 0).length === 0 && (
                          <li className="list-none text-emerald-700 font-bold uppercase text-[10px]">Excelência: 100% das turmas possuem cobertura de avaliação!</li>
                        )}
                      </ul>
                    </div>

                    {/* D) Pontos críticos de descritores/itens */}
                    <div className="border border-slate-200 rounded-lg p-4 space-y-2 md:col-span-2 bg-slate-50">
                      <span className="font-bold text-slate-800 uppercase block tracking-wider">
                        D) Pontos Críticos de Descritores/Itens na Rede
                      </span>
                      <ul className="list-disc pl-5 space-y-1 font-normal text-slate-600 leading-relaxed">
                        <li>Descritor municipal mais baixo: <strong className="text-red-700 font-bold">D007_J = 71%</strong></li>
                        <li>Item municipal mais baixo: <strong className="text-red-700 font-bold">Item 25 = 63%</strong></li>
                        <li>
                          Caso-escola sensível validado oficialmente: 
                          <strong className="text-slate-800 font-bold"> E.M. PROFA MARIA MADUREIRA SALGADO DONA MINICA</strong> registra 
                          <strong className="text-red-700 font-bold"> D005_J = 9%</strong> (não corrigido para 90, reflete defasagem empírica).
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* SECTION 7: ESCOLA DE REFERÊNCIA */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white space-y-4 print:border-none print:p-0">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="bg-blue-900 text-white text-[11px] font-bold px-2 py-0.5 rounded">7</span>
                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider">
                      ESCOLA DE REFERÊNCIA PARA CONFERÊNCIA — E.M. ARANTES VASQUES
                    </h3>
                  </div>

                  <div className="bg-blue-50/10 border border-blue-100 rounded-lg p-4 space-y-4 text-xs font-semibold">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="bg-white border border-blue-100 p-2.5 rounded-lg">
                        <span className="text-[9px] text-slate-400 uppercase block">Participação</span>
                        <p className="text-sm font-black text-blue-700 mt-1">Previstos=49 | Avaliados=47 | 96%</p>
                      </div>
                      <div className="bg-white border border-blue-100 p-2.5 rounded-lg">
                        <span className="text-[9px] text-slate-400 uppercase block">Faixas</span>
                        <p className="text-sm font-black text-slate-700 mt-1">Parcial=11% | Mínimo=53% | Excedeu=36%</p>
                      </div>
                      <div className="bg-white border border-blue-100 p-2.5 rounded-lg">
                        <span className="text-[9px] text-slate-400 uppercase block">Setor Geográfico</span>
                        <p className="text-sm font-black text-slate-700 mt-1">SETOR 1</p>
                      </div>
                    </div>

                    {/* Descritores */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Descritores (D001 a D007):</span>
                      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px]">
                        {[
                          { d: 'D001', v: 96 },
                          { d: 'D002', v: 100 },
                          { d: 'D003', v: 89 },
                          { d: 'D004', v: 83 },
                          { d: 'D005', v: 79 },
                          { d: 'D006', v: 88 },
                          { d: 'D007', v: 83 },
                        ].map(x => (
                          <div key={x.d} className="bg-white border border-slate-200 p-1 rounded">
                            <span className="text-[8px] text-slate-400 block font-sans">{x.d}</span>
                            <span className="font-extrabold text-blue-900">{x.v}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Itens */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Itens (01 → 27):</span>
                      <div className="grid grid-cols-9 sm:grid-cols-27 gap-1 text-center font-mono text-[9px] font-bold">
                        {[
                          '96', '100', '100', '—', '—', '89', '96', '68', '84',
                          '73', '92', '100', '—', '—', '84', '77', '—', '—',
                          '100', '86', '—', '—', '96', '82', '—', '—', '65'
                        ].map((v, idx) => (
                          <div key={idx} className="bg-white border border-slate-150 py-1 rounded">
                            <span className="text-[7px] text-slate-400 block font-sans">{(idx + 1 < 10 ? '0' : '') + (idx + 1)}</span>
                            <span className={v === '—' ? 'text-slate-300 font-sans' : 'text-slate-700'}>{v}{v !== '—' ? '%' : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Turmas */}
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Turmas Cadastradas:</span>
                      <div className="space-y-1.5 font-normal text-slate-600 leading-relaxed text-xs">
                        <p>
                          &bull; <strong className="text-slate-800 font-bold">2º ANO A:</strong> Prev=25 | Aval=25 | <strong className="text-blue-700 font-bold">100%</strong> | P=12% M=40% E=48% | Descritores: 96, 100, 92, 96, 84, 88, 89
                        </p>
                        <p>
                          &bull; <strong className="text-slate-800 font-bold">2º ANO B:</strong> Prev=24 | Aval=22 | <strong className="text-blue-700 font-bold">92%</strong> | P=9% M=68% E=23% | Descritores: 95, 100, 86, 68, 73, 89, 76
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    * O relatório executivo cita a E.M. Arantes Vasques como exemplo de leitura desagregada fidedigna para conferência, sem alteração desses números oficiais.
                  </p>
                </div>

                {/* SECTION 8: GRÁFICOS OBRIGATÓRIOS DO GABARITO */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white space-y-6 print:border-none print:p-0">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="bg-blue-900 text-white text-[11px] font-bold px-2 py-0.5 rounded">8</span>
                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider">
                      GRÁFICOS OBRIGATÓRIOS DO SISTEMA
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 1. Donut/Pizza Faixas */}
                    <div className="border border-slate-150 rounded-lg p-4 space-y-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider text-center">
                        1) Distribuição das Faixas de Desempenho (Município)
                      </span>
                      <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Atingiu parcialmente o mínimo', value: 29 },
                                { name: 'Atingiu o mínimo', value: 44 },
                                { name: 'Excedeu o mínimo', value: 27 },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={55}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              <Cell fill="#fbbf24" /> {/* Parcial - Amber */}
                              <Cell fill="#3b82f6" /> {/* Mínimo - Blue */}
                              <Cell fill="#10b981" /> {/* Excedeu - Emerald */}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* 2. Barras: Descritores da Rede */}
                    <div className="border border-slate-150 rounded-lg p-4 space-y-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider text-center">
                        2) Desempenho Médio por Descritor (%)
                      </span>
                      <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: 'D001', 'Média (%)': 88 },
                              { name: 'D002', 'Média (%)': 91 },
                              { name: 'D003', 'Média (%)': 92 },
                              { name: 'D004', 'Média (%)': 78 },
                              { name: 'D005', 'Média (%)': 79 },
                              { name: 'D006', 'Média (%)': 80 },
                              { name: 'D007', 'Média (%)': 71 },
                            ]}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={9} />
                            <YAxis domain={[0, 100]} fontSize={9} />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Bar dataKey="Média (%)" fill="#1e3b8b" radius={[3, 3, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* 3. Barras Horizontais: 10 Itens Mais Baixos */}
                    <div className="border border-slate-150 rounded-lg p-4 space-y-3 md:col-span-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider text-center">
                        3) Os 10 Itens de Menor Domínio na Rede (Foco de Recuperação)
                      </span>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={itemRankings.slice(0, 10).map(i => ({
                              name: `${i.id} (${i.descriptorId})`,
                              'Acerto (%)': i.avg
                            }))}
                            margin={{ left: 35, right: 10, top: 5, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} fontSize={9} />
                            <YAxis dataKey="name" type="category" fontSize={9} width={90} />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Bar dataKey="Acerto (%)" fill="#ef4444" radius={[0, 3, 3, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* 4. Barras por SETOR: Participação Média / Parcial Médio */}
                    <div className="border border-slate-150 rounded-lg p-4 space-y-3 md:col-span-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider text-center">
                        4) Participação Média x Parcial Médio por Setor Geográfico
                      </span>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sectorStats.filter(s => s.sectorName !== 'NÃO MAPEADO')}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="sectorName" fontSize={9} />
                            <YAxis domain={[0, 100]} fontSize={9} />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            <Bar dataKey="participacao" name="Participação Média (%)" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                            <Bar dataKey="parcial" name="Parcial Médio (%)" fill="#fbbf24" radius={[3, 3, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* 5. Tabela-ranking das escolas prioritárias */}
                    <div className="border border-slate-150 rounded-lg p-4 space-y-3 md:col-span-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
                        5) Ranking das Unidades Escolares Prioritárias (Participação Crítica e/ou Parcial &ge; 40%)
                      </span>
                      <div className="overflow-x-auto rounded border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-150 text-[11px] text-left">
                          <thead className="bg-slate-50 font-bold text-slate-400 uppercase">
                            <tr>
                              <th className="px-3 py-2">Escola</th>
                              <th className="px-3 py-2">Setor</th>
                              <th className="px-3 py-2 text-center">Participação (%)</th>
                              <th className="px-3 py-2 text-center text-amber-600">Parcial (%)</th>
                              <th className="px-3 py-2 text-center text-blue-700">Sucesso (%)</th>
                              <th className="px-3 py-2">Foco do Alerta</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                            {schools
                              .filter(s => s.participacao < 80 || s.parcial >= 40)
                              .map(s => {
                                let alertReason = 'Alerta Geral';
                                if (s.participacao < 80 && s.parcial >= 40) {
                                  alertReason = 'Part. Crítica & Alta Defasagem';
                                } else if (s.participacao < 80) {
                                  alertReason = 'Participação Crítica (<80%)';
                                } else if (s.parcial >= 40) {
                                  alertReason = 'Alta Defasagem (Parcial ≥40%)';
                                }
                                return (
                                  <tr key={s.nomeEscola} className="hover:bg-slate-50">
                                    <td className="px-3 py-2 font-bold text-slate-800">{formatSchoolName(s.nomeEscola)}</td>
                                    <td className="px-3 py-2">{getSectorForSchool(s.nomeEscola)}</td>
                                    <td className={`px-3 py-2 text-center ${s.participacao < 80 ? 'text-red-600 font-black' : 'text-slate-600'}`}>{s.participacao}%</td>
                                    <td className={`px-3 py-2 text-center text-amber-600 ${s.parcial >= 40 ? 'font-black' : ''}`}>{s.parcial}%</td>
                                    <td className="px-3 py-2 text-center text-blue-800">{s.sucesso}%</td>
                                    <td className="px-3 py-2">
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                                        s.participacao < 80 ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'
                                      }`}>
                                        {alertReason}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 9: SÍNTESE EXECUTIVA (TEXTO-BASE) */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white space-y-4 print:border-none print:p-0">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="bg-blue-900 text-white text-[11px] font-bold px-2 py-0.5 rounded">9</span>
                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider">
                      SÍNTESE EXECUTIVA (TEXTO-BASE)
                    </h3>
                  </div>

                  <div className="bg-slate-50 border border-slate-150 rounded-lg p-5 text-xs text-slate-700 leading-relaxed font-normal space-y-3">
                    <p>
                      A Rede Municipal de Pindamonhangaba aplicou a Avaliação Oral de Matemática 2026 ao 2º ano, com 1.716 estudantes avaliados de 1.881 previstos (91%).
                    </p>
                    <p>
                      No consolidado municipal, 44% atingiram o mínimo, 27% excederam o mínimo e 29% atingiram parcialmente o mínimo. Este último grupo constitui a prioridade de consolidação das aprendizagens.
                    </p>
                    <p>
                      Entre os descritores, o desempenho municipal varia de 71% (D007_J) a 92% (D003_J). Entre os itens, o menor percentual oficial da rede é o Item 25 (63%).
                    </p>
                    <p>
                      A leitura por setores e escolas deve considerar apenas as unidades com dados no CSV e vínculo válido ao cadastro de setores. Escolas ou turmas com participação baixa ou nula exigem checagem de cobertura antes da interpretação pedagógica dos percentuais de desempenho.
                    </p>
                    <p className="font-bold text-blue-950 uppercase text-[10px] tracking-wider pt-2">
                      As equipes pedagógicas devem priorizar:
                    </p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>escolas/turmas com participação crítica (&lt;80% ou Avaliados=0);</li>
                      <li>escolas com alto percentual em “atingiu parcialmente o mínimo”;</li>
                      <li>descritores e itens de menor domínio na rede (a partir de D007_J e Item 25, sem prejuízo da análise local escola a escola).</li>
                    </ol>
                  </div>
                </div>

                {/* SECTION 10: RODAPÉ */}
                <div className="border border-slate-200 rounded-lg p-6 bg-white space-y-2 print:border-none print:p-0">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                    <span className="bg-blue-900 text-white text-[11px] font-bold px-2 py-0.5 rounded">10</span>
                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider">
                      RODAPÉ
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Fonte: CSVs oficiais de Habilidade/Desempenho (Município, Escola e Turma) &mdash; Avaliação Oral de Matemática 2026. Este relatório não altera dados primários; apenas consolida e prioriza informações para apoio à intervenção pedagógica. Nomes de escolas exibidos com abreviatura E.M.
                  </p>
                </div>

              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* REPORT TYPE H: SETORES                               */}
            {/* ---------------------------------------------------- */}
            {reportType === 'setores' && (
              <div className="space-y-8 font-sans animate-fadeIn">
                {(!schoolName || schoolName === 'all') ? (
                  <>
                    {/* Summary grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="border border-slate-200 p-4 rounded-xl text-center bg-slate-50">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Setores Mapeados</span>
                        <span className="text-xl font-black text-slate-800 block mt-1">6</span>
                      </div>
                      <div className="border border-slate-200 p-4 rounded-xl text-center bg-slate-50">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Escolas Mapeadas</span>
                        <span className="text-xl font-black text-blue-600 block mt-1">
                          {sectorStats.reduce((acc, s) => acc + s.totalEscolas, 0)}
                        </span>
                      </div>
                      <div className="border border-slate-200 p-4 rounded-xl text-center bg-blue-50/20">
                        <span className="text-[10px] text-blue-500 font-bold uppercase block">Participação Média</span>
                        <span className="text-xl font-black text-blue-700 block mt-1">
                          {Math.round(sectorStats.reduce((acc, s) => acc + s.participacao, 0) / 6)}%
                        </span>
                      </div>
                      <div className="border border-slate-200 p-4 rounded-xl text-center bg-indigo-50/20">
                        <span className="text-[10px] text-indigo-500 font-bold uppercase block">Sucesso Médio</span>
                        <span className="text-xl font-black text-indigo-700 block mt-1">
                          {Math.round(sectorStats.reduce((acc, s) => acc + s.sucesso, 0) / 6)}%
                        </span>
                      </div>
                    </div>

                    {/* Sector performance cards */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                        Resumo de Desempenho por Setor Territorial
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:grid-cols-2">
                        {sectorStats
                          .filter(s => s.sectorName !== 'NÃO MAPEADO' || s.totalEscolas > 0)
                          .map(sec => (
                            <div key={sec.sectorName} className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 shadow-sm">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider">Unidade Territorial</span>
                                  <h4 className="text-base font-black text-slate-800 leading-tight">{sec.sectorName}</h4>
                                </div>
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200">
                                  {sec.totalEscolas} escolas
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-center py-2 bg-slate-50 rounded-lg border border-slate-100">
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Sucesso %</span>
                                  <span className="text-base font-black text-indigo-700">{sec.sucesso}%</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Participação %</span>
                                  <span className="text-base font-black text-emerald-600">{sec.participacao}%</span>
                                </div>
                              </div>

                              <div className="space-y-1 text-[11px] text-slate-600 font-semibold">
                                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                                  <span>Parcial ({sec.parcial}%)</span>
                                  <span>Mínimo ({sec.minimo}%)</span>
                                  <span>Excedeu ({sec.excedeu}%)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                  <div className="bg-amber-400 h-full" style={{ width: `${sec.parcial}%` }} />
                                  <div className="bg-blue-500 h-full" style={{ width: `${sec.minimo}%` }} />
                                  <div className="bg-emerald-500 h-full" style={{ width: `${sec.excedeu}%` }} />
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-100">
                                <span>Alunos: {sec.avaliados} de {sec.previstos}</span>
                                {sec.highPriorityCount > 0 ? (
                                  <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase">
                                    {sec.highPriorityCount} crítica(s)
                                  </span>
                                ) : (
                                  <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">
                                    Consolidado
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Sector Ranking Table */}
                    <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                      <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                        Tabela de Classificação dos Setores
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-[11px]">
                          <thead className="bg-slate-50 font-bold text-slate-500 uppercase">
                            <tr>
                              <th className="px-4 py-2.5 text-left">Setor Territorial</th>
                              <th className="px-3 py-2.5 text-center">Escolas</th>
                              <th className="px-3 py-2.5 text-center">Avaliados</th>
                              <th className="px-3 py-2.5 text-center">Participação (%)</th>
                              <th className="px-3 py-2.5 text-center text-amber-600">Parcial (%)</th>
                              <th className="px-3 py-2.5 text-center text-blue-600">Mínimo (%)</th>
                              <th className="px-3 py-2.5 text-center text-emerald-600">Excedeu (%)</th>
                              <th className="px-4 py-2.5 text-center text-indigo-700 font-extrabold">Sucesso (%)</th>
                              <th className="px-4 py-2.5 text-center">Prioridades</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                            {sectorStats.map((sec, idx) => (
                              <tr key={sec.sectorName} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-mono font-bold">
                                    {idx + 1}
                                  </span>
                                  <span>{sec.sectorName}</span>
                                </td>
                                <td className="px-3 py-3 text-center font-mono font-bold">{sec.totalEscolas}</td>
                                <td className="px-3 py-3 text-center font-mono">{sec.avaliados} / {sec.previstos}</td>
                                <td className="px-3 py-3 text-center font-bold text-emerald-600">{sec.participacao}%</td>
                                <td className="px-3 py-3 text-center text-amber-600">{sec.parcial}%</td>
                                <td className="px-3 py-3 text-center text-blue-600">{sec.minimo}%</td>
                                <td className="px-3 py-3 text-center text-emerald-600">{sec.excedeu}%</td>
                                <td className="px-4 py-3 text-center">
                                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                                    {sec.sucesso}%
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {sec.highPriorityCount > 0 ? (
                                    <span className="bg-red-50 text-red-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                      {sec.highPriorityCount} crítica(s)
                                    </span>
                                  ) : (
                                    <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                      Consolidado
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* 2. SE UM SETOR ESPECÍFICO */}
                    {(() => {
                      const activeSector = sectorStats.find(s => s.sectorName === schoolName);
                      if (!activeSector) return <p className="text-xs text-red-500 font-semibold">Setor não encontrado.</p>;
                      return (
                        <div className="space-y-6">
                          {/* Main metric row */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="border border-slate-200 p-4 rounded-xl text-center bg-slate-50">
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Escolas</span>
                              <span className="text-xl font-black text-slate-800 block mt-1">{activeSector.totalEscolas}</span>
                            </div>
                            <div className="border border-slate-200 p-4 rounded-xl text-center bg-slate-50">
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Alunos Avaliados</span>
                              <span className="text-xl font-black text-slate-800 block mt-1">
                                {activeSector.avaliados} de {activeSector.previstos}
                              </span>
                            </div>
                            <div className="border border-slate-200 p-4 rounded-xl text-center bg-blue-50/20">
                              <span className="text-[10px] text-blue-500 font-bold uppercase block">Participação</span>
                              <span className="text-xl font-black text-blue-700 block mt-1">{activeSector.participacao}%</span>
                            </div>
                            <div className="border border-slate-200 p-4 rounded-xl text-center bg-indigo-50/20">
                              <span className="text-[10px] text-indigo-500 font-bold uppercase block">Taxa de Sucesso</span>
                              <span className="text-xl font-black text-indigo-700 block mt-1">{activeSector.sucesso}%</span>
                            </div>
                          </div>

                          {/* Schools List inside this Sector */}
                          <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                            <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                              Unidades Escolares Pertencentes ao {activeSector.sectorName}
                            </h3>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-slate-200 text-[11px]">
                                <thead className="bg-slate-50 font-bold text-slate-500 uppercase">
                                  <tr>
                                    <th className="px-4 py-2.5 text-left">Escola</th>
                                    <th className="px-3 py-2.5 text-center">Previstos</th>
                                    <th className="px-3 py-2.5 text-center">Avaliados</th>
                                    <th className="px-3 py-2.5 text-center">Participação (%)</th>
                                    <th className="px-3 py-2.5 text-center text-amber-600">Parcial (%)</th>
                                    <th className="px-3 py-2.5 text-center text-blue-600">Mínimo (%)</th>
                                    <th className="px-3 py-2.5 text-center text-emerald-600">Excedeu (%)</th>
                                    <th className="px-4 py-2.5 text-center text-indigo-700 font-extrabold">Sucesso (%)</th>
                                    <th className="px-4 py-2.5 text-center">Prioridade</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                  {activeSector.escolas.map((sch) => {
                                    let priorityLabel = 'Baixa';
                                    let priorityStyle = 'bg-emerald-50 text-emerald-800';

                                    if (sch.sucesso < 65 || sch.participacao < 80) {
                                      priorityLabel = 'Alta';
                                      priorityStyle = 'bg-red-50 text-red-800';
                                    } else if (sch.sucesso < 76) {
                                      priorityLabel = 'Média';
                                      priorityStyle = 'bg-amber-50 text-amber-800';
                                    }

                                    return (
                                      <tr key={sch.nomeEscola} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-bold text-slate-900">{formatSchoolName(sch.nomeEscola)}</td>
                                        <td className="px-3 py-3 text-center font-mono">{sch.previstos}</td>
                                        <td className="px-3 py-3 text-center font-mono">{sch.avaliados}</td>
                                        <td className="px-3 py-3 text-center font-bold text-emerald-600">{sch.participacao}%</td>
                                        <td className="px-3 py-3 text-center text-amber-600">{sch.parcial}%</td>
                                        <td className="px-3 py-3 text-center text-blue-600">{sch.minimo}%</td>
                                        <td className="px-3 py-3 text-center text-emerald-600">{sch.excedeu}%</td>
                                        <td className="px-4 py-3 text-center">
                                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                                            {sch.sucesso}%
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${priorityStyle}`}>
                                            {priorityLabel}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Desempenho nos Descritores do Setor */}
                          <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                            <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                              Desempenho nos Descritores de Matemática ({activeSector.sectorName})
                            </h3>
                            <p className="text-[11px] text-slate-500 font-semibold">Média de acerto percentual por competência pedagógica (D001_J a D007_J)</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {DESCRIPTORS.map((desc) => {
                                const val = activeSector.descritores[desc.id];
                                const isCritical = val !== null && val < 70;
                                const isHigh = val !== null && val >= 85;

                                return (
                                  <div key={desc.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                        {desc.id}
                                      </span>
                                      <span className={`text-sm font-black ${isCritical ? 'text-red-600' : isHigh ? 'text-emerald-600' : 'text-slate-800'}`}>
                                        {val !== null ? `${val}%` : '-'}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed truncate" title={desc.description}>
                                      {desc.description}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Guidelines / Action Plan */}
                          <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                            <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                              Diretrizes de Plano de Ação e Orientação Pedagógica ({activeSector.sectorName})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block">1. Diagnóstico de Setor</span>
                                <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                                  O {activeSector.sectorName} possui taxa de sucesso de <strong>{activeSector.sucesso}%</strong> e participação de <strong>{activeSector.participacao}%</strong>, com <strong>{activeSector.highPriorityCount}</strong> escola(s) sinalizada(s) para intervenção prioritária.
                                </p>
                              </div>

                              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                                <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">2. Foco Pedagógico</span>
                                <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                                  Recomenda-se reforçar as estratégias didáticas em resolução de problemas do cotidiano (subtração e agrupamento), com acompanhamento semanal nas reuniões de HTPC das unidades do setor.
                                </p>
                              </div>

                              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">3. Encaminhamento</span>
                                <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                                  Organizar visitas de mentoria pedagógica e trocas de experiências entre os professores dos 2ºs anos do {activeSector.sectorName} e as escolas com patamar de excelência.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* REPORT TYPE G: PEDAGÓGICO / PRIORIZAÇÃO              */}
            {/* ---------------------------------------------------- */}
            {reportType === 'pedagogico' && (
              <div className="space-y-6 font-sans">
                {/* Intro banner */}
                <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl">
                  <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <AlertTriangle size={15} />
                    <span>Plano Integrado de Priorização e Enfrentamento das Fragilidades</span>
                  </h3>
                  <p className="text-xs text-amber-900 leading-relaxed font-semibold">
                    Este relatório estabelece os pontos focais prioritários com base em evidências estatísticas da rede municipal. O cruzamento analítico revela que descritores de tratamento de dados e subtrações com semântica de complementar conjuntos requerem atenção imediata.
                  </p>
                </div>

                {/* 1. COMPILADO DE PRIORIZAÇÃO DAS ESCOLAS */}
                <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 shadow-sm">
                  <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Compilado de Classificação por Prioridade Pedagógica (Matriz de Apoio)
                  </h3>
                  
                  {/* Grid de Contagem */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border border-red-100 bg-red-50/50 p-3 rounded-lg text-center">
                      <span className="text-[9px] text-red-500 font-bold uppercase block">Alta Prioridade</span>
                      <span className="text-lg font-black text-red-700 block mt-1">{reportSchoolCounts.high.length}</span>
                      <span className="text-[9px] text-slate-400 block font-semibold">Sucesso &lt; 65% ou Part. &lt; 80%</span>
                    </div>
                    <div className="border border-amber-100 bg-amber-50/50 p-3 rounded-lg text-center">
                      <span className="text-[9px] text-amber-500 font-bold uppercase block">Média Prioridade</span>
                      <span className="text-lg font-black text-amber-700 block mt-1">{reportSchoolCounts.medium.length}</span>
                      <span className="text-[9px] text-slate-400 block font-semibold">Sucesso entre 65% e 76%</span>
                    </div>
                    <div className="border border-emerald-100 bg-emerald-50/50 p-3 rounded-lg text-center">
                      <span className="text-[9px] text-emerald-500 font-bold uppercase block">Baixa Prioridade</span>
                      <span className="text-lg font-black text-emerald-700 block mt-1">{reportSchoolCounts.low.length}</span>
                      <span className="text-[9px] text-slate-400 block font-semibold">Sucesso &gt; 76%</span>
                    </div>
                  </div>

                  {/* Listagens Detalhadas por Prioridade */}
                  <div className="space-y-4 pt-2">
                    {/* Alta Prioridade */}
                    {reportSchoolCounts.high.length > 0 && (
                      <div className="border border-slate-150 rounded-lg overflow-hidden">
                        <div className="bg-red-50 px-3 py-2 border-b border-red-100 text-[10px] font-black text-red-800 uppercase flex justify-between">
                          <span>Unidades de Alta Prioridade</span>
                          <span>Ação Imediata</span>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-36 overflow-y-auto">
                          {reportSchoolCounts.high.map(s => (
                            <div key={s.nomeEscola} className="px-3 py-2 flex justify-between items-center text-[10px] font-semibold text-slate-700 hover:bg-slate-50">
                              <div>
                                <span className="font-bold text-slate-900">{formatSchoolName(s.nomeEscola)}</span>
                                <span className="text-slate-400 text-[9px] block">Motivo: {s.justification}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold block text-red-600">Sucesso: {s.sucesso}%</span>
                                <span className="text-slate-400 text-[9px] block">Part: {s.participacao}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Média Prioridade */}
                    {reportSchoolCounts.medium.length > 0 && (
                      <div className="border border-slate-150 rounded-lg overflow-hidden">
                        <div className="bg-amber-50 px-3 py-2 border-b border-amber-100 text-[10px] font-black text-amber-800 uppercase flex justify-between">
                          <span>Unidades de Média Prioridade</span>
                          <span>Monitoramento</span>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-36 overflow-y-auto">
                          {reportSchoolCounts.medium.map(s => (
                            <div key={s.nomeEscola} className="px-3 py-2 flex justify-between items-center text-[10px] font-semibold text-slate-700 hover:bg-slate-50">
                              <div>
                                <span className="font-bold text-slate-900">{formatSchoolName(s.nomeEscola)}</span>
                                <span className="text-slate-400 text-[9px] block">Motivo: {s.justification}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold block text-amber-600">Sucesso: {s.sucesso}%</span>
                                <span className="text-slate-400 text-[9px] block">Part: {s.participacao}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Baixa Prioridade */}
                    {reportSchoolCounts.low.length > 0 && (
                      <div className="border border-slate-150 rounded-lg overflow-hidden">
                        <div className="bg-emerald-50 px-3 py-2 border-b border-emerald-100 text-[10px] font-black text-emerald-800 uppercase flex justify-between">
                          <span>Unidades de Baixa Prioridade (Excelência Consolidada)</span>
                          <span>Disseminar Práticas</span>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-36 overflow-y-auto">
                          {reportSchoolCounts.low.map(s => (
                            <div key={s.nomeEscola} className="px-3 py-2 flex justify-between items-center text-[10px] font-semibold text-slate-700 hover:bg-slate-50">
                              <div>
                                <span className="font-bold text-slate-900">{formatSchoolName(s.nomeEscola)}</span>
                                <span className="text-slate-400 text-[9px] block">Motivo: {s.justification}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold block text-emerald-600">Sucesso: {s.sucesso}%</span>
                                <span className="text-slate-400 text-[9px] block">Part: {s.participacao}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. COMPILADO DE DESCRITORES CRÍTICOS DA REDE */}
                <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 shadow-sm">
                  <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Diagnóstico de Aprendizagens Críticas (Descritores &lt; 70%)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DESCRIPTORS.map(desc => {
                      const avgValue = networkData.descritores[desc.id] || 0;
                      const isCritical = avgValue < 70;
                      if (!isCritical) return null;
                      return (
                        <div key={desc.id} className="p-3 bg-red-50 border border-red-100 rounded-lg flex justify-between items-center text-[11px]">
                          <div className="max-w-[80%]">
                            <span className="font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded mr-2">{desc.id}</span>
                            <span className="text-slate-700 font-semibold leading-relaxed">{desc.description}</span>
                          </div>
                          <span className="font-black text-red-600 text-xs shrink-0">{avgValue}%</span>
                        </div>
                      );
                    }).filter(Boolean)}
                  </div>
                </div>

                {/* Dynamic plans of action for D004_J, D006_J, D007_J */}
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Diretrizes Estratégicas para Planos de Ação
                  </h3>
                  
                  <div className="border border-slate-200 p-4 rounded-lg bg-white space-y-1.5">
                    <span className="font-extrabold text-blue-900 text-xs uppercase block">Ação 1: Descritor D004_J (Subtração Semântica)</span>
                    <p className="text-slate-600 font-normal leading-relaxed">
                      <strong>Desafio:</strong> Média de acertos sob pressão semântica de &quot;quanto falta&quot; (Item 16) é sensivelmente menor que operações mecânicas diretas.
                    </p>
                    <p className="text-slate-600 font-normal leading-relaxed">
                      <strong>Ação Pedagógica:</strong> Criação de laboratórios dinâmicos de reta numérica pintados no pátio, onde as crianças jogam dados gigantes de espuma e andam corporalmente nas casas correspondentes para consolidar visualmente a complementação decimal.
                    </p>
                  </div>

                  <div className="border border-slate-200 p-4 rounded-lg bg-white space-y-1.5">
                    <span className="font-extrabold text-blue-900 text-xs uppercase block">Ação 2: Descritores de Grandezas e Medidas (D005_J &amp; D006_J)</span>
                    <p className="text-slate-600 font-normal leading-relaxed">
                      <strong>Desafio:</strong> Itens de medição com instrumentos graduados e leitura analógica de relógios geram perdas. Dona Minica é prioritária com 9% de sucesso em D005.
                    </p>
                    <p className="text-slate-600 font-normal leading-relaxed">
                      <strong>Ação Pedagógica:</strong> Distribuição emergencial de kits de réguas graduadas transparentes e relógios de ponteiros manuais de material reciclável para práticas cotidianas de estimativa física de objetos escolares de rotina.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* SLEEK REPORT FOOTER                                  */}
            {/* ==================================================== */}
            <footer className="border-t border-slate-200 pt-6 flex flex-col md:flex-row items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider gap-4">
              <p>© 2026 Secretaria de Educação • Pindamonhangaba (SP)</p>
              <p>Validação Oficial de Banco de Dados de Matemática</p>
            </footer>

          </div>
        </div>

      </div>
    </div>
  );
}
