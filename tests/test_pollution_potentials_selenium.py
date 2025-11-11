"""
Teste E2E completo para cadastro de Potencial Poluidor
Preenche TODOS os campos: nome, descrição
"""

import os
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from dotenv import load_dotenv

# Criar diretório para screenshots se não existir
os.makedirs('tests/screenshots', exist_ok=True)

# Carregar variáveis de ambiente
load_dotenv()

# Configurações
CPF = os.getenv('TEST_CPF', '61404694579')
PASSWORD = os.getenv('TEST_PASSWORD', 'Senh@01!')
BASE_URL = os.getenv('BASE_URL', 'http://localhost:5173')
CHROMEDRIVER_PATH = r'C:\chromedriver\chromedriver.exe'

print(f"👤 CPF: {CPF}")
print(f"🔗 URL: {BASE_URL}")
print("=" * 70)
print("🧪 TESTE COMPLETO: Cadastro de Potencial Poluidor")
print("=" * 70)

# Configurar ChromeDriver
service = Service(executable_path=CHROMEDRIVER_PATH)
options = webdriver.ChromeOptions()
options.add_argument('--start-maximized')
options.add_argument('--disable-blink-features=AutomationControlled')

print("\n📦 Inicializando ChromeDriver...")
driver = webdriver.Chrome(service=service, options=options)
wait = WebDriverWait(driver, 10)
print("✅ ChromeDriver iniciado com sucesso")

