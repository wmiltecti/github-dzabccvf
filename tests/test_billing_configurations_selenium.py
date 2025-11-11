# Teste Automatizado - Configuração de Cobrança
# Testa cadastro básico de configuração de cobrança

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
import time
import os
from datetime import datetime
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurações
BASE_URL = os.getenv('TEST_BASE_URL', 'http://localhost:5173')
ADMIN_CPF = '61404694579'
ADMIN_PASSWORD = 'Senh@01!'

print("="*60)
print("TESTE E2E: CONFIGURAÇÃO DE COBRANÇA")
print("="*60)

# Configurar Chrome
chrome_options = Options()
chrome_options.add_argument('--start-maximized')
chrome_options.add_argument('--disable-gpu')

driver_path = r'C:\chromedriver\chromedriver.exe'
service = Service(executable_path=driver_path)
driver = webdriver.Chrome(service=service, options=chrome_options)
driver.implicitly_wait(10)
wait = WebDriverWait(driver, 20)

try:
    # 1. LOGIN
    print("\n[1/7] Acessando página de login...")
    print(f"  🔗 URL: {BASE_URL}/login")
    driver.get(f"{BASE_URL}/login")
    time.sleep(2)
    print(f"  📍 Página carregada: {driver.current_url}")
    
    print("  ⏳ Aguardando campos de login...")
    cpf_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="text"]')))
    print("  ✓ Campo CPF encontrado")
    password_input = driver.find_element(By.CSS_SELECTOR, 'input[type="password"]')
    print("  ✓ Campo senha encontrado")
    submit_button = driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
    print("  ✓ Botão submit encontrado")
    
    print(f"  📝 Preenchendo CPF: {ADMIN_CPF}")
    cpf_input.clear()
    cpf_input.send_keys(ADMIN_CPF)
    
    print("  📝 Preenchendo senha")
    password_input.clear()
    password_input.send_keys(ADMIN_PASSWORD)
    
    print("  🖱️ Clicando em Login")
    submit_button.click()
    
    print("  ⏳ Aguardando redirecionamento...")
    time.sleep(3)
    print(f"  📍 URL após login: {driver.current_url}")
    
    # Aceitar tanto /dashboard quanto / (raiz)
    if '/login' not in driver.current_url:
        print("✅ Login realizado")
    else:
        print("⚠️ Ainda na página de login")
    time.sleep(2)
    
    # 2. NAVEGAR PARA ADMINISTRAÇÃO
    print("\n[2/7] Navegando para Administração...")
    admin_menu = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Administração')]"))
    )
    admin_menu.click()
    time.sleep(1)
    print("✅ Página Administração carregada")
    
    # 3. CLICAR EM CONFIGURAÇÃO DE COBRANÇA
    print("\n[3/7] Acessando Configuração de Cobrança...")
    billing_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Configuração de Cobrança')]"))
    )
    billing_btn.click()
    time.sleep(2)
    print("✅ Tabela de Configuração de Cobrança carregada")
    
    # 4. ABRIR MODAL
    print("\n[4/7] Abrindo modal de cadastro...")
    novo_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Novo')]"))
    )
    print("  ✓ Botão 'Novo' encontrado")
    novo_btn.click()
    print("  ✓ Botão 'Novo' clicado")
    time.sleep(2)
    print("  ⏳ Aguardando formulário carregar...")
    time.sleep(1)
    
    # 5. PREENCHER FORMULÁRIO (apenas campos obrigatórios)
    print("\n[5/7] Preenchendo formulário...")
    timestamp = datetime.now().strftime("%H%M%S")
    
    # Campo: Atividade (select - obrigatório)
    print("   📝 Selecionando Atividade...")
    time.sleep(2)  # Aguardar carregamento das options
    activity_select = wait.until(
        EC.presence_of_element_located((By.XPATH, "//label[contains(., 'Atividade')]/following-sibling::select | //label[contains(., 'Atividade')]/..//select"))
    )
    # Pegar todas as options e selecionar a segunda (primeira após o placeholder)
    from selenium.webdriver.support.ui import Select
    activity_dropdown = Select(activity_select)
    print(f"   ℹ️ Total de options no select Atividade: {len(activity_dropdown.options)}")
    for idx, opt in enumerate(activity_dropdown.options):
        print(f"      [{idx}] value='{opt.get_attribute('value')}' text='{opt.text}'")
    if len(activity_dropdown.options) > 1:
        activity_dropdown.select_by_index(1)
        selected_activity = activity_dropdown.first_selected_option.text
        print(f"   ✓ Atividade selecionada: {selected_activity}")
    else:
        print("   ⚠️ Nenhuma atividade disponível!")
    
    # Campo: Tipo de Licença (select - obrigatório)
    print("   📝 Selecionando Tipo de Licença...")
    license_select = driver.find_element(By.XPATH, "//label[contains(., 'Tipo de Licença')]/following-sibling::select | //label[contains(., 'Tipo de Licença')]/..//select")
    license_dropdown = Select(license_select)
    if len(license_dropdown.options) > 1:
        license_dropdown.select_by_index(1)
        selected_license = license_dropdown.first_selected_option.text
        print(f"   ✓ Tipo de Licença selecionado: {selected_license}")
    else:
        print("   ⚠️ Nenhum tipo de licença disponível!")
    
    # Campo: Unidade de Referência (select - obrigatório)
    print("   📝 Selecionando Unidade de Referência...")
    unit_select = driver.find_element(By.XPATH, "//label[contains(., 'Unidade de Referência')]/following-sibling::select | //label[contains(., 'Unidade de Referência')]/..//select")
    unit_dropdown = Select(unit_select)
    if len(unit_dropdown.options) > 1:
        unit_dropdown.select_by_index(1)
        selected_unit = unit_dropdown.first_selected_option.text
        print(f"   ✓ Unidade de Referência selecionada: {selected_unit}")
    else:
        print("   ⚠️ Nenhuma unidade disponível!")
    
    # Campo: Valor Base (decimal - obrigatório)
    print("   📝 Valor Base...")
    valor_input = driver.find_element(By.XPATH, "//label[contains(., 'Valor Base')]/following-sibling::input | //label[contains(., 'Valor Base')]/..//input")
    valor_input.clear()
    valor_input.send_keys("150.50")
    print("   ✓ Valor Base: R$ 150.50")
    
    # 6. SALVAR
    print("\n[6/7] Salvando registro...")
    salvar_btn = driver.find_element(By.XPATH, "//button[contains(., 'Salvar')]")
    salvar_btn.click()
    print("   ⏳ Aguardando processamento...")
    time.sleep(2)
    
    # Verificar se há toast (sucesso ou erro)
    try:
        toast = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(@class, 'Toastify')]")))
        toast_text = toast.text
        print(f"   📬 TOAST: {toast_text}")
        if "Erro" in toast_text or "erro" in toast_text:
            print(f"   ❌ ERRO NO TOAST: {toast_text}")
    except:
        print("   ⚠️ Nenhum toast exibido")
    
    time.sleep(3)
    
    # Verificar se modal fechou
    try:
        modal = driver.find_element(By.XPATH, "//div[contains(@class, 'fixed') and contains(@class, 'inset-0')]")
        if modal.is_displayed():
            print("   ⚠️ Modal ainda aberto")
        else:
            print("   ✅ Modal fechou")
    except:
        print("   ✅ Modal fechou")
    
    # 7. VERIFICAR NA LISTA
    print("\n[7/7] Verificando se item foi criado na lista...")
    time.sleep(2)
    
    # Buscar por "150.50" ou "R$ 150,50" na tabela
    try:
        item_na_lista = driver.find_element(By.XPATH, "//td[contains(text(), '150') and (contains(text(), '50') or contains(text(), ',50'))]")
        if item_na_lista.is_displayed():
            print("🎉 TESTE PASSOU: Configuração criada com valor R$ 150,50 encontrada na lista!")
            print("\n" + "="*60)
            print("✅ TESTE COMPLETO PASSOU!")
            print("="*60)
        else:
            print("❌ Item não visível na lista")
    except Exception as e:
        print(f"❌ TESTE FALHOU: Item não encontrado na lista")
        print(f"   Erro: {str(e)}")
        
        # Capturar logs
        try:
            print("\n📋 Todos os logs do console (últimos 10):")
            logs = driver.get_log('browser')
            for log in logs[-10:]:
                print(f"   [{log['level']}] {log['message'][:200]}")
        except:
            pass
    
    time.sleep(3)
    
except Exception as e:
    print(f"\n❌ ERRO DURANTE O TESTE: {str(e)}")
    
    # Screenshot de erro
    try:
        screenshot_dir = "tests/screenshots"
        os.makedirs(screenshot_dir, exist_ok=True)
        screenshot_path = f"{screenshot_dir}/billing_error_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        driver.save_screenshot(screenshot_path)
        print(f"📸 Screenshot: {screenshot_path}")
    except:
        pass

finally:
    print("\n🔚 Navegador fechado")
    driver.quit()
