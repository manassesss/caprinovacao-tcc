# Backend do Módulo de Acasalamento - Documentação Técnica

## Arquivos Criados/Modificados

### Novos Modelos (`app/models/mating.py`)

#### 1. MatingSimulationParameters
Armazena parâmetros de cada simulação de acasalamento.

**Campos principais:**
- `property_id`, `herd_id`: Identificação do rebanho
- `heritability`: Herdabilidade (h²)
- `selection_method`: Método de seleção (individual_massal ou selection_index)
- `min_age_male_months`, `min_age_female_months`: Idades mínimas
- `weight_adjustment_days`: Dias para ajuste de peso (60, 120 ou 180)
- `max_female_percentage_per_male`: Máximo % de fêmeas por macho

#### 2. MatingRecommendation
Armazena recomendações de acasalamento geradas.

**Campos principais:**
- `simulation_id`: Referência à simulação que gerou a recomendação
- `sire_id`, `dam_id`: Par de acasalamento (reprodutor × matriz)
- `predicted_offspring_index`: Índice predito da progênie
- `predicted_inbreeding`: Endogamia predita (%)
- `predicted_genetic_gain`: Ganho genético esperado
- `predicted_dep`: DEP esperada
- `status`: pending, adopted ou ignored

#### 3. AnimalGeneticEvaluation
Armazena avaliação genética calculada para cada animal.

**Campos principais:**
- `animal_id`: Referência ao animal
- `dep`: Diferença Esperada na Progênie
- `inbreeding_coefficient`: Coeficiente de endogamia (%)
- `selection_index`: Índice de seleção calculado
- `adjusted_weight_60d`, `adjusted_weight_120d`, `adjusted_weight_180d`: Pesos ajustados
- `scrotal_perimeter`: Perímetro escrotal (machos)
- `number_of_offspring`: Número de crias
- `last_evaluation_date`: Data da última avaliação

### Novo Router (`app/routers/mating.py`)

#### Endpoints Principais

**1. GET /mating/eligible-animals/{herd_id}**
- Lista animais elegíveis para acasalamento
- Filtra por idade mínima e gênero
- Retorna machos e fêmeas separadamente

**2. POST /mating/calculate-genetic-evaluation/{herd_id}**
- Calcula avaliação genética para todos os animais do rebanho
- Calcula: DEP, endogamia, índice de seleção
- Atualiza ou cria registros de `AnimalGeneticEvaluation`

**3. POST /mating/simulate**
- Executa simulação de acasalamentos
- Aplica otimização multiobjetivo simplificada
- Gera recomendações de acasalamento
- Respeita restrições de % fêmeas por macho

**4. GET /mating/recommendations/{simulation_id}**
- Lista recomendações de uma simulação
- Ordenadas por ganho genético (descendente)

**5. POST /mating/recommendations/{recommendation_id}/adopt**
- Marca uma recomendação como adotada
- Atualiza status para "adopted"

**6. POST /mating/recommendations/batch-create-coverages/{simulation_id}**
- Cria coberturas em lote no Manejo Reprodutivo
- Processa todas as recomendações adotadas
- Busca pesos e perímetro escrotal mais recentes
- Retorna contagem de sucessos e erros

**7. GET /mating/reports/birth-predictions/{herd_id}**
- Relatório de previsão de partos
- Lista coberturas em andamento
- Calcula data prevista (cobertura + 152 dias)

**8. GET /mating/reports/coverage-by-reproducer/{herd_id}**
- Relatório de coberturas por reprodutor
- Consolida estatísticas por macho
- Calcula taxa de natalidade

### Funções Auxiliares

#### `calculate_animal_age_months(birth_date: date) -> int`
Calcula idade do animal em meses completos.

#### `calculate_inbreeding_coefficient(animal: Animal, session: Session) -> float`
Calcula coeficiente de endogamia baseado em ancestrais comuns.

**Implementação atual:** Simplificada - verifica avós em comum
**Produção:** Deve usar matriz de parentesco (algoritmo de Meuwissen & Luo)

