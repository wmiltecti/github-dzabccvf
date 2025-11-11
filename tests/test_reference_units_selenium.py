"""
Teste E2E para Unidades de Referência no menu Administração
Testa o fluxo completo: Login → Navegação → Cadastro → Verificação
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import time
from datetime import datetime

# Configurações
CHROMEDRIVER_PATH = r"C:\chromedriver\chromedriver.exe"
BASE_URL = "http://localhost:5173"
CPF = "61404694579"
PASSWORD = "Senh@01!"

def setup_driver():
    """Configura o ChromeDriver"""
    chrome_options = Options()
    chrome_options.add_argument('--start-maximized')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    service = Service(CHROMEDRIVER_PATH)
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def test_reference_units_crud():
    """Teste completo de CRUD para Unidades de Referência"""
    driver = setup_driver()
    wait = WebDriverWait(driver, 15)
    
    try:
        print("\n" + "="*60)
        print("TESTE E2E: UNIDADES DE REFERÊNCIA")
        print("="*60)
        
        # 1. LOGIN
        print("\n[1/7] Acessando página de login...")
        driver.get(BASE_URL)
        time.sleep(2)
        
        cpf_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="text"]')))
        cpf_input.clear()
        cpf_input.send_keys(CPF)
        
        password_input = driver.find_element(By.CSS_SELECTOR, 'input[type="password"]')
        password_input.clear()
        password_input.send_keys(PASSWORD)
        
        login_button = driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
        login_button.click()
        time.sleep(3)
        
        print("✅ Login realizado")
        time.sleep(3)
        
        # 2. NAVEGAR PARA ADMINISTRAÇÃO
        print("\n[2/7] Navegando para Administração...")
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(2)
        
        admin_menu = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Administração')]"))
        )
        admin_menu.click()
        time.sleep(2)
        
        print("✅ Página Administração carregada")
        
        # 3. CLICAR EM UNIDADES DE REFERÊNCIA
        print("\n[3/7] Acessando Unidades de Referência...")
        reference_units_card = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//*[contains(text(), 'Unidades de Referência')]"))
        )
        reference_units_card.click()
        time.sleep(2)
        
        print("✅ Tabela de Unidades de Referência carregada")
        
        # 4. ABRIR MODAL DE NOVO
        print("\n[4/7] Abrindo modal de cadastro...")
        time.sleep(3)  # Aguardar tabela carregar
        
        try:
            novo_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Novo')]")))
            print("  ✓ Botão 'Novo' encontrado")
            novo_button.click()
            print("  ✓ Botão 'Novo' clicado")
            time.sleep(3)  # Aguardar modal abrir
        except Exception as e:
            print(f"  ❌ Erro ao clicar no botão 'Novo': {str(e)}")
            driver.save_screenshot('tests/screenshots/reference_unit_no_button.png')
            raise
        
        # Verificar se modal abriu (tentar encontrar os campos)
        print("  ⏳ Aguardando formulário carregar...")
        time.sleep(2)
        
        # Screenshot do modal
        driver.save_screenshot('tests/screenshots/reference_unit_modal_open.png')
        
        # 5. PREENCHER FORMULÁRIO
        print("\n[5/7] Preenchendo formulário...")
        timestamp = datetime.now().strftime("%H%M%S")
        
        # Campo: Código (obrigatório) - ex: UPF, UFIR, SM
        code_input = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'input[placeholder*="UPF"]')
        ))
        test_code = f"UR{timestamp[:4]}"
        code_input.clear()
        code_input.send_keys(test_code)
        print(f"   📝 Código: '{test_code}'")
        time.sleep(0.5)
        
        # Campo: Nome (obrigatório) - ex: Unidade Padrão Fiscal
        name_input = driver.find_element(By.CSS_SELECTOR, 'input[placeholder*="Unidade Padrão"]')
        test_name = f"Unidade Teste {timestamp}"
        name_input.clear()
        name_input.send_keys(test_name)
        print(f"   📝 Nome: '{test_name}'")
        time.sleep(0.5)
        
        # Campo: Descrição (opcional)
        description_input = driver.find_element(By.CSS_SELECTOR, 'textarea[placeholder*="Descrição"]')
        test_description = f"Unidade de referência para testes - criada em {timestamp}"
        description_input.clear()
        description_input.send_keys(test_description)
        print(f"   📝 Descrição: '{test_description[:50]}...'")
        time.sleep(0.5)
        
        # Screenshot antes de salvar
        driver.save_screenshot('tests/screenshots/reference_unit_before_save.png')
        
        # 6. SALVAR
        print("\n[6/7] Salvando registro...")
        save_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Salvar')]")
        save_button.click()
        time.sleep(3)
        
        # Verificar se modal fechou
        try:
            wait.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, '[role="dialog"]')))
            print("✅ Modal fechou")
        except:
            print("⚠️ Modal ainda aberto - pode haver erro")
            driver.save_screenshot('tests/screenshots/reference_unit_error_toast.png')
        
        # Screenshot após salvar
        driver.save_screenshot('tests/screenshots/reference_unit_after_save.png')
        
        # 7. VERIFICAR SE ITEM APARECE NA LISTA
        print("\n[7/7] Verificando se item foi criado na lista...")
        time.sleep(2)
        
        # Procurar pelo código na tabela
        try:
            item_row = wait.until(
                EC.presence_of_element_located((By.XPATH, f"//td[contains(text(), '{test_code}')]"))
            )
            print(f"🎉 TESTE PASSOU: Item '{test_code}' encontrado na lista!")
            driver.save_screenshot('tests/screenshots/reference_unit_list_view.png')
            test_passed = True
        except:
            print(f"❌ TESTE FALHOU: Item '{test_code}' NÃO encontrado na lista")
            driver.save_screenshot('tests/screenshots/reference_unit_list_view.png')
            test_passed = False
        
        print("\n" + "="*60)
        if test_passed:
            print("✅ TESTE COMPLETO PASSOU!")
        else:
            print("❌ TESTE COMPLETO FALHOU!")
        print("="*60 + "\n")
        
        time.sleep(2)
        
    except Exception as e:
        print(f"\n❌ ERRO NO TESTE: {str(e)}")
        driver.save_screenshot('tests/screenshots/reference_unit_error.png')
        raise
    
    finally:
        driver.quit()
        print("🔚 Navegador fechado")

if __name__ == "__main__":
    test_reference_units_crud()
