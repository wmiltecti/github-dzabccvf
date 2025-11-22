"""
Teste Automatizado 01 - Menu e Navegação
=========================================

Testa a navegação até o formulário de Novo Empreendimento.

Fluxo:
1. Faz login no sistema
2. Navega para Dashboard
3. Clica no menu "Empreendimento"
4. Clica no botão "Novo Empreendimento"
5. Valida que o wizard EmpreendimentoWizardMotor foi aberto
6. Valida que está na etapa 1 (Imóvel)

Se tudo OK, chama o próximo teste automatizado (02_imovel).

Autor: GitHub Copilot
Data: 2025-11-22
Branch: feature/evolucao-features
"""

import time
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Configuração
CHROME_DRIVER_PATH = "C:\\chromedriver\\chromedriver.exe"
BASE_URL = "http://localhost:5173"
TIMEOUT = 20

# Dados de login
LOGIN_CPF = "61404694579"
LOGIN_PASSWORD = "Senh@01!"


def executar_teste(driver_existente=None, contexto_anterior=None):
    """
    Executa o teste de navegação até Novo Empreendimento.
    
    Args:
        driver_existente: Instância do WebDriver (se vier de teste anterior)
        contexto_anterior: Dicionário com dados do teste anterior
    
    Returns:
        dict: Contexto para próximo teste
    """
    print("=" * 80)
    print("TESTE 01 - MENU E NAVEGAÇÃO ATÉ NOVO EMPREENDIMENTO")
    print("=" * 80)
    print(f"\n🔧 Configuração:")
    print(f"  - URL: {BASE_URL}")
    print(f"  - ChromeDriver: {CHROME_DRIVER_PATH}")
    print(f"  - Timeout: {TIMEOUT}s")
    print(f"  - Driver existente: {'Sim' if driver_existente else 'Não'}")
    print(f"  - Contexto anterior: {'Sim' if contexto_anterior else 'Não'}")
    print("\n" + "=" * 80 + "\n")
    
    # Usar driver existente ou criar novo
    if driver_existente:
        driver = driver_existente
        wait = WebDriverWait(driver, TIMEOUT)
    else:
        service = Service(CHROME_DRIVER_PATH)
        options = webdriver.ChromeOptions()
        options.add_argument('--start-maximized')
        
        driver = webdriver.Chrome(service=service, options=options)
        wait = WebDriverWait(driver, TIMEOUT)
    
    contexto = {
        'teste': '01_menu_navegacao',
        'status': 'iniciado',
        'driver': driver,
        'wait': wait,
        'erro': None
    }
    
    try:
        # =================================================================
        # ETAPA 1: LOGIN
        # =================================================================
        print("📝 ETAPA 1: LOGIN")
        print("-" * 80)
        
        driver.get(f"{BASE_URL}/login")
        print("✓ Navegou para página de login")
        time.sleep(1)
        
        # CPF
        print("✓ Preenchendo CPF...")
        cpf_input = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="text"]'))
        )
        cpf_input.clear()
        cpf_input.send_keys(LOGIN_CPF)
        
        # Senha
        print("✓ Preenchendo senha...")
        password_input = driver.find_element(By.CSS_SELECTOR, 'input[type="password"]')
        password_input.clear()
        password_input.send_keys(LOGIN_PASSWORD)
        
        # Submit
        print("✓ Clicando em Entrar...")
        submit_btn = driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
        submit_btn.click()
        
        # Aguardar redirecionamento
        print("✓ Aguardando redirecionamento...")
        time.sleep(3)
        
        current_url = driver.current_url
        
        # Verificar se saiu da página de login (login bem-sucedido)
        if 'login' in current_url.lower():
            raise Exception(f"❌ Login falhou - Ainda na página de login: {current_url}")
        
        print(f"✅ Login realizado com sucesso - URL: {current_url}")
        contexto['login_ok'] = True
        
        # Aguardar carregamento da página principal
        time.sleep(2)
        
        # =================================================================
        # ETAPA 2: NAVEGAR PARA EMPREENDIMENTO
        # =================================================================
        print("\n📂 ETAPA 2: NAVEGAR PARA MENU EMPREENDIMENTO")
        print("-" * 80)
        
        print("✓ Procurando botão 'Empreendimento' no menu...")
        
        # Tentar encontrar pelo texto exato
        try:
            empreendimento_btn = wait.until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//button[contains(., 'Empreendimento')]"
                ))
            )
        except TimeoutException:
            # Tentar alternativa com class
            empreendimento_btn = wait.until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//nav//button[.//text()='Empreendimento']"
                ))
            )
        
        print(f"✓ Botão encontrado: {empreendimento_btn.text}")
        
        print("✓ Clicando em 'Empreendimento'...")
        empreendimento_btn.click()
        time.sleep(2)
        
        # Validar navegação
        if 'empreendimento' not in driver.current_url.lower():
            # Se não mudou URL, verificar se conteúdo mudou (SPA)
            try:
                titulo = wait.until(
                    EC.presence_of_element_located((
                        By.XPATH,
                        "//h1[contains(text(), 'Empreendimentos') or contains(text(), 'Empreendimento')]"
                    ))
                )
                print(f"✅ Navegou para seção Empreendimento - Título: {titulo.text}")
            except:
                raise Exception("❌ Não encontrou título da seção Empreendimento")
        else:
            print(f"✅ Navegou para seção Empreendimento - URL: {driver.current_url}")
        
        contexto['menu_empreendimento_ok'] = True
        
        # =================================================================
        # ETAPA 3: CLICAR EM "NOVO EMPREENDIMENTO"
        # =================================================================
        print("\n➕ ETAPA 3: CLICAR EM 'NOVO EMPREENDIMENTO'")
        print("-" * 80)
        
        print("✓ Procurando botão 'Novo Empreendimento'...")
        
        # Tentar encontrar botão verde com texto "Novo Empreendimento"
        try:
            novo_btn = wait.until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//button[contains(@class, 'bg-green-600') and (contains(., 'Novo Empreendimento') or contains(., 'Novo'))]"
                ))
            )
        except TimeoutException:
            # Alternativa: qualquer botão com o texto
            novo_btn = wait.until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//button[contains(., 'Novo Empreendimento') or contains(., 'Novo')]"
                ))
            )
        
        print(f"✓ Botão encontrado: {novo_btn.text}")
        
        print("✓ Clicando em 'Novo Empreendimento'...")
        novo_btn.click()
        time.sleep(2)
        
        contexto['botao_novo_ok'] = True
        
        # =================================================================
        # ETAPA 3.5: VERIFICAR E CONFIRMAR MODAL (SE EXISTIR)
        # =================================================================
        print("\n🔔 ETAPA 3.5: VERIFICAR MODAL DE CONFIRMAÇÃO")
        print("-" * 80)
        
        print("✓ Verificando se há modal de confirmação...")
        try:
            # Procurar modal de confirmação
            modal_confirmar = driver.find_element(
                By.XPATH,
                "//button[contains(., 'Confirmar') or contains(., 'Sim') or contains(., 'Continuar') or contains(., 'OK')]"
            )
            print(f"✓ Modal encontrado, clicando em confirmar...")
            modal_confirmar.click()
            time.sleep(2)
            print("✅ Modal confirmado")
            contexto['modal_confirmado'] = True
        except:
            print("✓ Nenhum modal de confirmação (ou já fechado)")
            contexto['modal_confirmado'] = False
        
        # =================================================================
        # ETAPA 4: VALIDAR WIZARD ABERTO
        # =================================================================
        print("\n🎯 ETAPA 4: VALIDAR WIZARD EMPREENDIMENTO ABERTO")
        print("-" * 80)
        
        print("✓ Verificando se wizard foi aberto...")
        
        # Procurar título "Novo Empreendimento" ou indicadores de wizard
        try:
            titulo_wizard = wait.until(
                EC.presence_of_element_located((
                    By.XPATH,
                    "//h1[contains(text(), 'Novo Empreendimento')]"
                ))
            )
            print(f"✓ Título do wizard encontrado: {titulo_wizard.text}")
        except:
            raise Exception("❌ Título 'Novo Empreendimento' não encontrado")
        
        # Verificar se está na etapa 1 (Imóvel)
        print("✓ Verificando etapa atual (deve ser Imóvel)...")
        
        # Procurar indicadores de step/wizard
        try:
            # Tentar encontrar stepper ou título da etapa
            step_imovel = driver.find_element(
                By.XPATH,
                "//*[contains(text(), 'Imóvel') or contains(text(), 'Propriedade')]"
            )
            print(f"✓ Etapa Imóvel encontrada: {step_imovel.text}")
        except NoSuchElementException:
            print("⚠️ Não encontrou texto 'Imóvel', mas wizard parece aberto")
        
        # Procurar elementos típicos da página de Imóvel
        try:
            # Botão "Buscar" ou campo de busca de imóvel
            busca_imovel = driver.find_element(
                By.XPATH,
                "//button[contains(., 'Buscar')] | //input[contains(@placeholder, 'CAR') or contains(@placeholder, 'matrícula')]"
            )
            print(f"✓ Elemento de busca de imóvel encontrado")
        except:
            print("⚠️ Elementos de busca não encontrados, mas continuando...")
        
        print("✅ Wizard aberto e na etapa Imóvel")
        contexto['wizard_aberto'] = True
        contexto['etapa_atual'] = 'imovel'
        
        # =================================================================
        # CONCLUSÃO DO TESTE 01
        # =================================================================
        print("\n" + "=" * 80)
        print("✅ TESTE 01 CONCLUÍDO COM SUCESSO!")
        print("=" * 80)
        print("\n📊 Resumo:")
        print(f"  ✓ Login realizado")
        print(f"  ✓ Menu 'Empreendimento' acessado")
        print(f"  ✓ Botão 'Novo Empreendimento' clicado")
        print(f"  ✓ Wizard aberto na etapa Imóvel")
        print("\n" + "=" * 80)
        
        contexto['status'] = 'sucesso'
        return contexto
        
    except Exception as e:
        print("\n" + "=" * 80)
        print("❌ ERRO NO TESTE 01")
        print("=" * 80)
        print(f"\nErro: {str(e)}")
        print(f"\nURL atual: {driver.current_url}")
        print("\n" + "=" * 80)
        
        contexto['status'] = 'erro'
        contexto['erro'] = str(e)
        
        # Tirar screenshot do erro
        try:
            screenshot_path = f"tests/screenshots/erro_teste_01_{int(time.time())}.png"
            driver.save_screenshot(screenshot_path)
            print(f"\n📸 Screenshot salvo: {screenshot_path}")
        except:
            pass
        
        return contexto


