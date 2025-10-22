# 🎨 Guia de React Icons - CAPRINOVAÇÃO

## 📦 Instalação

```bash
npm install react-icons
```

## 🚀 Como Usar

### Importação Básica

```jsx
import { FaHome, FaUser, FaCog } from 'react-icons/fa';
import { MdEmail, MdPhone } from 'react-icons/md';
import { IoIosHeart } from 'react-icons/io';
```

### Exemplo de Uso

```jsx
function MyComponent() {
  return (
    <div>
      <FaHome className="text-2xl text-blue-500" />
      <FaUser className="mr-2" />
      <span>Usuário</span>
    </div>
  );
}
```

## 🎯 Ícones por Categoria

### 🏠 Navegação e Interface
- `FaHome` - Dashboard/Home
- `FaCog` - Configurações
- `FaBars` - Menu hambúrguer
- `FaSearch` - Busca
- `FaPlus` - Adicionar
- `FaEdit` - Editar
- `FaTrash` - Excluir
- `FaEye` - Visualizar
- `FaEyeSlash` - Ocultar

### 🏢 Gestão de Propriedades
- `FaBuilding` - Fazendas/Propriedades
- `FaUsers` - Funcionários/Usuários
- `FaHorse` - Animais/Rebanhos
- `FaDna` - Raças/Genética

### 🐄 Controle Animal
- `FaHeart` - Manejo Reprodutivo
- `FaExchangeAlt` - Movimentação
- `FaStethoscope` - Ocorrência Clínica
- `FaBug` - Controle Parasitário
- `FaSyringe` - Vacinação
- `FaHeartbeat` - Acasalamento

### 🧬 Saúde e Medicina
- `FaVirus` - Doenças
- `FaPills` - Medicamentos
- `FaShieldAlt` - Proteção
- `FaFlask` - Laboratório

### 📊 Relatórios e Análises
- `FaChartBar` - Gráficos
- `FaChartLine` - Análises
- `FaTable` - Tabelas
- `FaFileAlt` - Relatórios

### 🌱 Agricultura e Natureza
- `FaSeedling` - Crescimento/Agricultura
- `FaLeaf` - Vegetação
- `FaTractor` - Maquinário
- `FaTree` - Plantas

### 🔧 Utilitários
- `FaUser` - Usuário
- `FaLock` - Senha/Segurança
- `FaEnvelope` - Email
- `FaPhone` - Telefone
- `FaMapMarkerAlt` - Localização
- `FaCalendar` - Data
- `FaClock` - Hora

## 🎨 Estilização com Tailwind

### Tamanhos
```jsx
<FaHome className="text-xs" />    // Extra pequeno
<FaHome className="text-sm" />    // Pequeno
<FaHome className="text-base" />  // Base
<FaHome className="text-lg" />    // Grande
<FaHome className="text-xl" />    // Extra grande
<FaHome className="text-2xl" />   // 2x grande
<FaHome className="text-3xl" />   // 3x grande
```

### Cores
```jsx
<FaHome className="text-blue-500" />     // Azul
<FaHome className="text-green-600" />    // Verde
<FaHome className="text-red-500" />      // Vermelho
<FaHome className="text-gray-400" />     // Cinza
<FaHome className="text-yellow-500" />   // Amarelo
```

### Espaçamento
```jsx
<FaHome className="mr-2" />        // Margem direita
<FaHome className="ml-2" />        // Margem esquerda
<FaHome className="mx-2" />        // Margem horizontal
<FaHome className="my-2" />        // Margem vertical
```

## 📱 Exemplos Práticos

### Botão com Ícone
```jsx
<button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded">
  <FaPlus />
  Adicionar
</button>
```

### Card com Ícone
```jsx
<div className="bg-white p-4 rounded shadow">
  <div className="flex items-center gap-3 mb-2">
    <FaHorse className="text-2xl text-green-600" />
    <h3 className="text-lg font-semibold">Animais</h3>
  </div>
  <p>Gerencie seu rebanho</p>
</div>
```

### Lista com Ícones
```jsx
<ul className="space-y-2">
  <li className="flex items-center gap-2">
    <FaCheck className="text-green-500" />
    <span>Item 1</span>
  </li>
  <li className="flex items-center gap-2">
    <FaCheck className="text-green-500" />
    <span>Item 2</span>
  </li>
</ul>
```

## 🔍 Bibliotecas Disponíveis

### Font Awesome (fa)
```jsx
import { FaHome, FaUser } from 'react-icons/fa';
```

### Material Design (md)
```jsx
import { MdEmail, MdPhone } from 'react-icons/md';
```

### Ionicons (io)
```jsx
import { IoIosHeart, IoIosStar } from 'react-icons/io';
```

### Feather (fi)
```jsx
import { FiHome, FiUser } from 'react-icons/fi';
```

### Heroicons (hi)
```jsx
import { HiHome, HiUser } from 'react-icons/hi';
```

## 💡 Dicas

1. **Consistência**: Use a mesma biblioteca (ex: Font Awesome) em todo o projeto
2. **Tamanhos**: Mantenha tamanhos consistentes para ícones similares
3. **Cores**: Use cores do tema do projeto
4. **Acessibilidade**: Adicione `aria-label` quando necessário
5. **Performance**: Importe apenas os ícones que usar

## 🎯 Ícones Implementados no CAPRINOVAÇÃO

### Login Page
- `FaSeedling` - Logo principal
- `FaLeaf` - Controle de rebanhos
- `FaTractor` - Manejo reprodutivo
- `FaChartLine` - Relatórios
- `FaUser` - Campo email
- `FaLock` - Campo senha

### Menu Lateral
- `FaHome` - Dashboard
- `FaBuilding` - Fazendas
- `FaUsers` - Funcionários
- `FaHorse` - Rebanhos/Animais
- `FaDna` - Raças
- `FaVirus` - Doenças
- `FaPills` - Medicamentos
- `FaHeart` - Manejo Reprodutivo
- `FaExchangeAlt` - Movimentação
- `FaStethoscope` - Ocorrência Clínica
- `FaBug` - Controle Parasitário
- `FaSyringe` - Vacinação
- `FaChartBar` - Relatórios
- `FaHeartbeat` - Acasalamento

## 🔗 Links Úteis

- [React Icons - Documentação](https://react-icons.github.io/react-icons/)
- [Font Awesome Icons](https://fontawesome.com/icons)
- [Material Design Icons](https://materialdesignicons.com/)
- [Heroicons](https://heroicons.com/)
