# Sistema de Notificações - Documentação

## 📦 Estrutura Implementada

```
src/
├── types/
│   └── notification.ts              # TypeScript interfaces
├── services/
│   └── notificationService.ts       # API layer
├── hooks/
│   └── useNotifications.ts          # Business logic hook
└── components/
    └── notifications/
        ├── NotificationBell.tsx     # Header component
        ├── NotificationItem.tsx     # Reusable item
        └── NotificationCenter.tsx   # Full page
```

## 🚀 Como Usar

### 1. NotificationBell no Header

Adicione o componente no header da aplicação:

\`\`\`tsx
import NotificationBell from './components/notifications/NotificationBell';

function Header() {
  const currentUser = useAuth(); // Seu hook de autenticação
  
  return (
    <header>
      <nav>
        {/* ... outros itens do menu ... */}
        
        <NotificationBell userId={currentUser.id} />
      </nav>
    </header>
  );
}
\`\`\`

### 2. Página NotificationCenter

Adicione a rota no seu router:

\`\`\`tsx
import { Route } from 'react-router-dom';
import NotificationCenter from './components/notifications/NotificationCenter';

// Em App.tsx ou routes
<Route 
  path="/notificacoes" 
  element={<NotificationCenter userId={currentUser.id} />} 
/>
\`\`\`

### 3. Hook useNotifications (Uso Standalone)

Se precisar gerenciar notificações em outro componente:

\`\`\`tsx
import { useEffect } from 'react';
import { useNotifications } from './hooks/useNotifications';

function MyComponent() {
  const {
    stats,
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    startPolling,
    stopPolling
  } = useNotifications(userId);
  
  useEffect(() => {
    fetchNotifications();
    startPolling(30000); // Auto-refresh a cada 30s
    
    return () => stopPolling();
  }, []);
  
  return (
    <div>
      <p>Notificações não lidas: {stats.unread_count}</p>
      {/* ... */}
    </div>
  );
}
\`\`\`

## 🎨 Personalização de Cores

As cores por severity estão definidas em \`NotificationItem.tsx\`:

\`\`\`tsx
const severityConfig = {
  INFO: {
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    icon: 'ℹ️',
  },
  // ... outros
};
\`\`\`

Para customizar, edite estas classes Tailwind.

## 📊 Funcionalidades Implementadas

### NotificationBell
✅ Badge com contador de não lidas  
✅ Dropdown com últimas 5 notificações  
✅ Auto-refresh a cada 30 segundos  
✅ Marca como lida ao clicar  
✅ Navega para \`action_url\` se existir  
✅ Botão "Ver todas"  
✅ Botão "Marcar todas como lidas"  

### NotificationCenter
✅ Tabs de filtro (Todas | Não lidas | Lidas)  
✅ Lista completa de notificações  
✅ Paginação (20 por página)  
✅ Empty state  
✅ Data relativa (ex: "há 2 horas")  
✅ Badge "Nova" em não lidas  
✅ Botões de ação (marcar como lida, deletar)  
✅ Responsive (mobile-first)  

### useNotifications Hook
✅ State management completo  
✅ Polling opcional  
✅ Optimistic updates  
✅ Error handling  
✅ Loading states  
✅ Auto-cleanup no unmount  

### notificationService
✅ getNotifications (com filtros)  
✅ getStats  
✅ markAsRead  
✅ markAllAsRead  
✅ deleteNotification  
✅ Auth headers automático  
✅ Error handling  

## 🔧 Configuração do Backend

Certifique-se de que o backend está configurado em \`.env\`:

\`\`\`env
VITE_API_BASE_URL=https://fastapi-sandbox-ee3p.onrender.com/api/v1
\`\`\`

## 📝 Exemplo de Resposta da API

\`\`\`json
// GET /notifications
{
  "total": 15,
  "items": [
    {
      "id": "uuid",
      "type": "system",
      "title": "Novo processo criado",
      "message": "Processo #2025/001 foi criado com sucesso",
      "severity": "SUCCESS",
      "is_read": false,
      "action_url": "/processos/uuid",
      "created_at": "2025-11-19T10:30:00Z"
    }
  ]
}

// GET /stats
{
  "unread_count": 5,
  "total_count": 50
}
\`\`\`

## 🐛 Troubleshooting

**Erro de CORS:**
- Verifique se o backend tem CORS configurado para o frontend
- Headers necessários: \`Access-Control-Allow-Origin\`

**Token não enviado:**
- O hook busca o token de \`localStorage.getItem('token')\`
- Ajuste em \`notificationService.ts\` se usar outro local

**Data em formato incorreto:**
- O componente usa \`date-fns\` com locale \`ptBR\`
- Certifique-se de que \`created_at\` vem em ISO 8601

## 📦 Dependências

\`\`\`json
{
  "axios": "^1.x.x",
  "date-fns": "^3.x.x",
  "react-router-dom": "^6.x.x"
}
\`\`\`

## ✅ Checklist de Implementação

- [x] Types e interfaces
- [x] Serviço de API
- [x] Hook customizado
- [x] Componente NotificationItem
- [x] Componente NotificationBell
- [x] Componente NotificationCenter
- [x] Formatação de datas (date-fns)
- [x] Optimistic updates
- [x] Auto-refresh (polling)
- [x] Responsive design
- [x] Error handling
- [ ] Adicionar rota no router principal
- [ ] Adicionar NotificationBell no Header
- [ ] Testar com backend real

## 🎯 Próximos Passos

1. **Integrar no Header:**
   - Adicione \`<NotificationBell userId={user.id} />\` no seu header/navbar

2. **Adicionar Rota:**
   - Configure a rota \`/notificacoes\` no router

3. **Testar com Backend:**
   - Verifique se o backend está retornando o formato correto
   - Teste todas as operações (ler, marcar, deletar)

4. **Ajustar Estilos:**
   - Customize cores conforme identidade visual
   - Ajuste posicionamento do dropdown se necessário

5. **Performance:**
   - Considere adicionar React Query para cache
   - Implementar infinite scroll na página principal
