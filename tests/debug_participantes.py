"""
Script de debug para verificar o HTML da página Participantes no workflow
"""
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service

# Configurações
BASE_URL = "http://localhost:5173"
CHROMEDRIVER_PATH = "C:\\chromedriver\\chromedriver.exe"

# Setup
service = Service(CHROMEDRIVER_PATH)
driver = webdriver.Chrome(service=service)
wait = WebDriverWait(driver, 30)

try:
    print("🔐 Fazendo login...")
    driver.get(f"{BASE_URL}/login")
    time.sleep(2)
    
    # Login
    tipo_select = driver.find_element(By.CSS_SELECTOR, "select")
    tipo_select.send_keys("PF")
    
    cpf_input = driver.find_element(By.CSS_SELECTOR, "input[type='text']")
    cpf_input.send_keys("61404694579")
    
    password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    password_input.send_keys("Senh@01!")
    
    submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit_button.click()
    
    print("⏳ Aguardando dashboard...")
    wait.until(lambda d: '/dashboard' in d.current_url)
    time.sleep(2)
    
    print("✅ Login OK! Clicando em Motor BPMN...")
    motor_button = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Motor BPMN')]"))
    )
    motor_button.click()
    time.sleep(2)
    
    print("✅ Modal aberto! Aguardando Participantes...")
    wait.until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Participantes')]"))
    )
    time.sleep(2)
    
    print("\n" + "="*60)
    print("📸 ESTADO ATUAL DA PÁGINA:")
    print("="*60)
    print(f"URL: {driver.current_url}")
    print(f"\nTítulo da página: {driver.title}")
    
    # Pegar todo o HTML do body
    body_html = driver.find_element(By.TAG_NAME, "body").get_attribute("outerHTML")
    
    # Salvar HTML em arquivo
    with open("debug_participantes_workflow.html", "w", encoding="utf-8") as f:
        f.write(body_html)
    
    print(f"\n✅ HTML salvo em: debug_participantes_workflow.html")
    
    # Procurar botões
    print("\n" + "="*60)
    print("🔍 BOTÕES ENCONTRADOS:")
    print("="*60)
    
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for i, btn in enumerate(buttons):
        text = btn.text.strip()
        if text:
            print(f"{i+1}. '{text}'")
    
    # Verificar se existe o botão "Adicionar Participante"
    print("\n" + "="*60)
    print("🔍 PROCURANDO 'Adicionar Participante':")
    print("="*60)
    
    try:
        add_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Adicionar Participante')]")
        print(f"✅ ENCONTRADO!")
        print(f"   Texto: '{add_btn.text}'")
        print(f"   Visível: {add_btn.is_displayed()}")
        print(f"   Enabled: {add_btn.is_enabled()}")
        print(f"   Classe: {add_btn.get_attribute('class')}")
    except Exception as e:
        print(f"❌ NÃO ENCONTRADO: {e}")
    
    print("\n⏸️  Pressione Enter para fechar o navegador...")
    input()
    
except Exception as e:
    print(f"❌ ERRO: {e}")
    import traceback
    traceback.print_exc()
    
    print("\n⏸️  Pressione Enter para fechar...")
    input()

finally:
    driver.quit()
    print("👋 Navegador fechado")