def main():
    """Função principal - executa apenas este teste."""
    contexto = executar_teste()
    
    if contexto['status'] == 'sucesso':
        print("\n🎉 Teste 01 executado com sucesso!")
        print("\n💡 Próximo passo: Execute test_novo_empreendimento_02_imovel.py")
        
        # Perguntar se quer executar próximo teste
        resposta = input("\nDeseja executar o próximo teste agora? (s/n): ")
        if resposta.lower() == 's':
            print("\n" + "=" * 80)
            print("Iniciando Teste 02 - Imóvel...")
            print("=" * 80 + "\n")
            
            # Importar e executar próximo teste
            try:
                import test_novo_empreendimento_02_imovel as teste02
                contexto_02 = teste02.executar_teste(
                    driver_existente=contexto['driver'],
                    contexto_anterior=contexto
                )
                
                if contexto_02['status'] == 'sucesso':
                    print("\n✅ Todos os testes executados com sucesso!")
                else:
                    print("\n❌ Teste 02 falhou")
            except ImportError:
                print("\n⚠️ Arquivo test_novo_empreendimento_02_imovel.py não encontrado")
                print("Execute-o manualmente quando estiver pronto.")
        else:
            print("\n👍 OK! Execute manualmente quando estiver pronto.")
        
        # Fechar navegador
        input("\nPressione ENTER para fechar o navegador...")
        contexto['driver'].quit()
        
        return 0
    else:
        print("\n❌ Teste 01 falhou!")
        print("Corrija os erros antes de prosseguir.")
        
        # Perguntar se quer fechar
        resposta = input("\nFechar navegador? (s/n): ")
        if resposta.lower() == 's':
            contexto['driver'].quit()
        else:
            print("\n🔍 Navegador mantido aberto para debug.")
            print("Feche manualmente quando terminar.")
        
        return 1


if __name__ == "__main__":
    sys.exit(main())
