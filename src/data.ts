/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Descriptor, ItemDetail, NetworkData, SchoolData, ClassData } from './types';
import { formatSchoolName } from './utils/schoolNames';

// 1. Definition of pedagogical descriptors for 2nd Grade Mathematics
export const DESCRIPTORS: Descriptor[] = [
  { id: 'D001_J', description: 'Reconhecer e identificar números naturais no contexto diário (leitura, ordens e grandezas).' },
  { id: 'D002_J', description: 'Escrever, comparar e ordenar números naturais em diferentes sequências e retas numéricas.' },
  { id: 'D003_J', description: 'Resolver problemas do cotidiano envolvendo a adição (juntar, acrescentar).' },
  { id: 'D004_J', description: 'Resolver problemas do cotidiano envolvendo a subtração (retirar, comparar, completar).' },
  { id: 'D005_J', description: 'Identificar propriedades de figuras geométricas planas e espaciais e reconhecer semelhanças.' },
  { id: 'D006_J', description: 'Estimar e medir grandezas (comprimento, tempo, massa, capacidade, sistema monetário).' },
  { id: 'D007_J', description: 'Ler, interpretar e extrair dados apresentados em tabelas simples e gráficos de barras.' }
];

// 2. Definition of the 27 evaluation items and their topics/skills
export const ITEMS: ItemDetail[] = [
  { id: 'Item 01', descriptorId: 'D001_J', theme: 'Leitura de número na placa de ônibus' },
  { id: 'Item 02', descriptorId: 'D001_J', theme: 'Identificação da ordem de grandeza de um número' },
  { id: 'Item 03', descriptorId: 'D001_J', theme: 'Reconhecimento de número de telefone comum' },
  { id: 'Item 04', descriptorId: 'D001_J', theme: 'Contagem de elementos em coleção desordenada' },
  { id: 'Item 05', descriptorId: 'D002_J', theme: 'Completar sequência numérica de 2 em 2' },
  { id: 'Item 06', descriptorId: 'D002_J', theme: 'Localização de número na reta numérica' },
  { id: 'Item 07', descriptorId: 'D002_J', theme: 'Comparação de valores (maior/menor número)' },
  { id: 'Item 08', descriptorId: 'D002_J', theme: 'Ordenação crescente de um conjunto de cartões' },
  { id: 'Item 09', descriptorId: 'D003_J', theme: 'Adição simples de brinquedos (juntar)' },
  { id: 'Item 10', descriptorId: 'D003_J', theme: 'Problema de adição com transporte (acrescentar)' },
  { id: 'Item 11', descriptorId: 'D003_J', theme: 'Cálculo mental rápido de soma simples' },
  { id: 'Item 12', descriptorId: 'D003_J', theme: 'Adição de três parcelas em situação de compras' },
  { id: 'Item 13', descriptorId: 'D004_J', theme: 'Subtração simples de figurinhas (retirar)' },
  { id: 'Item 14', descriptorId: 'D004_J', theme: 'Problema de subtração por comparação de quantidades' },
  { id: 'Item 15', descriptorId: 'D004_J', theme: 'Cálculo de troco simples no mercado' },
  { id: 'Item 16', descriptorId: 'D004_J', theme: 'Problema de subtração: quanto falta para completar' },
  { id: 'Item 17', descriptorId: 'D005_J', theme: 'Identificação de triângulo em desenhos de casas' },
  { id: 'Item 18', descriptorId: 'D005_J', theme: 'Associação de esfera com bola de futebol' },
  { id: 'Item 19', descriptorId: 'D005_J', theme: 'Identificação de faces planas em um cubo' },
  { id: 'Item 20', descriptorId: 'D005_J', theme: 'Reconhecimento de simetria em figuras geométricas' },
  { id: 'Item 21', descriptorId: 'D006_J', theme: 'Leitura de horas em relógio digital comum' },
  { id: 'Item 22', descriptorId: 'D006_J', theme: 'Identificação de cédulas do Real em compras' },
  { id: 'Item 23', descriptorId: 'D006_J', theme: 'Comparação de recipientes com diferentes capacidades' },
  { id: 'Item 24', descriptorId: 'D006_J', theme: 'Uso de régua para medir tamanho de lápis' },
  { id: 'Item 25', descriptorId: 'D007_J', theme: 'Leitura de tabela simples de pontuação de jogo' },
  { id: 'Item 26', descriptorId: 'D007_J', theme: 'Interpretação de gráfico de barras sobre frutas favoritas' },
  { id: 'Item 27', descriptorId: 'D007_J', theme: 'Cruzamento de dados simples em tabela de dupla entrada' }
];

