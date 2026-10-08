/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchoolData, ClassData } from '../types';
import { DESCRIPTORS } from '../data';

// Official Sector Registry of Pindamonhangaba
export const SETORES_ESCOLAS: Record<string, string[]> = {
  "SETOR 1": [
    "ANDRÉ FRANCO MONTORO",
    "ARANTES VASQUES",
    "DULCE PEDROSA",
    "GILDA PIORINI",
    "MARIA ZARA",
    "MOACYR DE ALMEIDA",
    "PAULO FREIRE",
  ],
  "SETOR 4": [
    "MARIA APARECIDA CAMARGO DE SOUZA",
    "AUGUSTO CESAR",
    "DONA MINICA",
    "FELIX ADIB",
    "MARIO BONOTTI",
    "PADRE MARIO ANTONIO BONOTTI - REDENTORISTA",
    "REDENTORISTA",
    "ORLANDO PIRES",
  ],
  "SETOR 5": [
    "ÂNGELO PAZ",
    "ELIAS BARGIS",
    "JOÃO KOLENDA",
    "MADALENA CALTABIANO",
    "REGINA CÉLIA",
    "VITO ARDITO",
  ],
  "SETOR 7": [
    "ALEXANDRE MACHADO",
    "ARTHUR DE ANDRADE",
    "JOÃO CESÁRIO",
    "MARIA HELENA RIBEIRO",
    "RUTH AZEVEDO",
    "YVONE",
  ],
  "SETOR 9": [
    "FRANCISCO DE ASSIS",
    "JOAQUIM PEREIRA",
    "LAURO VICENTE",
    "MARIO DE ASSIS",
    "RACHEL DE AGUIAR",
    "SEU JUQUINHA",
  ],
  "SETOR 10": [
    "ABDIAS",
    "ISABEL DO CARMO",
    "JULIETA REALE",
    "ODETE CORRÊA",
    "PADRE ZEZINHO",
    "SERAFIM FERREIRA",
  ],
};

export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

/**
 * Returns the sector name for a given school name based on official rules
 */
export function getSectorForSchool(schoolName: string): string {
  const normName = normalizeText(schoolName);

  for (const [sector, keywords] of Object.entries(SETORES_ESCOLAS)) {
    for (const keyword of keywords) {
      const normKeyword = normalizeText(keyword);
      if (normName.includes(normKeyword)) {
        return sector;
      }
    }
  }

  return 'NÃO MAPEADO';
}

export interface SectorAggregatedStats {
  sectorName: string;
  totalEscolas: number;
  previstos: number;
  avaliados: number;
  participacao: number; // %
  parcial: number;     // %
  minimo: number;      // %
  excedeu: number;     // %
  sucesso: number;     // % (minimo + excedeu)
  descritores: Record<string, number | null>; // % acerto médio no setor
  escolas: SchoolData[];
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  bestSchool: SchoolData | null;
  lowestSchool: SchoolData | null;
}

/**
 * Computes aggregated statistics for all sectors based on the school list
 */
export function getSectorStats(schools: SchoolData[]): SectorAggregatedStats[] {
  const sectorMap: Record<string, SchoolData[]> = {
    'SETOR 1': [],
    'SETOR 4': [],
    'SETOR 5': [],
    'SETOR 7': [],
    'SETOR 9': [],
    'SETOR 10': [],
  };

  const unclassified: SchoolData[] = [];

  schools.forEach(sch => {
    const sec = getSectorForSchool(sch.nomeEscola);
    if (sectorMap[sec]) {
      sectorMap[sec].push(sch);
    } else {
      unclassified.push(sch);
    }
  });

  if (unclassified.length > 0) {
    sectorMap['NÃO MAPEADO'] = unclassified;
  }

  const result: SectorAggregatedStats[] = [];

  Object.entries(sectorMap).forEach(([sectorName, secSchools]) => {
    if (secSchools.length === 0) {
      result.push({
        sectorName,
        totalEscolas: 0,
        previstos: 0,
        avaliados: 0,
        participacao: 0,
        parcial: 0,
        minimo: 0,
        excedeu: 0,
        sucesso: 0,
        descritores: {},
        escolas: [],
        highPriorityCount: 0,
        mediumPriorityCount: 0,
        lowPriorityCount: 0,
        bestSchool: null,
        lowestSchool: null,
      });
      return;
    }

    const previstos = secSchools.reduce((acc, s) => acc + (s.previstos || 0), 0);
    const avaliados = secSchools.reduce((acc, s) => acc + (s.avaliados || 0), 0);
    const participacao = previstos > 0 ? Math.round((avaliados / previstos) * 1000) / 10 : 0;

    // Weighted or average percentages
    const parcial = Math.round(secSchools.reduce((acc, s) => acc + s.parcial, 0) / secSchools.length);
    const minimo = Math.round(secSchools.reduce((acc, s) => acc + s.minimo, 0) / secSchools.length);
    const excedeu = Math.round(secSchools.reduce((acc, s) => acc + s.excedeu, 0) / secSchools.length);
    const sucesso = Math.round(secSchools.reduce((acc, s) => acc + s.sucesso, 0) / secSchools.length);

    // Descriptor averages
    const descritoresMap: Record<string, { sum: number; count: number }> = {};
    DESCRIPTORS.forEach(d => {
      descritoresMap[d.id] = { sum: 0, count: 0 };
    });

    secSchools.forEach(s => {
      if (s.descritores) {
        Object.entries(s.descritores).forEach(([dId, val]) => {
          if (val !== null && val !== undefined) {
            if (!descritoresMap[dId]) descritoresMap[dId] = { sum: 0, count: 0 };
            descritoresMap[dId].sum += val;
            descritoresMap[dId].count += 1;
          }
        });
      }
    });

    const descritores: Record<string, number | null> = {};
    Object.entries(descritoresMap).forEach(([dId, data]) => {
      descritores[dId] = data.count > 0 ? Math.round(data.sum / data.count) : null;
    });

    // Priority counts
    let highPriorityCount = 0;
    let mediumPriorityCount = 0;
    let lowPriorityCount = 0;

    secSchools.forEach(s => {
      if (s.sucesso < 65 || s.participacao < 80) {
        highPriorityCount++;
      } else if (s.sucesso < 76) {
        mediumPriorityCount++;
      } else {
        lowPriorityCount++;
      }
    });

    // Best and lowest performing schools in sector
    const sortedBySucesso = [...secSchools].sort((a, b) => b.sucesso - a.sucesso);
    const bestSchool = sortedBySucesso[0] || null;
    const lowestSchool = sortedBySucesso[sortedBySucesso.length - 1] || null;

    result.push({
      sectorName,
      totalEscolas: secSchools.length,
      previstos,
      avaliados,
      participacao,
      parcial,
      minimo,
      excedeu,
      sucesso,
      descritores,
      escolas: secSchools,
      highPriorityCount,
      mediumPriorityCount,
      lowPriorityCount,
      bestSchool,
      lowestSchool,
    });
  });

  return result;
}
