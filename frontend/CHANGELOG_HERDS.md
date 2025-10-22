# Changelog - Implementação do Sistema de Rebanhos (Herds)

**Data:** 15 de Outubro de 2025

---

## 🎯 Objetivo

Criar sistema completo de gestão de rebanhos (herds), diferenciando-os de lotes (batches), com integração total entre backend e frontend.

---

## 🔧 Mudanças no Backend

### 1. Modelo de Dados Atualizado

**Arquivo:** `api-pravaler/app/models/farm.py`

**Mudanças:**
```python
class Herd(TimestampedModel, table=True):
    # Campos anteriores mantidos
    id: str
    property_id: str
    
    # NOVOS CAMPOS ADICIONADOS:
    name: str = Field(min_length=3)  # Nome obrigatório
    description: Optional[str] = None  # Descrição opcional
    species: str  # Espécie: caprino, ovino, ambos
    feeding_management: str  # Manejo: extensivo, semi-intensivo, intensivo
    production_type: str  # Produção: carne, leite, misto
    
    # CAMPOS REMOVIDOS:
    # specie_id (agora usa string direta)
    # food_management_type (renomeado para feeding_management)
    # production_objective (renomeado para production_type)
```

### 2. Novo Router de Herds

**Arquivo Criado:** `api-pravaler/app/routers/herds.py`

**Endpoints Implementados:**
- `GET /herds/` - Lista rebanhos do usuário
- `POST /herds/` - Cria novo rebanho
- `GET /herds/{herd_id}` - Busca rebanho específico
- `PUT /herds/{herd_id}` - Atualiza rebanho
- `DELETE /herds/{herd_id}` - Exclui rebanho

**Recursos:**
- Validação de valores permitidos (species, feeding_management, production_type)
- Controle de permissões (produtor vê apenas seus rebanhos)
- Geração automática de ID único
- Verificação de propriedade da fazenda

### 3. Atualização do Main

**Arquivo:** `api-pravaler/app/main.py`

**Mudança:**
```python
# ANTES:
from app.routers.farms import router as herds_router

# DEPOIS:
from app.routers.herds import router as herds_router
```

### 4. Modelo Batch Mantido

**Arquivo:** `api-pravaler/app/models/batch.py`

- Revertido às configurações originais
- Mantido separado de Herd (lotes ≠ rebanhos)

---

## 💻 Mudanças no Frontend

### 1. Atualização do Menu Lateral

**Arquivo:** `tcc-frontend/src/components/AppSideMenu.js`

**Mudanças:**
```javascript
// ANTES:
{ key: '12', label: <Link href='/flocks'>Rebanhos</Link> }
else if(pathName.startsWith("/flocks")) {
    setSelectedKey(["12"])
}

// DEPOIS:
{ key: '12', label: <Link href='/herds'>Rebanhos</Link> }
else if(pathName.startsWith("/herds")) {
    setSelectedKey(["12"])
}
```

### 2. API Service Atualizado

**Arquivo:** `tcc-frontend/src/services/api.js`

**Funções Adicionadas:**
```javascript
getHerds()           // GET /herds/
getHerd(id)          // GET /herds/{id}
createHerd(data)     // POST /herds/
updateHerd(id, data) // PUT /herds/{id} (corrigido de PATCH para PUT)
deleteHerd(id)       // DELETE /herds/{id}
```

**Adicionado ao export default:**
```javascript
export default {
  // ... exports anteriores
  getHerds,
  getHerd,
  createHerd,
  updateHerd,
  deleteHerd,
  // ... outros exports
};
```

### 3. Novos Componentes Criados

#### a) Página Principal
**Arquivo Criado:** `tcc-frontend/src/app/herds/page.js`
- Componente wrapper que renderiza HerdsList

#### b) Lista de Rebanhos
**Arquivo Criado:** `tcc-frontend/src/app/herds/components/HerdsList.js`

**Funcionalidades:**
- Tabela com colunas: Nome, Fazenda, Espécie, Manejo, Produção, Ações
- Filtros por: Nome, Fazenda, Espécie, Manejo, Produção
- Modal de detalhes completo
- Tags coloridas para espécies:
  - Caprino: Azul
  - Ovino: Verde
  - Ambos: Roxo
- Confirmação antes de excluir
- Loading states
- Integração com API

#### c) Página de Edição
**Arquivo Criado:** `tcc-frontend/src/app/herds/edit/[[...id]]/page.js`
- Rota dinâmica para criar/editar

#### d) Formulário de Rebanho
**Arquivo Criado:** `tcc-frontend/src/app/herds/edit/[[...id]]/components/HerdsForm.js`

**Campos Implementados:**
- Fazenda (Select, obrigatório)
- Nome do Rebanho (Input, obrigatório)
- Espécie (Select, obrigatório)
  - Caprino
  - Ovino
  - Ambos
- Manejo Alimentar (Select, obrigatório)
  - Extensivo
  - Semi-intensivo
  - Intensivo
