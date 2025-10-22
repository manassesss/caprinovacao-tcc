# 🐐 Formulário de Animais - RESTAURADO

## ✅ O que foi feito

O formulário original de cadastro de animais foi **restaurado** mantendo todos os campos conforme especificado inicialmente. O backend foi **ajustado** para receber e processar esses dados corretamente.

---

## 📋 Estrutura do Formulário

### 1. **Identificação Básica**
- Fazenda (property_id)
- Nome/Número (name → earring_identification)
- Rebanho (flock_id → herd_id) [opcional]
- Data de nascimento (cd_childbirth → birth_date)
- Sexo (genre → gender)
- Finalidade (cd_purpouse → objective)
- Motivo de Entrada (cd_entry_reason → entry_reason)
- Tipo de Parto (cd_type_childbirth → childbirth_type)
- Data de desmame (dt_weaning → weaning_date) [opcional]

### 2. **Genealogia**
- Raça (race_id)
- Mãe (cd_mom → mother_id) [opcional]
- Pai (cd_dad → father_id) [opcional]
- Composição genética (cd_genetic_composition → genetic_composition)
- Categoria (cd_category → category)

### 3. **Morfologia**
- Grau de partição testicular (cd_degree_of_testicular_partition → testicular_degree) [opcional]
- Posição da Orelha (cd_ear_position → ear_position) [opcional]

### 4. **Desenvolvimento Ponderal** (Collapse)
- Data de mensuração (dt_measurement)
- Período (cd_period): ao_nascer, desmame, outros
- Peso (weigth → weight)
- ECC - Escore de condição corporal (nr_ecc → ecc)
- C - Conformação (nr_c → conformation)
- P - Precocidade (nr_p → precocity)
- M - Muscolosidade (nr_m → musculature)

### 5. **Verminose** (Collapse)
- Data de mensuração (dt_measurement_verminose)
- OPG - Ovos por grama de fezes (nr_opg → opg)
- FAMACHA (farmhouse → famacha)

### 6. **Tamanho Corporal** (Collapse)
- Data de mensuração (dt_measurement_body)
- AC - Altura de cernelha (height_ac → ac)
- AG - Altura da garupa (height_ag → ag)
- AP - Altura da perna (height_ap → ap)
- CC - Comprimento corporal (length_cc → cc)
- PC - Perímetro da canela (perimeter_pc → pc)
- Perpe - Perímetro da perna (perimeter_perpe → perpe)
- Cpern - Comprimento da perna (length_cpern → cpern)
- CT - Circunferência torácica (circumference_ct → ct)
- CO - Comprimento da orelha (length_co → co)
- CCAB - Comprimento da cabeça (length_ccab → ccab)
- LR - Longitude de rosto (longitude_lr → lr)
- LIL - Largura entre Íleos (width_lil → lil)
- LIS - Largura entre Ísquios (width_lis → lis)
- Cga - Comprimento da garupa (length_cga → cga)
- Ccau - Comprimento da cauda (length_ccau → ccau)
- Pcau - Perímetro da cauda (perimeter_pcau → pcau)

### 7. **Carcaça (in vivo)** (Collapse)
- Data de mensuração (dt_measurement_carcass)
- AOL - Área de Olho de Lombo (nr_aol → aol)
- COL - Comprimento de Olho de Lombo (nr_col → col)
- POL - Profundidade de Olho de Lombo (nr_pol → pol)
- MOL - Marmoreiro de Olho de Lombo (nr_mol → mol)
- EGS - Espessura de Gordura Subcutânea (nr_egs → egs)
- EGBF - Espessura de Gordura do Bíceps (nr_egbf → egbf)
- EGE - Espessura de Gordura Esternal (nr_ege → ege)

---

## 🔄 Fluxo de Salvamento

### Ao criar/editar um animal:

