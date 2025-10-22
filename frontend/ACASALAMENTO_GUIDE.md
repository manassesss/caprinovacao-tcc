# Guia do Módulo de Acasalamento e Seleção Genética

## Visão Geral

O módulo de Acasalamento implementa funcionalidades completas de seleção genética e simulação de acasalamentos baseado nos princípios do CAPRIOVI 2017, incluindo:

- Seleção de animais por métodos individual/massal ou índice de seleção
- Simulação de acasalamentos com otimização multiobjetivo
- Cálculo de endogamia e DEP (Diferença Esperada na Progênie)
- Geração de recomendações de acasalamento
- Relatórios de previsão de partos e coberturas por reprodutor
- Criação automática de coberturas em lote

## Fluxo de Trabalho

### 1. Pré-requisitos

Antes de usar o módulo de acasalamento, certifique-se de ter:

1. **Rebanhos cadastrados** com animais
2. **Genealogia completa** (pai/mãe) para cálculo de endogamia
3. **Manejo reprodutivo lançado** (coberturas, partos, desmames)
4. **Pesagens registradas** para cálculo de DEP e índices

### 2. Etapas da Simulação

#### Etapa 1: Seleção de Rebanho e Parâmetros

1. Selecione o rebanho para análise
2. Configure os parâmetros:
   - **Herdabilidade (h²)**: Valor entre 0 e 1 (padrão: 0.3)
   - **Idade mínima fêmea**: Em meses (padrão: 8)
   - **Idade mínima macho**: Em meses (padrão: 6)
   - **Ajuste de peso**: 60, 120 ou 180 dias
   - **Método de seleção**: Individual/Massal ou Índice de Seleção
   - **Máx. % fêmeas por macho**: Limite de 1-100% (padrão: 50%)

3. Clique em "Próximo" para:
   - Calcular avaliação genética do rebanho
   - Carregar animais elegíveis

#### Etapa 2: Seleção de Animais

1. Visualize machos e fêmeas disponíveis com suas métricas:
   - DEP (Diferença Esperada na Progênie)
   - Coeficiente de endogamia (%)
   - Índice de seleção
   - Idade em meses

2. Transfira animais entre "Disponíveis" e "Selecionados"
   - Use os botões de seta para mover individualmente
   - Use "Todos →" ou "← Todos" para mover em lote

3. Clique em "Executar Simulação" para:
   - Aplicar algoritmo de otimização multiobjetivo
   - Gerar recomendações de acasalamento
   - Respeitar restrições (máx. % fêmeas por macho)

#### Etapa 3: Relatório de Acasalamentos

Visualize as recomendações geradas com:

- **Reprodutor** e **Matriz**
- **Índice da Progênie** (predito)
- **Endogamia da Progênie** (%)
- **Ganho Genético** (score de otimização)
- **DEP prevista**

**Ações disponíveis:**

1. **Adotar**: Marca uma recomendação como adotada
2. **Gerar Coberturas em Lote**: Cria registros de cobertura no Manejo Reprodutivo para todas as recomendações adotadas

## Relatórios Disponíveis

### Previsão de Partos

Acesse: Menu → Acasalamento → Relatórios → Aba "Previsão de Partos"

Mostra todas as coberturas em andamento com:
- Data de cobertura
- Data prevista de parto (cobertura + 152 dias)
- Dias até o parto (com indicadores coloridos)

### Coberturas por Reprodutor

Acesse: Menu → Acasalamento → Relatórios → Aba "Coberturas por Reprodutor"

Consolida por reprodutor:
- Total de coberturas
- Partos confirmados
- Coberturas em andamento
- Taxa de natalidade (%)

## Cálculos Implementados

### 1. Coeficiente de Endogamia

Calculado baseado em ancestrais comuns entre pai e mãe. Implementação simplificada que verifica avós em comum.

**Nota**: Em produção, deve-se implementar o algoritmo completo de Meuwissen & Luo (1992) com matriz de parentesco.

### 2. DEP (Diferença Esperada na Progênie)

Calculado baseado em:
- Peso ajustado no período configurado (60, 120 ou 180 dias)
- Desvio da média do rebanho
- Normalização por desvio padrão

### 3. Índice de Seleção

Fórmula simplificada:
```
Índice = (DEP × h²) - (Endogamia × 0.01)
```

### 4. Otimização Multiobjetivo

A simulação de acasalamentos usa uma abordagem simplificada de NSGA-II:

**Função objetivo:**
```
Score = Índice da Progênie - (Endogamia × 0.5)
```

**Restrições:**
- Cada fêmea é atribuída a apenas um macho
- Cada macho pode cobrir no máximo X% das fêmeas totais
- Seleção das melhores combinações por score

## API Endpoints

### Animais Elegíveis
```
GET /mating/eligible-animals/{herd_id}
```
Parâmetros: `min_age_male_months`, `min_age_female_months`

### Calcular Avaliação Genética
```
POST /mating/calculate-genetic-evaluation/{herd_id}
```
Parâmetros: `heritability`, `weight_adjustment_days`

### Executar Simulação
```
POST /mating/simulate
```
Body: `SimulationParametersCreate`
Query: `selected_male_ids`, `selected_female_ids`

### Listar Recomendações
```
GET /mating/recommendations/{simulation_id}
```

### Adotar Recomendação
```
POST /mating/recommendations/{recommendation_id}/adopt
```

### Gerar Coberturas em Lote
```
POST /mating/recommendations/batch-create-coverages/{simulation_id}
```
Parâmetros: `coverage_date`, `default_dam_weight`, `default_dam_body_condition`

### Relatório de Previsão de Partos
```
GET /mating/reports/birth-predictions/{herd_id}
```

### Relatório de Coberturas por Reprodutor
```
GET /mating/reports/coverage-by-reproducer/{herd_id}
```

## Modelos de Dados

### MatingSimulationParameters
Armazena os parâmetros de cada simulação realizada.

### MatingRecommendation
Armazena cada recomendação de acasalamento gerada pela simulação.

**Status possíveis:**
- `pending`: Recomendação ainda não analisada
- `adopted`: Recomendação aceita pelo usuário
- `ignored`: Recomendação rejeitada

### AnimalGeneticEvaluation
Armazena a avaliação genética calculada para cada animal:
- DEP
- Coeficiente de endogamia
- Índice de seleção
- Pesos ajustados
- Número de crias

## Melhorias Futuras

1. **Algoritmo NSGA-II completo**: Implementar versão completa com Pareto front
2. **Matriz de parentesco**: Cálculo preciso de endogamia usando matriz A
3. **Múltiplas características**: Seleção baseada em múltiplos objetivos (peso, altura, perímetro escrotal, etc.)
4. **Simulação de progênie**: Predição de características dos filhotes
5. **Exportação de relatórios**: Excel, PDF
6. **Histórico de simulações**: Comparação entre diferentes cenários
7. **Integração com BLUP**: Best Linear Unbiased Prediction para valores genéticos

## Referências

- CAPRIOVI 2017 - Sistema de Gestão e Avaliação Genética para Caprinos
- Meuwissen & Luo (1992) - Computing inbreeding coefficients
- Deb et al. (2002) - NSGA-II: Non-dominated Sorting Genetic Algorithm


