# Guia de Implementação - Sistema de Animais

## 📋 Visão Geral

Sistema completo de gestão de animais com identificação, desenvolvimento ponderal, verminose, medidas corporais e carcaça. Baseado na dissertação CAPRINOVAÇÃO 2017.

---

## 🔧 Backend (FastAPI)

### Modelo Principal - Animal (`app/models/animal.py`)

#### Identificação Básica
```python
id: int  # ID automático
property_id: str  # Fazenda
herd_id: Optional[str]  # Rebanho (opcional)
race_id: str  # Raça
earring_identification: str  # Identificação única (brinco)
name: Optional[str]  # Nome (opcional)
birth_date: date  # Data de nascimento
gender: str  # M ou F
```

#### Finalidade e Categoria
```python
objective: str  # producao, reproducao
entry_reason: str  # compra, nascimento, emprestimo, outros
category: str  # cabrito, borrego, marrão, matriz, reprodutor
```

#### Parto
```python
childbirth_type: str  # simples, duplo, triplo, quadruplo
weaning_date: Optional[date]  # Data de desmame
```

#### Genealogia
```python
father_id: Optional[int]  # ID do pai
mother_id: Optional[int]  # ID da mãe
father_race_id: Optional[str]  # Raça do pai (para mestiços)
mother_race_id: Optional[str]  # Raça da mãe (para mestiços)
genetic_composition: str  # PO, PC, mestiço
```

#### Características Morfológicas
```python
testicular_degree: Optional[str]  # Grau de partição (só machos)
ear_position: Optional[str]  # Posição da orelha
has_beard: bool  # Tem barba
has_earring: bool  # Tem brinco
has_horn: bool  # Tem corno
has_supranumerary_teats: bool  # Tetas supranumerárias
```

#### Status
```python
status: str  # ativo, vendido, morto, emprestado
status_description: Optional[str]  # Observações
```

### Modelos de Medições (`app/models/animal_measurements.py`)

#### 1. WeightRecord - Desenvolvimento Ponderal
```python
animal_id: int
measurement_period: str  # ao_nascer, desmame, outros
measurement_date: date
weight: float  # Peso em kg
body_condition_score: Optional[int]  # ECC (1-5)
conformation: Optional[int]  # C (1-5)
precocity: Optional[int]  # P (1-5)
musculature: Optional[int]  # M (1-5)
cpm_average: Optional[float]  # Média CPM (calculada automaticamente)
```

#### 2. ParasiteRecord - Verminose
```python
animal_id: int
record_date: date
opg: Optional[int]  # Ovos Por Grama de fezes
famacha: Optional[int]  # Classificação 1-5
```

#### 3. BodyMeasurement - Tamanho Corporal
```python
animal_id: int
measurement_date: date
# Medidas em cm:
ag, ac, ap, cc, pc, perpe, cpern, co, ct, lr, 
ccab, lil, lis, ccau, cga, pcau
```

#### 4. CarcassMeasurement - Carcaça (in vivo)
```python
animal_id: int
measurement_date: date
aol, col, pol, mol, egs, egbf, ege
```

### Rotas da API

#### CRUD de Animais
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/animals/` | Lista animais (com filtros) |
| POST | `/animals/` | Cria novo animal |
| GET | `/animals/{id}` | Busca animal |
| PUT | `/animals/{id}` | Atualiza animal |
| DELETE | `/animals/{id}` | Exclui animal |

#### Desenvolvimento Ponderal
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/animals/{id}/weights` | Lista registros de peso |
| POST | `/animals/{id}/weights` | Cria registro de peso |

#### Verminose
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/animals/{id}/parasites` | Lista registros de verminose |
| POST | `/animals/{id}/parasites` | Cria registro de verminose |

#### Medidas Corporais
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/animals/{id}/body-measurements` | Lista medidas |
| POST | `/animals/{id}/body-measurements` | Cria medidas |

#### Medidas de Carcaça
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/animals/{id}/carcass-measurements` | Lista medidas |
| POST | `/animals/{id}/carcass-measurements` | Cria medidas |

### Validações Backend

1. **Identificação Única:** `earring_identification` deve ser único
2. **Sexo:** Apenas 'M' ou 'F'
3. **Mestiço:** Se `genetic_composition = "mestiço"`, deve informar `father_race_id` e `mother_race_id`
4. **Grau Testicular:** Só permitido para machos (gender = 'M')
5. **Permissões:** Produtor vê apenas animais de suas fazendas
6. **CPM:** Média calculada automaticamente quando C, P e M são informados

---

## 💻 Frontend (Next.js + Ant Design)

### Componentes

#### AnimalsList.js
- Tabela com paginação
- Filtros por fazenda e rebanho
- Busca por identificação ou nome
- Tags coloridas por sexo
- Modal de detalhes
- Confirmação antes de excluir

#### AnimalsForm.js
**Seções com Dividers:**
1. **Identificação Básica**
   - Fazenda, Rebanho, Identificação, Nome, Data de Nascimento

2. **Características**
   - Sexo, Categoria, Finalidade, Motivo de Entrada

3. **Parto e Desmame**
   - Tipo de Parto, Data de Desmame

4. **Genealogia**
   - Raça, Composição Genética, Pai, Mãe
   - Raça do Pai e Mãe (se mestiço)

5. **Características Morfológicas**
   - Grau Testicular (só machos)
   - Posição da Orelha
   - Checkboxes: Barba, Brinco, Corno, Tetas Supranumerárias

6. **Status**
   - Status (ativo/vendido/morto/emprestado)
   - Observações

### Validações Frontend

- **Campos Obrigatórios:**
  - Fazenda
  - Identificação
  - Data de Nascimento
  - Sexo
  - Categoria
  - Finalidade
  - Motivo de Entrada
  - Tipo de Parto
  - Raça
  - Composição Genética

- **Validações Condicionais:**
  - Se `genetic_composition = "mestiço"`: Exige raça do pai e mãe
  - Se `gender = "F"`: Campo grau testicular é escondido

- **DatePicker:**
  - Formato: DD/MM/YYYY
  - Biblioteca: dayjs

### API Service (`services/api.js`)

**Funções de Animais:**
```javascript
getAnimals(propertyId?, herdId?)  // Lista animais
getAnimal(id)                      // Busca animal
createAnimal(data)                 // Cria animal
updateAnimal(id, data)             // Atualiza animal
deleteAnimal(id)                   // Exclui animal
```

**Funções de Medições:**
```javascript
// Peso/CPM
getAnimalWeights(animalId)
createAnimalWeight(animalId, data)

