# 📦 Dados de Teste - Cadastro em Massa

## 📋 Arquivos Disponíveis

| Arquivo | Registros | Descrição |
|---------|-----------|-----------|
| `fazendas.json` | 5 | Fazendas em PE com dados completos |
| `racas.json` | 10 | Raças de caprinos e ovinos |
| `rebanhos.json` | 5 | Rebanhos para diferentes finalidades |
| `doencas.json` | 10 | Doenças comuns em caprinos/ovinos |
| `medicamentos.json` | 10 | Medicamentos veterinários |

---

## 🚀 Como Usar

### Opção 1: Script Automático (Recomendado)

**Cadastra TUDO de uma vez na ordem correta:**

```bash
cd api-pravaler
python cadastrar_tudo.py
```

**O que faz:**
1. Pede login/senha
2. Cadastra 5 fazendas
3. Cadastra 10 raças
4. Cadastra 5 rebanhos (vinculados às fazendas)
5. Cadastra 10 doenças
6. Cadastra 10 medicamentos
7. Mostra IDs criados

**Resultado:**
```
✅ Fazendas:      5
✅ Raças:         10
✅ Rebanhos:      5
✅ Doenças:       10
✅ Medicamentos:  10

📊 TOTAL:         40 registros
```

---

### Opção 2: Cadastro Individual

#### 1️⃣ Fazendas

```bash
python cadastrar_individual.py fazendas
```

**Ou via curl:**
```bash
curl -X POST http://localhost:8000/properties/ \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d @dados_teste/fazendas.json
```

#### 2️⃣ Raças

```bash
python cadastrar_individual.py racas
```

#### 3️⃣ Rebanhos

⚠️ **IMPORTANTE:** Ajuste os `property_id` no arquivo antes!

```bash
# Edite rebanhos.json e substitua "PROPERTY_ID_AQUI" pelo ID da fazenda
python cadastrar_individual.py rebanhos
```

#### 4️⃣ Doenças

```bash
python cadastrar_individual.py doencas
```

#### 5️⃣ Medicamentos

```bash
python cadastrar_individual.py medicamentos
```

---

## 📝 Detalhes dos Dados

### Fazendas (5)

- **Fazenda São João** - Caruaru/PE, 150.5 ha
- **Sítio Boa Vista** - Gravatá/PE, 85 ha
- **Chácara Santa Rita** - Bezerros/PE, 45.8 ha
- **Fazenda Vale Verde** - Arcoverde/PE, 320 ha
- **Sítio Primavera** - São Bento do Una/PE, 62.3 ha

### Raças (10)

**Caprinas:**
- Anglo Nubiana (mista)
- Boer (carne)
- Saanen (leite)
- Alpina (leite)
- Parda Alpina (leite)
- SRD (sem raça definida)
- Mestiço Leiteiro

**Ovinas:**
- Santa Inês (carne)
- Dorper (carne)
- Morada Nova (carne)

### Rebanhos (5)

- **Rebanho Principal** - Produção de leite
- **Matrizes Elite** - Reprodução
- **Reprodutores** - Reprodução
- **Cabritos Desmamados** - Produção de carne
- **Engorda** - Produção de carne

### Doenças (10)

1. Verminose Gastrointestinal
2. Mastite
3. Clostridioses
4. Ceratoconjuntivite
5. Ectima Contagioso
6. Pneumonia
7. Linfadenite Caseosa
8. Coccidiose
9. Pododermatite
10. Toxoplasmose

### Medicamentos (10)

**Antiparasitários:**
- Ivermectina 1%
- Moxidectina 1%
- Levamisol 10%

**Antibióticos:**
- Oxitetraciclina LA
- Penicilina Benzatina
- Sulfadiazina + Trimetoprima

**Outros:**
- Flunixina Meglumina (anti-inflamatório)
- Vacina Polivalente
- Complexo B Injetável
- Cálcio Injetável

---

## ⚙️ Requisitos

```bash
pip install requests
```

---

## 🔧 Ajustes Necessários

### Para Rebanhos:

Abra `rebanhos.json` e substitua:
```json
"property_id": "PROPERTY_ID_AQUI"
```

Pelo ID de uma fazenda cadastrada. 

**Dica:** Use o script `pegar_ids.py` para ver os IDs:
```bash
python pegar_ids.py
```

---

