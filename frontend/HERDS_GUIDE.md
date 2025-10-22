# Guia de Implementação - Sistema de Rebanhos (Herds)

## 📋 Visão Geral

Sistema completo de gestão de rebanhos integrado com fazendas, permitindo cadastro, edição, listagem e exclusão de rebanhos com controle de permissões.

---

## 🔧 Backend (FastAPI)

### Modelo de Dados (`app/models/farm.py`)

```python
class Herd(TimestampedModel, table=True):
    """Modelo de Rebanho"""
    __tablename__ = "herd"
    id: str  # Primary Key
    property_id: str  # Foreign Key para properties
    name: str  # Nome do rebanho (mínimo 3 caracteres)
    description: Optional[str]  # Descrição opcional
    
    # Campos específicos de rebanho
    species: str  # Espécie: caprino, ovino ou ambos
    feeding_management: str  # Manejo: extensivo, semi-intensivo ou intensivo
    production_type: str  # Produção: carne, leite ou misto
```

### Rotas da API (`app/routers/herds.py`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/herds/` | Lista rebanhos do usuário | ✅ Required |
| POST | `/herds/` | Cria novo rebanho | ✅ Required |
| GET | `/herds/{herd_id}` | Busca rebanho específico | ✅ Required |
| PUT | `/herds/{herd_id}` | Atualiza rebanho | ✅ Required |
| DELETE | `/herds/{herd_id}` | Exclui rebanho | ✅ Required |

### Validações

**Espécie (species):**
- `caprino`
- `ovino`
- `ambos`

**Manejo Alimentar (feeding_management):**
- `extensivo`
- `semi-intensivo`
- `intensivo`

**Tipo de Produção (production_type):**
- `carne`
- `leite`
- `misto`

### Permissões

- **Produtor:** Vê apenas rebanhos de suas próprias fazendas
- **Administrador:** Vê todos os rebanhos
- **Outros:** Sem acesso

---

## 💻 Frontend (Next.js + Ant Design)

### Estrutura de Arquivos

```
tcc-frontend/src/app/herds/
├── page.js                          # Página principal
├── components/
│   └── HerdsList.js                 # Lista de rebanhos
└── edit/
    └── [[...id]]/
        ├── page.js                  # Página de edição
        └── components/
            └── HerdsForm.js         # Formulário
```

### Funcionalidades

#### Lista de Rebanhos (`HerdsList.js`)
- ✅ Tabela com paginação
- ✅ Busca por nome
- ✅ Filtros por:
  - Fazenda
  - Espécie
  - Manejo Alimentar
  - Tipo de Produção
- ✅ Modal de detalhes
- ✅ Botões de ação (Editar, Excluir)
- ✅ Tags coloridas para espécies
- ✅ Confirmação antes de excluir

#### Formulário (`HerdsForm.js`)
- ✅ Criação e edição
- ✅ Seleção de fazenda (obrigatório)
- ✅ Campos:
  - Nome do rebanho (obrigatório)
  - Espécie (obrigatório)
  - Manejo alimentar (obrigatório)
  - Tipo de produção (obrigatório)
  - Descrição (opcional)
- ✅ Validações client-side
- ✅ Loading states
- ✅ Tooltips informativos

### API Service (`services/api.js`)

```javascript
// Funções disponíveis
getHerds()                    // Lista todos os rebanhos
getHerd(id)                   // Busca rebanho por ID
createHerd(data)              // Cria novo rebanho
updateHerd(id, data)          // Atualiza rebanho
deleteHerd(id)                // Exclui rebanho
```

---

## 🎨 UI/UX

### Cores das Tags

- **Caprino:** Azul (`blue`)
- **Ovino:** Verde (`green`)
- **Ambos:** Roxo (`purple`)
- **Fazenda:** Ciano (`cyan`)

### Breadcrumbs

```
Cadastros > Rebanhos
Cadastros > Rebanhos > Novo Rebanho
Cadastros > Rebanhos > Editar Rebanho
```

---

## 📝 Exemplo de Uso

### Criar um Rebanho (Frontend)

```javascript
const newHerd = {
  property_id: "farm_1760454479298_d9qqssa2m",
  name: "Rebanho Principal",
  species: "caprino",
  feeding_management: "semi-intensivo",
  production_type: "leite",
  description: "Rebanho voltado para produção leiteira"
};

await createHerd(newHerd);
```

### Criar um Rebanho (API)

```bash
curl -X POST "http://localhost:8000/herds/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": "farm_xxx",
    "name": "Rebanho Principal",
    "species": "caprino",
    "feeding_management": "semi-intensivo",
    "production_type": "leite",
    "description": "Rebanho voltado para produção leiteira"
  }'
```

---

## 🧪 Testando o Sistema

### 1. Acesse o Frontend
```
http://localhost:3000/herds
```

### 2. Cadastre um Rebanho
1. Clique em "Adicionar"
2. Selecione uma fazenda
3. Preencha os campos obrigatórios
4. Clique em "Salvar"

### 3. Verifique a API
```
http://localhost:8000/docs#/herds
```

---

## ✅ Status da Implementação

- [x] Modelo de dados (Herd)
- [x] Rotas da API
- [x] Validações backend
- [x] Controle de permissões
- [x] Frontend - Listagem
- [x] Frontend - Formulário
- [x] Frontend - Filtros
- [x] Frontend - Modal de detalhes
- [x] Integração completa
- [x] Documentação

---

## 🔄 Diferença entre Batches e Herds

### Batches (Lotes)
- Agrupamento temporário de animais
- Usado para movimentação, eventos específicos
- Mais voltado para operações pontuais

### Herds (Rebanhos)
- Agrupamento permanente de animais
- Define a estrutura produtiva da fazenda
- Vinculado a espécie, manejo e tipo de produção

---

## 🚀 Próximos Passos

1. Vincular animais aos rebanhos (relação N:N via AnimalHerd)
2. Relatórios de produtividade por rebanho
3. Dashboard com estatísticas dos rebanhos
4. Histórico de movimentações entre rebanhos

---

**Data de Criação:** 15/10/2025  
**Última Atualização:** 15/10/2025  
**Status:** ✅ Implementado e Funcional