// Verminose
getAnimalParasites(animalId)
createAnimalParasite(animalId, data)

// Medidas Corporais
getAnimalBodyMeasurements(animalId)
createAnimalBodyMeasurement(animalId, data)

// Carcaça
getAnimalCarcassMeasurements(animalId)
createAnimalCarcassMeasurement(animalId, data)
```

---

## 🎨 Características Especiais

### Tags Coloridas
- **Macho:** Azul (`blue`)
- **Fêmea:** Rosa (`pink`)
- **Rebanho:** Roxo (`purple`)

### Seleção de Pai e Mãe
- **Filtro Automático:**
  - Campo "Pai": Mostra apenas animais machos
  - Campo "Mãe": Mostra apenas animais fêmeas
- **Busca:** Permite buscar por identificação ou nome

### Validação Inteligente
- **Mestiço:** Campos de raça do pai/mãe aparecem automaticamente
- **Grau Testicular:** Oculto para fêmeas

---

## 📝 Exemplo de Cadastro

### Animal PO (Puro de Origem)
```
Fazenda: Fazenda Boa Vista
Rebanho: Rebanho Principal
Identificação: BRI001
Nome: Mimosa
Data Nascimento: 15/03/2024
Sexo: Fêmea
Categoria: Matriz
Finalidade: Reprodução
Motivo Entrada: Nascimento
Tipo Parto: Simples
Data Desmame: 15/07/2024
Raça: Anglo-Nubiana
Composição Genética: PO
Pai: (selecionar da lista)
Mãe: (selecionar da lista)
```

### Animal Mestiço
```
Fazenda: Fazenda Esperança
Identificação: MES001
Sexo: Macho
Composição Genética: Mestiço
Raça Principal: Anglo-Nubiana
Raça do Pai: Boer         ← OBRIGATÓRIO
Raça da Mãe: Saanen       ← OBRIGATÓRIO
```

---

## 🧪 Fluxo de Testes

### 1. Cadastro Básico
1. Acesse http://localhost:3000/animals
2. Clique em "Adicionar"
3. Preencha os campos obrigatórios
4. Teste a validação de mestiço
5. Teste a validação de grau testicular
6. Salve

### 2. Filtros
1. Na listagem, teste busca por identificação
2. Filtre por fazenda
3. Filtre por rebanho

### 3. Medições (Futuro)
1. Após cadastrar animal, acesse via API:
2. `POST /animals/{id}/weights` - Adicionar peso
3. `POST /animals/{id}/parasites` - Adicionar OPG/FAMACHA
4. `POST /animals/{id}/body-measurements` - Medidas corporais
5. `POST /animals/{id}/carcass-measurements` - Medidas de carcaça

---

## 🚀 Próximas Etapas

### Interface de Medições
- [ ] Criar páginas/modais para adicionar:
  - Registros de peso com CPM
  - Registros de verminose
  - Medidas corporais
  - Medidas de carcaça

### Relatórios
- [ ] Curva de crescimento do animal
- [ ] Histórico de OPG/FAMACHA
- [ ] Evolução de medidas corporais
- [ ] Gráfico de CPM ao longo do tempo

### Genealogia
- [ ] Árvore genealógica visual
- [ ] Listagem de filhos do animal
- [ ] Histórico reprodutivo

---

## 📊 Estrutura do Banco

```sql
-- Animal (principal)
CREATE TABLE animals (...)

-- Medições
CREATE TABLE weight_records (...)       -- Peso e CPM
CREATE TABLE parasite_records (...)     -- OPG e FAMACHA
CREATE TABLE body_measurements (...)    -- Medidas corporais
CREATE TABLE carcass_measurements (...) -- Medidas de carcaça
```

---

## ✅ Status da Implementação

- [x] Modelo Animal completo
- [x] Modelos de medições (peso, verminose, corpo, carcaça)
- [x] Router CRUD de animals
- [x] Endpoints de medições
- [x] Validações backend
- [x] Controle de permissões
- [x] Frontend - Listagem
- [x] Frontend - Formulário de identificação
- [x] Validações condicionais (mestiço, testicular)
- [x] dayjs instalado
- [x] Integração completa
- [ ] Interface para adicionar medições (próximo passo)
- [ ] Relatórios e gráficos

---

## 🎯 Diferenciais

1. **Validação Inteligente:** Campos condicionais aparecem/desaparecem conforme seleção
2. **Genealogia:** Seleção de pai e mãe filtrada por sexo
3. **Mestiçagem:** Controle de raças do pai e mãe para mestiços
4. **Morfologia:** Checkboxes para características observadas
5. **Extensibilidade:** Estrutura preparada para medições futuras

---

**Data de Criação:** 15/10/2025  
**Status:** ✅ Identificação Implementada | ⏳ Medições (Backend pronto, Frontend pendente)