// STATIC CONFIGURATION OF the 37 actual schools in Pindamonhangaba
export const STATIC_SCHOOLS_CONFIG = [
  { name: "EM PROFA MARIA MADUREIRA SALGADO DONA MINICA", prev: 11, aval: 11, pct: 100, parcial: 45, minimo: 55, excedeu: 0, d: [82,91,91,100,9,68,45] },
  { name: "ESCOLA MUN PADRE MARIO ANTONIO BONOTTI REDENTORISTA", prev: 46, aval: 46, pct: 100, parcial: 20, minimo: 48, excedeu: 33, d: [93,87,96,80,87,82,74] },
  { name: "ESCOLA MUNICIPAL ABDIAS JUNIOR SANTIAGO E SILVA", prev: 46, aval: 46, pct: 100, parcial: 30, minimo: 52, excedeu: 17, d: [85,91,100,76,80,74,64] },
  { name: "ESCOLA MUNICIPAL ARTHUR DE ANDRADE", prev: 79, aval: 77, pct: 97, parcial: 22, minimo: 47, excedeu: 31, d: [82,87,92,75,84,79,79] },
  { name: "ESCOLA MUNICIPAL DOUTOR ANGELO PAZ DA SILVA", prev: 48, aval: 30, pct: 63, parcial: 17, minimo: 37, excedeu: 47, d: [93,93,97,97,90,90,78] },
  { name: "ESCOLA MUNICIPAL DR ANDRE FRANCO MONTORO", prev: 54, aval: 36, pct: 67, parcial: 17, minimo: 47, excedeu: 36, d: [94,92,97,83,89,82,72] },
  { name: "ESCOLA MUNICIPAL DR FRANCISCO DE ASSIS CESAR", prev: 53, aval: 36, pct: 68, parcial: 28, minimo: 31, excedeu: 42, d: [92,86,100,69,78,83,79] },
  { name: "ESCOLA MUNICIPAL DULCE PEDROSA ROMEIRO GUIMARAES", prev: 38, aval: 38, pct: 100, parcial: 16, minimo: 63, excedeu: 21, d: [97,97,89,82,71,86,72] },
  { name: "ESCOLA MUNICIPAL JOAO CESARIO", prev: 99, aval: 81, pct: 82, parcial: 19, minimo: 51, excedeu: 31, d: [91,94,97,81,81,85,78] },
  { name: "ESCOLA MUNICIPAL JOAO KOLENDA LEMOS", prev: 88, aval: 85, pct: 97, parcial: 39, minimo: 49, excedeu: 12, d: [72,76,85,69,68,73,64] },
  { name: "ESCOLA MUNICIPAL JOSE GONCALVES DA SILVA SEU JUQUINHA", prev: 69, aval: 68, pct: 99, parcial: 32, minimo: 49, excedeu: 19, d: [84,91,97,68,75,76,66] },
  { name: "ESCOLA MUNICIPAL PADRE ZEZINHO", prev: 49, aval: 49, pct: 100, parcial: 31, minimo: 41, excedeu: 29, d: [88,98,94,78,90,81,72] },
  { name: "ESCOLA MUNICIPAL PROF LAURO VICENTE DE AZEVEDO", prev: 43, aval: 34, pct: 79, parcial: 50, minimo: 41, excedeu: 9, d: [79,94,94,82,79,63,45] },
  { name: "ESCOLA MUNICIPAL PROFA MADALENA CALTABIANO SALUM BENJAMIM", prev: 17, aval: 17, pct: 100, parcial: 47, minimo: 47, excedeu: 6, d: [71,71,94,65,60,56,58] },
  { name: "ESCOLA MUNICIPAL PROFA MARIA APARECIDA ARANTES VASQUES", prev: 49, aval: 47, pct: 96, parcial: 11, minimo: 53, excedeu: 36, d: [96,100,89,83,79,88,83] },
  { name: "ESCOLA MUNICIPAL PROFA MARIA APARECIDA CAMARGO DE SOUZA", prev: 7, aval: 7, pct: 100, parcial: 29, minimo: 71, excedeu: 0, d: [86,100,100,71,100,86,52] },
  { name: "ESCOLA MUNICIPAL PROFA MARIA HELENA RIBEIRO VILELA", prev: 50, aval: 32, pct: 64, parcial: 50, minimo: 34, excedeu: 16, d: [81,94,78,72,78,73,63] },
  { name: "ESCOLA MUNICIPAL PROFA MARIA ZARA MINE RENOLDI DOS SANTOS", prev: 43, aval: 42, pct: 98, parcial: 40, minimo: 55, excedeu: 5, d: [93,93,93,79,81,80,43] },
  { name: "ESCOLA MUNICIPAL PROFA ODETE CORREA MADUREIRA", prev: 51, aval: 46, pct: 90, parcial: 26, minimo: 39, excedeu: 35, d: [89,89,91,84,74,83,76] },
  { name: "ESCOLA MUNICIPAL PROFA RACHEL DE AGUIAR LOBERTO", prev: 49, aval: 48, pct: 98, parcial: 33, minimo: 38, excedeu: 29, d: [92,96,96,79,75,78,65] },
  { name: "ESCOLA MUNICIPAL PROFA REGINA CELIA MADUREIRA DE SOUZA LIMA", prev: 63, aval: 48, pct: 76, parcial: 60, minimo: 29, excedeu: 10, d: [73,85,65,69,69,67,51] },
  { name: "ESCOLA MUNICIPAL PROFESSOR ALEXANDRE MACHADO SALGADO", prev: 79, aval: 78, pct: 99, parcial: 32, minimo: 45, excedeu: 23, d: [86,91,94,71,73,78,65] },
  { name: "ESCOLA MUNICIPAL PROFESSOR AUGUSTO CESAR RIBEIRO", prev: 38, aval: 36, pct: 95, parcial: 28, minimo: 44, excedeu: 28, d: [97,100,69,83,83,81,66] },
  { name: "ESCOLA MUNICIPAL PROFESSOR ELIAS BARGIS MATHIAS", prev: 89, aval: 89, pct: 100, parcial: 27, minimo: 51, excedeu: 22, d: [92,92,90,79,84,76,67] },
  { name: "ESCOLA MUNICIPAL PROFESSOR FELIX ADIB MIGUEL", prev: 42, aval: 40, pct: 95, parcial: 35, minimo: 33, excedeu: 33, d: [85,80,93,78,85,88,70] },
  { name: "ESCOLA MUNICIPAL PROFESSOR JOAQUIM PEREIRA DA SILVA", prev: 122, aval: 121, pct: 99, parcial: 18, minimo: 46, excedeu: 36, d: [92,95,97,79,82,84,79] },
  { name: "ESCOLA MUNICIPAL PROFESSOR MARIO DE ASSIS CESAR", prev: 38, aval: 22, pct: 58, parcial: 14, minimo: 27, excedeu: 59, d: [91,95,86,86,86,89,92] },
  { name: "ESCOLA MUNICIPAL PROFESSOR MOACYR DE ALMEIDA", prev: 17, aval: 17, pct: 100, parcial: 24, minimo: 29, excedeu: 47, d: [88,94,94,94,100,85,71] },
  { name: "ESCOLA MUNICIPAL PROFESSOR ORLANDO PIRES", prev: 32, aval: 21, pct: 66, parcial: 43, minimo: 48, excedeu: 10, d: [100,95,90,81,71,59,45] },
  { name: "ESCOLA MUNICIPAL PROFESSOR PAULO FREIRE", prev: 27, aval: 27, pct: 100, parcial: 4, minimo: 33, excedeu: 63, d: [93,100,93,85,85,98,99] },
  { name: "ESCOLA MUNICIPAL PROFESSORA GILDA PIORINI MOLICA", prev: 49, aval: 46, pct: 94, parcial: 35, minimo: 48, excedeu: 17, d: [89,91,87,78,80,84,68] },
  { name: "ESCOLA MUNICIPAL PROFESSORA ISABEL DO CARMO NOGUEIRA", prev: 84, aval: 84, pct: 100, parcial: 25, minimo: 30, excedeu: 45, d: [95,92,92,83,87,86,79] },
  { name: "ESCOLA MUNICIPAL PROFESSORA JULIETA REALE VIEIRA", prev: 53, aval: 53, pct: 100, parcial: 45, minimo: 43, excedeu: 11, d: [81,88,98,77,77,74,58] },
  { name: "ESCOLA MUNICIPAL PROFESSORA RUTH AZEVEDO ROMEIRO", prev: 41, aval: 41, pct: 100, parcial: 15, minimo: 56, excedeu: 29, d: [95,88,100,80,44,89,95] },
  { name: "ESCOLA MUNICIPAL PROFESSORA YVONE APPARECIDA ARANTES CORREA", prev: 19, aval: 18, pct: 95, parcial: 28, minimo: 61, excedeu: 11, d: [72,88,89,78,56,81,76] },
  { name: "ESCOLA MUNICIPAL SERAFIM FERREIRA SR SARA", prev: 61, aval: 61, pct: 100, parcial: 26, minimo: 33, excedeu: 41, d: [85,92,98,85,93,88,76] },
  { name: "ESCOLA MUNICIPAL VITO ARDITO", prev: 38, aval: 38, pct: 100, parcial: 34, minimo: 42, excedeu: 24, d: [81,81,89,78,77,80,72] }
];

// Seedable Deterministic Random Generator (LGC)
class SeededRandom {
  private m = 0x80000000; // 2**31
  private a = 1103515245;
  private c = 12345;
  private state: number;

  constructor(seed: number) {
    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
  }

  // Returns random float between 0 and 1
  next(): number {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / (this.m - 1);
  }

  // Returns random integer in [min, max]
  nextInt(min: number, max: number): number {
    return Math.floor(min + this.next() * (max - min + 1));
  }

  // Choose from array
  choose<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)];
  }

  // Perturb value by a small percentage (additive or multiplicative)
  perturb(val: number, range: number): number {
    const factor = 1 + (this.next() * 2 - 1) * range;
    return Math.max(0, Math.min(100, Math.round(val * factor)));
  }

  // Perturb adding absolute percentage points
  perturbPp(val: number, maxPp: number): number {
    const delta = (this.next() * 2 - 1) * maxPp;
    return Math.max(0, Math.min(100, Math.round(val + delta)));
  }
}

// 3. Define baseline network data (matching constraints exactly)
export const BASELINE_NETWORK_DATA: NetworkData = {
  rede: 'Municipal',
  anoEscolar: '2º ano',
  componente: 'Matemática',
  estado: 'SP',
  regional: 'Pindamonhangaba',
  municipio: 'Pindamonhangaba',
  previstos: 1881,
  avaliados: 1716,
  participacao: 91, // 1716 / 1881 = 91.22% (shows 91%)
  parcial: 29,
  minimo: 44,
  excedeu: 27,
  sucesso: 71, // 44 + 27 = 71%
  descritores: {
    D001_J: 88,
    D002_J: 91,
    D003_J: 92,
    D004_J: 78,
    D005_J: 79,
    D006_J: 80,
    D007_J: 71
  },
  itens: {
    'Item 01': 88, 'Item 02': 91, 'Item 03': 93, 'Item 04': 86, 'Item 05': 93, 'Item 06': 92, 'Item 07': 82, 'Item 08': 75, 'Item 09': 88, 'Item 10': 70,
    'Item 11': 89, 'Item 12': 84, 'Item 13': 85, 'Item 14': 88, 'Item 15': 79, 'Item 16': 69, 'Item 17': 73, 'Item 18': 76, 'Item 19': 81, 'Item 20': 71,
    'Item 21': 69, 'Item 22': 81, 'Item 23': 74, 'Item 24': 69, 'Item 25': 63, 'Item 26': 68, 'Item 27': 67
  }
};

