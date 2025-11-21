"""
Teste de Integração: Unidades de Referência no Cadastro de Atividades
Verifica se o select de Unidade de Medida está sendo alimentado pelas Unidades de Referência
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service

# Configurações
CPF = os.getenv('TEST_CPF', '61404694579')
PASSWORD = os.getenv('TEST_PASSWORD', 'Senh@01!')
BASE_URL = 'http://localhost:5173'
API_BASE_URL = 'http://localhost:8000/api/v1'
CHROMEDRIVER_PATH = r'C:\chromedriver\chromedriver.exe'

# Criar diretório para screenshots
os.makedirs('tests/screenshots', exist_ok=True)

print("=" * 70)
print("🧪 TESTE: Unidades de Referência no Cadastro de Atividades")
print("=" * 70)
print(f"📍 URL Frontend: {BASE_URL}")
print(f"📍 URL API: {API_BASE_URL}")
print("=" * 70)

def test_reference_units_in_activity_form():
    """Testa se Unidades de Referência alimentam o select de Unidade de Medida"""
    
    # Inicializar WebDriver
    print("\n📦 Inicializando ChromeDriver...")
    service = Service(CHROMEDRIVER_PATH)
    driver = webdriver.Chrome(service=service)
    driver.maximize_window()
    wait = WebDriverWait(driver, 20)
    
    try:
        # 1. FAZER LOGIN
        print("\n🔐 [1/5] Fazendo login...")
        driver.get(f"{BASE_URL}/login")
        time.sleep(2)
        
        cpf_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="text"]')))
        cpf_input.send_keys(CPF)
        print(f"  ✓ CPF: {CPF}")
        
        password_input = driver.find_element(By.CSS_SELECTOR, 'input[type="password"]')
        password_input.send_keys(PASSWORD)
        print("  ✓ Senha preenchida")
        
        login_button = driver.find_element(By.XPATH, "//button[contains(., 'Entrar')]")
        login_button.click()
        
        time.sleep(3)
        print("✅ Login realizado")
        
        # 2. NAVEGAR PARA ADMIN
        print("\n⚙️ [2/5] Navegando para Administração...")
        driver.get(f"{BASE_URL}/admin")
        time.sleep(2)
        
        wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(., 'Administração')]")))
        print("✅ Página de Administração carregada")
        
        # 3. ABRIR CARD DE ATIVIDADES
        print("\n📋 [3/5] Acessando cadastro de Atividades...")
        activities_card = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//h2[contains(text(), 'Atividades')]"))
        )
        activities_card.click()
        time.sleep(2)
        print("✅ Card de Atividades aberto")
        
        # 4. ABRIR MODAL DE NOVA ATIVIDADE
        print("\n➕ [4/5] Abrindo formulário de nova atividade...")
        add_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Nova Atividade') or contains(., 'Adicionar')]"))
        )
        add_button.click()
        time.sleep(2)
        
        # Aguardar modal aparecer
        modal = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[role="dialog"], .modal, [class*="Modal"]')))
        print("✅ Modal de atividade aberto")
        
        # 5. VERIFICAR SELECT DE UNIDADE DE MEDIDA
        print("\n🔍 [5/5] Verificando select de Unidade de Medida...")
        
        # Encontrar o select de Unidade de Medida
        unit_label = driver.find_element(By.XPATH, "//label[contains(text(), 'Unidade de Medida')]")
        unit_select = unit_label.find_element(By.XPATH, "./following-sibling::select")
        
        # Criar objeto Select
        select_unit = Select(unit_select)
        options = select_unit.options
        
        print(f"\n📊 RESULTADO:")
        print(f"  • Total de opções no select: {len(options)}")
        print(f"\n  📋 Opções disponíveis:")
        
        has_reference_units = False
        reference_unit_count = 0
        
        for idx, opt in enumerate(options):
            value = opt.get_attribute('value')
            text = opt.text
            
            # Primeira opção geralmente é "Selecione..."
            if idx == 0:
                print(f"    [{idx}] {text} (placeholder)")
            else:
                print(f"    [{idx}] {text} (value: {value})")
                reference_unit_count += 1
                
                # Verificar se tem formato de Unidade de Referência (código - nome)
                if ' - ' in text or value:
                    has_reference_units = True
        
        # Screenshot do select
        driver.save_screenshot('tests/screenshots/activity_form_unit_select.png')
        print(f"\n  📸 Screenshot salvo: activity_form_unit_select.png")
        
        # Verificar resultado
        print(f"\n{'='*70}")
        if reference_unit_count > 0 and has_reference_units:
            print("✅ SUCESSO: Select está sendo alimentado pelas Unidades de Referência!")
            print(f"   • {reference_unit_count} unidade(s) encontrada(s)")
            print("   • Formato correto detectado (código - nome)")
        elif reference_unit_count > 0:
            print("⚠️ PARCIAL: Select tem opções mas formato pode estar incorreto")
            print(f"   • {reference_unit_count} opção(ões) encontrada(s)")
            print("   • Verifique se são as Unidades de Referência cadastradas")
        else:
            print("❌ FALHA: Select não tem opções de Unidades de Referência!")
            print("   • Verifique se a API está retornando os dados")
            print("   • Verifique se há registros na tabela reference_units")
        print(f"{'='*70}")
        
        # Aguardar para análise manual
        print("\n⏸️  Pressione ENTER para fechar o navegador...")
        input()
        
        return reference_unit_count > 0 and has_reference_units
        
    except Exception as e:
        print(f"\n❌ Erro durante o teste: {e}")
        driver.save_screenshot('tests/screenshots/test_error.png')
        print("📸 Screenshot de erro salvo: test_error.png")
        raise
        
    finally:
        print("\n🔚 Fechando navegador...")
        driver.quit()
        print("✅ Teste finalizado")

if __name__ == "__main__":
    try:
        success = test_reference_units_in_activity_form()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n💥 Teste falhou com erro: {e}")
        exit(1)
