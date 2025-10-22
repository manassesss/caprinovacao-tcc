# 🐐 Módulo de Acasalamento e Seleção Genética

Sistema completo de seleção genética e simulação de acasalamentos para caprinos, baseado nos princípios do CAPRIOVI 2017.

## 🎯 Objetivo

Auxiliar produtores rurais na tomada de decisão sobre acasalamentos, otimizando:
- **Ganho genético** da progênie
- **Minimização de endogamia**
- **Maximização de características desejáveis**

## 📋 Funcionalidades

### ✅ Seleção de Animais
- Filtragem por idade mínima (machos e fêmeas)
- Cálculo automático de métricas genéticas:
  - DEP (Diferença Esperada na Progênie)
  - Coeficiente de endogamia
  - Índice de seleção

### ✅ Simulação de Acasalamentos
- Otimização multiobjetivo (NSGA-II simplificado)
- Restrições configuráveis (% máx. de fêmeas por macho)
- Predições por par:
  - Índice da progênie
  - Endogamia da progênie
  - Ganho genético esperado

### ✅ Gestão de Recomendações
- Adoção individual de recomendações
- Geração automática de coberturas em lote
- Integração com Manejo Reprodutivo

### ✅ Relatórios
- Previsão de partos (cobertura + 152 dias)
- Coberturas por reprodutor
- Estatísticas de desempenho

## 🚀 Início Rápido

### Pré-requisitos

1. **Rebanhos cadastrados** com animais
2. **Genealogia registrada** (pai/mãe para cada animal)
3. **Pesagens lançadas** (para cálculo de DEP)
4. **Manejo reprodutivo** (histórico de coberturas/partos)

### Uso Básico

1. **Acesse o módulo**: Menu → Controle Animal → Acasalamento

2. **Etapa 1 - Configure a simulação**:
   - Selecione o rebanho
   - Ajuste os parâmetros:
     - Herdabilidade (h²): 0.3 (padrão)
     - Idades mínimas: 6 meses (machos), 8 meses (fêmeas)
     - Ajuste de peso: 60 dias

3. **Etapa 2 - Selecione os animais**:
   - Visualize machos e fêmeas elegíveis
   - Selecione os animais que participarão da simulação
   - Clique em "Executar Simulação"

4. **Etapa 3 - Analise as recomendações**:
   - Veja as melhores combinações
   - Adote as recomendações desejadas
   - Gere coberturas em lote para registro

## 📊 Interpretando os Resultados

### DEP (Diferença Esperada na Progênie)
- **Positivo**: Animal melhor que a média do rebanho
- **Negativo**: Animal abaixo da média
- **Zero**: Animal na média

### Coeficiente de Endogamia
- **0%**: Sem ancestrais comuns conhecidos
- **>0%**: Há ancestrais comuns (quanto maior, maior o risco)
- **Ideal**: < 5%

### Índice de Seleção
Score combinado que considera:
- Desempenho (DEP × h²)
- Penalização por endogamia
- **Maior = Melhor**

### Ganho Genético
Score de otimização da simulação:
- Considera índice da progênie
- Penaliza endogamia
- **Maior = Melhor combinação**

## 🔧 Configuração Avançada

### Parâmetros de Simulação

| Parâmetro | Descrição | Valores | Padrão |
|-----------|-----------|---------|--------|
| Herdabilidade (h²) | Proporção da variação genética | 0.0 - 1.0 | 0.3 |
| Idade Mín. Macho | Idade mínima para reprodução | 1+ meses | 6 |
| Idade Mín. Fêmea | Idade mínima para reprodução | 1+ meses | 8 |
| Ajuste de Peso | Período para peso ajustado | 60, 120, 180 dias | 60 |
| Método | Tipo de seleção | Individual/Índice | Individual |
| Máx. % Fêmeas | Limite de fêmeas por macho | 1-100% | 50% |

### Quando usar cada método de seleção

**Individual/Massal**:
- Seleção baseada em uma única característica
- Mais simples
- Ideal para iniciantes

**Índice de Seleção**:
- Combina múltiplas características
- Mais sofisticado
- Requer mais dados