try:
    # 1. FAZER LOGIN
    print(f"\n🔐 PASSO 1: Fazendo login em {BASE_URL}")
    driver.get(BASE_URL)
    print("  ✓ Página carregada")
    
    time.sleep(2)
    
    # Preencher CPF
    cpf_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="text"]')))
    cpf_input.clear()
    cpf_input.send_keys(CPF)
    print(f"  ✓ CPF preenchido: {CPF}")
    
    # Preencher senha
    password_input = driver.find_element(By.CSS_SELECTOR, 'input[type="password"]')
    password_input.clear()
    password_input.send_keys(PASSWORD)
    print("  ✓ Senha preenchida")
    
    # Clicar em Login
    login_button = driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
    login_button.click()
    print("  ✓ Login clicado")
    
    time.sleep(5)
    print(f"  ✓ URL após login: {driver.current_url}")
    
    # 2. NAVEGAR PARA ADMINISTRAÇÃO
    print("\n📂 PASSO 2: Navegando para Administração")
    driver.get(f"{BASE_URL}/dashboard")
    time.sleep(3)
    
    admin_menu = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Administração')]"))
    )
    admin_menu.click()
    print("  ✅ Menu Administração aberto")
    time.sleep(1)
    
    # 3. ACESSAR POTENCIAL POLUIDOR
    print("\n📋 PASSO 3: Acessando Potencial Poluidor")
    pollution_button = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Potencial Poluidor')]"))
    )
    pollution_button.click()
    print("  ✅ Potencial Poluidor selecionado")
    time.sleep(2)
    
    # 4. CLICAR EM NOVO
    print("\n➕ PASSO 4: Clicando em 'Novo'")
    new_button = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Novo')]"))
    )
    new_button.click()
    print("  ✅ Modal de criação aberto")
    time.sleep(2)
    
    # 5. PREENCHER TODOS OS CAMPOS
    print("\n📝 PASSO 5: Preenchendo TODOS os campos do formulário")
    timestamp = datetime.now().strftime("%H%M%S")
    test_name = f"Potencial Teste {timestamp}"
    test_description = f"Descrição do potencial poluidor criado em teste às {timestamp}"
    
    time.sleep(1)
    
    # Campo 1: NOME (obrigatório)
    print("  1️⃣ Preenchendo NOME...")
    try:
        name_input = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'input[placeholder*="Baixo, Médio, Alto"]')
        ))
        name_input.clear()
        time.sleep(0.3)
        name_input.send_keys(test_name)
        print(f"     ✅ Nome: '{test_name}'")
    except Exception as e:
        print(f"     ❌ Erro: {e}")
    
    # Campo 2: DESCRIÇÃO (opcional, textarea)
    print("  2️⃣ Preenchendo DESCRIÇÃO...")
    try:
        desc_input = driver.find_element(By.CSS_SELECTOR, 'textarea')
        desc_input.clear()
        time.sleep(0.3)
        desc_input.send_keys(test_description)
        print(f"     ✅ Descrição preenchida")
    except Exception as e:
        print(f"     ⚠️ Campo descrição não encontrado: {e}")
    
    print("\n  ✅ Todos os campos preenchidos!")
    time.sleep(0.5)
    
    # Screenshot ANTES de salvar
    driver.save_screenshot('tests/screenshots/pollution_before_save.png')
    print("  📸 Screenshot salvo: pollution_before_save.png")
    
    # 6. SALVAR
    print("\n💾 PASSO 6: Salvando...")
    save_button = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Salvar')]"))
    )
    save_button.click()
    print("  ✓ Botão Salvar clicado")
    
    # Aguardar processamento
    time.sleep(2)
    
    # 7. VERIFICAR RESULTADO
    print("\n🔍 PASSO 7: Verificando resultado...")
    
    # Capturar logs do console
    logs = driver.get_log('browser')
    has_error = False
    print("  📋 Verificando console do navegador...")
    for log in logs[-15:]:  # Últimos 15 logs
        msg = log.get('message', '')
        
        if 'Insert error' in msg or 'Error saving' in msg:
            print(f"  ❌ ERRO: {msg[:300]}")
            has_error = True
        elif '400' in msg and 'pollution_potentials' in msg:
            print(f"  ❌ HTTP 400: {msg[:300]}")
            has_error = True
    
    # Verificar toast
    time.sleep(2)
    toast_text = None
    try:
        toast = driver.find_element(By.CSS_SELECTOR, '.Toastify__toast')
        toast_text = toast.text
        print(f"  📬 Toast: {toast_text}")
        
        if 'Erro' in toast_text or 'erro' in toast_text.lower():
            print("  ❌ ERRO DETECTADO NO TOAST!")
            driver.save_screenshot('tests/screenshots/pollution_error_toast.png')
            has_error = True
        elif 'sucesso' in toast_text.lower():
            print("  ✅ Toast de sucesso!")
    except:
        print("  ℹ️ Nenhum toast visível")
    
    # Verificar se modal fechou
    time.sleep(1)
    try:
        driver.find_element(By.XPATH, "//h2[contains(., 'Novo')]")
        print("  ⚠️ Modal ainda aberto")
        driver.save_screenshot('tests/screenshots/pollution_modal_open.png')
    except:
        print("  ✅ Modal fechou")
    
    # Screenshot final
    driver.save_screenshot('tests/screenshots/pollution_after_save.png')
    print("  📸 Screenshot final salvo: pollution_after_save.png")
    
    # Verificar se item apareceu na lista
    time.sleep(2)
    try:
        item_row = driver.find_element(By.XPATH, f"//td[contains(text(), '{test_name}')]")
        print(f"\n🎉 TESTE PASSOU: Item '{test_name}' encontrado na lista!")
        success = True
    except:
        print(f"\n❌ TESTE FALHOU: Item '{test_name}' NÃO encontrado na lista")
        driver.save_screenshot('tests/screenshots/pollution_list_view.png')
        success = False
    
    # RESULTADO FINAL
    print("\n" + "=" * 70)
    if success and not has_error:
        print("✅ TESTE COMPLETO PASSOU!")
        print(f"   Potencial Poluidor criado: {test_name}")
    else:
        print("❌ TESTE FALHOU!")
        if has_error:
            print("   Motivo: Erros detectados no console/toast")
        else:
            print("   Motivo: Item não apareceu na lista")
    print("=" * 70)
    
    time.sleep(3)

except Exception as e:
    print(f"\n❌ ERRO DURANTE TESTE: {e}")
    driver.save_screenshot('tests/screenshots/pollution_exception_error.png')
    import traceback
    traceback.print_exc()

finally:
    print("\n🔚 Fechando navegador...")
    driver.quit()
    print("✅ Navegador fechado")
