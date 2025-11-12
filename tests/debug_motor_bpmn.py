"""
Script de Debug - Motor BPMN
Captura HTML e screenshot para entender por que teste falha
"""

import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

# Configurações
BASE_URL = 'http://localhost:5173'
CHROMEDRIVER_PATH = r'C:\chromedriver\chromedriver.exe'

# Setup driver (usando mesmas opções dos testes funcionais)
service = Service(executable_path=CHROMEDRIVER_PATH)
chrome_options = Options()
chrome_options.add_argument('--start-maximized')
chrome_options.add_argument('--disable-blink-features=AutomationControlled')

driver = webdriver.Chrome(service=service, options=chrome_options)

wait = WebDriverWait(driver, 30)

try:
    print("1. Navegando para login...")
    driver.get(f"{BASE_URL}/login")
    time.sleep(2)
    
    print("2. Fazendo login...")
    # CPF
    cpf_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="text"]')))
    cpf_input.clear()
    cpf_input.send_keys("61404694579")
    
    # Senha
    senha_input = driver.find_element(By.CSS_SELECTOR, 'input[type="password"]')
    senha_input.clear()
    senha_input.send_keys("Senh@01!")
    
    # Clicar Entrar
    entrar_btn = driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
    entrar_btn.click()
    
    print("3. Aguardando dashboard...")
    # Aguardar sair da página de login (pode ir para / ou /dashboard)
    wait.until(lambda d: '/login' not in d.current_url)
    time.sleep(3)
    print(f"   URL atual: {driver.current_url}")
    
    print("4. Capturando HTML ANTES de clicar em Motor BPMN...")
    with open('debug_dashboard_before.html', 'w', encoding='utf-8') as f:
        f.write(driver.page_source)
    driver.save_screenshot('debug_dashboard_before.png')
    
    print("5. Procurando botão Motor BPMN...")
    # Procurar botão verde com FilePlus icon ou texto Motor
    motor_btn = wait.until(
        EC.presence_of_element_located((By.XPATH, "//button[contains(@class, 'bg-green-600') and contains(., 'Motor')]"))
    )
    print(f"   Botão encontrado: {motor_btn.text} | Visível: {motor_btn.is_displayed()}")
    
    # Scroll até o botão para garantir que está visível
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", motor_btn)
    time.sleep(1)
    
    print("6. Clicando no botão Motor BPMN...")
    # Usar JavaScript click se necessário
    driver.execute_script("arguments[0].click();", motor_btn)
    time.sleep(2)
    print(f"   URL após clicar: {driver.current_url}")
    time.sleep(3)
    
    print("7. Capturando HTML DEPOIS de clicar...")
    with open('debug_dashboard_after.html', 'w', encoding='utf-8') as f:
        f.write(driver.page_source)
    driver.save_screenshot('debug_dashboard_after.png')
    print(f"   URL final: {driver.current_url}")
    
    print("8. Procurando elementos do wizard...")
    # Procurar elementos que indicam wizard aberto
    elementos = [
        "Novo Processo de Licenciamento",
        "Inicializando processo",
        "Motor BPMN",
        "Participantes",
        "fixed", # classe do modal
        "inset-0" # classe do overlay
    ]
    
    for texto in elementos:
        found = driver.find_elements(By.XPATH, f"//*[contains(text(), '{texto}') or contains(@class, '{texto}')]")
        print(f"   '{texto}': {len(found)} elementos encontrados")
    
    print("\n✅ Debug concluído!")
    print("Arquivos gerados:")
    print("  - debug_dashboard_before.html")
    print("  - debug_dashboard_before.png")
    print("  - debug_dashboard_after.html")
    print("  - debug_dashboard_after.png")
    
    input("\nPressione ENTER para fechar o navegador...")
    
except Exception as e:
    print(f"\n❌ Erro: {e}")
    driver.save_screenshot('debug_error.png')
    with open('debug_error.html', 'w', encoding='utf-8') as f:
        f.write(driver.page_source)

finally:
    driver.quit()
