#!/usr/bin/env python3
"""
Script para executar testes do Workflow Engine
==============================================

Uso:
    python run_workflow_tests.py              # Executa todos os testes
    python run_workflow_tests.py --headless   # Executa em modo headless (padrão)
    python run_workflow_tests.py --show       # Executa mostrando o navegador
    python run_workflow_tests.py --help       # Mostra ajuda

Variáveis de ambiente (arquivo .env):
    APP_URL=http://localhost:5173
    API_URL=http://localhost:3000/api/v1
    TEST_USER_EMAIL=teste@example.com
    TEST_USER_PASSWORD=senha123
    SUPABASE_URL=https://xxx.supabase.co
    SUPABASE_KEY=eyJxxx...
"""

import sys
import os
import argparse
from pathlib import Path

# Adiciona o diretório tests ao path
sys.path.insert(0, str(Path(__file__).parent))

def load_env():
    """Carrega variáveis de ambiente do arquivo .env"""
    env_file = Path(__file__).parent / '.env'
    
    if env_file.exists():
        print(f"📁 Carregando {env_file}")
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    os.environ[key] = value
        print("✅ Variáveis de ambiente carregadas")
    else:
        print(f"⚠️  Arquivo .env não encontrado em {env_file}")
        print("   Usando valores padrão ou variáveis de ambiente do sistema")

def check_dependencies():
    """Verifica se todas as dependências estão instaladas"""
    missing = []
    
    try:
        import selenium
    except ImportError:
        missing.append('selenium')
    
    try:
        from webdriver_manager.chrome import ChromeDriverManager
    except ImportError:
        missing.append('webdriver-manager')
    
    if missing:
        print(f"\n❌ Dependências faltando: {', '.join(missing)}")
        print("\nInstale com:")
        print(f"    pip install {' '.join(missing)}")
        print("\nOu instale todas de uma vez:")
        print("    pip install -r tests/requirements.txt")
        return False
    
    return True

def main():
    parser = argparse.ArgumentParser(
        description='Executa testes do Workflow Engine',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument(
        '--show',
        action='store_true',
        help='Mostra o navegador durante os testes (desativa headless)'
    )
    
    parser.add_argument(
        '--headless',
        action='store_true',
        default=True,
        help='Executa em modo headless (padrão)'
    )
    
    args = parser.parse_args()
    
    # Carregar .env
    load_env()
    
    # Verificar dependências
    if not check_dependencies():
        return 1
    
    # Configurar modo headless
    if args.show:
        os.environ['HEADLESS'] = 'false'
    else:
        os.environ['HEADLESS'] = 'true'
    
    # Importar e executar testes
    try:
        from test_workflow_engine_integration import main as run_tests
        run_tests()
        return 0
    except Exception as e:
        print(f"\n❌ Erro ao executar testes: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    sys.exit(main())
