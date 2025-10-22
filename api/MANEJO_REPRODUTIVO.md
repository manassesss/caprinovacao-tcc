# 🐐 Sistema de Manejo Reprodutivo

## ✅ Implementação Completa

Sistema para gerenciar coberturas, parições e filhos gerados na criação animal.

---

## 📊 Estrutura de Dados

### Tabela: `reproductive_management`

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | int | ID do registro | Auto |
| `property_id` | str | ID da fazenda | ✅ |
| `herd_id` | str | ID do rebanho | ❌ |
| `dam_id` | int | ID da matriz (fêmea) | ✅ |
| `coverage_date` | date | Data da cobertura | ✅ |
| `dam_weight` | float | Peso da matriz (kg) | ✅ |
| `dam_body_condition_score` | int | ECC da matriz (1-5) | ✅ |
| `sire_id` | int | ID do reprodutor (macho) | ✅ |
| `sire_scrotal_perimeter` | float | Perímetro escrotal (cm) | ❌ |
| `parturition_status` | str | Status: sim/não/em_andamento | ✅ |
| `birth_date` | date | Data do parto | ❌ |
| `childbirth_type` | str | Tipo de parto | ❌ |
| `weaning_date` | date | Data do desmame | ❌ |
| `observations` | str | Observações | ❌ |

### Tabela: `reproductive_offspring`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | int | ID do registro |
| `reproductive_management_id` | int | ID do manejo reprodutivo |
| `offspring_id` | int | ID do filhote |

---

## 🔗 Endpoints

### CRUD Principal

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/reproductive-management/` | Lista todos os manejos |
| `POST` | `/reproductive-management/` | Cria novo manejo |
| `GET` | `/reproductive-management/{id}` | Busca por ID |
| `PUT` | `/reproductive-management/{id}` | Atualiza manejo |
| `DELETE` | `/reproductive-management/{id}` | Exclui manejo |

### Filhos (Offspring)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/reproductive-management/{id}/offspring` | Lista filhos |
| `POST` | `/reproductive-management/{id}/offspring` | Adiciona filho |
| `DELETE` | `/reproductive-management/{id}/offspring/{offspring_id}` | Remove filho |

---

## ✅ Validações de Negócio

### Backend

1. **Matriz deve ser fêmea**
   ```python
   if dam.gender != "F":
       raise HTTPException(400, "Matriz deve ser um animal fêmea")
   ```

2. **Reprodutor deve ser macho**
   ```python
   if sire.gender != "M":
       raise HTTPException(400, "Reprodutor deve ser um animal macho")
   ```

3. **Regra de parição**
   ```python
   if parturition_status in ("não", "em_andamento"):
       if birth_date or childbirth_type or weaning_date:
           raise HTTPException(400, "Não pode informar dados de parto")
   ```

### Frontend

1. **Filtro de rebanho por fazenda**
   - Campo desabilitado até selecionar fazenda
   - Mostra apenas rebanhos da fazenda selecionada

2. **Filtro de gênero**
   - Matriz: Apenas animais fêmeas (F)
   - Reprodutor: Apenas animais machos (M)

3. **Bloqueio condicional de campos**
   - Se `parturition_status` = "não" ou "em_andamento":
     - `birth_date` → **DESABILITADO**
     - `childbirth_type` → **DESABILITADO**
     - `weaning_date` → **DESABILITADO**
     - `filhos` (Transfer) → **OCULTO**

---

## 🎯 Fluxo de Uso

### 1. Cadastrar Cobertura

1. Acesse: http://localhost:3000/reproductive-management
2. Clique em "Adicionar"
3. Preencha:
   - Fazenda
   - Matriz (fêmea)
   - Data da cobertura
   - Peso e ECC da matriz
   - Reprodutor (macho)
   - Perímetro escrotal (opcional)
4. Selecione **Parição**:
   - **Não** = Ainda não pariu
   - **Em Andamento** = Em gestação
   - **Sim** = Já pariu

### 2. Se Parição = Sim

Campos adicionais ficam habilitados:
- Data do parto
- Tipo de parto (simples, duplo, triplo, quádruplo)
- Data do desmame
- **Filhos** (Transfer component):
  - Selecione os animais que nasceram desta cobertura
  - Podem ser 1, 2, 3 ou mais filhotes

### 3. Salvar

- Backend valida tudo
- Cria registro principal
- Vincula filhos (se houver)
- Retorna sucesso

---

## 📝 Exemplo de Cadastro

### Caso 1: Cobertura Recente (Sem Parição)

