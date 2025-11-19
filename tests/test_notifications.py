"""
Script para testar o sistema de notificações
Cria notificações de teste usando a API backend
"""

import requests
import json
from datetime import datetime

# Configuração
API_BASE_URL = "https://fastapi-sandbox-ee3p.onrender.com/api/v1"
# Substitua pelo ID do usuário que você está testando
USER_ID = "264671"  # ✅ ID do usuário logado

def create_test_notification(notification_type: str, title: str, message: str, severity: str, action_url: str = None):
    """Cria uma notificação de teste"""
    url = f"{API_BASE_URL}/notifications"
    
    payload = {
        "user_id": USER_ID,
        "type": notification_type,
        "title": title,
        "message": message,
        "severity": severity,
        "target_type": "test",
        "target_id": "test-123",
        "action_url": action_url
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print(f"✅ Notificação criada: {title}")
        return response.json()
    except Exception as e:
        print(f"❌ Erro ao criar notificação: {e}")
        return None

def get_user_notifications():
    """Lista todas as notificações do usuário"""
    url = f"{API_BASE_URL}/notifications"
    params = {"user_id": USER_ID, "skip": 0, "limit": 20}
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        print(f"\n📊 Total de notificações: {data['total']}")
        for notif in data['items']:
            status = "✉️ Nova" if not notif['is_read'] else "✅ Lida"
            print(f"  {status} - [{notif['severity']}] {notif['title']}")
        return data
    except Exception as e:
        print(f"❌ Erro ao listar notificações: {e}")
        return None

def get_stats():
    """Obtém estatísticas das notificações"""
    url = f"{API_BASE_URL}/notifications/stats"
    params = {"user_id": USER_ID}
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        stats = response.json()
        print(f"\n📈 Estatísticas:")
        print(f"  Não lidas: {stats['unread_count']}")
        print(f"  Total: {stats['total_count']}")
        return stats
    except Exception as e:
        print(f"❌ Erro ao obter estatísticas: {e}")
        return None

def main():
    print("=" * 60)
    print("🔔 TESTE DO SISTEMA DE NOTIFICAÇÕES")
    print("=" * 60)
    
    if USER_ID == "seu-user-id-aqui":
        print("\n⚠️  ATENÇÃO: Você precisa definir o USER_ID no script!")
        print("   1. Faça login no sistema")
        print("   2. Abra o DevTools (F12)")
        print("   3. Console > digite: localStorage.getItem('userId')")
        print("   4. Copie o ID e cole no script na linha 11")
        return
    
    print(f"\n👤 Testando com USER_ID: {USER_ID}")
    print("-" * 60)
    
    # Criar notificações de teste
    print("\n📝 Criando notificações de teste...")
    print("-" * 60)
    
    create_test_notification(
        notification_type="SYSTEM",
        title="Bem-vindo ao sistema!",
        message="Esta é uma notificação de boas-vindas. O sistema de notificações está funcionando corretamente.",
        severity="INFO",
        action_url="/dashboard"
    )
    
    create_test_notification(
        notification_type="PROCESS",
        title="Processo aprovado",
        message="Seu processo #1234 foi aprovado com sucesso. Você pode visualizar os detalhes clicando aqui.",
        severity="SUCCESS",
        action_url="/inscricao/revisao"
    )
    
    create_test_notification(
        notification_type="DOCUMENT",
        title="Documento pendente",
        message="O documento 'Certidão de Matrícula' está aguardando aprovação. Por favor, revise o documento.",
        severity="WARNING",
        action_url="/inscricao/documentacao"
    )
    
    create_test_notification(
        notification_type="ERROR",
        title="Erro no processamento",
        message="Houve um erro ao processar sua solicitação. Nossa equipe técnica foi notificada e está trabalhando na solução.",
        severity="ERROR",
        action_url="/dashboard"
    )
    
    create_test_notification(
        notification_type="WORKFLOW",
        title="Nova tarefa atribuída",
        message="Você foi atribuído à tarefa 'Análise técnica do empreendimento'. Prazo: 3 dias.",
        severity="INFO",
        action_url="/inscricao/empreendimento"
    )
    
    # Listar notificações
    print("\n" + "-" * 60)
    get_user_notifications()
    
    # Obter estatísticas
    get_stats()
    
    print("\n" + "=" * 60)
    print("✅ TESTE CONCLUÍDO!")
    print("=" * 60)
    print("\n📌 Próximos passos:")
    print("  1. Acesse o sistema em http://localhost:5173")
    print("  2. Faça login")
    print("  3. Vá para /inscricao/participantes (ou qualquer página)")
    print("  4. Veja o sino de notificações no header (🔔)")
    print("  5. Clique no sino para ver as notificações")
    print("  6. Clique em 'Ver todas as notificações' para ir para /notificacoes")
    print("\n")

if __name__ == "__main__":
    main()