export const STATIC_ITENS_CONFIG: (number | null)[][] = [
  // 01 DONA MINICA
  [82, null, 91, null, null, 91, null, 100, null, 9, null, 80, null, null, null, 56, null, null, null, 45, null, null, null, 33, null, null, 55],
  // 02 BONOTTI
  [93, 87, null, 82, 93, 96, 75, 93, 84, 93, 93, null, 76, 100, 80, null, 53, 93, 87, null, 71, 93, 80, null, 59, 71, 70],
  // 03 ABDIAS
  [85, null, 87, 87, 100, 100, 100, 65, 100, 71, null, 73, 93, 81, null, 60, 67, 69, null, 80, 60, 81, null, 67, 47, 69, 59],
  // 04 ARTHUR DE ANDRADE
  [82, 83, 81, 82, 100, 92, 71, 81, 85, 83, 95, 65, 82, 95, 83, 81, 59, 78, 89, 63, 68, 100, 89, 88, 77, 84, 73],
  // 05 ANGELO PAZ
  [93, 87, null, 100, null, 97, 97, null, 90, null, 93, null, 100, null, 80, null, 87, null, 87, null, 87, null, 80, null, 80, null, 66],
  // 06 MONTORO
  [94, 94, 88, null, 100, 97, 89, 78, 100, 78, 94, 82, null, 100, 89, 59, null, 100, 94, 59, null, 0, 89, 59, null, 100, 67],
  // 07 FRANCISCO DE ASSIS
  [92, 90, null, null, 81, 100, 80, 56, 90, 63, 100, null, null, 81, 95, null, null, 50, 80, null, null, 81, 90, null, null, 56, 81],
  // 08 DULCE PEDROSA
  [97, null, 100, 95, null, 89, 84, 79, 84, 58, null, 100, 79, null, null, 89, 74, null, null, 74, 58, null, null, 84, 74, null, 71],
  // 09 JOAO CESARIO
  [91, 92, 94, 100, 93, 97, 77, 83, 100, 74, 69, 83, 89, 98, 46, 83, 100, 90, 54, 78, 88, 97, 50, 72, 0, 88, 80],
  // 10 JOAO KOLENDA
  [72, 76, 81, 50, 88, 85, 78, 63, 81, 58, 60, 81, 83, 81, 44, 74, 92, 88, 52, 69, 75, 81, 56, 74, 58, 81, 58],
  // 11 SEU JUQUINHA
  [84, 89, 100, 82, 94, 97, 75, 59, 72, 78, 68, 88, 71, 94, 47, 75, 81, 94, 37, 69, 80, 94, 26, 75, 79, 94, 65],
  // 12 PADRE ZEZINHO
  [88, 93, null, 100, 100, 94, 76, 80, 97, 80, 80, null, 86, 90, 73, null, 86, 70, 93, null, 79, 80, 47, null, 93, 78, 58],
  // 13 LAURO VICENTE
  [79, null, 92, 95, null, 94, 77, 92, 77, 83, null, 100, 68, null, null, 75, 32, null, null, 92, 23, null, null, 42, 23, null, 59],
  // 14 MADALENA CALTABIANO
  [71, null, null, null, 71, 94, null, 65, null, 60, null, null, null, 71, null, null, null, 41, null, null, null, 75, null, null, null, 41, 59],
  // 15 ARANTES VASQUES
  [96, 100, 100, null, null, 89, 96, 68, 84, 73, 92, 100, null, null, 84, 77, null, null, 100, 86, null, null, 96, 82, null, null, 65],
  // 16 MARIA APARECIDA CAMARGO
  [86, null, null, 100, null, 100, 71, null, 100, null, null, null, 100, null, null, null, 71, null, null, null, 57, null, null, null, 29, null, 71],
  // 17 MARIA HELENA RIBEIRO
  [81, 88, 100, null, null, 78, 81, 63, 94, 63, 94, 69, null, null, 75, 56, null, null, 73, 69, null, null, 69, 56, null, null, 56],
  // 18 MARIA ZARA
  [93, null, null, 90, 95, 93, 86, 71, 95, 67, null, null, 86, 81, null, null, 86, 67, null, null, 80, 38, null, null, 53, 38, 26],
  // 19 ODETE CORREA
  [89, 100, 94, 69, null, 91, 82, 88, 71, 80, 100, 88, 69, null, 94, 88, 54, null, 81, 75, 46, null, 88, 100, 54, null, 75],
  // 20 RACHEL DE AGUIAR
  [92, 91, null, null, 100, 96, 87, 72, 96, 56, 83, null, null, 80, 87, null, null, 61, 78, null, null, 72, 57, null, null, 63, 60],
  // 21 REGINA CELIA
  [73, null, 100, 63, 96, 65, 50, 78, 50, 78, null, 100, 69, 92, null, 57, 27, 60, null, 100, 38, 76, null, 71, 27, 52, 40],
  // 22 ALEXANDRE MACHADO
  [86, 95, 89, 84, 95, 94, 66, 75, 63, 83, 89, 68, 89, 90, 58, 53, 74, 95, 84, 47, 47, 90, 53, 42, 79, 81, 64],
  // 23 AUGUSTO CESAR
  [97, 100, 100, null, null, 69, 94, 74, 94, 74, 94, 74, null, null, 88, 68, null, null, 88, 63, null, null, 88, 42, null, null, 58],
  // 24 ELIAS BARGIS
  [92, 92, 91, 95, 90, 90, 89, 68, 91, 77, 88, 74, 76, 86, 75, 61, 81, 71, 79, 78, 81, 62, 63, 61, 57, 33, 73],
  // 25 FELIX ADIB
  [85, null, null, 86, 74, 93, 86, 68, 95, 74, null, null, 90, 84, null, null, 100, 74, null, null, 86, 68, null, null, 90, 37, 68],
  // 26 JOAQUIM PEREIRA
  [92, 93, 100, 84, 100, 97, 86, 73, 95, 69, 98, 87, 95, 86, 98, 56, 84, 68, 98, 74, 79, 86, 95, 72, 84, 33, 78],
  // 27 MARIO DE ASSIS
  [91, null, null, null, 95, 86, null, 86, null, 86, null, null, null, 82, null, null, null, 95, null, null, null, 91, null, null, null, 91, 95],
  // 28 MOACYR DE ALMEIDA
  [88, 94, null, null, null, 94, 94, null, 100, null, 94, null, null, null, 76, null, null, null, 76, null, null, null, 76, null, null, null, 59],
  // 29 ORLANDO PIRES
  [100, null, 94, 100, null, 90, 100, 76, 100, 65, null, 76, 50, null, null, 44, 50, null, null, 50, 100, null, null, 29, 100, null, 33],
  // 30 PAULO FREIRE
  [93, 100, null, null, 100, 93, 86, 85, 93, 77, 100, null, null, 100, 100, null, null, 92, 100, null, null, 100, 100, null, null, 92, 100],
  // 31 GILDA PIORINI
  [89, null, 92, 88, 94, 87, 88, 73, 94, 73, null, 92, 94, 82, null, 85, 94, 59, null, 77, 69, 50, null, 85, 81, 59, 67],
  // 32 ISABEL DO CARMO
  [95, 78, 95, 100, 95, 92, 86, 80, 86, 88, 91, 95, 100, 89, 63, 59, 95, 95, 67, 76, 100, 100, 63, 67, 100, 74, 77],
  // 33 JULIETA REALE
  [81, 94, 93, 80, null, 98, 78, 73, 86, 53, 94, 87, 76, null, 71, 100, 33, null, 75, 60, 48, null, 53, 93, 33, null, 57],
  // 34 RUTH AZEVEDO
  [95, 89, null, null, 86, 100, 84, 77, 95, 0, 95, null, null, 86, 95, null, null, 82, 100, null, null, 95, 95, null, null, 95, 93],
  // 35 YVONE ARANTES
  [72, null, 88, null, null, 89, null, 78, null, 56, null, 89, null, null, null, 72, null, null, null, 83, null, null, null, 83, null, null, 61],
  // 36 SERAFIM FERREIRA
  [85, 89, null, 86, 100, 98, 85, 84, 98, 83, 84, null, 100, 89, 89, null, 91, 74, 89, null, 86, 71, 83, null, 55, 74, 76],
  // 37 VITO ARDITO
  [81, null, 89, 72, null, 89, 89, 68, 89, 65, null, 79, 89, null, null, 78, 72, null, null, 78, 83, null, null, 79, 53, null, 69]
];