```json
{
  "property_id": "farm_123",
  "herd_id": "herd_1",
  "dam_id": 5,  // Matriz (fêmea)
  "coverage_date": "2024-10-01",
  "dam_weight": 65.5,
  "dam_body_condition_score": 4,
  "sire_id": 2,  // Reprodutor (macho)
  "sire_scrotal_perimeter": 32.5,
  "parturition_status": "em_andamento",
  "observations": "Primeira cobertura da matriz"
}
```

### Caso 2: Com Parição e Filhos

```json
{
  "property_id": "farm_123",
  "herd_id": "herd_1",
  "dam_id": 5,
  "coverage_date": "2024-04-01",
  "dam_weight": 68.0,
  "dam_body_condition_score": 4,
  "sire_id": 2,
  "sire_scrotal_perimeter": 33.0,
  "parturition_status": "sim",
  "birth_date": "2024-09-15",
  "childbirth_type": "duplo",
  "weaning_date": "2024-12-15",
  "observations": "Parto gemelar, ambos saudáveis"
}
```

**Depois vincular filhos via:**
```
POST /reproductive-management/{id}/offspring
{ "offspring_id": 15 }
{ "offspring_id": 16 }
```

---

## 🎨 Interface

### Lista

- **Filtros:**
  - Fazenda
  - Rebanho
  - Matriz
  - Reprodutor
  - Status de Parição

- **Tabela:**
  - Rebanho
  - Matriz (nome/identificação)
  - Reprodutor (nome/identificação)
  - Data da Cobertura
  - Parição (Tag colorida: Verde/Vermelho/Laranja)
  - Ações (Editar/Excluir)

### Formulário

- **Seção 1:** Identificação (Fazenda, Rebanho, Matriz)
- **Seção 2:** Cobertura (Data, Peso, ECC)
- **Seção 3:** Reprodutor (Animal, Perímetro escrotal)
- **Seção 4:** Parição (Status → habilita/desabilita campos)
- **Seção 5:** Dados de Parto (se Parição = Sim)
- **Seção 6:** Filhos (Transfer - se Parição = Sim)
- **Seção 7:** Observações

---

## 💡 Regras de Negócio

### Bloqueio de Campos

```javascript
const isParturitionBlocked = 
    parturitionStatus === 'não' || 
    parturitionStatus === 'em_andamento';

<DatePicker disabled={isParturitionBlocked} />  // Data do parto
<Select disabled={isParturitionBlocked} />       // Tipo de parto
<DatePicker disabled={isParturitionBlocked} />  // Data desmame

{parturitionStatus === 'sim' && (
    <Transfer />  // Filhos - só aparece se parição = sim
)}
```

### Limpeza Automática

Quando muda `parturition_status` para "não" ou "em_andamento":
```javascript
form.setFieldsValue({
    birth_date: undefined,
    childbirth_type: undefined,
    weaning_date: undefined,
});
setSelectedOffspring([]);  // Limpa filhos selecionados
```

---

## 🗄️ Banco de Dados

### Relacionamentos

```
ReproductiveManagement
    ├─ property_id → properties.id
    ├─ herd_id → herd.id
    ├─ dam_id → animals.id (gender = F)
    └─ sire_id → animals.id (gender = M)

ReproductiveOffspring
    ├─ reproductive_management_id → reproductive_management.id
    └─ offspring_id → animals.id
```

---

## 🧪 Como Testar

### 1. Acessar
```
http://localhost:3000/reproductive-management
```

### 2. Criar Manejo sem Parição
- Clique em "Adicionar"
- Preencha dados básicos
- Parição: **Não** ou **Em Andamento**
- **Observe:** Campos de parto desabilitados
- Salve

### 3. Criar Manejo com Parição
- Clique em "Adicionar"
- Preencha dados básicos
- Parição: **Sim**
- **Observe:** Campos de parto habilitados
- Preencha data do parto, tipo
- Selecione filhos no Transfer
- Salve

### 4. Editar
- Clique em editar
- Mude Parição de "Não" para "Sim"
- **Observe:** Campos ficam habilitados
- Mude de "Sim" para "Não"
- **Observe:** Campos ficam desabilitados e são limpos

---

## ✨ Recursos Implementados

- ✅ CRUD completo
- ✅ Filtros múltiplos
- ✅ Validação de gênero (matriz/reprodutor)
- ✅ Bloqueio condicional de campos
- ✅ Sistema de filhos (Transfer component)
- ✅ Integração frontend ↔ backend
- ✅ Mensagens de sucesso/erro
- ✅ Permissões por usuário
- ✅ Filtro de rebanho por fazenda

---

## 🎉 Status

**✅ IMPLEMENTADO E FUNCIONAL**

Acesse agora: http://localhost:3000/reproductive-management

---

**Implementado em:** 17/10/2024