## 📈 Boas Práticas

### 1. Antes da Simulação
- ✅ Mantenha genealogia atualizada
- ✅ Registre pesagens regularmente
- ✅ Lance coberturas e partos
- ✅ Verifique dados dos animais

### 2. Durante a Simulação
- ✅ Selecione animais com dados completos
- ✅ Evite machos ou fêmeas únicos (diversidade)
- ✅ Considere o histórico reprodutivo

### 3. Após a Simulação
- ✅ Analise as 10 melhores recomendações
- ✅ Considere fatores não-genéticos (saúde, temperamento)
- ✅ Adote gradualmente (não todas de uma vez)
- ✅ Monitore os resultados

## 🔬 Base Científica

### Algoritmos Implementados

1. **Cálculo de Endogamia**
   - Baseado em ancestrais comuns
   - Wright's coefficient of inbreeding
   - Ref: Meuwissen & Luo (1992)

2. **DEP (EPD)**
   - Expected Progeny Difference
   - Baseado em peso ajustado
   - Ref: Bourdon (2000)

3. **Otimização Multiobjetivo**
   - Simplificação do NSGA-II
   - Maximiza ganho genético
   - Minimiza endogamia
   - Ref: Deb et al. (2002)

### Período de Gestação
- **Caprinos**: 152 dias (± 5 dias)
- Usado para previsão de partos

## 🐛 Solução de Problemas

### "Nenhum animal elegível"
**Causa**: Animais não atendem critérios de idade
**Solução**: Reduza as idades mínimas ou verifique datas de nascimento

### "Simulação não gera recomendações"
**Causa**: Poucos animais selecionados
**Solução**: Selecione mais animais (mínimo 2 machos e 2 fêmeas)

### "DEP sempre zero"
**Causa**: Faltam pesagens
**Solução**: Registre pesagens para os animais

### "Endogamia sempre zero"
**Causa**: Genealogia incompleta
**Solução**: Registre pai e mãe de cada animal

## 📚 Documentação Adicional

- **Guia do Usuário**: `tcc-frontend/ACASALAMENTO_GUIDE.md`
- **Documentação Técnica**: `api-pravaler/ACASALAMENTO_BACKEND.md`
- **Resumo da Implementação**: `ACASALAMENTO_SUMMARY.md`

## 🧪 Teste o Módulo

### Teste Manual (Interface)
1. Acesse http://localhost:3000
2. Faça login
3. Menu → Controle Animal → Acasalamento

### Teste Automático (API)
```bash
cd api-pravaler
python test_mating_module.py
```

## 🔄 Migração de Banco de Dados

```bash
cd api-pravaler
python create_mating_tables.py
```

Ou simplesmente inicie a API (as tabelas serão criadas automaticamente):
```bash
python start.py
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação
2. Verifique os logs da API
3. Acesse `/docs` para testar endpoints manualmente
4. Verifique os dados de base (rebanhos, animais, genealogia)

## ⚠️ Limitações Conhecidas

### Implementação Simplificada
- Cálculo de endogamia simplificado (3 gerações)
- NSGA-II simplificado (sem Pareto front completo)
- Uma característica por vez no índice

### Para Produção
Considere implementar:
- Matriz de parentesco completa
- NSGA-II completo
- BLUP para valores genéticos
- Múltiplas características simultâneas
- Validações estatísticas avançadas

## 📊 Estatísticas do Módulo

- **3 Modelos de Dados** criados
- **8 Endpoints** de API implementados
- **2 Páginas** de interface
- **4 Funções** principais de cálculo
- **2 Relatórios** disponíveis

## 🎓 Referências

1. **CAPRIOVI 2017** - Sistema de Gestão para Caprinos
2. **Wright, S. (1922)** - Coefficients of Inbreeding
3. **Meuwissen & Luo (1992)** - Computing Inbreeding
4. **Deb et al. (2002)** - NSGA-II Algorithm
5. **Bourdon (2000)** - Understanding Animal Breeding

---

**Desenvolvido com base nos princípios científicos do CAPRIOVI 2017** 🐐📊🧬


