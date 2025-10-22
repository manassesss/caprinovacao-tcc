// Tema Verde CAPRINOVAÇÃO
export const theme = {
  colors: {
    primary: '#16a34a',        // Verde principal
    primaryHover: '#15803d',   // Verde hover
    primaryLight: '#22c55e',   // Verde claro
    primaryDark: '#14532d',    // Verde escuro
    accent: '#84cc16',         // Verde accent
    success: '#10b981',        // Verde sucesso
    warning: '#65a30d',        // Verde warning
    background: '#f0fdf4',     // Fundo verde claro
  },
  
  // Classes CSS para botões
  button: {
    primary: 'bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700 text-white',
    success: 'bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600 text-white',
    danger: 'bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700 text-white',
    outline: 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white',
    outlineDanger: 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white',
  },
  
  // Classes CSS para tags
  tag: {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  
  // Classes CSS para cards
  card: {
    hover: 'hover:border-green-300 hover:shadow-green-100',
    header: 'bg-green-50 border-b border-green-200',
  },
  
  // Classes CSS para inputs
  input: {
    focus: 'focus:border-green-500 focus:ring-green-500',
  },
  
  // Classes CSS para links
  link: {
    primary: 'text-green-600 hover:text-green-700',
    secondary: 'text-gray-600 hover:text-green-600',
  },
};

// Função helper para aplicar tema
export const applyTheme = (component, variant = 'primary') => {
  return `${component} ${theme.button[variant] || theme.button.primary}`;
};

// Função helper para cores
export const getColor = (colorName) => {
  return theme.colors[colorName] || theme.colors.primary;
};

export default theme;