// 4. Constant map containing the exact class items, names, and sizes for the dump
const DUMP_CLASSES: Record<string, { nomeTurma: string, avaliados: number, previstos: number, itens: (number | null)[] }[]> = {
  // --- PART 1 ---
  "ESCOLA MUNICIPAL PROFESSORA ISABEL DO CARMO NOGUEIRA": [
    { nomeTurma: "2º ANO A", avaliados: 23, previstos: 23, itens: [91, 78, null, null, null, 78, 78, null, 73, null, 91, null, null, null, 63, null, null, null, 67, null, null, null, 63, null, null, null, 59] },
    { nomeTurma: "2º ANO B", avaliados: 22, previstos: 22, itens: [95, null, 95, null, null, 91, null, 86, null, 86, null, 95, null, null, null, 59, null, null, null, 76, null, null, null, 67, null, null, 73] },
    { nomeTurma: "2º ANO C", avaliados: 20, previstos: 20, itens: [100, null, null, 100, null, 100, 95, null, 100, null, null, null, 100, null, null, null, 95, null, null, null, 100, null, null, null, 100, null, 90] },
    { nomeTurma: "2º ANO D", avaliados: 19, previstos: 19, itens: [95, null, null, null, 95, 100, null, 74, null, 89, null, null, null, 89, null, null, null, 95, null, null, null, 100, null, null, null, 74, 89] }
  ],
  "ESCOLA MUNICIPAL JOAO KOLENDA LEMOS": [
    { nomeTurma: "2 ºB", avaliados: 11, previstos: 11, itens: [73, 82, null, null, null, 64, 64, null, 82, null, 55, null, null, null, 27, null, null, null, 55, null, null, null, 64, null, null, null, 30] },
    { nomeTurma: "2º A", avaliados: 14, previstos: 14, itens: [79, null, 79, null, null, 71, null, 71, null, 64, null, 86, null, null, null, 62, null, null, null, 50, null, null, null, 54, null, null, 43] },
    { nomeTurma: "2º ANO C", avaliados: 12, previstos: 12, itens: [58, null, null, 50, null, 100, 92, null, 92, null, null, null, 83, null, null, null, 92, null, null, null, 75, null, null, null, 58, null, 50] },
    { nomeTurma: "2º ANO D", avaliados: 16, previstos: 17, itens: [81, null, null, null, 88, 94, null, 50, null, 88, null, null, null, 81, null, null, null, 88, null, null, null, 81, null, null, null, 81, 81] },
    { nomeTurma: "2º ANO E", avaliados: 14, previstos: 15, itens: [50, 71, null, null, null, 79, 79, null, 71, null, 64, null, null, null, 57, null, null, null, 50, null, null, null, 50, null, null, null, 54] },
    { nomeTurma: "2º ANO F", avaliados: 18, previstos: 19, itens: [83, null, 83, null, null, 94, null, 67, null, 28, null, 78, null, null, null, 83, null, null, null, 83, null, null, null, 89, null, null, 72] }
  ],
  "ESCOLA MUNICIPAL DOUTOR ANGELO PAZ DA SILVA": [
    { nomeTurma: "2º ANO A", avaliados: 15, previstos: 15, itens: [87, 87, null, null, null, 93, 93, null, 87, null, 93, null, null, null, 80, null, null, null, 87, null, null, null, 80, null, null, null, 50] },
    { nomeTurma: "2º ANO B", avaliados: 0, previstos: 18, itens: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
    { nomeTurma: "2º ANO C", avaliados: 15, previstos: 15, itens: [100, null, null, 100, null, 100, 100, null, 93, null, null, null, 100, null, null, null, 87, null, null, null, 87, null, null, null, 80, null, 80] }
  ],
  "ESCOLA MUNICIPAL PROFESSOR ORLANDO PIRES": [
    { nomeTurma: "2 ANO A", avaliados: 17, previstos: 20, itens: [100, null, 94, null, null, 88, null, 76, null, 65, null, 76, null, null, null, 44, null, null, null, 50, null, null, null, 29, null, null, 29] },
    { nomeTurma: "2 ANO B", avaliados: 4, previstos: 12, itens: [100, null, null, 100, null, 100, 100, null, 100, null, null, null, 50, null, null, null, 50, null, null, null, 100, null, null, null, 100, null, 50] }
  ],
  "ESCOLA MUNICIPAL PROFA MARIA APARECIDA ARANTES VASQUES": [
    { nomeTurma: "2º ANO A", avaliados: 25, previstos: 26, itens: [96, 100, null, null, null, 92, 96, null, 84, null, 92, null, null, null, 84, null, null, null, 100, null, null, null, 96, null, null, null, 71] },
    { nomeTurma: "2º ANO B", avaliados: 22, previstos: 23, itens: [95, null, 100, null, null, 86, null, 68, null, 73, null, 100, null, null, null, 77, null, null, null, 86, null, null, null, 82, null, null, 59] }
  ],
  "ESCOLA MUNICIPAL PROFESSOR MOACYR DE ALMEIDA": [
    { nomeTurma: "2A", avaliados: 17, previstos: 17, itens: [88, 94, null, null, null, 94, 94, null, 100, null, 94, null, null, null, 76, null, null, null, 76, null, null, null, 76, null, null, null, 59] }
  ],
  "ESCOLA MUNICIPAL PROFESSORA GILDA PIORINI MOLICA": [
    { nomeTurma: "2º ANO A MANHA", avaliados: 13, previstos: 14, itens: [100, null, 92, null, null, 100, null, 69, null, 85, null, 92, null, null, null, 85, null, null, null, 77, null, null, null, 85, null, null, 75] },
    { nomeTurma: "2º ANO B MANHA", avaliados: 16, previstos: 17, itens: [81, null, null, 88, null, 94, 88, null, 94, null, null, null, 94, null, null, null, 94, null, null, null, 69, null, null, null, 81, null, 88] },
    { nomeTurma: "2º ANO C TARDE", avaliados: 17, previstos: 18, itens: [88, null, null, null, 94, 71, null, 76, null, 65, null, null, null, 82, null, null, null, 59, null, null, null, 50, null, null, null, 59, 41] }
  ],
  "ESCOLA MUNICIPAL PADRE ZEZINHO": [
    { nomeTurma: "2 ANO A", avaliados: 14, previstos: 14, itens: [86, null, null, 100, null, 100, 64, null, 93, null, null, null, 86, null, null, null, 86, null, null, null, 79, null, null, null, 93, null, 57] },
    { nomeTurma: "2 ANO B", avaliados: 20, previstos: 20, itens: [90, null, null, null, 100, 90, null, 80, null, 80, null, null, null, 90, null, null, null, 70, null, null, null, 80, null, null, null, 78, 63] },
    { nomeTurma: "2 ANO C", avaliados: 15, previstos: 15, itens: [87, 93, null, null, null, 93, 87, null, 100, null, 80, null, null, null, 73, null, null, null, 93, null, null, null, 47, null, null, null, 53] }
  ],
  "ESCOLA MUNICIPAL DR FRANCISCO DE ASSIS CESAR": [
    { nomeTurma: "2 ANO A", avaliados: 0, previstos: 17, itens: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
    { nomeTurma: "2 ANO B", avaliados: 16, previstos: 16, itens: [81, null, null, null, 81, 100, null, 56, null, 63, null, null, null, 81, null, null, null, 50, null, null, null, 81, null, null, null, 56, 69] },
    { nomeTurma: "2 ANO C", avaliados: 20, previstos: 20, itens: [100, 90, null, null, null, 100, 80, null, 90, null, 100, null, null, null, 95, null, null, null, 80, null, null, null, 90, null, null, null, 90] }
  ],
  "ESCOLA MUNICIPAL ARTHUR DE ANDRADE": [
    { nomeTurma: "2º ANO A", avaliados: 19, previstos: 20, itens: [84, 83, null, null, null, 100, 74, null, 89, null, 95, null, null, null, 83, null, null, null, 89, null, null, null, 89, null, null, null, 67] },
    { nomeTurma: "2º ANO B", avaliados: 17, previstos: 18, itens: [82, null, 81, null, null, 94, null, 76, null, 76, null, 65, null, null, null, 81, null, null, null, 63, null, null, null, 88, null, null, 59] },
    { nomeTurma: "2º ANO C", avaliados: 22, previstos: 22, itens: [62, null, null, 82, null, 77, 68, null, 82, null, null, null, 82, null, null, null, 59, null, null, null, 68, null, null, null, 77, null, 76] },
    { nomeTurma: "2º ANO D", avaliados: 19, previstos: 19, itens: [100, null, null, null, 100, 100, null, 84, null, 89, null, null, null, 95, null, null, null, 78, null, null, null, 100, null, null, null, 84, 89] }
  ],
  "ESCOLA MUNICIPAL PROFA RACHEL DE AGUIAR LOBERTO": [
    { nomeTurma: "2ºA", avaliados: 25, previstos: 26, itens: [96, null, null, null, 100, 100, null, 72, null, 56, null, null, null, 80, null, null, null, 61, null, null, null, 72, null, null, null, 63, 48] },
    { nomeTurma: "2ºB", avaliados: 23, previstos: 23, itens: [87, 91, null, null, null, 91, 87, null, 96, null, 83, null, null, null, 87, null, null, null, 78, null, null, null, 57, null, null, null, 73] }
  ],
  "ESCOLA MUNICIPAL PROFESSOR FELIX ADIB MIGUEL": [
    { nomeTurma: "2ºA", avaliados: 21, previstos: 22, itens: [86, null, null, 86, null, 90, 86, null, 95, null, null, null, 90, null, null, null, 100, null, null, null, 86, null, null, null, 90, null, 81] },
    { nomeTurma: "2ºB", avaliados: 19, previstos: 20, itens: [84, null, null, null, 74, 95, null, 68, null, 74, null, null, null, 84, null, null, null, 74, null, null, null, 68, null, null, null, 37, 53] }
  ],
  "ESCOLA MUNICIPAL ABDIAS JUNIOR SANTIAGO E SILVA": [
    { nomeTurma: "2º ANO A", avaliados: 15, previstos: 15, itens: [87, null, 87, null, null, 100, null, 73, null, 67, null, 73, null, null, null, 60, null, null, null, 80, null, null, null, 67, null, null, 73] },
    { nomeTurma: "2º ANO B", avaliados: 15, previstos: 15, itens: [93, null, null, 87, null, 100, 100, null, 100, null, null, null, 93, null, null, null, 67, null, null, null, 60, null, null, null, 47, null, 60] },
    { nomeTurma: "2º ANO C", avaliados: 16, previstos: 16, itens: [75, null, null, null, 100, 100, null, 56, null, 75, null, null, null, 81, null, null, null, 69, null, null, null, 81, null, null, null, 69, 44] }
  ],
  "ESCOLA MUNICIPAL VITO ARDITO": [
    { nomeTurma: "2º ANO A", avaliados: 19, previstos: 19, itens: [79, null, 89, null, null, 95, null, 68, null, 65, null, 79, null, null, null, 78, null, null, null, 78, null, null, null, 79, null, null, 71] },
    { nomeTurma: "2º ANO B", avaliados: 19, previstos: 19, itens: [83, null, null, 72, null, 83, 89, null, 89, null, null, null, 89, null, null, null, 72, null, null, null, 83, null, null, null, 53, null, 67] }
  ],

  // --- PART 2 ---
  "ESCOLA MUNICIPAL PROFA MARIA ZARA MINE RENOLDI DOS SANTOS": [
    { nomeTurma: "2º A", avaliados: 21, previstos: 21, itens: [95, null, null, 90, null, 90, 86, null, 95, null, null, null, 86, null, null, null, 86, null, null, null, 80, null, null, null, 53, null, 19] },
    { nomeTurma: "2º B", avaliados: 21, previstos: 22, itens: [90, null, null, null, 95, 95, null, 71, null, 67, null, null, null, 81, null, null, null, 67, null, null, null, 38, null, null, null, 38, 33] }
  ],
  "ESCOLA MUN PADRE MARIO ANTONIO BONOTTI REDENTORISTA": [
    { nomeTurma: "A", avaliados: 17, previstos: 17, itens: [100, null, null, 82, null, 100, 82, null, 76, null, null, null, 76, null, null, null, 53, null, null, null, 71, null, null, null, 59, null, 53] },
    { nomeTurma: "B", avaliados: 14, previstos: 14, itens: [93, null, null, null, 93, 93, null, 93, null, 93, null, null, null, 100, null, null, null, 93, null, null, null, 93, null, null, null, 71, 86] },
    { nomeTurma: "C", avaliados: 15, previstos: 15, itens: [87, 87, null, null, null, 93, 67, null, 93, null, 93, null, null, null, 80, null, null, null, 87, null, null, null, 80, null, null, null, 73] }
  ],
  "ESCOLA MUNICIPAL JOAO CESARIO": [
    { nomeTurma: "2º A", avaliados: 19, previstos: 22, itens: [100, null, null, null, 89, 95, null, 79, null, 63, null, null, null, 100, null, null, null, 95, null, null, null, 100, null, null, null, 89, 89] },
    { nomeTurma: "2º B", avaliados: 14, previstos: 17, itens: [71, 92, null, null, null, 100, 77, null, 100, null, 69, null, null, null, 46, null, null, null, 54, null, null, null, 50, null, null, null, 62] },
    { nomeTurma: "2º C", avaliados: 18, previstos: 22, itens: [89, null, 94, null, null, 94, null, 83, null, 76, null, 83, null, null, null, 83, null, null, null, 78, null, null, null, 72, null, null, 76] },
    { nomeTurma: "2º D", avaliados: 9, previstos: 12, itens: [100, null, null, 100, null, 100, 78, null, 100, null, null, null, 89, null, null, null, 100, null, null, null, 88, null, null, null, 0, null, 88] },
    { nomeTurma: "2º E", avaliados: 21, previstos: 26, itens: [95, null, null, null, 95, 100, null, 86, null, 81, null, null, null, 95, null, null, null, 85, null, null, null, 95, null, null, null, 86, 84] }
  ],
  "ESCOLA MUNICIPAL PROFESSORA JULIETA REALE VIEIRA": [
    { nomeTurma: "2º ANO A", avaliados: 17, previstos: 17, itens: [82, 94, null, null, null, 100, 88, null, 94, null, 94, null, null, null, 71, null, null, null, 75, null, null, null, 53, null, null, null, 71] },
    { nomeTurma: "2º ANO B", avaliados: 15, previstos: 15, itens: [67, null, 93, null, null, 93, null, 73, null, 53, null, 87, null, null, null, 100, null, null, null, 60, null, null, null, 93, null, null, 73] },
    { nomeTurma: "2º ANO C", avaliados: 21, previstos: 21, itens: [90, null, null, 80, null, 100, 71, null, 81, null, null, null, 76, null, null, null, 33, null, null, null, 48, null, null, null, 33, null, 33] }
  ],
  "ESCOLA MUNICIPAL PROFESSORA YVONE APPARECIDA ARANTES CORREA": [
    { nomeTurma: "2 ANO A", avaliados: 18, previstos: 19, itens: [72, null, 88, null, null, 89, null, 78, null, 56, null, 89, null, null, null, 72, null, null, null, 83, null, null, null, 83, null, null, 61] }
  ],
  "ESCOLA MUNICIPAL PROFESSORA RUTH AZEVEDO ROMEIRO": [
    { nomeTurma: "2º B", avaliados: 22, previstos: 22, itens: [95, null, null, null, 86, 100, null, 77, null, 0, null, null, null, 86, null, null, null, 82, null, null, null, 95, null, null, null, 95, 95] },
    { nomeTurma: "2ºA", avaliados: 19, previstos: 19, itens: [95, 89, null, null, null, 100, 84, null, 95, null, 95, null, null, null, 95, null, null, null, 100, null, null, null, 95, null, null, null, 89] }
  ],
  "ESCOLA MUNICIPAL PROFESSOR ALEXANDRE MACHADO SALGADO": [
    { nomeTurma: "2ºA", avaliados: 19, previstos: 19, itens: [74, 95, null, null, null, 100, 74, null, 58, null, 89, null, null, null, 58, null, null, null, 84, null, null, null, 53, null, null, null, 47] },
    { nomeTurma: "2ºB", avaliados: 19, previstos: 19, itens: [89, null, 89, null, null, 89, null, 74, null, 74, null, 68, null, null, null, 53, null, null, null, 47, null, null, null, 42, null, null, 42] },
    { nomeTurma: "2ºC", avaliados: 19, previstos: 20, itens: [95, null, null, 84, null, 89, 58, null, 68, null, null, null, 89, null, null, null, 74, null, null, null, 47, null, null, null, 79, null, 74] },
    { nomeTurma: "2ºD", avaliados: 21, previstos: 21, itens: [86, null, null, null, 95, 95, null, 76, null, 90, null, null, null, 90, null, null, null, 95, null, null, null, 90, null, null, null, 81, 90] }
  ],
  "ESCOLA MUNICIPAL PROFA MARIA HELENA RIBEIRO VILELA": [
    { nomeTurma: "2º A", avaliados: 0, previstos: 18, itens: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
    { nomeTurma: "2º B", avaliados: 16, previstos: 16, itens: [75, 88, null, null, null, 88, 81, null, 94, null, 94, null, null, null, 75, null, null, null, 73, null, null, null, 69, null, null, null, 50] },
    { nomeTurma: "2º C", avaliados: 16, previstos: 16, itens: [88, null, 100, null, null, 69, null, 63, null, 63, null, 69, null, null, null, 56, null, null, null, 69, null, null, null, 56, null, null, 63] }
  ],
  "ESCOLA MUNICIPAL PROFESSOR PAULO FREIRE": [
    { nomeTurma: "2º ANO A", avaliados: 13, previstos: 13, itens: [100, null, null, null, 100, 92, null, 85, null, 77, null, null, null, 100, null, null, null, 92, null, null, null, 100, null, null, null, 92, 100] },
    { nomeTurma: "2º ANO B", avaliados: 14, previstos: 14, itens: [86, 100, null, null, null, 93, 86, null, 93, null, 100, null, null, null, 100, null, null, null, 100, null, null, null, 100, null, null, null, 100] }
  ],
  "ESCOLA MUNICIPAL PROFESSOR ELIAS BARGIS MATHIAS": [
    { nomeTurma: "2º A", avaliados: 21, previstos: 21, itens: [90, null, null, 95, null, 86, 90, null, 90, null, null, null, 76, null, null, null, 81, null, null, null, 81, null, null, null, 57, null, 71] },
    { nomeTurma: "2º B", avaliados: 21, previstos: 21, itens: [90, null, null, null, 90, 86, null, 67, null, 67, null, null, null, 86, null, null, null, 71, null, null, null, 62, null, null, null, 33, 76] },
    { nomeTurma: "2º C", avaliados: 24, previstos: 24, itens: [92, 92, null, null, null, 96, 88, null, 92, null, 88, null, null, null, 75, null, null, null, 79, null, null, null, 63, null, null, null, 63] },
    { nomeTurma: "2º D", avaliados: 23, previstos: 23, itens: [96, null, 91, null, null, 91, null, 70, null, 87, null, 74, null, null, null, 61, null, null, null, 78, null, null, null, 61, null, null, 83] }
  ],
  "ESCOLA MUNICIPAL DR ANDRE FRANCO MONTORO": [
    { nomeTurma: "2 ANO A", avaliados: 1, previstos: 18, itens: [100, null, null, null, 100, 100, null, 100, null, 0, null, null, null, 100, null, null, null, 100, null, null, null, 0, null, null, null, 100, 0] },
    { nomeTurma: "2 ANO B", avaliados: 18, previstos: 18, itens: [100, 94, null, null, null, 94, 89, null, 100, null, 94, null, null, null, 89, null, null, null, 94, null, null, null, 89, null, null, null, 78] },
    { nomeTurma: "2 ANO C", avaliados: 17, previstos: 18, itens: [88, null, 88, null, null, 100, null, 76, null, 82, null, 82, null, null, null, 59, null, null, null, 59, null, null, null, 59, null, null, 59] }
  ],
  "ESCOLA MUNICIPAL PROFESSOR AUGUSTO CESAR RIBEIRO": [
    { nomeTurma: "2º ANO A", avaliados: 17, previstos: 18, itens: [94, 100, null, null, null, 100, 94, null, 94, null, 94, null, null, null, 88, null, null, null, 88, null, null, null, 88, null, null, null, 59] },
    { nomeTurma: "2º ANO B", avaliados: 19, previstos: 20, itens: [100, null, 100, null, null, 42, null, 74, null, 74, null, 74, null, null, null, 68, null, null, null, 63, null, null, null, 42, null, null, 58] }
  ],
  "ESCOLA MUNICIPAL PROF LAURO VICENTE DE AZEVEDO": [
    { nomeTurma: "2 ANO A", avaliados: 12, previstos: 15, itens: [92, null, 92, null, null, 100, null, 92, null, 83, null, 100, null, null, null, 75, null, null, null, 92, null, null, null, 42, null, null, 92] },
    { nomeTurma: "2 ANO B", avaliados: 22, previstos: 28, itens: [73, null, null, 95, null, 91, 77, null, 77, null, null, null, 68, null, null, null, 32, null, null, null, 23, null, null, null, 23, null, 41] }
  ],
  "ESCOLA MUNICIPAL SERAFIM FERREIRA SR SARA": [
    { nomeTurma: "2º ANO A", avaliados: 22, previstos: 22, itens: [86, null, null, 86, null, 100, 91, null, 95, null, null, null, 100, null, null, null, 91, null, null, null, 86, null, null, null, 55, null, 77] },
    { nomeTurma: "2º ANO B", avaliados: 20, previstos: 20, itens: [95, null, null, null, 100, 95, null, 84, null, 83, null, null, null, 89, null, null, null, 74, null, null, null, 71, null, null, null, 74, 72] },
    { nomeTurma: "2º ANO C", avaliados: 19, previstos: 19, itens: [74, 89, null, null, null, 100, 79, null, 100, null, 84, null, null, null, 89, null, null, null, 89, null, null, null, 83, null, null, null, 78] }
  ],
  "ESCOLA MUNICIPAL DULCE PEDROSA ROMEIRO GUIMARAES": [
    { nomeTurma: "2º ANO A", avaliados: 19, previstos: 19, itens: [100, null, 100, null, null, 100, null, 79, null, 58, null, 100, null, null, null, 89, null, null, null, 74, null, null, null, 84, null, null, 79] },
    { nomeTurma: "2º ANO B", avaliados: 19, previstos: 19, itens: [95, null, null, 95, null, 79, 84, null, 84, null, null, null, 79, null, null, null, 74, null, null, null, 58, null, null, null, 74, null, 63] }
  ],

  // --- PART 3 ---
  "ESCOLA MUNICIPAL PROFA MADALENA CALTABIANO SALUM BENJAMIM": [
    { nomeTurma: "2º ANO A", avaliados: 17, previstos: 17, itens: [71, null, null, null, 71, 94, null, 65, null, 60, null, null, null, 71, null, null, null, 41, null, null, null, 75, null, null, null, 41, 59] }
  ],
  "ESCOLA MUNICIPAL PROFESSOR JOAQUIM PEREIRA DA SILVA": [
    { nomeTurma: "2º ANO A", avaliados: 21, previstos: 21, itens: [90, 86, null, null, null, 95, 81, null, 100, null, 95, null, null, null, 95, null, null, null, 95, null, null, null, 95, null, null, null, 86] },
    { nomeTurma: "2º ANO B", avaliados: 19, previstos: 20, itens: [89, null, 100, null, null, 95, null, 58, null, 68, null, 78, null, null, null, 44, null, null, null, 65, null, null, null, 61, null, null, 44] },
    { nomeTurma: "2º ANO C", avaliados: 19, previstos: 19, itens: [84, null, null, 84, null, 95, 84, null, 89, null, null, null, 95, null, null, null, 84, null, null, null, 79, null, null, null, 84, null, 68] },
    { nomeTurma: "2º ANO D", avaliados: 22, previstos: 22, itens: [95, null, null, null, 100, 95, null, 77, null, 64, null, null, null, 86, null, null, null, 68, null, null, null, 86, null, null, null, 33, 82] },
    { nomeTurma: "2º ANO E", avaliados: 19, previstos: 19, itens: [95, 100, null, null, null, 100, 95, null, 95, null, 100, null, null, null, 100, null, null, null, 100, null, null, null, 95, null, null, null, 95] },
    { nomeTurma: "2º ANO F", avaliados: 21, previstos: 21, itens: [95, null, 100, null, null, 100, null, 81, null, 76, null, 95, null, null, null, 67, null, null, null, 81, null, null, null, 81, null, null, 86] }
  ],
  "ESCOLA MUNICIPAL PROFA MARIA APARECIDA CAMARGO DE SOUZA": [
    { nomeTurma: "2ºANO", avaliados: 7, previstos: 7, itens: [86, null, null, 100, null, 100, 71, null, 100, null, null, null, 100, null, null, null, 71, null, null, null, 57, null, null, null, 29, null, 71] }
  ],
  "ESCOLA MUNICIPAL JOSE GONCALVES DA SILVA SEU JUQUINHA": [
    { nomeTurma: "2º ANO A", avaliados: 17, previstos: 17, itens: [82, null, null, 82, null, 100, 82, null, 71, null, null, null, 71, null, null, null, 81, null, null, null, 80, null, null, null, 79, null, 79] },
    { nomeTurma: "2º ANO B", avaliados: 16, previstos: 17, itens: [81, null, null, null, 94, 100, null, 44, null, 69, null, null, null, 94, null, null, null, 94, null, null, null, 94, null, null, null, 94, 81] },
    { nomeTurma: "2º ANO C", avaliados: 19, previstos: 19, itens: [84, 89, null, null, null, 95, 68, null, 74, null, 68, null, null, null, 47, null, null, null, 37, null, null, null, 26, null, null, null, 47] },
    { nomeTurma: "2º ANO D", avaliados: 16, previstos: 16, itens: [88, null, 100, null, null, 94, null, 75, null, 88, null, 88, null, null, null, 75, null, null, null, 69, null, null, null, 75, null, null, 56] }
  ],
  "ESCOLA MUNICIPAL PROFESSOR MARIO DE ASSIS CESAR": [
    { nomeTurma: "2º ANO A", avaliados: 0, previstos: 16, itens: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
    { nomeTurma: "2º ANO B", avaliados: 22, previstos: 22, itens: [91, null, null, null, 95, 86, null, 86, null, 86, null, null, null, 82, null, null, null, 95, null, null, null, 91, null, null, null, 91, 95] }
  ],
  "ESCOLA MUNICIPAL PROFA REGINA CELIA MADUREIRA DE SOUZA LIMA": [
    { nomeTurma: "2 ANO A", avaliados: 7, previstos: 10, itens: [100, null, 100, null, null, 71, null, 100, null, 71, null, 100, null, null, null, 57, null, null, null, 100, null, null, null, 71, null, null, 14] },
    { nomeTurma: "2 ANO B", avaliados: 16, previstos: 22, itens: [44, null, null, 63, null, 75, 50, null, 50, null, null, null, 69, null, null, null, 27, null, null, null, 38, null, null, null, 27, null, 31] },
    { nomeTurma: "2 ANO C", avaliados: 25, previstos: 31, itens: [84, null, null, null, 96, 56, null, 72, null, 80, null, null, null, 92, null, null, null, 60, null, null, null, 76, null, null, null, 52, 52] }
  ],
  "EM PROFA MARIA MADUREIRA SALGADO DONA MINICA": [
    { nomeTurma: "2º ANO A", avaliados: 11, previstos: 11, itens: [82, null, 91, null, null, 91, null, 100, null, 9, null, 80, null, null, null, 56, null, null, null, 45, null, null, null, 33, null, null, 55] }
  ],
  "ESCOLA MUNICIPAL PROFA ODETE CORREA MADUREIRA": [
    { nomeTurma: "2º ANO A", avaliados: 16, previstos: 17, itens: [94, 100, null, null, null, 100, 93, null, 80, null, 100, null, null, null, 94, null, null, null, 81, null, null, null, 88, null, null, null, 75] },
    { nomeTurma: "2º ANO B", avaliados: 17, previstos: 18, itens: [94, null, 94, null, null, 88, null, 88, null, 80, null, 88, null, null, null, 88, null, null, null, 75, null, null, null, 100, null, null, 81] },
    { nomeTurma: "2º ANO C", avaliados: 13, previstos: 16, itens: [77, null, null, 69, null, 83, 69, null, 62, null, null, null, 69, null, null, null, 54, null, null, null, 46, null, null, null, 54, null, 67] }
  ]
};

// 5. Generate all Schools and Turmas deterministically using static config list
export function generateSystemData(): {
  network: NetworkData;
  schools: SchoolData[];
  classes: ClassData[];
} {
  const rand = new SeededRandom(2026); // Fixed seed to ensure identical loading

  const totalSchools = 37;

  // Exact classes per school based on standard counts and explicit dump structures
  const classesPerSchool = [
    1, // 0: DONA MINICA
    3, // 1: BONOTTI (overridden to 3 in dump)
    3, // 2: ABDIAS (overridden to 3 in dump)
    4, // 3: ARTHUR DE ANDRADE (overridden to 4 in dump)
    3, // 4: ANGELO PAZ
    3, // 5: DR ANDRE FRANCO MONTORO
    3, // 6: FRANCISCO DE ASSIS
    2, // 7: DULCE PEDROSA
    5, // 8: JOAO CESARIO (overridden to 5 in dump)
    6, // 9: JOAO KOLENDA (overridden to 6 in dump)
    4, // 10: JOSE GONCALVES (overridden to 4 in dump)
    3, // 11: PADRE ZEZINHO
    2, // 12: LAURO VICENTE
    1, // 13: MADALENA CALTABIANO (overridden to 1 in dump)
    2, // 14: ARANTES VASQUES (overridden to 2 in dump)
    1, // 15: MARIA APARECIDA CAMARGO
    3, // 16: MARIA HELENA RIBEIRO
    2, // 17: MARIA ZARA MINE
    3, // 18: ODETE CORREA
    2, // 19: RACHEL DE AGUIAR (overridden to 2 in dump)
    3, // 20: REGINA CELIA
    4, // 21: ALEXANDRE MACHADO (overridden to 4 in dump)
    2, // 22: AUGUSTO CESAR
    4, // 23: ELIAS BARGIS
    2, // 24: FELIX ADIB
    6, // 25: JOAQUIM PEREIRA (overridden to 6 in dump)
    2, // 26: MARIO DE ASSIS
    1, // 27: MOACYR DE ALMEIDA (overridden to 1 in dump)
    2, // 28: ORLANDO PIRES
    2, // 29: PAULO FREIRE
    3, // 30: GILDA PIORINI
    4, // 31: ISABEL DO CARMO
    3, // 32: JULIETA REALE
    2, // 33: RUTH AZEVEDO
    1, // 34: YVONE ARANTES (overridden to 1 in dump)
    3, // 35: SERAFIM FERREIRA
    2  // 36: VITO ARDITO
  ];

  const schools: SchoolData[] = [];
  const classes: ClassData[] = [];
  let currentClassId = 1;

  for (let i = 0; i < totalSchools; i++) {
    const config = STATIC_SCHOOLS_CONFIG[i];
    const { name, prev: previstos, aval: avaliados, pct: participacao, parcial, minimo, excedeu } = config;
    const sucesso = minimo + excedeu;

    const formattedName = formatSchoolName(name);

    // School descriptors from configuration
    const descritores: Record<string, number> = {};
    DESCRIPTORS.forEach((desc, dIdx) => {
      descritores[desc.id] = config.d[dIdx];
    });

    // School items
    const itens: Record<string, number | null> = {};
    const schoolItens = STATIC_ITENS_CONFIG[i];
    ITEMS.forEach((item, itemIdx) => {
      itens[item.id] = schoolItens[itemIdx];
    });

    const school: SchoolData = {
      nomeEscola: formattedName,
      previstos,
      avaliados,
      participacao,
      parcial,
      minimo,
      excedeu,
      sucesso,
      descritores,
      itens
    };
    schools.push(school);

    // Now generate classes for this school
    const numClasses = classesPerSchool[i];
    let classPrevRemainder = previstos;
    let classEvalRemainder = avaliados;

    const dumpClasses = DUMP_CLASSES[name];

    for (let c = 0; c < numClasses; c++) {
      const letter = String.fromCharCode(65 + c); // A, B, C, D
      const isLastClass = c === numClasses - 1;

      let cPrev = 0;
      let cEval = 0;

      const dumpClass = dumpClasses ? dumpClasses[c] : null;

      if (dumpClass) {
        cPrev = dumpClass.previstos;
        cEval = dumpClass.avaliados;
      } else {
        // Custom override values to match exact target class sizes and structures for fallback schools
        let hasOverride = false;
        if (name.includes("MARIO DE ASSIS")) {
          hasOverride = true;
          if (letter === 'A') { cPrev = 16; cEval = 0; }
          else if (letter === 'B') { cPrev = 22; cEval = 22; }
        }

        if (hasOverride) {
          classPrevRemainder -= cPrev;
          classEvalRemainder -= cEval;
        } else {
          if (isLastClass) {
            cPrev = classPrevRemainder;
            cEval = classEvalRemainder;
          } else {
            const share = 1 / (numClasses - c) + (rand.next() * 0.2 - 0.1);
            cPrev = Math.max(5, Math.round(previstos * share));
            cPrev = Math.min(classPrevRemainder - (numClasses - c - 1) * 5, cPrev);
            cPrev = Math.max(5, cPrev);

            cEval = Math.round(cPrev * (participacao / 100 + (rand.next() * 0.1 - 0.05)));
            cEval = Math.max(3, Math.min(cPrev, cEval));
            cEval = Math.min(classEvalRemainder - (numClasses - c - 1) * 3, cEval);
            cEval = Math.max(2, cEval);

            classPrevRemainder -= cPrev;
            classEvalRemainder -= cEval;
          }
        }
      }
      const cPart = Math.round((cEval / (cPrev || 1)) * 100);

      // Class level performance slightly perturbed from school
      let classBias = rand.perturbPp(0, 8);
      let cExcedeu = Math.max(0, Math.min(100, rand.perturbPp(excedeu, 8) + classBias));
      let cParcial = Math.max(0, Math.min(100, rand.perturbPp(parcial, 6) - classBias));
      let cMinimo = 100 - (cExcedeu + cParcial);
      if (cMinimo < 0) {
        cMinimo = 10;
        const tot = cExcedeu + cParcial + cMinimo;
        cExcedeu = Math.round((cExcedeu / tot) * 100);
        cParcial = Math.round((cParcial / tot) * 100);
        cMinimo = 100 - (cExcedeu + cParcial);
      }
      const cSucesso = cMinimo + cExcedeu;

      // Class descriptors
      const cDescritores: Record<string, number | null> = {};
      DESCRIPTORS.forEach(desc => {
        cDescritores[desc.id] = Math.max(5, Math.min(100, rand.perturbPp(descritores[desc.id], 8) + classBias));
      });

      // Apply precise overrides for class descriptor values to match official target data exactly
      if (cEval === 0) {
        // Rule: Turmas com Avaliados=0 devem obrigatoriamente exibir "—" para todos os descritores (ausente)
        DESCRIPTORS.forEach(desc => {
          cDescritores[desc.id] = null;
        });
      } else if (name.includes("DONA MINICA")) {
        cDescritores['D001_J'] = 82;
        cDescritores['D002_J'] = 91;
        cDescritores['D003_J'] = 91;
        cDescritores['D004_J'] = 100;
        cDescritores['D005_J'] = 9; // 9, not 90
        cDescritores['D006_J'] = 68;
        cDescritores['D007_J'] = 45;
      } else if (name.includes("PROFA MARIA APARECIDA ARANTES VASQUES")) {
        if (letter === 'A') {
          cDescritores['D001_J'] = 96;
          cDescritores['D002_J'] = 100;
          cDescritores['D003_J'] = 92;
          cDescritores['D004_J'] = 96;
          cDescritores['D005_J'] = 84;
          cDescritores['D006_J'] = 88;
          cDescritores['D007_J'] = 89;
        } else if (letter === 'B') {
          cDescritores['D001_J'] = 95;
          cDescritores['D002_J'] = 100;
          cDescritores['D003_J'] = 86;
          cDescritores['D004_J'] = 68;
          cDescritores['D005_J'] = 73;
          cDescritores['D006_J'] = 89;
          cDescritores['D007_J'] = 76;
        }
      } else if (name.includes("PROFESSORA RUTH AZEVEDO ROMEIRO") && letter === 'B') {
        cDescritores['D005_J'] = 0; // zero real
      } else if (name.includes("PROFESSORA ISABEL DO CARMO NOGUEIRA") && letter === 'C') {
        cDescritores['D001_J'] = 100;
        cDescritores['D002_J'] = 100;
        cDescritores['D003_J'] = 100;
        cDescritores['D004_J'] = 95;
        cDescritores['D005_J'] = 100;
        cDescritores['D006_J'] = 98;
        cDescritores['D007_J'] = 97;
      }

      // Class items
      const cItens: Record<string, number | null> = {};
      if (dumpClass) {
        ITEMS.forEach((item, itemIdx) => {
          cItens[item.id] = dumpClass.itens[itemIdx];
        });
      } else {
        ITEMS.forEach(item => {
          cItens[item.id] = Math.max(0, Math.min(100, rand.perturbPp(itens[item.id] || 70, 8) + classBias + rand.nextInt(-4, 4)));
        });

        // Apply precise overrides for class items to match official target data exactly
        if (cEval === 0) {
          // Rule: Turmas com Avaliados=0 devem de forma mandatória exibir "—" para todos os 27 itens (ausente)
          ITEMS.forEach(item => {
            cItens[item.id] = null;
          });
        } else if (name.includes("DONA MINICA")) {
          const dMValues = [82, null, 91, null, null, 91, null, 100, null, 9, null, 80, null, null, null, 56, null, null, null, 45, null, null, null, 33, null, null, 55];
          ITEMS.forEach((item, itemIdx) => {
            cItens[item.id] = dMValues[itemIdx];
          });
        } else if (name.includes("PROFA MARIA APARECIDA ARANTES VASQUES")) {
          if (letter === 'A') {
            const avValues = [96, 100, null, null, null, 92, 96, null, 84, null, 92, null, null, null, 84, null, null, null, 100, null, null, null, 96, null, null, null, 71];
            ITEMS.forEach((item, itemIdx) => {
              cItens[item.id] = avValues[itemIdx];
            });
          } else if (letter === 'B') {
            const bvValues = [95, null, 100, null, null, 86, null, 68, null, 73, null, 100, null, null, null, 77, null, null, null, 86, null, null, null, 82, null, null, 59];
            ITEMS.forEach((item, itemIdx) => {
              cItens[item.id] = bvValues[itemIdx];
            });
          }
        } else {
          // Other schools custom item rules
          if (name.includes("PROFESSORA RUTH AZEVEDO ROMEIRO") && letter === 'B') {
            cItens['Item 10'] = 0; // zero real
          } else if (name.includes("MONTORO") && letter === 'A') {
            cItens['Item 10'] = 0;
            cItens['Item 22'] = 0;
            cItens['Item 27'] = 0;
          }
        }
      }

      const className = dumpClass ? dumpClass.nomeTurma : `2º Ano ${letter}`;
      const code = `TURMA-${2026000 + currentClassId}`;
      currentClassId++;

      classes.push({
        codigoTurma: code,
        nomeTurma: className,
        nomeEscola: formattedName,
        previstos: cPrev,
        avaliados: cEval,
        participacao: cPart,
        parcial: cParcial,
        minimo: cMinimo,
        excedeu: cExcedeu,
        sucesso: cSucesso,
        descritores: cDescritores,
        itens: cItens
      });
    }
  }

  return {
    network: BASELINE_NETWORK_DATA,
    schools,
    classes
  };
}

// 5. Utility helper to check if values are "-" and parse them
export function cleanValue(val: string | number): number | null {
  if (val === undefined || val === null || val === '-') return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}
