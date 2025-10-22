# 🚀 Guia de Instalação - Módulo de Acasalamento

## Visão Geral

Este guia mostra como instalar e configurar o módulo de Acasalamento e Seleção Genética.

## ✅ Pré-requisitos

- Python 3.9+
- Node.js 16+
- npm ou yarn
- Git

## 📦 Instalação

### 1. Backend (API)

```bash
# Navegue até o diretório da API
cd api-pravaler

# Instale as dependências (se ainda não fez)
pip install -r requirements.txt

# Crie as tabelas do módulo de acasalamento
python create_mating_tables.py
```

**Saída esperada:**
```
Criando tabelas do módulo de acasalamento...
✅ Tabelas criadas com sucesso!

Tabelas do módulo de acasalamento:
- mating_simulation_parameters
- mating_recommendations
- animal_genetic_evaluation
```

### 2. Frontend

```bash
# Navegue até o diretório do frontend
cd tcc-frontend

# Instale as dependências (se ainda não fez)
npm install

# Não há instalação adicional necessária para o módulo de acasalamento
# Os arquivos já foram criados
```

## 🎯 Inicialização

### Iniciar o Backend

**Opção 1 - Script de inicialização:**
```bash
cd api-pravaler
python start.py
```

**Opção 2 - Uvicorn diretamente:**
```bash
cd api-pravaler
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Verifique se está rodando:**
- Acesse: http://localhost:8000
- Documentação: http://localhost:8000/docs

### Iniciar o Frontend

```bash
cd tcc-frontend
npm run dev
```

**Verifique se está rodando:**
- Acesse: http://localhost:3000
- Faça login
- Menu: Controle Animal → Acasalamento

## ✅ Verificação da Instalação

### 1. Verificar Backend

Acesse a documentação da API: http://localhost:8000/docs

Procure pelos endpoints do módulo de acasalamento:
- ✅ `/mating/eligible-animals/{herd_id}`
- ✅ `/mating/calculate-genetic-evaluation/{herd_id}`
- ✅ `/mating/simulate`
- ✅ `/mating/recommendations/{simulation_id}`
- ✅ `/mating/reports/birth-predictions/{herd_id}`
- ✅ `/mating/reports/coverage-by-reproducer/{herd_id}`

### 2. Verificar Frontend

Acesse: http://localhost:3000

1. Faça login
2. Abra o menu lateral
3. Procure por: **Controle Animal → Acasalamento**
4. Clique para acessar o módulo

**Você deve ver:**
- Breadcrumb: "Acasalamento e Seleção Genética"
- Stepper com 3 etapas: Rebanho, Seleção, Relatório
- Tabela de rebanhos cadastrados

### 3. Teste Automatizado

Execute o script de teste:

```bash
cd api-pravaler
python test_mating_module.py
```

**O script irá:**
1. Fazer login
2. Listar rebanhos
3. Buscar animais elegíveis
4. Calcular avaliação genética
5. Executar simulação
6. Listar recomendações
7. Adotar recomendação
8. Gerar relatórios

## 🗄️ Estrutura do Banco de Dados

### Novas Tabelas Criadas

**1. mating_simulation_parameters**
```sql
- id (PK)
- property_id (FK)
- herd_id (FK)
- heritability
- selection_method
- min_age_male_months
- min_age_female_months
- weight_adjustment_days
- max_female_percentage_per_male
- observations
- created_at
- updated_at
```

**2. mating_recommendations**
```sql
- id (PK)
- simulation_id (FK)
- property_id (FK)
- herd_id (FK)
- sire_id (FK)
- dam_id (FK)
- predicted_offspring_index
- predicted_inbreeding
- predicted_genetic_gain
- predicted_dep
- status
- adopted_date
- observations
- created_at
- updated_at
```

**3. animal_genetic_evaluation**
```sql
- id (PK)
- animal_id (FK, UNIQUE)
- herd_id (FK)
- dep
- inbreeding_coefficient
- selection_index
- adjusted_weight_60d
- adjusted_weight_120d
- adjusted_weight_180d
- scrotal_perimeter
- number_of_offspring
- last_evaluation_date
- observations
- created_at
- updated_at
```

## 🔍 Verificação de Arquivos

### Backend
Verifique se os seguintes arquivos existem:

```
api-pravaler/
├── app/
│   ├── models/
│   │   ├── mating.py ✅ (NOVO)
│   │   └── __init__.py ✅ (MODIFICADO)
│   ├── routers/
│   │   └── mating.py ✅ (NOVO)
│   └── main.py ✅ (MODIFICADO)
├── create_mating_tables.py ✅ (NOVO)
├── test_mating_module.py ✅ (NOVO)
└── ACASALAMENTO_BACKEND.md ✅ (NOVO)
```

### Frontend
Verifique se os seguintes arquivos existem:

```
tcc-frontend/
├── src/
│   ├── app/
│   │   └── mating/
│   │       ├── page.js ✅
│   │       ├── components/
│   │       │   └── MatingStepper.js ✅ (MODIFICADO)
│   │       └── reports/
│   │           └── page.js ✅ (NOVO)
│   └── components/
│       └── AppSideMenu.js ✅ (MODIFICADO - Menu habilitado)
└── ACASALAMENTO_GUIDE.md ✅ (NOVO)
```

## 🐛 Solução de Problemas na Instalação

### Erro: "Tabelas não foram criadas"

**Solução 1 - Executar script de criação:**
```bash
cd api-pravaler
python create_mating_tables.py
```

**Solução 2 - Recriar banco de dados:**
```bash
cd api-pravaler
rm pravaler.db  # ⚠️ CUIDADO: Apaga todos os dados!
python start.py  # Recria o banco com todas as tabelas
```

### Erro: "Module 'mating' not found"

**Causa:** Arquivos não foram criados corretamente

**Solução:**
Verifique se os arquivos `app/models/mating.py` e `app/routers/mating.py` existem e estão corretos.

### Erro: "Menu de Acasalamento não aparece"

**Causa:** Frontend não foi reiniciado após modificações

**Solução:**
```bash
cd tcc-frontend
# Ctrl+C para parar o servidor
npm run dev  # Reiniciar
```

Limpe o cache do navegador (Ctrl+Shift+R)

### Erro: "401 Unauthorized" na API

**Causa:** Token de autenticação expirou

**Solução:**
Faça login novamente na interface ou no script de teste.

## 📊 Dados de Teste

### Criar Dados Mínimos para Teste

Para testar o módulo, você precisa de:

1. **Pelo menos 1 rebanho** cadastrado
2. **Pelo menos 2 machos** com idade ≥ 6 meses
3. **Pelo menos 2 fêmeas** com idade ≥ 8 meses
4. **Genealogia** (pai/mãe) registrada
5. **Pesagens** registradas

**Script SQL de exemplo (SQLite):**

```sql
-- Verificar dados existentes
SELECT 
    h.name as rebanho,
    COUNT(CASE WHEN a.gender = 'M' THEN 1 END) as machos,
    COUNT(CASE WHEN a.gender = 'F' THEN 1 END) as femeas
