# Script de execução dos testes
# Execute: python run_tests.py

import subprocess
import sys
import os
from pathlib import Path

def check_requirements():
    """Verifica se as dependências estão instaladas"""
    print("🔍 Verificando dependências...")
    
    try:
        import selenium
        import pytest
        import webdriver_manager
        print("✅ Todas as dependências estão instaladas")
        return True
    except ImportError as e:
        print(f"❌ Dependência faltando: {e}")
        print("\n📦 Instalando dependências...")
        
        subprocess.check_call([
            sys.executable, 
            "-m", 
            "pip", 
            "install", 
            "-r", 
            "requirements.txt"
        ])
        return True

def check_env_file():
    """Verifica se arquivo .env existe"""
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if not env_file.exists():
        print("\n⚠️ Arquivo .env não encontrado!")
        
        if env_example.exists():
            print("📝 Copiando .env.example para .env...")
            env_file.write_text(env_example.read_text())
            print("✅ Arquivo .env criado")
            print("\n⚠️ IMPORTANTE: Edite o arquivo .env com suas credenciais reais!")
            print("   Arquivo localizado em: tests/.env")
            
            response = input("\nDeseja continuar mesmo assim? (s/n): ")
            if response.lower() != 's':
                print("Execução cancelada")
                return False
        else:
            print("❌ Arquivo .env.example também não encontrado!")
            return False
    
    return True

def run_tests(test_filter=None):
    """Executa os testes"""
    print("\n" + "="*60)
    print("🚀 INICIANDO TESTES AUTOMATIZADOS")
    print("="*60 + "\n")
    
    # Construir comando pytest
    cmd = [
        sys.executable,
        "-m",
        "pytest",
        "test_parametrizacao_empreendimento.py",
        "-v",  # Verbose
        "-s",  # Mostrar prints
        "--tb=short",  # Traceback curto
        "--color=yes"  # Colorir output
    ]
    
    # Filtrar testes específicos se solicitado
    if test_filter:
        cmd.extend(["-k", test_filter])
    
    # Executar pytest
    result = subprocess.run(cmd, cwd=Path(__file__).parent)
    
    return result.returncode == 0

def main():
    """Função principal"""
    print("="*60)
    print("TESTES AUTOMATIZADOS - PARAMETRIZAÇÃO DE EMPREENDIMENTO")
    print("="*60)
    
    # Verificar dependências
    if not check_requirements():
        print("\n❌ Erro ao instalar dependências")
        return 1
    
    # Verificar arquivo .env
    if not check_env_file():
        print("\n❌ Configuração inválida")
        return 1
    
    # Menu de opções
    print("\n📋 OPÇÕES DE TESTE:")
    print("1. Executar TODOS os testes")
    print("2. Cenário 1: Pesquisa OBRIGATÓRIA + Cadastro PERMITIDO")
    print("3. Cenário 2: Pesquisa OBRIGATÓRIA + Cadastro NÃO PERMITIDO")
    print("4. Cenário 3: Pesquisa OPCIONAL")
    print("5. Cenário 4: Empreendimento Existente")
    print("0. Sair")
    
    choice = input("\nEscolha uma opção: ")
    
    test_filters = {
        "1": None,  # Todos
        "2": "cenario1",
        "3": "cenario2",
        "4": "cenario3",
        "5": "cenario4"
    }
    
    if choice == "0":
        print("Saindo...")
        return 0
    
    if choice not in test_filters:
        print("❌ Opção inválida!")
        return 1
    
    # Executar testes
    success = run_tests(test_filters[choice])
    
    if success:
        print("\n" + "="*60)
        print("✅ TODOS OS TESTES PASSARAM!")
        print("="*60)
        return 0
    else:
        print("\n" + "="*60)
        print("❌ ALGUNS TESTES FALHARAM")
        print("="*60)
        return 1

if __name__ == "__main__":
    sys.exit(main())
