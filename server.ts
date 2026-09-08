/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === '') {
    console.warn('GEMINI_API_KEY key is missing. Using rule-based pedagogical model.');
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '10mb' }));

  // API endpoint for generating pedagogical insights
  app.post('/api/gemini/insights', async (req: express.Request, res: express.Response) => {
    try {
      const { entityName, entityType, performance, networkAvg } = req.body;

      if (!entityName) {
        res.status(400).json({ error: 'Faltando o nome do elemento para gerar insights.' });
        return;
      }

      const client = getGeminiClient();

      if (client) {
        // Build an educational analysis prompt for Gemini
        const prompt = `Você é um especialista sênior em análise de dados educacionais (nível de Diretoria Pedagógica).
Analise o desempenho da seguinte entidade educacional no 2º Ano do Ensino Fundamental na Avaliação Oral de Matemática 2026 de Pindamonhangaba (SP):

Nome da Entidade: ${entityName} (${entityType})
Metas de Participação: Alvo é >= 80% (Adequado). Abaixo disso é Alerta.

Indicadores da Entidade:
- Participação: ${performance.participacao}% (Previstos: ${performance.previstos}, Avaliados: ${performance.avaliados})
- Desempenho dos Alunos:
  - Atingiu parcialmente o mínimo: ${performance.parcial}%
  - Atingiu o mínimo: ${performance.minimo}%
  - Excedeu o mínimo: ${performance.excedeu}%
  - Indicador Principal (Mínimo + Excedeu): ${performance.sucesso}%

Indicadores de Comparação (Média da Rede):
- Participação Rede: ${networkAvg.participacao}%
- Parcial Rede: ${networkAvg.parcial}%
- Mínimo Rede: ${networkAvg.minimo}%
- Excedeu Rede: ${networkAvg.excedeu}%
- Indicador Principal Rede (Mínimo + Excedeu): ${networkAvg.sucesso}%

Descritores Críticos (D001_J a D007_J) - Notas da Entidade:
${Object.entries(performance.descritores)
  .map(([k, v]) => `- ${k}: ${v}% (Média Rede: ${networkAvg.descritores[k]}%)`)
  .join('\n')}

Itens Críticos (Abaixo de 70%):
${Object.entries(performance.itens)
  .filter(([_, v]) => (v as number) < 70)
  .slice(0, 5)
  .map(([k, v]) => `- ${k}: ${v}% (Média Rede: ${networkAvg.itens[k]}%)`)
  .join('\n')}

Por favor, escreva um relatório de análise de 3 parágrafos curtos, objetivos e práticos em português:
1. **Visão Geral e Equidade**: Analise a participação (${performance.participacao}%) e o nível de sucesso em relação à média da rede (${performance.sucesso}% vs ${networkAvg.sucesso}%). Comente se a escola necessita de apoio urgente.
2. **Fragilidades e Pontos de Atenção**: Destaque de 2 a 3 descritores ou itens de habilidade onde o rendimento está muito abaixo da rede ou abaixo dos 70% críticos. Explique a habilidade envolvida didaticamente (ex: D004_J é subtração, D006_J é medidas).
3. **Recomendações Práticas**: Forneça duas sugestões pedagógicas específicas e acionáveis para os professores trabalharem em sala de aula (como jogos, materiais manipulativos, ou resolução de problemas orais).

Mantenha o tom extremamente profissional, focado na melhoria do aprendizado e acolhedor para a comunidade escolar de Pindamonhangaba.`;

        const response = await client.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
        });

        res.json({ text: response.text });
        return;
      } else {
        // Rule-based fallback insights generator
        const diff = performance.sucesso - networkAvg.sucesso;
        const diffSign = diff >= 0 ? '+' : '';
        const criticalDescs = Object.entries(performance.descritores)
          .filter(([_, v]) => (v as number) < 70)
          .map(([k]) => k);

        const criticalItems = Object.entries(performance.itens)
          .filter(([_, v]) => (v as number) < 70)
          .slice(0, 3)
          .map(([k]) => k);

        let report = `### Análise Pedagógica Consolidada para ${entityName}\n\n`;

        // Paragraph 1
        report += `**Visão Geral e Desempenho:** A unidade apresenta uma taxa de participação de **${performance.participacao}%**, o que indica uma representatividade ${performance.participacao >= 80 ? 'adequada e fidedigna' : 'abaixo do recomendado'} da população de estudantes. O indicador principal de sucesso (% Mínimo + % Excedeu) atingiu **${performance.sucesso}%**, variando **${diffSign}${diff} p.p.** em relação à média da rede de Pindamonhangaba. ${
          performance.sucesso < 60
            ? 'Esta unidade está classificada como **Alta Prioridade** e necessita de atenção focalizada urgente da supervisão de ensino.'
            : performance.sucesso < 75
            ? 'A unidade está classificada como **Média Prioridade**, apresentando pontos de progresso mas também lacunas importantes de aprendizagem.'
            : 'Esta unidade demonstra desempenho consolidado de **Baixa Prioridade**, servindo como referência de boas práticas.'
        }\n\n`;

        // Paragraph 2
        report += `**Pontos de Atenção Pedagógica:** Identificamos fragilidades que demandam intervenção direta. `;
        if (criticalDescs.length > 0) {
          report += `Os descritores de habilidade mais críticos são **${criticalDescs.join(', ')}** (rendimento abaixo dos 70% recomendados). `;
          if (criticalDescs.includes('D004_J')) {
            report += `O descritor **D004_J** (Subtração) aponta que os alunos ainda enfrentam desafios no raciocínio de retirar ou comparar quantidades. `;
          }
          if (criticalDescs.includes('D006_J')) {
            report += `O descritor **D006_J** (Grandezas e Medidas) indica necessidade de reforçar a leitura de horas, cédulas do Real e medidas lineares básicas. `;
          }
        } else {
          report += `O rendimento geral por descritor está adequado, mas itens específicos como **${
            criticalItems.length > 0 ? criticalItems.join(', ') : 'nenhum item de urgência'
          }** requerem revisão de conteúdo por se manterem abaixo da proficiência plena. `;
        }
        report += `Em especial, os itens com desempenho abaixo da média municipal representam lacunas conceituais pontuais que devem ser resolvidas antes do término do ano letivo.\n\n`;

        // Paragraph 3
        report += `**Recomendações Práticas para Sala de Aula:**\n` +
          `1. **Uso de Materiais Concretos**: Sugere-se a aplicação regular do Material Dourado e do Ábaco para consolidação do sistema decimal e contagem, auxiliando na transição do cálculo oral para o registro escrito.\n` +
          `2. **Atividades e Jogos de Resolução de Problemas Orais**: Promover pequenos torneios e rodas de problemas rápidos em sala de aula, incentivando os alunos a explicar oralmente o seu raciocínio de adição ou subtração, o que fortalece a compreensão sem a dependência imediata de fórmulas rígidas.`;

        res.json({ text: report });
        return;
      }
    } catch (err: any) {
      console.error('Error generating insights:', err);
      res.status(500).json({ error: err.message || 'Erro interno do servidor ao gerar diagnóstico.' });
    }
  });

  // Serve static assets in production, use Vite in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