#### `calculate_predicted_inbreeding(sire: Animal, dam: Animal, session: Session) -> float`
Calcula endogamia prevista da progênie dado um par de acasalamento.

#### `calculate_dep(animal: Animal, session: Session, weight_adjustment_days: int) -> float`
Calcula DEP baseado em peso ajustado:
1. Busca pesagem mais próxima do período de ajuste
2. Calcula média do rebanho
3. DEP = (peso_ajustado - média) / média

#### `calculate_selection_index(animal: Animal, session: Session, heritability: float, weight_adjustment_days: int) -> float`
Calcula índice de seleção:
```
Índice = (DEP × h²) - (Endogamia × 0.01)
```

#### `run_mating_simulation(males, females, session, heritability, weight_adjustment_days, max_female_percentage_per_male) -> List[dict]`
Executa simulação de acasalamentos:

1. **Gera todas as combinações possíveis** (Pai × Mãe)
2. **Calcula métricas para cada par:**
   - DEP predita = média dos pais
   - Índice predito = média dos pais
   - Endogamia predita
3. **Calcula score objetivo:**
   ```
   Score = Índice - (Endogamia × 0.5)
   ```
4. **Ordena por score** (maior = melhor)
5. **Seleciona melhores combinações** respeitando:
   - Cada fêmea atribuída a apenas um macho
   - Macho não excede limite de % de fêmeas
6. **Retorna lista de recomendações**

## Integração com Sistema Existente

### Dependências de Modelos
- `Animal`: Genealogia, características
- `AnimalMeasurement`: Pesagens, perímetro escrotal
- `ReproductiveManagement`: Histórico de coberturas/partos
- `Property`, `Herd`: Contexto organizacional

### Fluxo de Dados

```
1. Usuário seleciona rebanho
   ↓
2. Sistema calcula avaliações genéticas
   ↓
3. Usuário seleciona animais
   ↓
4. Sistema executa simulação
   ↓
5. Gera recomendações
   ↓
6. Usuário adota recomendações
   ↓
7. Sistema gera coberturas em lote
   ↓
8. Registros criados em ReproductiveManagement
```

## Considerações de Performance

### Queries Otimizadas
- Uso de índices em `animal_id`, `herd_id`, `simulation_id`
- Select específico por rebanho evita full table scan
- Paginação em listagens

### Cálculos em Lote
- `calculate_genetic_evaluation` processa todos os animais do rebanho de uma vez
- `batch_create_coverages` cria múltiplos registros em uma transação

### Melhorias Futuras
1. **Cache de avaliações genéticas**: Evitar recálculo frequente
2. **Background jobs**: Simulações longas em fila assíncrona
3. **Índices compostos**: Para queries frequentes
4. **Materialização de resultados**: Para relatórios complexos

## Validações Implementadas

1. **Permissões de acesso**: Produtor vê apenas suas propriedades
2. **Validação de gênero**: Reprodutor deve ser macho, matriz deve ser fêmea
3. **Restrições de idade**: Animais devem ter idade mínima
4. **Duplicação de coberturas**: Verifica se cobertura já existe antes de criar
5. **Existência de animais**: Valida IDs de animais antes de criar recomendações

## Testes Recomendados

### Unitários
- Funções de cálculo (endogamia, DEP, índice)
- Algoritmo de simulação
- Validações de negócio

### Integração
- Fluxo completo de simulação
- Criação de coberturas em lote
- Relatórios

### Performance
- Simulação com 100+ animais
- Cálculo de endogamia em rebanhos grandes
- Queries de relatórios com muitos registros

## Configuração de Banco de Dados

As tabelas serão criadas automaticamente pelo SQLModel ao iniciar a aplicação.

**Migrations recomendadas** para produção usando Alembic.

## Monitoramento

### Métricas Importantes
- Tempo médio de simulação
- Número de recomendações geradas por simulação
- Taxa de adoção de recomendações
- Tempo de cálculo de avaliação genética

### Logs
- Erros em batch operations
- Simulações executadas
- Coberturas criadas automaticamente


