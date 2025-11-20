"""
Teste direto da API do backend para verificar se os endpoints estão funcionando
"""

import requests

BASE_URL = 'http://localhost:8000/api/v1'

print("=" * 70)
print("🧪 TESTE DIRETO DA API DO BACKEND")
print("=" * 70)
print(f"📍 Base URL: {BASE_URL}")
print()

# Teste 1: Potenciais Poluidores
print("1️⃣ Testando GET /referencias/pollution-potentials")
try:
    response = requests.get(f"{BASE_URL}/referencias/pollution-potentials", timeout=5)
    print(f"   Status: {response.status_code}")
    if response.ok:
        data = response.json()
        print(f"   ✅ Sucesso! {len(data)} itens retornados")
        for item in data:
            print(f"      - {item['name']} (ID: {item['id'][:8]}...)")
    else:
        print(f"   ❌ Erro: {response.text}")
except Exception as e:
    print(f"   ❌ Exceção: {e}")

print()

# Teste 2: Tipos de Licença
print("2️⃣ Testando GET /license-types")
try:
    response = requests.get(f"{BASE_URL}/license-types", timeout=5)
    print(f"   Status: {response.status_code}")
    if response.ok:
        data = response.json()
        print(f"   ✅ Sucesso! {len(data)} itens retornados")
        for item in data[:5]:  # Mostrar apenas os 5 primeiros
            print(f"      - {item['abbreviation']} - {item['name']}")
    else:
        print(f"   ❌ Erro: {response.text}")
except Exception as e:
    print(f"   ❌ Exceção: {e}")

print()

# Teste 3: Templates de Documentos
print("3️⃣ Testando GET /document-templates")
try:
    response = requests.get(f"{BASE_URL}/document-templates", timeout=5)
    print(f"   Status: {response.status_code}")
    if response.ok:
        data = response.json()
        print(f"   ✅ Sucesso! {len(data)} itens retornados")
        for item in data[:5]:  # Mostrar apenas os 5 primeiros
            print(f"      - {item['name']}")
    else:
        print(f"   ❌ Erro: {response.text}")
except Exception as e:
    print(f"   ❌ Exceção: {e}")

print()
print("=" * 70)
print("🏁 TESTE CONCLUÍDO")
print("=" * 70)
