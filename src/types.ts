/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Descriptor {
  id: string; // D001_J, D002_J, etc.
  description: string;
}

export interface ItemDetail {
  id: string; // Item 01, Item 02, etc.
  descriptorId: string; // Which descriptor this item belongs to
  theme: string; // Theme/Topic of the item
}

export interface PerformanceStats {
  previstos: number;
  avaliados: number;
  participacao: number; // % (avaliados / previstos)
  parcial: number;     // % Atingiu parcialmente o mínimo
  minimo: number;      // % Atingiu o mínimo
  excedeu: number;     // % Excedeu o mínimo
  sucesso: number;     // % Atingiu o mínimo + % Excedeu o mínimo
  descritores: Record<string, number | null>; // D001_J -> % acerto
  itens: Record<string, number | null>;       // Item 01 -> % acerto
}

export interface NetworkData extends PerformanceStats {
  rede: string;
  anoEscolar: string;
  componente: string;
  estado: string;
  regional: string;
  municipio: string;
}

export interface SchoolData extends PerformanceStats {
  nomeEscola: string;
}

export interface ClassData extends PerformanceStats {
  codigoTurma: string;
  nomeTurma: string;
  nomeEscola: string;
}

export interface FilterState {
  searchEscola: string;
  selectedEscola: string;
  selectedTurma: string;
  minParticipacao: number;
  maxParticipacao: number;
  minSucesso: number;
  maxSucesso: number;
}

export interface AIInsight {
  title: string;
  text: string;
  timestamp: string;
}

export interface AvaliacaoMunicipio {
  avaliacao: string;
  rede: string;
  anoEscolar: string;
  componente: string;
  estado: string;
  regional: string;
  municipio: string;
  previstos: number;
  avaliados: number;
  avaliadosPct: number;
  atingiuParcialmentePct: number;
  atingiuMinimoPct: number;
  excedeuMinimoPct: number;
  descritores: Record<string, number | null>;
  itens: Record<string, number | null>;
  arquivoOrigem: string;
  dataCarga: string;
}

export interface ResultadoAvaliacao {
  nivel: 'MUNICIPIO' | 'ESCOLA';
  escola: string | null;      // None se município
  previstos: number;
  avaliados: number;
  avaliados_pct: number;       // valor do arquivo
  parcial_pct: number;
  minimo_pct: number;
  excedeu_pct: number;
  descritores: Record<string, number | null>;  // D001_J..D007_J
  itens: Record<string, number | null>;        // Item 01..Item 27
  arquivo_origem: string;
}

export interface ExternalAssessmentState {
  municipio: ResultadoAvaliacao | null;
  escolas: ResultadoAvaliacao[];
  dataCarga: string;
}


