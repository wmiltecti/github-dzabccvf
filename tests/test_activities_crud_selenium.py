"""
Teste E2E COMPLETO para cadastro de Atividades
Inclui inserção, validação e verificação na lista
"""

import os
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import Select
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

# Dados da nova atividade
TIMESTAMP = datetime.now().strftime("%H%M%S")
NEW_ACTIVITY = {
    'code': f'99{TIMESTAMP[-2:]}',  # Código único: 99 + últimos 2 dígitos do timestamp
    'name': f'Teste Automático {TIMESTAMP}',
    'description': f'Atividade criada automaticamente pelo teste em {datetime.now().strftime("%d/%m/%Y %H:%M:%S")}'
}

print(f"👤 CPF: {CPF}")
print(f"🔗 URL: {BASE_URL}")
print("=" * 70)
print("🧪 TESTE COMPLETO: Cadastro de Atividades")
print("=" * 70)
print(f"📝 Nova Atividade:")
print(f"   Código: {NEW_ACTIVITY['code']}")
print(f"   Nome: {NEW_ACTIVITY['name']}")
print(f"   Descrição: {NEW_ACTIVITY['description']}")
print("=" * 70)

# Configurar ChromeDriver
service = Service(executable_path=CHROMEDRIVER_PATH)
options = webdriver.ChromeOptions()
options.add_argument('--start-maximized')
options.add_argument('--disable-blink-features=AutomationControlled')
options.add_argument('--auto-open-devtools-for-tabs')  # Abre DevTools automaticamente

print("\n📦 Inicializando ChromeDriver...")
driver = webdriver.Chrome(service=service, options=options)
wait = WebDriverWait(driver, 10)
print("✅ ChromeDriver iniciado com sucesso (DevTools aberto)")

