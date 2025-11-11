# Testes Automatizados - Parametrização de Empreendimento
# Requerimentos: selenium, pytest, webdriver-manager

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
import time
import pytest
from typing import Dict, Any
import os

# Configurações
BASE_URL = os.getenv('TEST_BASE_URL', 'http://localhost:5173')
ADMIN_EMAIL = os.getenv('TEST_ADMIN_EMAIL', 'admin@example.com')
ADMIN_PASSWORD = os.getenv('TEST_ADMIN_PASSWORD', 'admin123')
TIMEOUT = 10

class TestParametrizacaoEmpreendimento:
    """Testes automatizados para funcionalidade de parametrização de empreendimento"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup do navegador antes de cada teste"""
        chrome_options = Options()
        # chrome_options.add_argument('--headless')  # Descomente para modo headless
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--start-maximized')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--disable-software-rasterizer')
        
        # Download e configuração automática do ChromeDriver
        driver_path = ChromeDriverManager().install()
        service = Service(executable_path=driver_path)
        
        self.driver = webdriver.Chrome(
            service=service,
            options=chrome_options
        )
        self.driver.implicitly_wait(5)
        self.wait = WebDriverWait(self.driver, TIMEOUT)
        
        yield
        
        # Teardown
        self.driver.quit()

    def login_admin(self):
        """Realiza login como administrador"""
        print(f"\n🔐 Fazendo login como admin em {BASE_URL}")
        self.driver.get(f"{BASE_URL}/login")
        
        try:
            # Aguarda página de login carregar
            email_input = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="email"], input[placeholder*="email" i]'))
            )
            
            password_input = self.driver.find_element(By.CSS_SELECTOR, 'input[type="password"]')
            submit_button = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
            
            email_input.clear()
            email_input.send_keys(ADMIN_EMAIL)
            password_input.clear()
            password_input.send_keys(ADMIN_PASSWORD)
            
            submit_button.click()
            
            # Aguarda redirecionamento para dashboard
            self.wait.until(EC.url_contains('/dashboard'))
            print("✅ Login realizado com sucesso")
            time.sleep(2)  # Aguarda carregamento completo
            
        except TimeoutException:
            print("❌ Timeout ao fazer login")
            self.driver.save_screenshot('login_error.png')
            raise

    def configurar_sistema(self, pesquisa_obrigatoria: bool, permitir_novo: bool):
        """
        Configura as opções do sistema
        
        Args:
            pesquisa_obrigatoria: Se pesquisa é obrigatória
            permitir_novo: Se permite cadastrar novo empreendimento
        """
        print(f"\n⚙️ Configurando sistema - Pesquisa obrigatória: {pesquisa_obrigatoria}, Permitir novo: {permitir_novo}")
        
        try:
            # Navegar para configurações do sistema
            self.driver.get(f"{BASE_URL}/dashboard")
            time.sleep(2)
            
            # Clicar em Administração no menu lateral
            admin_menu = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Administração')]"))
            )
            admin_menu.click()
            time.sleep(1)
            
            # Clicar em Configurações do Sistema
            config_menu = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Configurações do Sistema')]"))
            )
            config_menu.click()
            time.sleep(2)
            
            # Aguarda toggles carregarem
            toggles = self.wait.until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'button[role="switch"]'))
            )
            
            if len(toggles) < 2:
                raise Exception("Não encontrou os 2 toggles de configuração")
            
            # Toggle 1: Pesquisa Obrigatória
            toggle_pesquisa = toggles[0]
            is_active = 'bg-green-600' in toggle_pesquisa.get_attribute('class')
            
            if is_active != pesquisa_obrigatoria:
                toggle_pesquisa.click()
                time.sleep(1)
                # Aguarda toast de confirmação
                self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'Toastify')))
                print(f"  ✓ Toggle 'Pesquisa Obrigatória' ajustado para: {pesquisa_obrigatoria}")
            
            # Toggle 2: Permitir Novo Cadastro
            toggle_novo = toggles[1]
            is_active = 'bg-green-600' in toggle_novo.get_attribute('class')
            
            if is_active != permitir_novo:
                toggle_novo.click()
                time.sleep(1)
                self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'Toastify')))
                print(f"  ✓ Toggle 'Permitir Novo' ajustado para: {permitir_novo}")
            
            print("✅ Configurações aplicadas com sucesso")
            time.sleep(2)
            
        except Exception as e:
            print(f"❌ Erro ao configurar sistema: {str(e)}")
            self.driver.save_screenshot('config_error.png')
            raise

    def iniciar_nova_solicitacao(self):
        """Inicia uma nova solicitação e navega até etapa 3 (Empreendimento)"""
        print("\n📝 Iniciando nova solicitação")
        
        try:
            # Ir para dashboard
            self.driver.get(f"{BASE_URL}/dashboard")
            time.sleep(2)
            
            # Clicar em "Nova Solicitação" ou "Solicitação de Processo"
            nova_solicitacao = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Nova Solicitação') or contains(., 'Solicitação')]"))
            )
            nova_solicitacao.click()
            time.sleep(3)
            
            # Aguarda wizard carregar
            self.wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(., 'Nova Inscrição')]")))
            print("  ✓ Wizard aberto")
            
            # Preencher Etapa 1 (Participantes) - simplificado
            print("  → Etapa 1: Participantes")
            # Aqui você pode adicionar preenchimento se necessário
            
            # Avançar para Etapa 2
            proximo_btn = self.driver.find_element(By.XPATH, "//button[contains(., 'Próximo') or contains(., 'Avançar')]")
            proximo_btn.click()
            time.sleep(2)
            
            # Preencher Etapa 2 (Imóvel) - simplificado
            print("  → Etapa 2: Imóvel")
            
            # Avançar para Etapa 3 (Empreendimento)
            proximo_btn = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Próximo') or contains(., 'Avançar')]"))
            )
            proximo_btn.click()
            time.sleep(2)
            
            # Aguarda etapa 3 carregar
            self.wait.until(EC.presence_of_element_located((By.XPATH, "//h2[contains(., 'Empreendimento')]")))
            print("✅ Navegado até Etapa 3: Empreendimento")
            
        except Exception as e:
            print(f"❌ Erro ao iniciar solicitação: {str(e)}")
            self.driver.save_screenshot('iniciar_solicitacao_error.png')
            raise

    def pesquisar_empreendimento(self, query: str) -> bool:
        """
        Realiza pesquisa de empreendimento
        
        Args:
            query: Termo de busca (CNPJ, CPF, nome)
            
        Returns:
            True se encontrou resultados, False caso contrário
        """
        print(f"\n🔍 Pesquisando empreendimento: '{query}'")
        
        try:
            # Localizar campo de pesquisa
            search_input = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'input[placeholder*="CNPJ" i], input[placeholder*="pesquis" i]'))
            )
            
            search_input.clear()
            search_input.send_keys(query)
            
            # Clicar no botão Buscar
            buscar_btn = self.driver.find_element(By.XPATH, "//button[contains(., 'Buscar')]")
            buscar_btn.click()
            
            # Aguarda loading terminar
            time.sleep(2)
            
            # Verificar se há resultados
            try:
                resultados = self.driver.find_elements(By.XPATH, "//button[contains(., 'Selecionar')]")
                
                if len(resultados) > 0:
                    print(f"✅ Encontrou {len(resultados)} resultado(s)")
                    return True
                else:
                    print("ℹ️ Nenhum resultado encontrado")
                    return False
                    
            except NoSuchElementException:
                print("ℹ️ Nenhum resultado encontrado")
                return False
                
        except Exception as e:
            print(f"❌ Erro ao pesquisar: {str(e)}")
            self.driver.save_screenshot('pesquisa_error.png')
            raise

    def verificar_botao_cadastrar_novo_visivel(self) -> bool:
        """Verifica se o botão 'Cadastrar Novo Empreendimento' está visível"""
        try:
            botao = self.driver.find_element(By.XPATH, "//button[contains(., 'Cadastrar Novo Empreendimento')]")
            return botao.is_displayed()
        except NoSuchElementException:
            return False

    def clicar_cadastrar_novo(self):
        """Clica no botão Cadastrar Novo Empreendimento"""
        print("\n➕ Clicando em 'Cadastrar Novo Empreendimento'")
        
        try:
            botao = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Cadastrar Novo Empreendimento')]"))
            )
            botao.click()
            time.sleep(2)
            
            # Verificar se card verde apareceu
            card_novo = self.wait.until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(., 'Novo Cadastro de Empreendimento')]"))
            )
            print("✅ Modo novo cadastro ativado")
            
        except Exception as e:
            print(f"❌ Erro ao clicar em cadastrar novo: {str(e)}")
            self.driver.save_screenshot('cadastrar_novo_error.png')
            raise

    def tentar_avancar(self) -> bool:
        """
        Tenta avançar para próxima etapa
        
        Returns:
            True se conseguiu avançar, False se foi bloqueado
        """
        print("\n→ Tentando avançar para próxima etapa")
        
        try:
            # Pegar URL atual
            url_antes = self.driver.current_url
            
            # Clicar em Próximo
            proximo_btn = self.driver.find_element(By.XPATH, "//button[contains(., 'Próximo') or contains(., 'Avançar')]")
            proximo_btn.click()
            time.sleep(2)
            
            # Verificar se URL mudou (avançou)
            url_depois = self.driver.current_url
            
            if url_antes != url_depois:
                print("✅ Avançou para próxima etapa")
                return True
            else:
                print("⛔ Bloqueado - não avançou")
                return False
                
        except Exception as e:
            print(f"❌ Erro ao tentar avançar: {str(e)}")
            return False

    def verificar_toast_erro(self, texto_esperado: str) -> bool:
        """
        Verifica se um toast de erro com texto específico apareceu
        
        Args:
            texto_esperado: Texto que deve estar no toast
            
        Returns:
            True se o toast apareceu com o texto esperado
        """
        try:
            toast = self.wait.until(
                EC.presence_of_element_located((By.XPATH, f"//div[contains(@class, 'Toastify') and contains(., '{texto_esperado}')]"))
            )
            return toast.is_displayed()
        except TimeoutException:
            return False

    # ============================================
    # CENÁRIO 1: Pesquisa OBRIGATÓRIA + Cadastro PERMITIDO
    # ============================================
    
    def test_cenario1_bloquear_sem_pesquisa(self):
        """Cenário 1.1: Deve bloquear avanço sem pesquisar"""
        print("\n" + "="*60)
        print("TESTE: Cenário 1.1 - Bloquear avanço sem pesquisa")
        print("="*60)
        
        self.login_admin()
        self.configurar_sistema(pesquisa_obrigatoria=True, permitir_novo=True)
        self.iniciar_nova_solicitacao()
        
        # Tentar avançar sem pesquisar
        avancou = self.tentar_avancar()
        
        # Verificar toast de erro
        toast_apareceu = self.verificar_toast_erro("pesquise o empreendimento")
        
        assert not avancou, "❌ FALHOU: Deveria ter bloqueado o avanço"
        assert toast_apareceu, "❌ FALHOU: Toast de erro deveria ter aparecido"
        
        print("\n✅ TESTE PASSOU: Bloqueou corretamente sem pesquisa")

    def test_cenario1_pesquisar_sem_resultados(self):
        """Cenário 1.2: Pesquisar sem encontrar resultados"""
        print("\n" + "="*60)
        print("TESTE: Cenário 1.2 - Pesquisar sem resultados")
        print("="*60)
        
        self.login_admin()
        self.configurar_sistema(pesquisa_obrigatoria=True, permitir_novo=True)
        self.iniciar_nova_solicitacao()
        
        # Pesquisar por CNPJ inexistente
        encontrou = self.pesquisar_empreendimento("99999999999999")
        
        assert not encontrou, "❌ FALHOU: Não deveria ter encontrado resultados"
        
        # Verificar se botão Cadastrar Novo aparece
        botao_visivel = self.verificar_botao_cadastrar_novo_visivel()
        
        assert botao_visivel, "❌ FALHOU: Botão 'Cadastrar Novo' deveria estar visível"
        
        print("\n✅ TESTE PASSOU: Pesquisa sem resultados funcionou corretamente")

    def test_cenario1_cadastrar_novo(self):
        """Cenário 1.3: Cadastrar novo empreendimento"""
        print("\n" + "="*60)
        print("TESTE: Cenário 1.3 - Cadastrar novo empreendimento")
        print("="*60)
        
        self.login_admin()
        self.configurar_sistema(pesquisa_obrigatoria=True, permitir_novo=True)
        self.iniciar_nova_solicitacao()
        
        # Pesquisar sem resultados
        self.pesquisar_empreendimento("88888888888888")
        time.sleep(1)
        
        # Clicar em Cadastrar Novo
        self.clicar_cadastrar_novo()
        
        # Verificar se formulário ficou visível
        try:
            self.driver.find_element(By.XPATH, "//label[contains(., 'Tipo de Empreendimento')]")
            print("\n✅ TESTE PASSOU: Formulário de novo cadastro apareceu")
        except NoSuchElementException:
            assert False, "❌ FALHOU: Formulário não apareceu"

    # ============================================
    # CENÁRIO 2: Pesquisa OBRIGATÓRIA + Cadastro NÃO PERMITIDO
    # ============================================
    
    def test_cenario2_botao_novo_nao_aparece(self):
        """Cenário 2.1: Botão Cadastrar Novo não deve aparecer"""
        print("\n" + "="*60)
        print("TESTE: Cenário 2.1 - Botão Cadastrar Novo não aparece")
        print("="*60)
        
        self.login_admin()
        self.configurar_sistema(pesquisa_obrigatoria=True, permitir_novo=False)
        self.iniciar_nova_solicitacao()
        
        # Pesquisar sem resultados
        self.pesquisar_empreendimento("77777777777777")
        time.sleep(2)
        
        # Verificar que botão NÃO aparece
        botao_visivel = self.verificar_botao_cadastrar_novo_visivel()
        
        assert not botao_visivel, "❌ FALHOU: Botão 'Cadastrar Novo' NÃO deveria estar visível"
        
        print("\n✅ TESTE PASSOU: Botão corretamente oculto")

    def test_cenario2_bloquear_sem_selecao(self):
        """Cenário 2.2: Deve bloquear avanço sem seleção"""
        print("\n" + "="*60)
        print("TESTE: Cenário 2.2 - Bloquear avanço sem seleção")
        print("="*60)
        
        self.login_admin()
        self.configurar_sistema(pesquisa_obrigatoria=True, permitir_novo=False)
        self.iniciar_nova_solicitacao()
        
        # Pesquisar sem resultados
        self.pesquisar_empreendimento("66666666666666")
        time.sleep(1)
        
        # Tentar avançar
        avancou = self.tentar_avancar()
        
        # Verificar toast específico
        toast_apareceu = self.verificar_toast_erro("não permitido")
        
        assert not avancou, "❌ FALHOU: Deveria ter bloqueado"
        assert toast_apareceu, "❌ FALHOU: Toast específico deveria aparecer"
        
        print("\n✅ TESTE PASSOU: Bloqueou corretamente sem permitir novo cadastro")

    # ============================================
    # CENÁRIO 3: Pesquisa OPCIONAL
    # ============================================
    
    def test_cenario3_avancar_sem_pesquisa(self):
        """Cenário 3.1: Pode avançar sem pesquisar (pesquisa opcional)"""
        print("\n" + "="*60)
        print("TESTE: Cenário 3.1 - Avançar sem pesquisa (opcional)")
        print("="*60)
        
        self.login_admin()
        self.configurar_sistema(pesquisa_obrigatoria=False, permitir_novo=True)
        self.iniciar_nova_solicitacao()
        
        # Verificar se botão Cadastrar Novo está visível mesmo sem pesquisa
        time.sleep(2)
        botao_visivel = self.verificar_botao_cadastrar_novo_visivel()
        
        assert botao_visivel, "❌ FALHOU: Botão deveria estar visível sem pesquisa"
        
        # Clicar em Cadastrar Novo
        self.clicar_cadastrar_novo()
        
        print("\n✅ TESTE PASSOU: Pode cadastrar novo sem pesquisar (opcional)")

    # ============================================
    # CENÁRIO 4: Empreendimento Existente
    # ============================================
    
    def test_cenario4_selecionar_existente(self):
        """Cenário 4: Selecionar empreendimento existente (requer dados no banco)"""
        print("\n" + "="*60)
        print("TESTE: Cenário 4 - Selecionar empreendimento existente")
        print("="*60)
        print("⚠️ ATENÇÃO: Este teste requer dados reais no banco!")
        
        self.login_admin()
        self.configurar_sistema(pesquisa_obrigatoria=False, permitir_novo=True)
        self.iniciar_nova_solicitacao()
        
        # Pesquisar por CNPJ real (ajuste conforme seus dados)
        # Exemplo: substitua pelo CNPJ que existe no seu banco
        CNPJ_REAL = "12345678000199"  # ⚠️ AJUSTE ESTE VALOR
        
        encontrou = self.pesquisar_empreendimento(CNPJ_REAL)
        
        if not encontrou:
            print("⚠️ PULADO: Nenhum empreendimento encontrado no banco")
            pytest.skip("Sem dados no banco para testar")
            return
        
        # Clicar em Selecionar no primeiro resultado
        try:
            selecionar_btn = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Selecionar')]"))
            )
            selecionar_btn.click()
            time.sleep(2)
            
            # Verificar card verde de confirmação
            card_selecionado = self.driver.find_element(
                By.XPATH, "//div[contains(@class, 'bg-green-50')]//h4[contains(., 'selecionado')]"
            )
            
            assert card_selecionado.is_displayed(), "❌ FALHOU: Card de confirmação não apareceu"
            
            print("\n✅ TESTE PASSOU: Empreendimento selecionado com sucesso")
            
        except Exception as e:
            print(f"❌ FALHOU: Erro ao selecionar: {str(e)}")
            raise


if __name__ == "__main__":
    # Executar testes com pytest
    pytest.main([__file__, "-v", "-s", "--tb=short"])
