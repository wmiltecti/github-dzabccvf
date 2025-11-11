# Teste Automatizado - Cadastro de Tipos de Imóvel
# Testa se o formulário está salvando corretamente no Supabase

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
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

print(f"� CPF: {ADMIN_CPF}")
print(f"🔗 URL: {BASE_URL}")

print("="*70)
print("🧪 TESTE: Cadastro de Tipos de Imóvel")
print("="*70)

# Configurar Chrome
chrome_options = Options()
chrome_options.add_argument('--start-maximized')
chrome_options.add_argument('--disable-gpu')
# chrome_options.add_argument('--headless')  # Descomente para modo headless

print("\n📦 Inicializando ChromeDriver...")
try:
    driver_path = r'C:\chromedriver\chromedriver.exe'
    service = Service(executable_path=driver_path)
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.implicitly_wait(10)
    wait = WebDriverWait(driver, 20)
    print("✅ ChromeDriver iniciado com sucesso")
except Exception as e:
    print(f"❌ Erro ao iniciar ChromeDriver: {e}")
    exit(1)

try:
    # 1. FAZER LOGIN
    print(f"\n🔐 PASSO 1: Fazendo login em {BASE_URL}")
    driver.get(f"{BASE_URL}/login")
    print("  ✓ Página carregada")
    time.sleep(3)
    
    print("  ⏳ Aguardando campos de login...")
    cpf_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="text"], input[placeholder*="CPF"], input[name="cpf"]')))
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
    time.sleep(2)
    print(f"  📍 URL atual: {driver.current_url}")
    
    # Aguardar até 30 segundos pelo redirecionamento
    wait_long = WebDriverWait(driver, 30)
    try:
        wait_long.until(EC.url_contains('/dashboard'))
        print("✅ Login realizado com sucesso - redirecionado para dashboard")
    except:
        print(f"⚠️ Não redirecionou para dashboard. URL atual: {driver.current_url}")
        # Verificar se há mensagem de erro
        try:
            error_msg = driver.find_element(By.CSS_SELECTOR, '.error, .alert, [role="alert"]')
            print(f"❌ Mensagem de erro encontrada: {error_msg.text}")
        except:
            print("ℹ️ Nenhuma mensagem de erro visível")
    
    time.sleep(3)
    
    # 2. NAVEGAR PARA ADMINISTRAÇÃO
    print("\n📂 PASSO 2: Navegando para Administração")
    driver.get(f"{BASE_URL}/dashboard")
    time.sleep(2)
    
    # Clicar em Administração no menu lateral
    admin_menu = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Administração')]"))
    )
    admin_menu.click()
    print("✅ Menu Administração aberto")
    time.sleep(1)
    
    # 3. CLICAR EM TIPOS DE IMÓVEL
    print("\n🏠 PASSO 3: Acessando Tipos de Imóvel")
    property_types_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Tipos de Imóvel')]"))
    )
    property_types_btn.click()
    print("✅ Tipos de Imóvel selecionado")
    time.sleep(2)
    
    # 4. CLICAR EM + NOVO
    print("\n➕ PASSO 4: Clicando em 'Novo'")
    novo_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Novo')]"))
    )
    novo_btn.click()
    print("✅ Modal de criação aberto")
    time.sleep(2)
    
    # 5. PREENCHER FORMULÁRIO
    print("\n📝 PASSO 5: Preenchendo formulário")
    timestamp = datetime.now().strftime("%H%M%S")
    nome_teste = f"Tipo Teste {timestamp}"
    descricao_teste = f"Descrição do tipo de imóvel criado em teste às {timestamp}"
    
    # Encontrar campos do formulário
    nome_input = wait.until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Ex: Rural, Urbano, Linear']"))
    )
    nome_input.clear()
    nome_input.send_keys(nome_teste)
    print(f"  ✓ Nome preenchido: {nome_teste}")
    
    descricao_textarea = driver.find_element(
        By.XPATH, "//textarea[@placeholder='Descrição detalhada do tipo de imóvel']"
    )
    descricao_textarea.clear()
    descricao_textarea.send_keys(descricao_teste)
    print(f"  ✓ Descrição preenchida: {descricao_teste}")
    
    # 6. CLICAR EM SALVAR
    print("\n💾 PASSO 6: Salvando...")
    salvar_btn = driver.find_element(By.XPATH, "//button[contains(., 'Salvar')]")
    salvar_btn.click()
    print("  ✓ Botão Salvar clicado")
    time.sleep(3)
    
    # 7. VERIFICAR SUCESSO
    print("\n🔍 PASSO 7: Verificando resultado...")
    
    # Verificar se modal fechou
    try:
        modal = driver.find_element(By.XPATH, "//div[contains(@class, 'fixed') and contains(@class, 'inset-0')]")
        if modal.is_displayed():
            print("⚠️ Modal ainda está aberto - pode ter erro")
        else:
            print("✅ Modal fechou")
    except:
        print("✅ Modal fechou (não encontrado no DOM)")
    
    # Verificar toast de sucesso
    try:
        toast = wait.until(
            EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'Toastify')]"))
        )
        toast_text = toast.text
        print(f"📬 Toast exibido: {toast_text}")
        
        if "sucesso" in toast_text.lower():
            print("✅ Toast de sucesso encontrado!")
        elif "erro" in toast_text.lower():
            print(f"❌ Toast de erro encontrado: {toast_text}")
    except:
        print("⚠️ Nenhum toast foi exibido")
    
    # Verificar se item aparece na lista
    time.sleep(2)
    try:
        item_na_lista = driver.find_element(By.XPATH, f"//td[contains(text(), '{nome_teste}')]")
        if item_na_lista.is_displayed():
            print(f"✅ Item '{nome_teste}' encontrado na lista!")
            print("\n" + "="*70)
            print("🎉 TESTE PASSOU: Tipo de Imóvel cadastrado com sucesso!")
            print("="*70)
        else:
            print(f"❌ Item '{nome_teste}' não está visível na lista")
    except:
        print(f"❌ Item '{nome_teste}' NÃO encontrado na lista")
        print("\n⚠️ TESTE FALHOU: Item não foi salvo ou lista não atualizou")
        
        # Tentar verificar logs do console do navegador
        print("\n📋 Logs do Console do Navegador:")
        for log in driver.get_log('browser'):
            print(f"  {log['level']}: {log['message']}")
    
    # Aguardar um pouco antes de fechar
    print("\n⏳ Aguardando 3 segundos antes de fechar...")
    time.sleep(3)
    
except Exception as e:
    print(f"\n❌ ERRO DURANTE O TESTE: {str(e)}")
    print(f"   Tipo: {type(e).__name__}")
    
    # Tentar capturar screenshot
    try:
        screenshot_path = f"error_property_types_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        driver.save_screenshot(screenshot_path)
        print(f"📸 Screenshot salvo em: {screenshot_path}")
    except:
        pass
    
    # Tentar mostrar logs do console
    try:
        print("\n📋 Logs do Console do Navegador:")
        for log in driver.get_log('browser'):
            print(f"  {log['level']}: {log['message']}")
    except:
        pass

finally:
    print("\n🔚 Fechando navegador...")
    driver.quit()
    print("✅ Navegador fechado")
