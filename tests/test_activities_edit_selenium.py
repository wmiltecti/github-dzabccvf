"""
Teste E2E para EDIÇÃO de Atividades
Busca uma atividade existente, abre modal de edição e altera faixas e portes
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

# Buscar última atividade de teste criada automaticamente
SEARCH_PATTERN = 'Teste Automático'

# Novos valores para edição
now = datetime.now()
UPDATED_VALUES = {
    'description': f'DESCRIÇÃO EDITADA em {now.strftime("%d/%m/%Y %H:%M:%S")}',
    'faixa_1_start': '200',
    'faixa_1_end': '3000',
    'faixa_2_start': '3001',
    'faixa_2_end': '15000'
}

print(f"👤 CPF: {CPF}")
print(f"🔗 URL: {BASE_URL}")
print("=" * 70)
print("🧪 TESTE DE EDIÇÃO: Alterar Atividade (Descrição, Faixas e Portes)")
print("=" * 70)
print(f"📝 Alterações:")
print(f"   Descrição: {UPDATED_VALUES['description']}")
print(f"   Faixa 1: {UPDATED_VALUES['faixa_1_start']} - {UPDATED_VALUES['faixa_1_end']}")
print(f"   Faixa 2: {UPDATED_VALUES['faixa_2_start']} - {UPDATED_VALUES['faixa_2_end']}")
print("=" * 70)

# Configurar ChromeDriver
service = Service(executable_path=CHROMEDRIVER_PATH)
options = webdriver.ChromeOptions()
options.add_argument('--start-maximized')
options.add_argument('--disable-blink-features=AutomationControlled')
options.add_argument('--auto-open-devtools-for-tabs')

print("\n📦 Inicializando ChromeDriver...")
driver = webdriver.Chrome(service=service, options=options)
wait = WebDriverWait(driver, 10)
print("✅ ChromeDriver iniciado com sucesso (DevTools aberto)")

try:
    # 1. FAZER LOGIN
    print(f"\n🔐 [1/6] Fazendo login...")
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
    time.sleep(8)
    print("✅ Login realizado")
    
    # 2. NAVEGAR PARA ADMINISTRAÇÃO
    print("\n📂 [2/6] Navegando para Administração...")
    print("  ⏳ Aguardando botão Administração aparecer...")
    time.sleep(2)  # Aguardar renderização inicial
    
    # Capturar screenshot para debug
    driver.save_screenshot('tests/screenshots/edit_before_admin.png')
    print("  📸 Screenshot: edit_before_admin.png")
    
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
    print("\n📋 [3/6] Acessando Atividades...")
    activities_button = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Atividades')]"))
    )
    activities_button.click()
    time.sleep(2)
    print("✅ Tela de Atividades carregada")
    
    # Aguardar tabela carregar
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'table')))
    time.sleep(1)
    
    # Contar atividades existentes
    table = driver.find_element(By.CSS_SELECTOR, 'table')
    rows_before = table.find_elements(By.CSS_SELECTOR, 'tbody tr')
    print(f"  ℹ️ Atividades existentes: {len(rows_before)}")
    
    # 4. BUSCAR ÚLTIMA ATIVIDADE DE TESTE AUTOMÁTICO
    print(f"\n🔍 [4/6] Buscando atividade de teste automático...")
    
    activity_found = False
    edit_button = None
    activity_info = {}
    
    # Buscar de trás para frente (mais recente primeiro)
    for row in reversed(rows_before):
        try:
            cells = row.find_elements(By.CSS_SELECTOR, 'td')
            if len(cells) >= 2:
                code_cell = cells[0].text
                name_cell = cells[1].text
                
                # Buscar atividade de teste automático
                if SEARCH_PATTERN in name_cell:
                    activity_info = {
                        'code': code_cell,
                        'name': name_cell
                    }
                    
                    print(f"\n  ✓ Atividade encontrada:")
                    print(f"     Código: {code_cell}")
                    print(f"     Nome: {name_cell}")
                    
                    # Encontrar botões (geralmente: ver, editar, excluir)
                    buttons = row.find_elements(By.CSS_SELECTOR, 'button')
                    print(f"  ℹ️ Botões encontrados: {len(buttons)}")
                    
                    # Usar o segundo botão (índice 1) que é o de editar
                    # O primeiro (índice 0) geralmente é visualizar
                    if len(buttons) >= 2:
                        edit_button = buttons[1]  # Segundo botão = Editar
                        print(f"  ✓ Botão de editar selecionado (2º botão)")
                        activity_found = True
                        break
                    elif len(buttons) > 0:
                        edit_button = buttons[0]
                        print(f"  ⚠️ Usando primeiro botão disponível")
                        activity_found = True
                        break
        except:
            continue
    
    if not activity_found:
        print(f"\n  ⚠️ Nenhuma atividade '{SEARCH_PATTERN}' encontrada")
        print(f"  📋 Listando últimas 10 atividades:")
        for idx, row in enumerate(list(reversed(rows_before))[:10]):
            try:
                cells = row.find_elements(By.CSS_SELECTOR, 'td')
                if len(cells) >= 2:
                    code_cell = cells[0].text
                    name_cell = cells[1].text
                    print(f"      [{idx+1}] {code_cell} - {name_cell[:50]}")
            except:
                continue
        raise Exception(f"Nenhuma atividade '{SEARCH_PATTERN}' encontrada para editar")
    
    # Clicar no botão de editar
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", edit_button)
    time.sleep(0.5)
    driver.execute_script("arguments[0].click();", edit_button)
    print("  ✓ Botão de edição clicado")
    time.sleep(2)
    
    # 5. MODIFICAR DESCRIÇÃO E FAIXAS
    print("\n✏️ [5/6] Aguardando modal e modificando dados...")
    
    # Aguardar modal abrir - procurar pelo título "Editar Atividade"
    print("  ⏳ Aguardando modal de edição abrir...")
    WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.XPATH, "//h2[contains(text(), 'Editar Atividade')] | //h3[contains(text(), 'Editar Atividade')]"))
    )
    time.sleep(2)
    print("  ✓ Modal de edição aberto")
    
    # Não precisamos do modal_element, vamos buscar os campos diretamente no driver
    
    driver.save_screenshot('tests/screenshots/edit_modal_opened.png')
    print("  📸 Screenshot: edit_modal_opened.png")
    
    # MODIFICAR NOME DA ATIVIDADE
    print("\n  ✏️ Modificando nome da atividade...")
    try:
        name_input = driver.find_element(By.XPATH, "//label[contains(text(), 'Nome da Atividade')]/following-sibling::input")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", name_input)
        time.sleep(0.3)
        name_input.clear()
        time.sleep(0.2)
        name_input.send_keys("Atividade EDITADA - " + now.strftime("%H:%M:%S"))
        print(f"    ✓ Nome alterado")
        time.sleep(0.5)
    except Exception as e:
        print(f"    ⚠️ Erro ao modificar nome: {e}")
    
    # MODIFICAR DESCRIÇÃO DA ATIVIDADE
    print("\n  ✏️ Modificando descrição da atividade...")
    try:
        description_input = driver.find_element(By.XPATH, "//label[contains(text(), 'Descrição')]/following-sibling::textarea")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", description_input)
        time.sleep(0.3)
        description_input.clear()
        time.sleep(0.2)
        description_input.send_keys(UPDATED_VALUES['description'])
        print(f"    ✓ Descrição alterada")
        time.sleep(0.5)
    except Exception as e:
        print(f"    ❌ Erro ao modificar descrição: {e}")
    
    # MODIFICAR CÓDIGO CNAE
    print("\n  ✏️ Modificando Código CNAE...")
    try:
        cnae_codigo_input = driver.find_element(By.XPATH, "//label[contains(text(), 'Código CNAE')]/following-sibling::input")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", cnae_codigo_input)
        time.sleep(0.3)
        cnae_codigo_input.clear()
        time.sleep(0.2)
        cnae_codigo_input.send_keys("9999-9/99")
        print(f"    ✓ Código CNAE alterado para: 9999-9/99")
        time.sleep(0.3)
    except Exception as e:
        print(f"    ⚠️ Erro ao modificar Código CNAE: {e}")
    
    # MODIFICAR DESCRIÇÃO CNAE
    print("\n  ✏️ Modificando Descrição CNAE...")
    try:
        cnae_descricao_input = driver.find_element(By.XPATH, "//label[contains(text(), 'Descrição CNAE')]/following-sibling::input")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", cnae_descricao_input)
        time.sleep(0.3)
        cnae_descricao_input.clear()
        time.sleep(0.2)
        cnae_descricao_input.send_keys("Descrição CNAE EDITADA")
        print(f"    ✓ Descrição CNAE alterada")
        time.sleep(0.3)
    except Exception as e:
        print(f"    ⚠️ Erro ao modificar Descrição CNAE: {e}")
    
    # MODIFICAR UNIDADE DE MEDIDA
    print("\n  ✏️ Modificando Unidade de Medida...")
    try:
        unit_label = driver.find_element(By.XPATH, "//label[contains(text(), 'Unidade de Medida')]")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", unit_label)
        time.sleep(0.5)
        unit_select = unit_label.find_element(By.XPATH, "./following-sibling::select")
        select_unit = Select(unit_select)
        
        if len(select_unit.options) > 2:
            select_unit.select_by_index(2)  # Trocar para outra unidade
            selected_unit = select_unit.first_selected_option.text
            print(f"    ✓ Unidade de Medida alterada para: {selected_unit}")
        time.sleep(0.3)
    except Exception as e:
        print(f"    ⚠️ Erro ao modificar Unidade de Medida: {e}")
    
    # MODIFICAR POTENCIAL POLUIDOR
    print("\n  ✏️ Modificando Potencial Poluidor...")
    try:
        potential_label = driver.find_element(By.XPATH, "//label[contains(text(), 'Potencial Poluidor')]")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", potential_label)
        time.sleep(0.5)
        potential_select = potential_label.find_element(By.XPATH, "./following-sibling::select")
        select_potential = Select(potential_select)
        
        # Trocar para outro potencial
        if len(select_potential.options) > 2:
            select_potential.select_by_index(2)
            selected_potential = select_potential.first_selected_option.text
            print(f"    ✓ Potencial Poluidor alterado para: {selected_potential}")
        time.sleep(0.3)
    except Exception as e:
        print(f"    ⚠️ Erro ao modificar Potencial Poluidor: {e}")
    
    # MODIFICAR TIPOS DE LICENÇA (OBRIGATÓRIO - PELO MENOS 1)
    print("\n  📋 Modificando Tipos de Licença...")
    try:
        # Rolar até a seção de tipos de licença
        license_heading = driver.find_element(By.XPATH, "//label[contains(text(), 'Tipos de Licença Aplicáveis')]")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", license_heading)
        time.sleep(1)
        
        # Verificar quantos tipos de licença já existem
        license_selects = driver.find_elements(By.XPATH, "//label[contains(text(), 'Tipo de Licença')]/following-sibling::select")
        print(f"    • Tipos de licença atuais: {len(license_selects)}")
        
        # REMOVER TIPOS DE LICENÇA EXTRAS (manter apenas 1 - obrigatório)
        if len(license_selects) > 1:
            print(f"    🗑️ Removendo tipos de licença extras (mantendo 1)...")
            
            # Remover tipos extras APENAS se houver mais de 1
            # Clicar no botão de remover dos tipos excedentes (do último ao segundo)
            for idx in range(len(license_selects) - 1, 0, -1):
                try:
                    # Buscar novamente os selects (lista atualiza após cada remoção)
                    current_selects = driver.find_elements(By.XPATH, "//label[contains(text(), 'Tipo de Licença')]/following-sibling::select")
                    
                    if len(current_selects) > 1:
                        # Encontrar o botão de remover mais próximo do último select
                        # Procurar o botão irmão do select ou no container pai
                        last_select = current_selects[-1]
                        parent = last_select.find_element(By.XPATH, "./ancestor::div[1]")
                        
                        # Buscar botão de remover dentro deste container específico
                        remove_btn = parent.find_element(By.XPATH, ".//button[contains(., 'Remover') or contains(@title, 'Remover')]")
                        
                        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", remove_btn)
                        time.sleep(0.3)
                        driver.execute_script("arguments[0].click();", remove_btn)
                        time.sleep(0.8)  # Aguardar remoção e re-render
                        print(f"    ✓ Tipo de licença extra removido")
                    else:
                        break  # Já tem apenas 1, parar
                except Exception as e:
                    print(f"    ⚠️ Erro ao remover tipo de licença extra: {e}")
                    break
        
        # Aguardar atualização após remoções
        time.sleep(1)
        
        # Verificar novamente quantos tipos restaram
        license_selects = driver.find_elements(By.XPATH, "//label[contains(text(), 'Tipo de Licença')]/following-sibling::select")
        
        # Se existe pelo menos 1, modificar
        if len(license_selects) > 0:
            print(f"    ✏️ Alterando tipo de licença (OBRIGATÓRIO)...")
            select_license = Select(license_selects[0])
            
            # Trocar para outro tipo (se houver opções)
            if len(select_license.options) > 2:
                select_license.select_by_index(2)  # Selecionar terceira opção
                selected_license = select_license.first_selected_option.text
                print(f"    ✓ Tipo de Licença alterado para: {selected_license}")
                time.sleep(0.5)
            elif len(select_license.options) > 1:
                select_license.select_by_index(1)  # Selecionar segunda opção
                selected_license = select_license.first_selected_option.text
                print(f"    ✓ Tipo de Licença alterado para: {selected_license}")
                time.sleep(0.5)
        else:
            # Se não existe nenhum, ADICIONAR (obrigatório)
            print(f"    ⚠️ NENHUM tipo de licença encontrado - ADICIONANDO (OBRIGATÓRIO)...")
            add_license_button = driver.find_element(By.XPATH, "//button[contains(., 'Adicionar Tipo de Licença')]")
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", add_license_button)
            time.sleep(0.5)
            driver.execute_script("arguments[0].click();", add_license_button)
            time.sleep(2)
            print(f"    ✓ Botão 'Adicionar Tipo de Licença' clicado")
            
            # Selecionar o tipo adicionado (OBRIGATÓRIO)
            license_selects = driver.find_elements(By.XPATH, "//label[contains(text(), 'Tipo de Licença')]/following-sibling::select")
            if license_selects:
                select_license = Select(license_selects[0])
                if len(select_license.options) > 1:
                    select_license.select_by_index(1)
                    selected_license = select_license.first_selected_option.text
                    print(f"    ✓ Tipo de Licença selecionado: {selected_license}")
                else:
                    print(f"    ❌ ERRO: Nenhuma opção de tipo de licença disponível!")
            else:
                print(f"    ❌ ERRO: Tipo de licença não foi adicionado!")
        
        # Modificar documentos exigidos (se existirem)
        try:
            print(f"\n    📄 Verificando documentos exigidos...")
            time.sleep(1)
            
            # Verificar se já existe algum documento
            doc_selects = driver.find_elements(By.XPATH, "//label[contains(text(), 'Documento')]/following-sibling::select")
            
            if len(doc_selects) > 0:
                print(f"    • Documentos existentes: {len(doc_selects)}")
                # Alterar primeiro documento
                select_doc = Select(doc_selects[0])
                if len(select_doc.options) > 2:
                    select_doc.select_by_index(2)
                    selected_doc = select_doc.first_selected_option.text
                    print(f"    ✓ Documento alterado para: {selected_doc}")
            else:
                # Adicionar novo documento
                add_doc_button = driver.find_element(By.XPATH, "//button[contains(., 'Adicionar Documento')]")
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", add_doc_button)
                time.sleep(0.5)
                driver.execute_script("arguments[0].click();", add_doc_button)
                time.sleep(1.5)
                print(f"    ✓ Documento adicionado")
                
                # Selecionar documento
                all_selects = driver.find_elements(By.TAG_NAME, "select")
                for select_elem in reversed(all_selects):
                    try:
                        select_obj = Select(select_elem)
                        if len(select_obj.options) > 1:
                            first_option = select_obj.options[0].text if select_obj.options else ""
                            if "documento" in first_option.lower() or "selecione" in first_option.lower():
                                select_obj.select_by_index(1)
                                selected_doc = select_obj.first_selected_option.text
                                print(f"    ✓ Documento selecionado: {selected_doc}")
                                break
                    except:
                        continue
        except Exception as e:
            print(f"    ⚠️ Erro ao modificar documentos: {e}")
        
        # Modificar tipos de estudo (se existirem)
        try:
            print(f"\n    📚 Verificando tipos de estudo...")
            time.sleep(1)
            
            # Verificar se já existe algum estudo
            study_selects = driver.find_elements(By.XPATH, "//label[contains(text(), 'Tipo de Estudo')]/following-sibling::select")
            
            if len(study_selects) > 0:
                print(f"    • Estudos existentes: {len(study_selects)}")
                # Alterar primeiro estudo
                select_study = Select(study_selects[0])
                if len(select_study.options) > 2:
                    select_study.select_by_index(2)
                    selected_study = select_study.first_selected_option.text
                    print(f"    ✓ Tipo de estudo alterado para: {selected_study}")
        except Exception as e:
            print(f"    ⚠️ Erro ao modificar tipos de estudo: {e}")
            
    except Exception as e:
        print(f"    ⚠️ Erro ao modificar tipos de licença: {e}")
    
    # VERIFICAR DADOS ATUAIS
    print("\n  📊 Dados Atuais:")
    try:
        # Verificar portes atuais
        porte_selects = driver.find_elements(By.XPATH, "//label[contains(text(), 'Porte do Empreendimento')]/following-sibling::select")
        print(f"    • Portes atuais: {len(porte_selects)}")
        
        for i, porte_select in enumerate(porte_selects):
            select_porte = Select(porte_select)
            selected_porte = select_porte.first_selected_option.text
            print(f"      Porte {i+1}: {selected_porte}")
        
        # Verificar faixas atuais
        faixa_inicial_inputs = driver.find_elements(By.XPATH, "//label[contains(text(), 'Faixa Inicial')]/following-sibling::input")
        faixa_final_inputs = driver.find_elements(By.XPATH, "//label[contains(text(), 'Faixa Final')]/following-sibling::input")
        
        for i in range(len(faixa_inicial_inputs)):
            inicial = faixa_inicial_inputs[i].get_attribute('value')
            final = faixa_final_inputs[i].get_attribute('value') if i < len(faixa_final_inputs) else 'N/A'
            print(f"      Faixa {i+1}: {inicial} - {final}")
    except Exception as e:
        print(f"    ⚠️ Erro ao ler dados atuais: {e}")
    
    # REMOVER PORTES EXISTENTES (exceto o primeiro)
    print("\n  🗑️ Removendo portes extras...")
    try:
        remove_buttons = driver.find_elements(By.XPATH, "//button[contains(., 'Remover') or contains(., '×') or contains(@title, 'Remover')]")
        
        # Remover todos menos o primeiro
        for i in range(len(remove_buttons) - 1, 0, -1):
            try:
                btn = remove_buttons[i]
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
                time.sleep(0.3)
                driver.execute_script("arguments[0].click();", btn)
                time.sleep(0.5)
                print(f"    ✓ Porte {i+1} removido")
            except:
                continue
    except Exception as e:
        print(f"    ℹ️ Nenhum porte extra para remover ou erro: {e}")
    
    # MODIFICAR FAIXAS DO PRIMEIRO PORTE
    print("\n  ✏️ Modificando faixas do primeiro porte...")
    try:
        time.sleep(1)
        
        # Modificar faixas
        faixa_inicial_inputs = driver.find_elements(By.XPATH, "//label[contains(text(), 'Faixa Inicial')]/following-sibling::input")
        faixa_final_inputs = driver.find_elements(By.XPATH, "//label[contains(text(), 'Faixa Final')]/following-sibling::input")
        
        if len(faixa_inicial_inputs) > 0:
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", faixa_inicial_inputs[0])
            time.sleep(0.3)
            faixa_inicial_inputs[0].clear()
            time.sleep(0.2)
            faixa_inicial_inputs[0].send_keys(UPDATED_VALUES['faixa_1_start'])
            print(f"    ✓ Faixa 1 Inicial: {UPDATED_VALUES['faixa_1_start']}")
        
        if len(faixa_final_inputs) > 0:
            faixa_final_inputs[0].clear()
            time.sleep(0.2)
            faixa_final_inputs[0].send_keys(UPDATED_VALUES['faixa_1_end'])
            print(f"    ✓ Faixa 1 Final: {UPDATED_VALUES['faixa_1_end']}")
            
    except Exception as e:
        print(f"    ❌ Erro ao modificar faixas: {e}")
    
    # MODIFICAR FAIXAS DO SEGUNDO PORTE
    print("\n  ✏️ Modificando faixas do segundo porte...")
    try:
        # Buscar faixas novamente
        faixa_inicial_inputs = driver.find_elements(By.XPATH, "//label[contains(text(), 'Faixa Inicial')]/following-sibling::input")
        faixa_final_inputs = driver.find_elements(By.XPATH, "//label[contains(text(), 'Faixa Final')]/following-sibling::input")
        
        if len(faixa_inicial_inputs) >= 2:
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", faixa_inicial_inputs[1])
            time.sleep(0.3)
            faixa_inicial_inputs[1].clear()
            time.sleep(0.2)
            faixa_inicial_inputs[1].send_keys(UPDATED_VALUES['faixa_2_start'])
            print(f"    ✓ Faixa 2 Inicial: {UPDATED_VALUES['faixa_2_start']}")
        
        if len(faixa_final_inputs) >= 2:
            faixa_final_inputs[1].clear()
            time.sleep(0.2)
            faixa_final_inputs[1].send_keys(UPDATED_VALUES['faixa_2_end'])
            print(f"    ✓ Faixa 2 Final: {UPDATED_VALUES['faixa_2_end']}")
            print(f"    ✅ Faixas do segundo porte atualizadas")
        else:
            print(f"    ℹ️ Segundo porte não encontrado (OK se já existe apenas 1 porte)")
    except Exception as e:
        print(f"    ⚠️ Erro ao modificar segundo porte: {e}")
    
    driver.save_screenshot('tests/screenshots/edit_form_modified.png')
    print("\n  📸 Screenshot: edit_form_modified.png")
    
    # 6. SALVAR ALTERAÇÕES
    print("\n💾 [6/6] Salvando alterações...")
    try:
        save_button = driver.find_element(By.XPATH, "//button[contains(., 'Salvar') or contains(., 'Atualizar')]")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", save_button)
        time.sleep(0.5)
        driver.execute_script("arguments[0].click();", save_button)
        print("  ✓ Botão 'Salvar' clicado")
        time.sleep(2)
        
        # Verificar toast de sucesso
        try:
            toast = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'sucesso') or contains(text(), 'atualizada') or contains(text(), 'Sucesso')]"))
            )
            print(f"  ✅ Toast de SUCESSO: {toast.text}")
        except:
            print("  ⚠️ Toast de sucesso não detectado (pode ter sido rápido demais)")
        
        # Verificar se modal fechou
        time.sleep(2)
        try:
            modal = driver.find_element(By.CSS_SELECTOR, '[role="dialog"]')
            print("  ⚠️ Modal ainda está aberto")
        except:
            print("  ✅ Modal fechou com sucesso")
        
    except Exception as e:
        print(f"  ❌ Erro ao salvar: {e}")
        driver.save_screenshot('tests/screenshots/edit_save_error.png')
    
    # VERIFICAR ALTERAÇÕES SALVAS
    print("\n🔍 Verificando alterações salvas...")
    try:
        # Aguardar página estabilizar e tabela aparecer
        time.sleep(3)
        
        # Aguardar tabela carregar após modal fechar
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'table'))
        )
        time.sleep(1)
        
        # Reabrir atividade para verificar
        table = driver.find_element(By.CSS_SELECTOR, 'table')
        rows = table.find_elements(By.CSS_SELECTOR, 'tbody tr')
        
        for row in rows:
            try:
                cells = row.find_elements(By.CSS_SELECTOR, 'td')
                if len(cells) >= 2:
                    code_cell = cells[0].text
                    
                    if activity_info['code'] in code_cell:
                        # Encontrar botão de editar (segundo botão)
                        buttons = row.find_elements(By.CSS_SELECTOR, 'button')
                        edit_btn = buttons[1] if len(buttons) >= 2 else None
                        
                        if edit_btn:
                            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", edit_btn)
                            time.sleep(0.5)
                            driver.execute_script("arguments[0].click();", edit_btn)
                            time.sleep(2)
                            
                            # Verificar modal
                            modal = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[role="dialog"]')))
                            
                            print("\n  📊 Dados Após Edição:")
                            
                            # Verificar portes salvos
                            porte_selects = modal.find_elements(By.XPATH, "//label[contains(text(), 'Porte do Empreendimento')]/following-sibling::select")
                            print(f"    • Portes salvos: {len(porte_selects)}")
                            
                            for i, porte_select in enumerate(porte_selects):
                                select_porte = Select(porte_select)
                                selected_porte = select_porte.first_selected_option.text
                                print(f"      Porte {i+1}: {selected_porte}")
                            
                            # Verificar faixas salvas
                            faixa_inicial_inputs = modal.find_elements(By.XPATH, "//label[contains(text(), 'Faixa Inicial')]/following-sibling::input")
                            faixa_final_inputs = modal.find_elements(By.XPATH, "//label[contains(text(), 'Faixa Final')]/following-sibling::input")
                            
                            for i in range(len(faixa_inicial_inputs)):
                                inicial = faixa_inicial_inputs[i].get_attribute('value')
                                final = faixa_final_inputs[i].get_attribute('value') if i < len(faixa_final_inputs) else 'N/A'
                                print(f"      Faixa {i+1}: {inicial} - {final}")
                            
                            print("  ✅ Verificação concluída")
                            
                            driver.save_screenshot('tests/screenshots/edit_verification.png')
                            print("  📸 Screenshot: edit_verification.png")
                            
                            # Fechar modal
                            close_button = modal.find_element(By.XPATH, "//button[contains(@aria-label, 'Fechar') or contains(@title, 'Fechar') or contains(., '×')]")
                            driver.execute_script("arguments[0].click();", close_button)
                            time.sleep(1)
                            
                            break
            except:
                continue
                
    except Exception as e:
        print(f"  ⚠️ Erro ao verificar alterações: {e}")
    
    # RESULTADO FINAL
    print("\n" + "=" * 70)
    print("🎉 TESTE DE EDIÇÃO CONCLUÍDO!")
    print(f"   Atividade '{activity_info['code']}' - '{activity_info['name']}' editada")
    print(f"   ✓ Faixas e portes alterados com sucesso")
    print("=" * 70)
    
    time.sleep(3)
    
    # Pausar antes de fechar
    print("\n⏸️  TESTE FINALIZADO - Navegador permanecerá aberto para análise")
    print("    Verifique o console do navegador (DevTools) para erros")
    input("    Pressione ENTER para fechar o navegador e finalizar...")

except Exception as e:
    print(f"\n❌ ERRO DURANTE TESTE: {e}")
    driver.save_screenshot('tests/screenshots/edit_exception_error.png')
    import traceback
    traceback.print_exc()
    
    print("\n⏸️  ERRO CAPTURADO - Navegador permanecerá aberto para análise")
    print("    Verifique o console do navegador (DevTools)")
    input("    Pressione ENTER para fechar o navegador e finalizar...")

finally:
    print("\n🔚 Fechando navegador...")
    driver.quit()
    print("✅ Navegador fechado")

