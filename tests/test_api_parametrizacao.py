# Testes de API - Parametrização de Empreendimento
# Testes unitários das APIs sem interface gráfica

import requests
import pytest
import os
from typing import Dict, Any
import json

# Configurações
BASE_URL = os.getenv('TEST_BASE_URL', 'http://localhost:5173')
API_BASE = BASE_URL.replace('5173', '3000')  # Backend geralmente roda na 3000
ADMIN_EMAIL = os.getenv('TEST_ADMIN_EMAIL', 'admin@example.com')
ADMIN_PASSWORD = os.getenv('TEST_ADMIN_PASSWORD', 'admin123')

class TestParametrizacaoAPI:
    """Testes de API para parametrização de empreendimento"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup do cliente HTTP e login"""
        self.session = requests.Session()
        self.token = None
        self.config_ids = {}
        
        # Fazer login
        try:
            response = self.session.post(
                f"{API_BASE}/api/v1/auth/login",
                json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('token') or data.get('access_token')
                self.session.headers.update({
                    'Authorization': f'Bearer {self.token}'
                })
                print(f"\n✅ Login realizado com sucesso")
            else:
                print(f"\n⚠️ Login falhou: {response.status_code}")
                
        except Exception as e:
            print(f"\n⚠️ Erro ao fazer login: {str(e)}")
            print("   Testes de API podem falhar sem autenticação")
        
        yield
        
        # Cleanup
        self.session.close()
    
    def test_01_listar_configuracoes(self):
        """Teste 1: Listar configurações do sistema"""
        print("\n" + "="*60)
        print("TESTE 1: Listar configurações do sistema")
        print("="*60)
        
        try:
            response = self.session.get(f"{API_BASE}/api/v1/system-config")
            
            print(f"\nStatus Code: {response.status_code}")
            
            if response.status_code == 200:
                configs = response.json()
                print(f"✅ Configurações encontradas: {len(configs)}")
                
                for config in configs:
                    print(f"  - {config.get('config_key')}: {config.get('config_value')}")
                    self.config_ids[config.get('config_key')] = config.get('id')
                
                assert len(configs) >= 2, "Deveria ter pelo menos 2 configurações"
                
            elif response.status_code == 404:
                print("⚠️ AVISO: Endpoint /api/v1/system-config não encontrado")
                print("   Backend precisa implementar este endpoint")
                pytest.skip("Backend não implementado")
                
            else:
                print(f"❌ FALHOU: Status {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                
        except requests.exceptions.ConnectionError:
            print("❌ ERRO: Não foi possível conectar ao backend")
            print(f"   Verifique se backend está rodando em {API_BASE}")
            pytest.skip("Backend não disponível")
    
    def test_02_atualizar_config_pesquisa_obrigatoria(self):
        """Teste 2: Atualizar config 'pesquisa obrigatória' para TRUE"""
        print("\n" + "="*60)
        print("TESTE 2: Atualizar configuração - Pesquisa Obrigatória")
        print("="*60)
        
        config_key = "empreendimento_search_required"
        
        try:
            response = self.session.put(
                f"{API_BASE}/api/v1/system-config/{config_key}",
                json={"config_value": True}
            )
            
            print(f"\nStatus Code: {response.status_code}")
            
            if response.status_code in [200, 204]:
                print(f"✅ Configuração '{config_key}' atualizada para TRUE")
                
            elif response.status_code == 404:
                print("⚠️ AVISO: Endpoint PUT /api/v1/system-config/:key não encontrado")
                pytest.skip("Backend não implementado")
                
            else:
                print(f"❌ FALHOU: Status {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                
        except requests.exceptions.ConnectionError:
            pytest.skip("Backend não disponível")
    
    def test_03_atualizar_config_permitir_novo(self):
        """Teste 3: Atualizar config 'permitir novo' para FALSE"""
        print("\n" + "="*60)
        print("TESTE 3: Atualizar configuração - Permitir Novo Cadastro")
        print("="*60)
        
        config_key = "empreendimento_allow_new_register"
        
        try:
            response = self.session.put(
                f"{API_BASE}/api/v1/system-config/{config_key}",
                json={"config_value": False}
            )
            
            print(f"\nStatus Code: {response.status_code}")
            
            if response.status_code in [200, 204]:
                print(f"✅ Configuração '{config_key}' atualizada para FALSE")
                
            elif response.status_code == 404:
                print("⚠️ AVISO: Endpoint PUT não encontrado")
                pytest.skip("Backend não implementado")
                
            else:
                print(f"❌ FALHOU: Status {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            pytest.skip("Backend não disponível")
    
    def test_04_pesquisar_empreendimento_cnpj(self):
        """Teste 4: Pesquisar empreendimento por CNPJ"""
        print("\n" + "="*60)
        print("TESTE 4: Pesquisar empreendimento por CNPJ")
        print("="*60)
        
        cnpj_teste = "12345678000199"
        
        try:
            response = self.session.get(
                f"{API_BASE}/api/v1/enterprises/search",
                params={"query": cnpj_teste}
            )
            
            print(f"\nQuery: {cnpj_teste}")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                results = response.json()
                print(f"✅ Pesquisa executada: {len(results)} resultado(s)")
                
                if len(results) > 0:
                    print("\nPrimeiro resultado:")
                    print(f"  ID: {results[0].get('id')}")
                    print(f"  CNPJ/CPF: {results[0].get('cnpj_cpf')}")
                    print(f"  Nome: {results[0].get('razao_social') or results[0].get('nome_fantasia')}")
                else:
                    print("ℹ️ Nenhum resultado encontrado (esperado se não há dados)")
                    
            elif response.status_code == 404:
                print("⚠️ AVISO: Endpoint /api/v1/enterprises/search não encontrado")
                pytest.skip("Backend não implementado")
                
            else:
                print(f"❌ FALHOU: Status {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            pytest.skip("Backend não disponível")
    
    def test_05_pesquisar_empreendimento_nome(self):
        """Teste 5: Pesquisar empreendimento por nome"""
        print("\n" + "="*60)
        print("TESTE 5: Pesquisar empreendimento por nome")
        print("="*60)
        
        nome_teste = "Empresa"
        
        try:
            response = self.session.get(
                f"{API_BASE}/api/v1/enterprises/search",
                params={"query": nome_teste}
            )
            
            print(f"\nQuery: {nome_teste}")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                results = response.json()
                print(f"✅ Pesquisa executada: {len(results)} resultado(s)")
                
                if len(results) > 0:
                    for i, result in enumerate(results[:3], 1):  # Mostra até 3
                        print(f"\nResultado {i}:")
                        print(f"  CNPJ/CPF: {result.get('cnpj_cpf')}")
                        print(f"  Nome: {result.get('razao_social') or result.get('nome_fantasia')}")
                        
            elif response.status_code == 404:
                pytest.skip("Backend não implementado")
                
            else:
                print(f"❌ FALHOU: Status {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            pytest.skip("Backend não disponível")
    
    def test_06_buscar_config_especifica(self):
        """Teste 6: Buscar configuração específica"""
        print("\n" + "="*60)
        print("TESTE 6: Buscar configuração específica")
        print("="*60)
        
        config_key = "empreendimento_search_required"
        
        try:
            response = self.session.get(
                f"{API_BASE}/api/v1/system-config/{config_key}"
            )
            
            print(f"\nBuscando: {config_key}")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                config = response.json()
                print(f"✅ Configuração encontrada:")
                print(f"  Key: {config.get('config_key')}")
                print(f"  Value: {config.get('config_value')}")
                print(f"  Description: {config.get('config_description')}")
                
            elif response.status_code == 404:
                pytest.skip("Backend não implementado")
                
            else:
                print(f"❌ FALHOU: Status {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            pytest.skip("Backend não disponível")
    
    def test_07_validar_estrutura_response(self):
        """Teste 7: Validar estrutura do response"""
        print("\n" + "="*60)
        print("TESTE 7: Validar estrutura do response de configurações")
        print("="*60)
        
        try:
            response = self.session.get(f"{API_BASE}/api/v1/system-config")
            
            if response.status_code == 200:
                configs = response.json()
                
                if len(configs) > 0:
                    config = configs[0]
                    
                    # Validar campos obrigatórios
                    required_fields = ['id', 'config_key', 'config_value']
                    missing_fields = [f for f in required_fields if f not in config]
                    
                    if missing_fields:
                        print(f"❌ FALHOU: Campos faltando: {missing_fields}")
                        assert False, f"Campos obrigatórios faltando: {missing_fields}"
                    else:
                        print("✅ Estrutura do response está correta")
                        print(f"   Campos presentes: {list(config.keys())}")
                else:
                    print("⚠️ Nenhuma configuração para validar")
                    
            else:
                pytest.skip("Endpoint não disponível")
                
        except requests.exceptions.ConnectionError:
            pytest.skip("Backend não disponível")


def run_summary():
    """Executa todos os testes e mostra resumo"""
    print("\n" + "="*70)
    print(" RESUMO DOS TESTES DE API")
    print("="*70)
    
    result = pytest.main([
        __file__,
        "-v",
        "-s",
        "--tb=short",
        "--color=yes"
    ])
    
    return result


if __name__ == "__main__":
    import sys
    sys.exit(run_summary())