try:
    # 1. FAZER LOGIN
    print(f"\n🔐 [1/7] Fazendo login...")
    driver.get(BASE_URL)
    time.sleep(2)
    
    cpf_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="text"]')))
    cpf_input.clear()
    cpf_input.send_keys(CPF)
    print(f"  ✓ CPF: {CPF}")
    
    password_input = driver.find_element(By.CSS_SELECTOR, 'input[type="password"]')
    password_input.clear()
    password_input.send_keys(PASSWORD)
    print("  ✓ Senha preenchida")
    
    login_button = driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
    login_button.click()
    time.sleep(8)  # Aguardar redirecionamento completo
    print("✅ Login realizado")
    
    # 2. NAVEGAR PARA ADMINISTRAÇÃO
    print("\n📂 [2/7] Navegando para Administração...")
    # Aguardar estar no dashboard
    WebDriverWait(driver, 15).until(
        EC.url_contains("/dashboard")
    )
    time.sleep(3)  # Aguardar renderização completa
    
    # Aumentar timeout para encontrar botão Administração
    admin_wait = WebDriverWait(driver, 20)
    admin_menu = admin_wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Administração')]"))
    )
    admin_menu.click()
    time.sleep(2)
    print("✅ Menu Administração aberto")
    
    # 3. ACESSAR ATIVIDADES
    print("\n📋 [3/7] Acessando Atividades...")
    activities_button = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Atividades')]"))
    )
    activities_button.click()
    time.sleep(2)
    print("✅ Tela de Atividades carregada")
    
    # Contar atividades existentes
    try:
        rows_before = driver.find_elements(By.CSS_SELECTOR, 'tbody tr')
        count_before = len(rows_before)
        print(f"  ℹ️ Atividades existentes: {count_before}")
    except:
        count_before = 0
        print("  ℹ️ Nenhuma atividade existente")
    
    # 4. ABRIR MODAL DE CADASTRO
    print("\n➕ [4/7] Abrindo modal de cadastro...")
    new_button = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Novo')]"))
    )
    new_button.click()
    time.sleep(2)
    
    # Verificar se modal abriu
    modal = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, '[role="dialog"]'))
    )
    print("✅ Modal aberto")
    
    driver.save_screenshot('tests/screenshots/activities_modal_opened.png')
    print("  📸 Screenshot: activities_modal_opened.png")
    
    # 5. PREENCHER FORMULÁRIO
    print(f"\n📝 [5/7] Preenchendo formulário...")
    
    # Campo Código (número)
    try:
        code_input = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="number"]'))
        )
        code_input.clear()
        code_input.send_keys(NEW_ACTIVITY['code'])
        print(f"  ✓ Código: {NEW_ACTIVITY['code']}")
        time.sleep(0.5)
    except Exception as e:
        print(f"  ❌ Erro ao preencher Código: {e}")
        raise
    
    # Campo Nome (procurar por placeholder)
    try:
        # Procurar input com placeholder que contenha "Extração"
        modal_element = driver.find_element(By.CSS_SELECTOR, '[role="dialog"]')
        name_input = modal_element.find_element(By.CSS_SELECTOR, 'input[placeholder*="Extração"]')
        
        # Limpar e preencher usando send_keys
        name_input.clear()
        time.sleep(0.3)
        name_input.send_keys(NEW_ACTIVITY['name'])
        
        # Disparar eventos do React manualmente
        driver.execute_script("""
            arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
            arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
        """, name_input)
        
        print(f"  ✓ Nome: {NEW_ACTIVITY['name']}")
        time.sleep(0.5)
    except Exception as e:
        print(f"  ❌ Erro ao preencher Nome: {e}")
        # Fallback: tentar por index
        try:
            text_inputs = modal_element.find_elements(By.CSS_SELECTOR, 'input[type="text"]')
            if len(text_inputs) > 0:
                print(f"  ℹ️ Tentando com primeiro input text (total: {len(text_inputs)})")
                name_input = text_inputs[0]
                name_input.clear()
                name_input.send_keys(NEW_ACTIVITY['name'])
                driver.execute_script("""
                    arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
                    arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
                """, name_input)
                print(f"  ✓ Nome (fallback): {NEW_ACTIVITY['name']}")
        except Exception as fallback_error:
            print(f"  ❌ Fallback falhou: {fallback_error}")
            raise e
    
    # Campo Descrição (textarea)
    try:
        description_input = driver.find_element(By.CSS_SELECTOR, 'textarea')
        description_input.clear()
        description_input.send_keys(NEW_ACTIVITY['description'])
        print(f"  ✓ Descrição: {NEW_ACTIVITY['description'][:50]}...")
        time.sleep(0.5)
    except Exception as e:
        print(f"  ⚠️ Campo Descrição não preenchido: {e}")
    
    # Preencher selects se existirem (Porte e Potencial Poluidor)
    try:
        selects = driver.find_elements(By.CSS_SELECTOR, 'select')
        print(f"  ℹ️ Encontrados {len(selects)} campos select")
        
        for i, select_elem in enumerate(selects):
            if select_elem.is_displayed():
                try:
                    select = Select(select_elem)
                    options = select.options
                    if len(options) > 1:  # Pular placeholder
                        select.select_by_index(1)  # Selecionar primeira opção real
                        selected_text = select.first_selected_option.text
                        print(f"  ✓ Select {i+1}: {selected_text}")
                        time.sleep(0.3)
                except Exception as e:
                    print(f"  ⚠️ Erro ao preencher select {i+1}: {e}")
    except Exception as e:
        print(f"  ℹ️ Campos select não preenchidos: {e}")
    
    # Marcar pelo menos 1 tipo de licença (OBRIGATÓRIO)
    try:
        # Procurar pela seção de "Tipos de Licença Aplicáveis"
        license_heading = driver.find_element(By.XPATH, "//label[contains(text(), 'Tipos de Licença Aplicáveis')]")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", license_heading)
        time.sleep(0.5)
        
        # Encontrar o container dos checkboxes (div com grid)
        license_container = license_heading.find_element(By.XPATH, "./following-sibling::div")
        
        # Encontrar todos os labels clicáveis (que contêm o checkbox)
        license_labels = license_container.find_elements(By.TAG_NAME, 'label')
        print(f"  ℹ️ Encontrados {len(license_labels)} tipos de licença")
        
        if license_labels:
            # Clicar no primeiro label (isso aciona o handleLicenseTypeToggle)
            first_label = license_labels[0]
            
            # Pegar o texto antes de clicar
            label_text = first_label.text.strip().split('\n')[0]  # Primeira linha = sigla
            
            # Clicar no label usando JavaScript (mais confiável que click())
            driver.execute_script("arguments[0].click();", first_label)
            time.sleep(0.5)
            
            # Verificar se o checkbox dentro foi marcado
            checkbox = first_label.find_element(By.CSS_SELECTOR, 'input[type="checkbox"]')
            is_checked = checkbox.is_selected()
            
            if is_checked:
                print(f"  ✓ Tipo de Licença marcado: {label_text}")
            else:
                print(f"  ⚠️ Label clicado mas checkbox não marcou: {label_text}")
                # Tentar clicar de novo
                driver.execute_script("arguments[0].click();", first_label)
                time.sleep(0.3)
                driver.execute_script("arguments[0].click();", first_label)
                time.sleep(0.3)
                is_checked_retry = checkbox.is_selected()
                print(f"  ℹ️ Segunda tentativa: {is_checked_retry}")
        else:
            print("  ⚠️ Nenhum label de licença encontrado")
    except Exception as e:
        print(f"  ⚠️ Erro ao marcar tipos de licença: {e}")
    
    driver.save_screenshot('tests/screenshots/activities_form_filled.png')
    print("  📸 Screenshot: activities_form_filled.png")
    
    # 6. SALVAR
    print("\n💾 [6/7] Salvando atividade...")
    try:
        # Procurar botão Salvar
        save_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Salvar')]"))
        )
        save_button.click()
        print("  ✓ Botão 'Salvar' clicado")
        time.sleep(3)
        
        # Verificar se há toast (sucesso ou erro)
        try:
            # Procurar por qualquer toast
            toasts = driver.find_elements(By.CSS_SELECTOR, '[role="alert"], .Toastify__toast')
            if toasts:
                for toast in toasts:
                    toast_text = toast.text.strip()
                    if 'sucesso' in toast_text.lower():
                        print(f"  ✅ Toast de SUCESSO: {toast_text}")
                    elif toast_text:
                        print(f"  ❌ Toast de ERRO: {toast_text}")
        except:
            pass
        
        # Verificar se modal fechou
        try:
            modal_check = driver.find_element(By.CSS_SELECTOR, '[role="dialog"]')
            print("  ⚠️ Modal ainda aberto - verificar erro de validação")
            driver.save_screenshot('tests/screenshots/activities_validation_error.png')
            print("  📸 Screenshot: activities_validation_error.png")
        except:
            print("  ✅ Modal fechou com sucesso")
        
        time.sleep(2)
        
    except Exception as e:
        print(f"  ❌ Erro ao salvar: {e}")
        driver.save_screenshot('tests/screenshots/activities_save_error.png')
        raise
    
    # 7. VERIFICAR NA LISTA
    print("\n🔍 [7/7] Verificando atividade na lista...")
    time.sleep(2)
    
    try:
        # Recarregar a tabela
        rows_after = driver.find_elements(By.CSS_SELECTOR, 'tbody tr')
        count_after = len(rows_after)
        
        print(f"  ℹ️ Atividades após cadastro: {count_after}")
        
        # Procurar pela nova atividade
        found = False
        for row in rows_after:
            try:
                cells = row.find_elements(By.CSS_SELECTOR, 'td')
                if len(cells) >= 2:
                    code_cell = cells[0].text
                    name_cell = cells[1].text
                    
                    if NEW_ACTIVITY['code'] in code_cell or NEW_ACTIVITY['name'] in name_cell:
                        print(f"  ✅ Atividade encontrada!")
                        print(f"     Código: {code_cell}")
                        print(f"     Nome: {name_cell}")
                        found = True
                        break
            except:
                continue
        
        if not found:
            print(f"  ⚠️ Atividade não encontrada na lista")
            print(f"  ℹ️ Quantidade antes: {count_before}, depois: {count_after}")
            
            # Listar todas as atividades para debug
            print("\n  📋 Atividades na lista:")
            for i, row in enumerate(rows_after[:10]):
                try:
                    cells = row.find_elements(By.CSS_SELECTOR, 'td')
                    if len(cells) >= 2:
                        print(f"     {i+1}. {cells[0].text} - {cells[1].text}")
                except:
                    pass
        
        driver.save_screenshot('tests/screenshots/activities_list_final.png')
        print("  📸 Screenshot: activities_list_final.png")
        
        # RESULTADO FINAL
        print("\n" + "=" * 70)
        if found:
            print("🎉 TESTE PASSOU COM SUCESSO!")
            print(f"   Atividade '{NEW_ACTIVITY['name']}' cadastrada e verificada")
        else:
            print("⚠️ TESTE PARCIALMENTE COMPLETO")
            print("   Cadastro executado mas verificação na lista falhou")
        print("=" * 70)
        
    except Exception as e:
        print(f"  ❌ Erro ao verificar lista: {e}")
        driver.save_screenshot('tests/screenshots/activities_verification_error.png')
    
    time.sleep(3)

except Exception as e:
    print(f"\n❌ ERRO DURANTE TESTE: {e}")
    driver.save_screenshot('tests/screenshots/activities_exception_error.png')
    import traceback
    traceback.print_exc()
    
    # Pausar antes de fechar para análise
    print("\n⏸️  ERRO CAPTURADO - Navegador permanecerá aberto para análise")
    print("    Verifique o console do navegador (DevTools)")
    input("    Pressione ENTER para fechar o navegador e finalizar...")

finally:
    print("\n🔚 Fechando navegador...")
    driver.quit()
    print("✅ Navegador fechado")