1. **Salva dados básicos** → Tabela `animals`
2. **Salva desenvolvimento ponderal** (se preenchido) → Tabela `weight_records`
3. **Salva verminose** (se preenchido) → Tabela `parasite_records`
4. **Salva medidas corporais** (se preenchido) → Tabela `body_measurements`
5. **Salva carcaça** (se preenchido) → Tabela `carcass_measurements`

### Ao carregar para edição:

- Carrega dados básicos do animal
- Carrega **última medição** de cada tipo (peso, verminose, medidas, carcaça)

---

## 📊 Mapeamento de Campos

| Campo do Formulário | Campo do Backend | Tipo |
|---------------------|------------------|------|
| `name` | `earring_identification` | string |
| `flock_id` | `herd_id` | string (opcional) |
| `cd_childbirth` | `birth_date` | date |
| `genre` | `gender` | string (M/F) |
| `cd_purpouse` | `objective` | string |
| `cd_entry_reason` | `entry_reason` | string |
| `cd_type_childbirth` | `childbirth_type` | string |
| `dt_weaning` | `weaning_date` | date (opcional) |
| `cd_dad` | `father_id` | int (opcional) |
| `cd_mom` | `mother_id` | int (opcional) |
| `cd_genetic_composition` | `genetic_composition` | string |
| `cd_category` | `category` | string |
| `cd_degree_of_testicular_partition` | `testicular_degree` | string (opcional) |
| `cd_ear_position` | `ear_position` | string (opcional) |

---

## 🗄️ Estrutura do Banco de Dados

### Tabela Principal: `animals`
Campos de identificação, genealogia e morfologia básica.

### Tabelas de Medições (relacionadas com `animal_id`):

1. **`weight_records`** - Desenvolvimento Ponderal
   - measurement_period, weight, ecc, conformation, precocity, musculature, cpm_average

2. **`parasite_records`** - Verminose
   - opg, famacha

3. **`body_measurements`** - Tamanho Corporal
   - ag, ac, ap, cc, pc, perpe, cpern, co, ct, lr, ccab, lil, lis, ccau, cga, pcau

4. **`carcass_measurements`** - Carcaça
   - aol, col, pol, mol, egs, egbf, ege

---

## ✨ Funcionalidades Implementadas

- ✅ Formulário com layout original (Collapse para medições)
- ✅ Salvamento automático de todas as medições
- ✅ Carregamento das últimas medições ao editar
- ✅ Validação de campos obrigatórios
- ✅ Seleção inteligente de pai/mãe (filtrados por sexo)
- ✅ Integração completa com backend
- ✅ Suporte a múltiplas medições ao longo do tempo

---

## 🌐 Como Usar

### 1. Acessar o formulário:
```
http://localhost:3000/animals
```

### 2. Cadastrar novo animal:
- Clique em "Adicionar"
- Preencha os dados básicos (obrigatórios)
- Opcionalmente, preencha as medições nos Collapses
- Clique em "Salvar"

### 3. Editar animal existente:
- Na lista, clique no ícone de editar
- Os dados básicos e últimas medições serão carregados
- Modifique o que for necessário
- Clique em "Salvar"

---

## 📝 Observações Importantes

1. **Campos Obrigatórios:**
   - Fazenda, Nome/Número, Data de nascimento, Sexo, Finalidade, Motivo de Entrada, Tipo de Parto, Raça, Composição genética, Categoria

2. **Campos Opcionais:**
   - Rebanho, Data de desmame, Mãe, Pai, Grau testicular, Posição da orelha, Todas as medições

3. **Medições:**
   - São salvas em tabelas separadas
   - Permitem histórico ao longo do tempo
   - Ao editar, carrega a última medição de cada tipo

4. **Validações:**
   - Campos obrigatórios validados no frontend
   - Backend valida composição genética "mestiço"
   - Backend valida grau testicular apenas para machos

---

## 🎯 Status

✅ **COMPLETO E FUNCIONAL**

- Formulário restaurado conforme original
- Backend integrado corretamente
- Todas as medições funcionando
- Sistema de edição/carregamento implementado
- Pronto para uso em produção

---

**Última atualização:** 16/10/2024

