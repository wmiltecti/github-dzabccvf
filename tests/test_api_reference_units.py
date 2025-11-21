"""
Teste Rápido: Validação do Endpoint de Unidades de Medida
Verifica se o endpoint está retornando dados corretamente
"""

import requests
import os

API_BASE_URL = os.getenv('VITE_API_BASE_URL', 'http://localhost:8000/api/v1')
ENDPOINT = f"{API_BASE_URL}/referencias/unidades-medida"

print("=" * 70)
print("🧪 TESTE: Endpoint de Unidades de Medida")
print("=" * 70)
print(f"📍 API URL: {API_BASE_URL}")
print(f"📍 Endpoint: {ENDPOINT}")
print("=" * 70)

def test_endpoint():
    """Testa se o endpoint está funcionando"""
    
    try:
        print("\n📡 [1/2] Fazendo requisição GET com is_active=true...")
        response = requests.get(f"{ENDPOINT}?is_active=true", timeout=10)
        
        print(f"  ✓ Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✓ Dados recebidos: {len(data)} unidade(s)")
            
            if len(data) > 0:
                print(f"\n📋 [2/2] Estrutura dos dados:")
                print(f"\n  Primeira unidade:")
                first = data[0]
                print(f"    • ID: {first.get('id', 'N/A')}")
                print(f"    • Código: {first.get('code', 'N/A')}")
                print(f"    • Nome: {first.get('name', 'N/A')}")
                print(f"    • Descrição: {first.get('description', 'N/A')[:50]}..." if first.get('description') else "    • Descrição: N/A")
                print(f"    • Ativo: {first.get('is_active', 'N/A')}")
                
                print(f"\n  📊 Todas as unidades disponíveis:")
                for idx, unit in enumerate(data, 1):
                    print(f"    {idx}. {unit.get('code', '?')} - {unit.get('name', '?')}")
                
                print(f"\n{'='*70}")
                print("✅ SUCESSO: Endpoint funcionando corretamente!")
                print(f"   • {len(data)} unidade(s) de medida disponível(is)")
                print("   • Formato dos dados está correto")
                print("   • Frontend poderá popular o select sem problemas")
                print(f"{'='*70}")
                return True
            else:
                print(f"\n{'='*70}")
                print("⚠️ ATENÇÃO: Endpoint funcionando mas sem dados!")
                print("   • Endpoint retorna 200 OK")
                print("   • Mas lista está vazia")
                print("   • Cadastre Unidades de Referência via Admin")
                print(f"{'='*70}")
                return False
        elif response.status_code == 404:
            print(f"\n{'='*70}")
            print("❌ ERRO: Endpoint não encontrado!")
            print("   • Verifique se o backend está rodando")
            print("   • Confirme a URL da API no .env")
            print(f"   • URL tentada: {ENDPOINT}")
            print(f"{'='*70}")
            return False
        else:
            print(f"\n{'='*70}")
            print(f"❌ ERRO: Status inesperado {response.status_code}")
            print(f"   • Response: {response.text[:200]}")
            print(f"{'='*70}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"\n{'='*70}")
        print("❌ ERRO: Não foi possível conectar à API!")
        print("   • Verifique se o backend está rodando")
        print(f"   • URL: {API_BASE_URL}")
        print("   • Execute: uvicorn app.main:app --reload")
        print(f"{'='*70}")
        return False
    except requests.exceptions.Timeout:
        print(f"\n{'='*70}")
        print("❌ ERRO: Timeout na requisição!")
        print("   • Backend demorou muito para responder")
        print(f"{'='*70}")
        return False
    except Exception as e:
        print(f"\n{'='*70}")
        print(f"❌ ERRO INESPERADO: {e}")
        print(f"{'='*70}")
        return False

if __name__ == "__main__":
    try:
        success = test_endpoint()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n💥 Teste falhou: {e}")
        exit(1)