## 🐛 Solução de Problemas

### Erro: "Not authorized"
- Verifique se fez login corretamente
- Certifique-se de ter permissão (produtor ou admin)

### Erro: "Already exists"
- Alguns registros podem ter nomes únicos
- Edite o JSON para usar nomes diferentes

### Erro: "Foreign key constraint"
- Para rebanhos, certifique-se de que `property_id` existe
- Cadastre fazendas primeiro!

### Erro ao abrir JSON
- Verifique o encoding do arquivo (deve ser UTF-8)
- Verifique se o JSON está válido

---

## 💡 Dicas

### 1. Ordem de Cadastro

**SEMPRE** cadastre nesta ordem:
1. ✅ Fazendas (não depende de nada)
2. ✅ Raças (não depende de nada)
3. ✅ Rebanhos (depende de fazendas)
4. ✅ Doenças (não depende de nada)
5. ✅ Medicamentos (não depende de nada)
6. ✅ Animais (depende de fazendas e raças)

### 2. Teste Primeiro

Cadastre 1 registro de cada tipo manualmente via interface:
```
http://localhost:3000
```

Depois use os scripts para popular o banco.

### 3. Backup

Se já tem dados no banco, faça backup:
```bash
cp pravaler.db pravaler.db.backup
```

### 4. Limpar e Recomeçar

Para começar do zero:
```bash
# Pare o backend
# Delete o banco
rm pravaler.db
# Reinicie o backend (vai recriar o banco vazio)
# Execute os scripts de cadastro
```

---

## 📊 Estrutura dos JSONs

### Fazenda
```json
{
  "name": "Nome da Fazenda",
  "location": "Descrição da localização",
  "size_hectares": 150.5,
  "cnpj": "12.345.678/0001-90",
  "phone": "(81) 99999-1111",
  "email": "contato@fazenda.com",
  "address": "Endereço completo",
  "city": "Cidade",
  "state": "UF",
  "zip_code": "00000-000"
}
```

### Raça
```json
{
  "name": "Nome da Raça",
  "species_id": "caprina",
  "origin": "País/Região",
  "characteristics": "Descrição das características",
  "average_weight_male": 90.0,
  "average_weight_female": 65.0
}
```

### Rebanho
```json
{
  "name": "Nome do Rebanho",
  "description": "Descrição do rebanho",
  "purpose": "Finalidade",
  "property_id": "farm_xxx"
}
```

### Doença
```json
{
  "name": "Nome da Doença",
  "scientific_name": "Nome Científico",
  "description": "Descrição da doença",
  "symptoms": "Sintomas",
  "treatment": "Tratamento",
  "prevention": "Prevenção"
}
```

### Medicamento
```json
{
  "name": "Nome do Medicamento",
  "type": "Tipo",
  "description": "Descrição",
  "dosage": "Dosagem e via",
  "withdrawal_period_days": 35,
  "manufacturer": "Fabricante",
  "active_ingredient": "Princípio ativo",
  "presentation": "Apresentação",
  "storage_conditions": "Condições de armazenamento"
}
```

---

## 🎯 Resultado Esperado

Após executar `cadastrar_tudo.py`:

```
✅ Login bem-sucedido!

1️⃣  CADASTRANDO FAZENDAS
[1/5] Fazenda São João... ✅ ID: farm_xxx
[2/5] Sítio Boa Vista... ✅ ID: farm_yyy
...

2️⃣  CADASTRANDO RAÇAS
[1/10] Anglo Nubiana... ✅ ID: race_xxx
[2/10] Boer... ✅ ID: race_yyy
...

3️⃣  CADASTRANDO REBANHOS
[1/5] Rebanho Principal → Fazenda São João... ✅
...

4️⃣  CADASTRANDO DOENÇAS
[1/10] Verminose Gastrointestinal... ✅
...

5️⃣  CADASTRANDO MEDICAMENTOS
[1/10] Ivermectina 1% (antiparasitario)... ✅
...

RESUMO DO CADASTRO:
  ✅ Fazendas:      5
  ✅ Raças:         10
  ✅ Rebanhos:      5
  ✅ Doenças:       10
  ✅ Medicamentos:  10

  📊 TOTAL:         40 registros

🎉 CADASTRO COMPLETO!
```

---

**Criado em:** 17/10/2024  
**Versão:** 1.0