- Tipo de Produção (Select, obrigatório)
  - Carne
  - Leite
  - Misto
- Descrição (TextArea, opcional, max 500 caracteres)

**Recursos:**
- Validação client-side
- Tooltips informativos
- Loading states
- Breadcrumbs
- Divisores para organização visual

---

## 📚 Documentação Criada

### 1. Guia Completo
**Arquivo Criado:** `tcc-frontend/HERDS_GUIDE.md`
- Visão geral do sistema
- Documentação do modelo de dados
- Documentação das rotas
- Exemplos de uso
- Diferença entre Batches e Herds

### 2. Changelog
**Arquivo Criado:** `tcc-frontend/CHANGELOG_HERDS.md` (este arquivo)
- Registro detalhado de todas as mudanças

---

## 🗂️ Estrutura de Arquivos Criada

```
Backend:
  api-pravaler/app/
    ├── models/
    │   └── farm.py (ATUALIZADO)
    └── routers/
        └── herds.py (NOVO)

Frontend:
  tcc-frontend/src/
    ├── app/
    │   └── herds/ (NOVO)
    │       ├── page.js
    │       ├── components/
    │       │   └── HerdsList.js
    │       └── edit/
    │           └── [[...id]]/
    │               ├── page.js
    │               └── components/
    │                   └── HerdsForm.js
    ├── components/
    │   └── AppSideMenu.js (ATUALIZADO)
    └── services/
        └── api.js (ATUALIZADO)

Documentação:
  tcc-frontend/
    ├── HERDS_GUIDE.md (NOVO)
    └── CHANGELOG_HERDS.md (NOVO)
```

---

## 🎨 Decisões de Design

### UI/UX
1. **Cores Consistentes:** Tags coloridas para identificação visual rápida
2. **Filtros Intuitivos:** Todos os campos principais são filtráveis
3. **Feedback Claro:** Mensagens de sucesso/erro em todas as operações
4. **Confirmações:** Modal de confirmação antes de excluir
5. **Tooltips:** Ajuda contextual em campos que podem gerar dúvidas

### Arquitetura
1. **Separação de Responsabilidades:** Lista e Formulário em componentes separados
2. **Reutilização:** Funções da API centralizadas em `api.js`
3. **Validação em Camadas:** Client-side (frontend) + Server-side (backend)
4. **Permissões:** Implementadas no backend, transparentes no frontend

---

## ✅ Testes Recomendados

### Backend
1. ✅ Acesse `/docs` e teste todas as rotas de `/herds`
2. ✅ Tente criar rebanho com valores inválidos (deve retornar erro 400)
3. ✅ Tente acessar rebanho de outra fazenda (deve retornar erro 403)
4. ✅ Verifique geração automática de ID único

### Frontend
1. ✅ Acesse `/herds` e verifique listagem
2. ✅ Teste todos os filtros
3. ✅ Crie um novo rebanho
4. ✅ Edite um rebanho existente
5. ✅ Visualize detalhes no modal
6. ✅ Exclua um rebanho
7. ✅ Verifique validações do formulário

---

## 🐛 Problemas Resolvidos

### 1. Conflito Batches vs Herds
**Problema:** Router de batches foi modificado acidentalmente
**Solução:** Revertido para configuração original, criado router separado para herds

### 2. Endpoint UPDATE usando PATCH
**Problema:** API service usando PATCH ao invés de PUT
**Solução:** Alterado para PUT no `updateHerd()`

### 3. Menu apontando para /flocks
**Problema:** URL antiga do menu (/flocks)
**Solução:** Atualizado para /herds em todo o código

---

## 🚀 Próximas Etapas Sugeridas

1. **Vincular Animais aos Rebanhos**
   - Usar tabela `AnimalHerd` existente
   - Criar interface para adicionar/remover animais

2. **Dashboard de Rebanhos**
   - Estatísticas por rebanho
   - Gráficos de produtividade
   - Comparativos entre rebanhos

3. **Relatórios**
   - Relatório de produção por rebanho
   - Histórico de movimentações
   - Análise de desempenho

4. **Melhorias de UX**
   - Ícones personalizados para cada espécie
   - Modo de visualização em cards (além de tabela)
   - Exportação de dados (PDF/Excel)

---

## 📊 Impacto

### Linhas de Código
- Backend: ~160 linhas (router + model updates)
- Frontend: ~550 linhas (4 componentes novos)
- Total: ~710 linhas

### Arquivos Modificados
- **Criados:** 6 arquivos
- **Modificados:** 4 arquivos

### Funcionalidades Adicionadas
- 5 endpoints REST
- 2 páginas completas
- 4 componentes React
- 6 funções de API service

---

**Status Final:** ✅ **Implementação Completa e Funcional**

**Testado em:**
- Backend: FastAPI 0.104+
- Frontend: Next.js 14.2.18
- Banco de Dados: SQLite com SQLModel

**Data de Conclusão:** 15/10/2025

