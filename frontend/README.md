# 🐐 CAPRINOVAÇÃO - Sistema de Gestão Caprina

Frontend do sistema de gestão de rebanhos caprinos, desenvolvido com Next.js e Ant Design.

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variável de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Iniciar Servidor de Desenvolvimento

**Importante:** Certifique-se de que a API backend está rodando em `http://localhost:8000`

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🔐 Autenticação

O sistema possui autenticação completa integrada com a API:

### **Primeiro Acesso**

1. Acesse `http://localhost:3000/register`
2. Preencha o formulário de cadastro
3. Escolha o tipo de usuário (Produtor, Técnico, etc.)
4. Após o cadastro, você será automaticamente logado

### **Login**

1. Acesse `http://localhost:3000/login`
2. Use seu email e senha
3. Você será redirecionado para a página inicial

### **Tipos de Usuário**

- **Produtor**: Gerencia propriedades e animais
- **Técnico**: Registra eventos e consultas (requer número do conselho)
- **Gerente de Cooperativa**: Acesso a múltiplas propriedades
- **Governo**: Acesso para fiscalização
- **Administrador**: Acesso total ao sistema

---

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Páginas Next.js (App Router)
│   ├── login/             # Página de login
│   ├── register/          # Página de cadastro
│   ├── animals/           # Gestão de animais
│   ├── flocks/            # Gestão de lotes
│   ├── medicines/         # Gestão de medicamentos
│   └── ...
├── components/            # Componentes reutilizáveis
│   ├── AppHeader.js      # Cabeçalho com menu de usuário
│   ├── AppLayout.js      # Layout principal
│   └── AppSideMenu.js    # Menu lateral de navegação
├── contexts/             # React Contexts
│   └── AuthContext.js    # Contexto de autenticação
└── services/             # Serviços
    └── api.js           # Cliente HTTP para API
```

---

## 🛠️ Tecnologias

- **Next.js 14** - Framework React
- **Ant Design** - Biblioteca de componentes UI
- **React Context API** - Gerenciamento de estado
- **Tailwind CSS** - Estilização

---

## 📡 Integração com API

O frontend se comunica com a API FastAPI através do serviço em `src/services/api.js`.

### **Exemplo de Uso**

```javascript
import { getAnimals, createAnimal } from '@/services/api';

// Buscar todos os animais
const animals = await getAnimals();

// Criar novo animal
const newAnimal = await createAnimal({
  id: 'animal_001',
  name: 'Boi 001',
  // ... outros campos
});
```

### **Autenticação Automática**

Todas as requisições incluem automaticamente o token JWT do usuário logado.

---

## 📚 Documentação Completa

Para informações detalhadas sobre a integração, autenticação e uso da API, consulte:

- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Guia completo de integração
- **[API Docs](http://localhost:8000/docs)** - Documentação interativa da API

---

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm run start

# Linter
npm run lint
```

---

## 🎨 Páginas Principais

- `/` - Dashboard principal
- `/login` - Login de usuários
- `/register` - Cadastro de novos usuários
- `/animals` - Gestão de animais
- `/flocks` - Gestão de lotes
- `/medicines` - Gestão de medicamentos
- `/races` - Gestão de raças
- `/employees` - Gestão de funcionários
- `/clinical-occurrence` - Ocorrências clínicas
- `/parasite-control` - Controle parasitário
- `/reproductive-management` - Manejo reprodutivo
- `/mating` - Acasalamento
- `/animal-movimentation` - Movimentação de animais

---

## 🐛 Troubleshooting

### Erro: "Failed to fetch"

1. Verifique se a API está rodando: `http://localhost:8000/docs`
2. Verifique a variável `NEXT_PUBLIC_API_URL` no `.env.local`

### Não consigo fazer login

1. Certifique-se de que o backend está rodando
2. Verifique se o usuário está cadastrado
3. Limpe o cache do navegador e localStorage

### Problemas com autenticação

```javascript
// No console do navegador
localStorage.clear(); // Limpa tokens antigos
location.reload();    // Recarrega a página
```

---

## 📝 Notas de Desenvolvimento

- O token JWT é armazenado no `localStorage`
- As rotas são protegidas automaticamente pelo `ProtectedRoute`
- O `AuthContext` gerencia o estado global de autenticação
- Páginas públicas: `/login`, `/register`, `/forgot-password`

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença especificada no arquivo LICENSE.

---

## 🆘 Suporte

Para dúvidas e problemas:

1. Consulte o [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
2. Verifique a documentação da API em `http://localhost:8000/docs`
3. Abra uma issue no repositório

---

**Desenvolvido com ❤️ para gestão eficiente de rebanhos caprinos**
