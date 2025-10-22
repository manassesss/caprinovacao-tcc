# 🏡 Sistema de Fazendas (Properties) - Guia Completo

## ✅ Integração Completa Backend + Frontend

### 📋 **Modelo de Dados (Property)**

O sistema usa o modelo `Property` do backend para representar Fazendas/Propriedades:

```
Property (properties):
  - id: string
  - producer_id: string (dono da fazenda - usuário logado)
  - name: string ⭐ (nome da fazenda - obrigatório)
  - city: string ⭐ (município - obrigatório)
  - state: string ⭐ (estado - obrigatório)
  - phone: string (telefone - opcional)
  - cpf_cnpj: string (CNPJ - opcional, único)
  - area: float (área em hectares - opcional)
  - state_registration: string (inscrição estadual - opcional)
  - address: string (endereço - opcional)
  - cep: string (CEP - opcional)
  - created_at: datetime
  - updated_at: datetime
```

---

## 🚀 **Funcionalidades Implementadas**

### **Backend (API)**
- ✅ Rotas em `/properties/`
- ✅ CRUD completo (criar, listar, buscar, atualizar, deletar)
- ✅ Autenticação obrigatória
- ✅ Filtragem automática por usuário logado
- ✅ Validação de CNPJ único
- ✅ Controle de permissões

### **Frontend**
- ✅ Página de listagem: `/fazendas`
- ✅ Formulário de cadastro/edição: `/fazendas/edit/`
- ✅ Integração completa com API
- ✅ Máscaras automáticas (CNPJ, telefone, CEP)
- ✅ Validações em tempo real
- ✅ Busca e filtros
- ✅ Modal de detalhes

---

## 📝 **Campos do Formulário**

### **Campos Obrigatórios:** ⭐
1. **Nome da Fazenda**
   - Mínimo 3 caracteres
   - Exemplo: "Fazenda São João"

2. **Município**
   - Texto livre
   - Exemplo: "Campinas"

3. **Estado**
   - Select com 27 estados brasileiros
   - Com busca/filtro

### **Campos Opcionais:**
4. **Telefone**
   - Máscara: (00) 00000-0000
   - Aceita celular e fixo

5. **CNPJ**
   - Máscara: 00.000.000/0000-00
   - Validação de formato
   - Deve ser único no sistema

6. **Inscrição Estadual**
   - Texto livre
   - Exemplo: 123.456.789.000

7. **Endereço**
   - Texto livre
   - Exemplo: "Rodovia BR-101, Km 25"

8. **CEP**
   - Máscara: 00000-000
   - Validação de formato

9. **Dimensão/Área**
   - Número decimal (hectares)
   - Exemplo: 150.5 hectares

---

## 🎯 **Como Usar**

### **1. Acessar Fazendas**
```
Menu Lateral → Cadastros → Fazendas
ou
http://localhost:3000/fazendas
```

### **2. Cadastrar Nova Fazenda**
1. Clique em **"Adicionar Fazenda"**
2. Preencha os campos obrigatórios:
   - Nome: Fazenda Bela Vista
   - Município: Campinas
   - Estado: SP
3. Preencha campos opcionais (se desejar):
   - Telefone: (19) 99999-9999
   - CNPJ: 12.345.678/0001-90
   - Área: 150.5
   - Endereço: Estrada Municipal, Km 10
   - CEP: 13000-000
   - Inscrição Estadual: 123.456.789
4. Clique em **"Cadastrar"**

### **3. Listar Fazendas**
- Vê todas as fazendas cadastradas
- Busca por nome, município ou estado
- Ordenação e paginação automáticas

### **4. Ver Detalhes**
- Clique no botão azul (ícone de "abrir")
- Modal mostra todas as informações completas

### **5. Editar Fazenda**
- Clique no botão de editar (ícone de lápis)
- Altere os campos desejados
- Clique em **"Atualizar"**

### **6. Excluir Fazenda**
- Clique no botão vermelho (lixeira)
- Confirme a exclusão
- Fazenda será removida

---

## 🔒 **Segurança**

- ✅ Apenas usuários autenticados podem acessar
- ✅ Cada usuário vê apenas suas próprias fazendas
- ✅ producer_id é automaticamente definido como o usuário logado
- ✅ Apenas o dono ou admin pode editar/excluir
- ✅ CNPJ deve ser único no sistema

---

## 🎨 **Interface**

### **Listagem:**
- Colunas: Nome, Município, Estado, Telefone, CNPJ, Área, Ações
- Busca em tempo real
- Paginação (10 itens por página)
- Tooltips nos botões
- Confirmação antes de excluir

### **Formulário:**
- Layout responsivo (2 colunas em desktop)
- Máscaras automáticas em tempo real
- Validações com feedback visual
- Breadcrumb para navegação
- Botões: Voltar, Cancelar, Salvar

### **Modal de Detalhes:**
- Design limpo com ícones
- Mostra apenas campos preenchidos
- Data de cadastro
- Informações organizadas

---

## 📡 **Endpoints da API**

```
GET    /properties/          - Lista fazendas do usuário
POST   /properties/          - Cria nova fazenda
GET    /properties/{id}      - Busca fazenda específica
PUT    /properties/{id}      - Atualiza fazenda
DELETE /properties/{id}      - Exclui fazenda
```

Todos requerem token JWT no header:
```
Authorization: Bearer {token}
```

---

## 🧪 **Testando**

### **Via Frontend:**
1. Faça login em `http://localhost:3000/login`
2. Acesse `http://localhost:3000/fazendas`
3. Clique em "Adicionar Fazenda"
4. Preencha e cadastre

### **Via API (Swagger):**
1. Acesse `http://localhost:8000/docs`
2. Clique em "Authorize" e cole seu token
3. Vá para `/properties/`
4. Teste os endpoints

---

## 💡 **Dicas**

### **Máscaras Automáticas:**
- Digite apenas números, a máscara é aplicada automaticamente
- CNPJ: Digite 12345678000190 → Vira 12.345.678/0001-90
- Telefone: Digite 11987654321 → Vira (11) 98765-4321
- CEP: Digite 13000000 → Vira 13000-000

### **Busca:**
- Busca em tempo real (não precisa apertar Enter)
- Procura em: nome, município e estado
- Case-insensitive

### **Validações:**
- Campos obrigatórios são marcados
- Mensagens de erro claras
- CNPJ e CEP validam formato

---

## 📁 **Arquivos Criados/Modificados**

### **Backend:**
- ✅ `app/models/property.py` - Adicionados campos phone e area
- ✅ `app/routers/properties.py` - Atualizado com autenticação e filtros

### **Frontend:**
- ✅ `src/app/fazendas/page.js`
- ✅ `src/app/fazendas/components/FarmsList.js`
- ✅ `src/app/fazendas/edit/[[...id]]/page.js`
- ✅ `src/app/fazendas/edit/[[...id]]/components/FarmsForm.js`
- ✅ `src/components/AppSideMenu.js` - Adicionado item "Fazendas"
- ✅ `src/services/api.js` - Aliases para fazendas

---

## 🎉 **Tudo Pronto!**

O sistema de fazendas está completamente integrado ao backend usando o modelo `Property` existente!

**Para testar:**
```bash
# Terminal 1 (backend já está rodando)
http://localhost:8000

# Terminal 2 (frontend)
cd tcc-frontend
npm run dev

# Acesse
http://localhost:3000/fazendas
```

---

**Data:** 14/10/2025  
**Status:** ✅ Implementado e Funcionando