FROM herd h
LEFT JOIN animals a ON a.herd_id = h.id
WHERE a.status = 'ativo'
GROUP BY h.id;
```

## 🎓 Próximos Passos

Após a instalação bem-sucedida:

1. **Leia o guia do usuário**: `ACASALAMENTO_GUIDE.md`
2. **Configure seus rebanhos**: Cadastre rebanhos e animais
3. **Registre genealogia**: Adicione pai e mãe de cada animal
4. **Lance pesagens**: Registre pesos dos animais
5. **Execute sua primeira simulação**: Menu → Acasalamento

## 📞 Suporte

Se encontrar problemas durante a instalação:

1. Verifique os logs da API e do frontend
2. Consulte a documentação técnica: `ACASALAMENTO_BACKEND.md`
3. Execute o script de teste: `test_mating_module.py`
4. Verifique se todos os arquivos foram criados

## ✅ Checklist de Instalação

- [ ] Backend instalado e rodando (http://localhost:8000)
- [ ] Frontend instalado e rodando (http://localhost:3000)
- [ ] Tabelas criadas no banco de dados
- [ ] Menu "Acasalamento" visível na interface
- [ ] Endpoints disponíveis em /docs
- [ ] Teste automatizado executado com sucesso
- [ ] Dados de teste criados (opcional)

---

**Parabéns! 🎉 O módulo de Acasalamento está instalado e pronto para uso!**


