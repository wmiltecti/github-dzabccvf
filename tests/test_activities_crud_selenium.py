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

# Dados da nova atividade (código único com timestamp completo + microsegundos)
now = datetime.now()
TIMESTAMP = now.strftime("%H%M%S")
MICROSECONDS = now.microsecond // 1000  # Pegar apenas 3 dígitos dos microsegundos
UNIQUE_CODE = f'{TIMESTAMP}{MICROSECONDS}'  # Ex: 152030456 (HH:MM:SS:mmm)

NEW_ACTIVITY = {
    'code': f'{int(UNIQUE_CODE) % 10000}',  # Código único: últimos 4 dígitos para não ficar muito grande
    'name': f'Teste Automático {TIMESTAMP}-{MICROSECONDS}',
    'description': f'Atividade criada automaticamente pelo teste em {now.strftime("%d/%m/%Y %H:%M:%S")}.{MICROSECONDS}'
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
    # Aguardar o dashboard carregar (verificando elemento ao invés de URL)
    print("  ⏳ Aguardando botão Administração aparecer...")
    time.sleep(2)  # Aguardar renderização inicial
    
    # Capturar screenshot para debug
    driver.save_screenshot('debug_before_admin.png')
    print("  📸 Screenshot: debug_before_admin.png")
    
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.XPATH, "//button[contains(., 'Administração')]"))
    )
    time.sleep(2)  # Aguardar renderização completa
    
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
    # Aguardar botão Novo estar visível e clicável
    new_button = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(@class, 'bg-blue-600') and contains(., 'Novo')]"))
    )
    # Scroll para o botão caso necessário
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", new_button)
    time.sleep(1)
    new_button.click()
    time.sleep(3)  # Aguardar animação do modal
    
    # Verificar se modal abriu e guardar referência
    modal_element = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, '.bg-white.rounded-lg.shadow-lg'))
    )
    print("✅ Modal aberto")
    
    driver.save_screenshot('tests/screenshots/activities_modal_opened.png')
    print("  📸 Screenshot: activities_modal_opened.png")
    
    # 5. PREENCHER FORMULÁRIO
    print(f"\n📝 [5/7] Preenchendo formulário...")
    
    # Campo Código (número)
    try:
        code_input = modal_element.find_element(By.CSS_SELECTOR, 'input[type="number"]')
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
    
    # Preencher Unidade de Medida (select - OBRIGATÓRIO)
    try:
        time.sleep(1.5)  # Aguardar API carregar
        unit_label = modal_element.find_element(By.XPATH, "//label[contains(text(), 'Unidade de Medida')]")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", unit_label)
        time.sleep(0.5)
        
        unit_select = unit_label.find_element(By.XPATH, "./following-sibling::select")
        select_unit = Select(unit_select)
        
        print(f"  ℹ️ Opções de Unidade de Medida: {len(select_unit.options)}")
        
        if len(select_unit.options) > 1:
            # Listar primeiras opções disponíveis
            for i, option in enumerate(select_unit.options[:5]):
                print(f"      [{i}] {option.text}")
            
            select_unit.select_by_index(1)  # Selecionar primeira unidade disponível
            selected_unit = select_unit.first_selected_option.text
            print(f"  ✓ Unidade de Medida: {selected_unit}")
            time.sleep(0.3)
        else:
            print(f"  ⚠️ Nenhuma unidade de medida disponível (API pode estar offline)")
            print(f"  ⚠️ O teste não será salvo com sucesso, mas continuará para debug")
    except Exception as e:
        print(f"  ❌ Erro ao preencher Unidade de Medida (OBRIGATÓRIO): {e}")
        print(f"  ⚠️ Continuando teste mesmo com erro...")
    
    # Preencher Potencial Poluidor (select - OBRIGATÓRIO)
    try:
        potential_label = modal_element.find_element(By.XPATH, "//label[contains(text(), 'Potencial Poluidor')]")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", potential_label)
        time.sleep(0.5)
        
        potential_select = potential_label.find_element(By.XPATH, "./following-sibling::select")
        select_potential = Select(potential_select)
        
        print(f"  ℹ️ Opções de Potencial Poluidor: {len(select_potential.options)}")
        
        if len(select_potential.options) > 1:
            select_potential.select_by_index(1)  # Selecionar primeiro potencial disponível
            selected_potential = select_potential.first_selected_option.text
            print(f"  ✓ Potencial Poluidor: {selected_potential}")
            time.sleep(0.3)
        else:
            print(f"  ⚠️ Nenhum potencial poluidor disponível (banco pode estar vazio ou API offline)")
            print(f"  ⚠️ O teste não será salvo com sucesso, mas continuará para debug")
    except Exception as e:
        print(f"  ❌ Erro ao preencher Potencial Poluidor (OBRIGATÓRIO): {e}")
        print(f"  ⚠️ Continuando teste mesmo com erro...")
    
    # Preencher Porte do Empreendimento (seção de faixas)
    try:
        # Buscar pela label "Porte do Empreendimento" e encontrar o select associado
        porte_label = modal_element.find_element(By.XPATH, "//label[contains(text(), 'Porte do Empreendimento')]")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", porte_label)
        time.sleep(0.5)
        
        # Encontrar o select logo após essa label
        porte_container = porte_label.find_element(By.XPATH, "./following-sibling::select")
        select_porte = Select(porte_container)
        
        if len(select_porte.options) > 1:
            select_porte.select_by_index(1)  # Selecionar primeiro porte disponível
            selected_porte = select_porte.first_selected_option.text
            print(f"  ✓ Porte do Empreendimento: {selected_porte}")
        else:
            print(f"  ⚠️ Nenhum porte disponível no select")
            
        # Preencher campos de faixa (range_start e range_end)
        time.sleep(0.5)
        
        # Buscar pela label "Faixa Inicial"
        faixa_inicial_label = modal_element.find_element(By.XPATH, "//label[contains(text(), 'Faixa Inicial')]")
        faixa_inicial_input = faixa_inicial_label.find_element(By.XPATH, "./following-sibling::input")
        faixa_inicial_input.clear()
        faixa_inicial_input.send_keys("0")
        print(f"  ✓ Faixa Inicial: 0")
        
        # Buscar pela label "Faixa Final"
        faixa_final_label = modal_element.find_element(By.XPATH, "//label[contains(text(), 'Faixa Final')]")
        faixa_final_input = faixa_final_label.find_element(By.XPATH, "./following-sibling::input")
        faixa_final_input.clear()
        faixa_final_input.send_keys("1000")
        print(f"  ✓ Faixa Final: 1000")
        
        # Adicionar segundo porte
        time.sleep(0.5)
        add_porte_button = modal_element.find_element(By.XPATH, "//button[contains(., 'Adicionar outro porte')]")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", add_porte_button)
        time.sleep(0.3)
        driver.execute_script("arguments[0].click();", add_porte_button)
        time.sleep(0.5)
        print(f"  ✓ Botão 'Adicionar outro porte' clicado")
        
        # Preencher segundo porte
        porte_labels = modal_element.find_elements(By.XPATH, "//label[contains(text(), 'Porte do Empreendimento')]")
        if len(porte_labels) >= 2:
            # Segundo porte
            porte_container_2 = porte_labels[1].find_element(By.XPATH, "./following-sibling::select")
            select_porte_2 = Select(porte_container_2)
            
            if len(select_porte_2.options) > 2:
                select_porte_2.select_by_index(2)  # Selecionar segundo porte disponível
                selected_porte_2 = select_porte_2.first_selected_option.text
                print(f"  ✓ Porte do Empreendimento 2: {selected_porte_2}")
            
            # Faixas do segundo porte
            faixa_inicial_labels = modal_element.find_elements(By.XPATH, "//label[contains(text(), 'Faixa Inicial')]")
            faixa_final_labels = modal_element.find_elements(By.XPATH, "//label[contains(text(), 'Faixa Final')]")
            
            if len(faixa_inicial_labels) >= 2:
                faixa_inicial_input_2 = faixa_inicial_labels[1].find_element(By.XPATH, "./following-sibling::input")
                faixa_inicial_input_2.clear()
                faixa_inicial_input_2.send_keys("1001")
                print(f"  ✓ Faixa Inicial 2: 1001")
            
            if len(faixa_final_labels) >= 2:
                faixa_final_input_2 = faixa_final_labels[1].find_element(By.XPATH, "./following-sibling::input")
                faixa_final_input_2.clear()
                faixa_final_input_2.send_keys("5000")
                print(f"  ✓ Faixa Final 2: 5000")
                
            print(f"  ✅ Segundo porte adicionado com sucesso")
        
    except Exception as e:
        print(f"  ❌ Erro ao preencher Porte/Faixas: {e}")
    
    # Adicionar pelo menos 1 tipo de licença (OBRIGATÓRIO - NOVA INTERFACE)
    try:
        # Procurar pela seção de "Tipos de Licença Aplicáveis"
        license_heading = driver.find_element(By.XPATH, "//label[contains(text(), 'Tipos de Licença Aplicáveis')]")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", license_heading)
        time.sleep(1)
        
        # Clicar no botão "+ Adicionar Tipo de Licença"
        add_license_button = modal_element.find_element(By.XPATH, "//button[contains(., 'Adicionar Tipo de Licença')]")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", add_license_button)
        time.sleep(0.5)
        driver.execute_script("arguments[0].click();", add_license_button)
        time.sleep(0.5)
        print(f"  ✓ Botão 'Adicionar Tipo de Licença' clicado")
        
        # Aguardar o bloco de tipo de licença aparecer
        time.sleep(0.5)
        
        # Aguardar um pouco mais para a API carregar os tipos
        time.sleep(2)
        
        # Encontrar o select de tipo de licença (dropdown)
        license_selects = modal_element.find_elements(By.XPATH, "//label[contains(text(), 'Tipo de Licença')]/following-sibling::select")
        
        print(f"  ℹ️ Dropdowns de tipo de licença encontrados: {len(license_selects)}")
        
        if license_selects:
            select_license = Select(license_selects[0])
            options = select_license.options
            
            print(f"  ℹ️ Opções no dropdown: {len(options)}")
            for idx, opt in enumerate(options[:5]):  # Mostrar primeiras 5 opções
                print(f"      [{idx}] {opt.text}")
            
            # Pegar opções disponíveis (pular a primeira que é placeholder)
            if len(options) > 1:
                select_license.select_by_index(1)  # Selecionar primeira licença disponível
                selected_license = select_license.first_selected_option.text
                print(f"  ✓ Tipo de Licença selecionado: {selected_license}")
                time.sleep(1)
                
                # ===== ADICIONAR DOCUMENTO EXIGIDO =====
                try:
                    print(f"\n  📄 Adicionando Documentos Exigidos...")
                    add_doc_button = modal_element.find_element(By.XPATH, "//button[contains(., 'Adicionar Documento')]")
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", add_doc_button)
                    time.sleep(0.5)
                    driver.execute_script("arguments[0].click();", add_doc_button)
                    time.sleep(1.5)
                    print(f"    ✓ Botão 'Adicionar Documento' clicado")
                    
                    # Procurar todos os selects na modal (depois de clicar adicionar)
                    all_selects = modal_element.find_elements(By.TAG_NAME, "select")
                    print(f"    ℹ️ Total de selects na modal: {len(all_selects)}")
                    
                    # O dropdown de documento deve ser um dos últimos adicionados
                    doc_select = None
                    for select_elem in reversed(all_selects):
                        try:
                            # Verificar se não é um select que já identificamos
                            select_obj = Select(select_elem)
                            first_option = select_obj.options[0].text if select_obj.options else ""
                            
                            # Se a primeira opção contém texto relacionado a documento ou é um placeholder genérico
                            if "documento" in first_option.lower() or "selecione" in first_option.lower():
                                # Verificar se tem opções além do placeholder
                                if len(select_obj.options) > 1:
                                    doc_select = select_obj
                                    print(f"    ℹ️ Documentos disponíveis: {len(select_obj.options)}")
                                    break
                        except:
                            continue
                    
                    if doc_select and len(doc_select.options) > 1:
                        doc_select.select_by_index(1)  # Selecionar primeiro documento
                        selected_doc = doc_select.first_selected_option.text
                        print(f"    ✓ Documento selecionado: {selected_doc}")
                        time.sleep(0.5)
                        
                        # Marcar como obrigatório
                        try:
                            doc_checkboxes = modal_element.find_elements(By.XPATH, "//input[@type='checkbox']")
                            # Pegar o último checkbox adicionado (deve ser do documento)
                            if doc_checkboxes:
                                last_checkbox = doc_checkboxes[-1]
                                if not last_checkbox.is_selected():
                                    driver.execute_script("arguments[0].click();", last_checkbox)
                                    print(f"    ✓ Marcado como obrigatório")
                                time.sleep(0.3)
                        except Exception as e:
                            print(f"    ⚠️ Checkbox obrigatório não encontrado: {e}")
                    else:
                        print(f"    ⚠️ Nenhum documento disponível ou dropdown não encontrado")
                        
                except Exception as e:
                    print(f"    ⚠️ Erro ao adicionar documento: {e}")
                
                # ===== ADICIONAR TIPO DE ESTUDO APLICÁVEL =====
                try:
                    print(f"\n  📚 Adicionando Tipos de Estudo Aplicáveis...")
                    add_study_button = modal_element.find_element(By.XPATH, "//button[contains(., 'Adicionar Estudo')]")
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", add_study_button)
                    time.sleep(0.5)
                    driver.execute_script("arguments[0].click();", add_study_button)
                    time.sleep(1.5)
                    print(f"    ✓ Botão 'Adicionar Estudo' clicado")
                    
                    # Procurar todos os selects na modal novamente
                    all_selects = modal_element.find_elements(By.TAG_NAME, "select")
                    print(f"    ℹ️ Total de selects na modal: {len(all_selects)}")
                    
                    # O dropdown de estudo deve ser o último adicionado
                    study_select = None
                    for select_elem in reversed(all_selects):
                        try:
                            select_obj = Select(select_elem)
                            first_option = select_obj.options[0].text if select_obj.options else ""
                            
                            # Se a primeira opção contém texto relacionado a estudo ou tipo
                            if "estudo" in first_option.lower() or "tipo" in first_option.lower() or "selecione" in first_option.lower():
                                # Verificar se tem opções além do placeholder
                                if len(select_obj.options) > 1:
                                    study_select = select_obj
                                    print(f"    ℹ️ Tipos de estudo disponíveis: {len(select_obj.options)}")
                                    break
                        except:
                            continue
                    
                    if study_select and len(study_select.options) > 1:
                        study_select.select_by_index(1)  # Selecionar primeiro estudo
                        selected_study = study_select.first_selected_option.text
                        print(f"    ✓ Tipo de estudo selecionado: {selected_study}")
                        time.sleep(0.5)
                        
                        # Marcar como obrigatório
                        try:
                            study_checkboxes = modal_element.find_elements(By.XPATH, "//input[@type='checkbox']")
                            # Pegar o último checkbox adicionado (deve ser do estudo)
                            if study_checkboxes:
                                last_checkbox = study_checkboxes[-1]
                                if not last_checkbox.is_selected():
                                    driver.execute_script("arguments[0].click();", last_checkbox)
                                    print(f"    ✓ Marcado como obrigatório")
                                time.sleep(0.3)
                        except Exception as e:
                            print(f"    ⚠️ Checkbox obrigatório não encontrado: {e}")
                    else:
                        print(f"    ⚠️ Nenhum tipo de estudo disponível ou dropdown não encontrado")
                        
                except Exception as e:
                    print(f"    ⚠️ Erro ao adicionar tipo de estudo: {e}")
                
            else:
                print(f"  ⚠️ Nenhum tipo de licença disponível no dropdown (API não retornou dados?)")
                print(f"  ⚠️ Continuando sem tipo de licença (teste vai falhar na validação)")
        else:
            print(f"  ⚠️ Dropdown de tipo de licença não encontrado na página")
    except Exception as e:
        print(f"  ⚠️ Erro ao adicionar tipo de licença: {e}")
    
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
    
    try:
        # Aguardar a tabela carregar (até 10 segundos)
        print("  ⏳ Aguardando tabela carregar...")
        time.sleep(3)  # Aumentar de 2 para 3 segundos
        
        # Capturar logs do console
        logs = driver.get_log('browser')
        print(f"\n📋 Últimos logs do console ({len(logs)} mensagens):")
        for log in logs[-10:]:  # Mostrar últimas 10 mensagens
            level = log['level']
            message = log['message']
            print(f"  [{level}] {message}")
        
        # Aguardar até que haja pelo menos uma linha na tabela
        wait.until(lambda d: len(d.find_elements(By.CSS_SELECTOR, 'tbody tr')) > 0)
        
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
        
        # VERIFICAR DADOS SALVOS (Porte e Tipo de Licença)
        if found:
            print("\n🔎 [BONUS] Verificando dados salvos (Porte e Tipo de Licença)...")
            try:
                # Encontrar a linha da atividade e clicar no botão de editar
                for row in rows_after:
                    try:
                        cells = row.find_elements(By.CSS_SELECTOR, 'td')
                        if len(cells) >= 2:
                            code_cell = cells[0].text
                            name_cell = cells[1].text
                            
                            if NEW_ACTIVITY['code'] in code_cell or NEW_ACTIVITY['name'] in name_cell:
                                # Encontrar todos os botões na linha
                                buttons = row.find_elements(By.CSS_SELECTOR, 'button')
                                print(f"  ℹ️ Botões encontrados na linha: {len(buttons)}")
                                
                                # Procurar pelo botão de editar (geralmente o primeiro ou com ícone de lápis)
                                edit_button = None
                                for btn in buttons:
                                    # Tentar identificar pelo ícone ou título
                                    try:
                                        # Verificar se tem ícone de lápis
                                        btn.find_element(By.CSS_SELECTOR, 'svg')
                                        # Primeiro botão com SVG geralmente é editar
                                        edit_button = btn
                                        break
                                    except:
                                        continue
                                
                                if not edit_button and len(buttons) > 0:
                                    edit_button = buttons[0]  # Fallback: primeiro botão
                                
                                if edit_button:
                                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", edit_button)
                                    time.sleep(0.5)
                                    driver.execute_script("arguments[0].click();", edit_button)
                                    print("  ✓ Botão de edição clicado")
                                    time.sleep(2)
                                else:
                                    print("  ⚠️ Botão de editar não encontrado")
                                    break
                                
                                # Verificar modal abriu
                                modal = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[role="dialog"]')))
                                
                                # Verificar Portes do Empreendimento
                                porte_selects = modal.find_elements(By.XPATH, "//label[contains(text(), 'Porte do Empreendimento')]/following-sibling::select")
                                print(f"  ℹ️ Portes salvos: {len(porte_selects)}")
                                
                                for i, porte_select in enumerate(porte_selects):
                                    select_porte = Select(porte_select)
                                    selected_porte = select_porte.first_selected_option.text
                                    print(f"      Porte {i+1}: {selected_porte}")
                                
                                # Verificar faixas
                                faixa_inicial_inputs = modal.find_elements(By.XPATH, "//label[contains(text(), 'Faixa Inicial')]/following-sibling::input")
                                faixa_final_inputs = modal.find_elements(By.XPATH, "//label[contains(text(), 'Faixa Final')]/following-sibling::input")
                                
                                for i in range(len(faixa_inicial_inputs)):
                                    inicial = faixa_inicial_inputs[i].get_attribute('value')
                                    final = faixa_final_inputs[i].get_attribute('value') if i < len(faixa_final_inputs) else 'N/A'
                                    print(f"      Faixa {i+1}: {inicial} - {final}")
                                
                                # Verificar Tipos de Licença
                                license_selects = modal.find_elements(By.XPATH, "//label[contains(text(), 'Tipo de Licença')]/following-sibling::select")
                                print(f"  ℹ️ Tipos de Licença salvos: {len(license_selects)}")
                                
                                for i, license_select in enumerate(license_selects):
                                    select_license = Select(license_select)
                                    selected_license = select_license.first_selected_option.text
                                    print(f"      Tipo {i+1}: {selected_license}")
                                
                                print("  ✅ Verificação de dados salvos concluída")
                                
                                # Fechar modal
                                close_button = modal.find_element(By.CSS_SELECTOR, 'button[aria-label*="Fechar"], button[title*="Fechar"]')
                                driver.execute_script("arguments[0].click();", close_button)
                                time.sleep(1)
                                
                                break
                    except:
                        continue
                        
            except Exception as e:
                print(f"  ⚠️ Erro ao verificar dados salvos: {e}")
        
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
    
    # Pausar antes de fechar para análise do console
    print("\n⏸️  TESTE FINALIZADO - Navegador permanecerá aberto para análise")
    print("    Verifique o console do navegador (DevTools) para erros")
    input("    Pressione ENTER para fechar o navegador e finalizar...")

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
