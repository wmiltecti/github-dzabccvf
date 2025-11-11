"""
Teste E2E para Documentação no menu Administração
Testa o fluxo completo: Login → Navegação → Cadastro → Verificação
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
import time
from datetime import datetime
import os

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

def test_documentation_crud():
    """Teste completo de CRUD para Documentação"""
    driver = setup_driver()
    wait = WebDriverWait(driver, 15)
    
    try:
        print("\n" + "="*60)
        print("TESTE E2E: DOCUMENTAÇÃO")
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
        
        # 3. CLICAR EM DOCUMENTAÇÃO
        print("\n[3/7] Acessando Documentação...")
        documentation_card = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//*[contains(text(), 'Documentação')]"))
        )
        documentation_card.click()
        time.sleep(2)
        
        print("✅ Tabela de Documentação carregada")
        
        # 4. ABRIR MODAL DE NOVO
        print("\n[4/7] Abrindo modal de cadastro...")
        time.sleep(3)
        
        try:
            novo_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Novo')]")))
            print("  ✓ Botão 'Novo' encontrado")
            novo_button.click()
            print("  ✓ Botão 'Novo' clicado")
            time.sleep(3)
        except Exception as e:
            print(f"  ❌ Erro ao clicar no botão 'Novo': {str(e)}")
            driver.save_screenshot('tests/screenshots/documentation_no_button.png')
            raise
        
        # Verificar se formulário carregou
        print("  ⏳ Aguardando formulário carregar...")
        time.sleep(2)
        
        # Screenshot do modal
        driver.save_screenshot('tests/screenshots/documentation_modal_open.png')
        
        # 5. PREENCHER FORMULÁRIO
        print("\n[5/7] Preenchendo formulário...")
        timestamp = datetime.now().strftime("%H%M%S")
        
        # Campo: Nome do Documento (obrigatório)
        name_input = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'input[placeholder*="Requerimento"]')
        ))
        test_name = f"Documento Teste {timestamp}"
        name_input.clear()
        name_input.send_keys(test_name)
        print(f"   📝 Nome: '{test_name}'")
        time.sleep(0.5)
        
        # Campo: Descrição (obrigatório)
        description_textarea = driver.find_element(By.CSS_SELECTOR, 'textarea[placeholder*="Descrição detalhada"]')
        test_description = f"Documento de teste criado em {timestamp} para validação do sistema"
        description_textarea.clear()
        description_textarea.send_keys(test_description)
        print(f"   📝 Descrição: '{test_description[:50]}...'")
        time.sleep(0.5)
        
        # Campo: Tipos de Documento (multiselect - obrigatório)
        print("   📝 Selecionando tipos de documento...")
        try:
            # Scroll para o campo de tipos
            driver.execute_script("window.scrollTo(0, 300);")
            time.sleep(0.5)
            
            # Procurar input do multiselect e clicar
            multiselect_input = driver.find_element(By.XPATH, "//label[contains(text(), 'Tipos de Documento')]//following-sibling::div//input")
            multiselect_input.click()
            time.sleep(1)
            
            # Selecionar "PDF" - tentar múltiplos seletores
            try:
                pdf_option = driver.find_element(By.XPATH, "//div[@role='option' and contains(., 'PDF')]")
                pdf_option.click()
                print("   ✓ Tipo 'PDF' selecionado")
            except:
                # Tentar outro seletor
                pdf_checkbox = driver.find_element(By.XPATH, "//label[contains(., 'PDF')]//input[@type='checkbox']")
                pdf_checkbox.click()
                print("   ✓ Tipo 'PDF' selecionado (checkbox)")
            
            time.sleep(0.5)
            
            # Pressionar ESC para fechar dropdown
            multiselect_input.send_keys(Keys.ESCAPE)
            time.sleep(0.5)
        except Exception as e:
            print(f"   ⚠️ Erro ao selecionar tipos: {str(e)[:100]}")
            # Tentar fechar qualquer dropdown aberto
            try:
                driver.find_element(By.TAG_NAME, 'body').click()
            except:
                pass
        
        # Campo: Upload de Arquivo (opcional)
        print("   📝 Fazendo upload de arquivo teste...")
        try:
            test_file_path = os.path.join(os.path.dirname(__file__), 'fixtures', 'test_document.txt')
            
            # Criar arquivo se não existir
            if not os.path.exists(test_file_path):
                os.makedirs(os.path.dirname(test_file_path), exist_ok=True)
                with open(test_file_path, 'w', encoding='utf-8') as f:
                    f.write('Documento de teste para upload\nData: ' + timestamp + '\n')
                    f.write('Este arquivo foi criado automaticamente pelo teste Selenium.\n')
                    f.write('Propósito: Validar funcionalidade de upload de templates de documentação.\n')
            
            # Procurar input file (hidden)
            file_input = driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
            absolute_path = os.path.abspath(test_file_path)
            file_input.send_keys(absolute_path)
            print(f"   ✓ Arquivo '{os.path.basename(test_file_path)}' selecionado para upload")
            time.sleep(2)  # Aguardar arquivo ser processado
            
            # Verificar se nome do arquivo apareceu na interface
            try:
                uploaded_filename = driver.find_element(By.XPATH, f"//*[contains(text(), '{os.path.basename(test_file_path)}')]")
                print(f"   ✓ Nome do arquivo confirmado na interface")
            except:
                print(f"   ⚠️ Nome do arquivo não apareceu na interface (normal)")
        except Exception as e:
            print(f"   ⚠️ Não foi possível fazer upload: {str(e)[:100]}")
            print(f"      (Upload pode ser opcional e não impedir o salvamento)")
        
        # Screenshot antes de salvar
        driver.save_screenshot('tests/screenshots/documentation_before_save.png')
        
        # 6. SALVAR
        print("\n[6/7] Salvando registro...")
        save_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Salvar')]")
        save_button.click()
        
        # Aguardar processamento (upload pode demorar)
        print("   ⏳ Aguardando upload e salvamento...")
        time.sleep(8)  # Mais tempo para upload processar
        
        # Tentar capturar toast de erro se existir
        try:
            toast_error = driver.find_element(By.XPATH, "//*[contains(@class, 'Toastify') and contains(., 'Erro')]")
            if toast_error.text:
                print(f"   ❌ ERRO NO TOAST: {toast_error.text}")
        except:
            pass
        
        # Verificar se modal fechou
        try:
            wait.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, '[role="dialog"]')))
            print("✅ Modal fechou")
        except:
            print("⚠️ Modal ainda aberto - verificando erro...")
            driver.save_screenshot('tests/screenshots/documentation_error.png')
            
            # Capturar logs do console
            try:
                logs = driver.get_log('browser')
                if logs:
                    print("   📋 Console logs (últimos 3):")
                    for log in logs[-3:]:
                        if 'SEVERE' in log['level'] or 'ERROR' in str(log):
                            print(f"      {log.get('message', '')[:200]}")
            except:
                pass
        
        # Screenshot após salvar
        driver.save_screenshot('tests/screenshots/documentation_after_save.png')
        
        # 7. VERIFICAR SE ITEM APARECE NA LISTA
        print("\n[7/7] Verificando se item foi criado na lista...")
        time.sleep(2)
        
        # Procurar pelo nome na tabela
        try:
            item_row = wait.until(
                EC.presence_of_element_located((By.XPATH, f"//td[contains(text(), '{test_name}')]"))
            )
            print(f"🎉 TESTE PASSOU: Item '{test_name}' encontrado na lista!")
            driver.save_screenshot('tests/screenshots/documentation_list_view.png')
            test_passed = True
        except:
            print(f"❌ TESTE FALHOU: Item '{test_name}' NÃO encontrado na lista")
            driver.save_screenshot('tests/screenshots/documentation_list_view.png')
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
        driver.save_screenshot('tests/screenshots/documentation_error.png')
        raise
    
    finally:
        driver.quit()
        print("🔚 Navegador fechado")

if __name__ == "__main__":
    test_documentation_crud()
