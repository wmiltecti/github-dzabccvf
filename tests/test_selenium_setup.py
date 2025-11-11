# Teste simples de configuração do Selenium
print("🔧 Testando configuração do Selenium...")

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from webdriver_manager.chrome import ChromeDriverManager
    print("✅ Imports OK")
    
    # Configurar opções
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    print("✅ Opções configuradas")
    
    # Usar ChromeDriver instalado manualmente
    driver_path = r'C:\chromedriver\chromedriver.exe'
    print(f"📍 Usando ChromeDriver: {driver_path}")
    
    # Criar serviço
    service = Service(executable_path=driver_path)
    print("✅ Serviço criado")
    
    # Iniciar navegador
    print("🌐 Iniciando navegador...")
    driver = webdriver.Chrome(service=service, options=chrome_options)
    print("✅ Navegador iniciado!")
    
    # Testar navegação
    print("🔗 Testando navegação para google.com...")
    driver.get("https://www.google.com")
    print(f"✅ Título da página: {driver.title}")
    
    # Fechar
    driver.quit()
    print("✅ Navegador fechado")
    
    print("\n" + "="*50)
    print("🎉 SUCESSO! Selenium está funcionando perfeitamente!")
    print("="*50)
    
except Exception as e:
    print(f"\n❌ ERRO: {e}")
    print(f"Tipo: {type(e).__name__}")
    import traceback
    traceback.print_exc()
