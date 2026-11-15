# Gestão PPR AGF — Portas e Rodapés

Sistema independente de Gestão de Programa de Participação nos Resultados (PPR) adaptado integralmente à operação da **AGF – Portas e Rodapés**, combinando os cinco blocos indicadores da empresa com a arquitetura de **Eficiência Reancorada (80,00% Ref.)**, **22 Faixas Progressivas** e **Moduladores Compostos (±40%)**.

## Principais Evoluções sobre o Regulamento Original AGF

1. **Reancoragem da Meta (100% Atual -> Novo 80,00%)**: O antigo patamar de 100% de produção passa a corresponder à faixa de **80,00% de Eficiência**, destravando 13 faixas superiores (81% a 93%+) para crescimento produtivo contínuo.
2. **Moduladores Compostos (±40%)**: Qualidade & Retrabalho (±10%), Índice de Horas Extras (±10%), Faltas Injustificadas (±10%), Atrasos (±5%) e Gestão/Quadro/5S (±5%) multiplicam a Base Eficiência em vez de somarem isoladamente.
3. **22 Faixas Contínuas Sem Sobreposição**: Substitui as 5 faixas largas do regulamento anterior (que continham sobreposição textual entre `95–96,9%` e `96–97,9%`) por degraus lineares de 1% em 1% (`72,00%` a `93,00%+`).
4. **Horas Extras Universais + Bônus Top 3**: Substitui o ranking excludente (onde do 4º setor em diante o prêmio zerava) por régua técnica por índice de HE, engajando 100% dos setores.
5. **Qualidade & Retrabalho Numérica por Volume**: Régua objetiva em `%` de retrabalho sobre volume produzido, eliminando subjetividade entre setores de volumes distintos.
6. **Tabela Dedicada de 22 Faixas para Líder Geral**: Escala de `R$ 150,00` (72%) a `R$ 3.200,00` (93%+), com `R$ 1.200,00` exatamente em `80,00%`.
7. **Expansão Operacional, Views DW & Auditoria**: Suporte à classe operacional semestral (`R$ 50,00` a `R$ 1.100,00`, `R$ 450,00` em `80,00%`), proporcionalidade de horas trabalhadas, simulação de Views DW, fechamento histórico e exportação JSON.

## Escala Financeira Base (Ref. 80,00%)

| Perfil | Piso (72%) | Referência (80,00% = Antigo 100%) | Teto Base (93%+) | Com Modulador +40% |
| --- | ---: | ---: | ---: | ---: |
| Líder de Setor AGF | R$ 100,00 | R$ 900,00 | R$ 2.600,00 | R$ 3.640,00 |
| Líder Geral AGF | R$ 150,00 | R$ 1.200,00 | R$ 3.200,00 | R$ 4.480,00 |
| Operacional AGF (Expansão) | R$ 50,00 | R$ 450,00 | R$ 1.100,00 | R$ 1.540,00 |

## Proposta Executiva (Padrão Akiom)

O documento PDF completo com o comparativo executivo, regras e simulações financeiras está disponível em `public/Proposta_Alteracao_PPR_AGF_Akiom.pdf` e acessível diretamente pela interface da aplicação no botão **Proposta PDF**.

## Stack e Execução Local

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (Padrão Akiom: Neo-Tactile Porcelain & Obsidian Liquid Glass)
- `@xyflow/react` v12 (Canvas interativo de Setores, Indicadores DW, Classes e Colaboradores)
- `lucide-react` & `next-themes`

```bash
npm install
npm run dev
```

Para build de produção:

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run start
```
