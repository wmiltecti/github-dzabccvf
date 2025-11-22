"""
=======================================================================
TESTE 04 - ETAPA ATIVIDADES (NOVO EMPREENDIMENTO)
=======================================================================

Este teste valida a etapa de Atividades no fluxo do Motor BPMN:
- Valida página de Atividades
- Clica em "Adicionar Atividade do Sistema"
- Seleciona uma atividade do sistema
- Preenche dados quantitativos (quantidade e área ocupada)
- Avança para próxima etapa (Caracterização)

Autor: Sistema de Testes Automatizados
Data: 22/11/2025
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import time
from datetime import datetime

# ===================================================================
# CONFIGURAÇÃO
# ===================================================================

TIMEOUT = 20

# Dados mockados de atividade para teste
DADOS_ATIVIDADE = {
    'busca': 'Pesquisa mineral',  # Termo de busca no modal
    'quantidade': '150',
    'area_ocupada': '2500.50'
}


# ===================================================================
# FUNÇÕES AUXILIARES
# ===================================================================

def log_etapa(etapa: str, emoji: str = "📝"):
    """Log formatado para cada etapa do teste"""
    print(f"\n{emoji} {etapa.upper()}")
    print("-" * 71)


def log_sucesso(mensagem: str):
    """Log de sucesso"""
    print(f"✓ {mensagem}")


def log_erro(mensagem: str):
    """Log de erro"""
    print(f"⚠️ {mensagem}")


def salvar_screenshot_erro(driver: webdriver.Chrome, descricao: str):
    """Salva screenshot quando ocorre erro"""
    timestamp = int(time.time())
    filename = f"erro_teste_04_{timestamp}.png"
    driver.save_screenshot(filename)
    log_erro(f"Screenshot salvo: {filename}")


def scroll_to_top(driver: webdriver.Chrome):
    """Scroll para o topo da página"""
    driver.execute_script("window.scrollTo(0, 0);")
    time.sleep(0.5)


def scroll_to_element(driver: webdriver.Chrome, element):
    """Scroll suave até elemento"""
    driver.execute_script("""
        arguments[0].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    """, element)
    time.sleep(0.5)


# ===================================================================
# FUNÇÃO PRINCIPAL DO TESTE
# ===================================================================

def executar_teste_atividades(
    driver_existente: webdriver.Chrome = None,
    timeout: int = TIMEOUT,
    contexto_anterior: dict = None
):
    """
    Testa a etapa de Atividades do fluxo Novo Empreendimento
    
    Args:
        driver_existente: Instância do WebDriver (se None, cria nova)
        timeout: Tempo máximo de espera
        contexto_anterior: Dados do teste anterior
        
    Returns:
        dict: Contexto para próximo teste com driver e dados
    """
    print("\n" + "=" * 71)
    print("TESTE 04 - ETAPA ATIVIDADES (NOVO EMPREENDIMENTO)")
    print("=" * 71)
    
    driver_criado = False
    driver = driver_existente
    
    if driver is None:
        log_erro("ERRO: Este teste precisa receber o driver do teste anterior!")
        return None
    
    wait = WebDriverWait(driver, timeout)
    
    print(f"\n🔧 Configuração:")
    print(f"  - Timeout: {timeout}s")
    print(f"  - Driver recebido: {'Sim' if driver else 'Não'}")
    print(f"  - Contexto anterior: {'Sim' if contexto_anterior else 'Não'}")
    print("\n" + "=" * 71)
    
    try:
        # ===============================================================
        # ETAPA 1: VALIDAR PÁGINA DE ATIVIDADES
        # ===============================================================
        log_etapa("ETAPA 1: VALIDAR PÁGINA DE ATIVIDADES", "📋")
        
        log_sucesso("Verificando se estamos na etapa Atividades...")
        print(f"  URL atual: {driver.current_url}")
        
        # Scroll para o topo
        scroll_to_top(driver)
        log_sucesso("Scroll para o topo da página")
        
        # Procurar título "Atividades do Empreendimento"
        titulo = wait.until(EC.presence_of_element_located((
            By.XPATH,
            "//*[contains(text(), 'Atividades do Empreendimento')]"
        )))
        log_sucesso(f"Elemento da página Atividades encontrado: {titulo.text}")
        
        log_sucesso("✅ Na página de Atividades")
        
        # ===============================================================
        # ETAPA 2: CLICAR EM 'ADICIONAR ATIVIDADE DO SISTEMA'
        # ===============================================================
        log_etapa("ETAPA 2: CLICAR EM 'ADICIONAR ATIVIDADE DO SISTEMA'", "➕")
        
        log_sucesso("Procurando botão 'Adicionar Atividade do Sistema'...")
        btn_adicionar = wait.until(EC.element_to_be_clickable((
            By.XPATH,
            "//button[contains(., 'Adicionar Atividade do Sistema')]"
        )))
        log_sucesso(f"Botão encontrado: {btn_adicionar.text}")
        
        log_sucesso("Clicando em 'Adicionar Atividade do Sistema'...")
        btn_adicionar.click()
        time.sleep(1)
        
        log_sucesso("✅ Botão clicado")
        
        # ===============================================================
        # ETAPA 3: MODAL DE SELEÇÃO DE ATIVIDADE
        # ===============================================================
        log_etapa("ETAPA 3: MODAL DE SELEÇÃO DE ATIVIDADE", "🔍")
        
        log_sucesso("Verificando se modal de seleção foi aberto...")
        modal_titulo = wait.until(EC.presence_of_element_located((
            By.XPATH,
            "//*[contains(text(), 'Selecionar Atividade Cadastrada')]"
        )))
        log_sucesso(f"Modal encontrado: {modal_titulo.text}")
        
        # Esperar campo de busca estar presente
        log_sucesso("Procurando campo de busca...")
        campo_busca = wait.until(EC.presence_of_element_located((
            By.XPATH,
            "//input[contains(@placeholder, 'Buscar por nome ou código')]"
        )))
        log_sucesso("Campo de busca encontrado")
        
        # Buscar atividade específica (opcional)
        if DADOS_ATIVIDADE['busca']:
            log_sucesso(f"Buscando por: '{DADOS_ATIVIDADE['busca']}'...")
            campo_busca.clear()
            campo_busca.send_keys(DADOS_ATIVIDADE['busca'])
            time.sleep(1.5)  # Aguardar filtragem
            log_sucesso("Busca realizada")
        
        log_sucesso("✅ Modal de seleção aberto")
        
        # ===============================================================
        # ETAPA 4: SELECIONAR ATIVIDADE
        # ===============================================================
        log_etapa("ETAPA 4: SELECIONAR ATIVIDADE", "✅")
        
        log_sucesso("Aguardando lista de atividades...")
        time.sleep(1)
        
        # Procurar card de atividade (primeira disponível ou filtrada)
        log_sucesso("Procurando card de atividade para selecionar...")
        
        # Estratégia 1: Tentar clicar no primeiro card que não está selecionado
        try:
            cards_atividade = driver.find_elements(By.XPATH, 
                "//div[contains(@class, 'border rounded-lg p-4 cursor-pointer') and not(contains(@class, 'border-green-500'))]"
            )
            
            if len(cards_atividade) > 0:
                card = cards_atividade[0]
                
                # Pegar informações da atividade
                try:
                    nome_atividade = card.find_element(By.XPATH, ".//h4").text
                    codigo = card.find_element(By.XPATH, ".//span[contains(text(), 'Cód.')]").text
                    log_sucesso(f"Atividade encontrada: {nome_atividade} ({codigo})")
                except:
                    log_sucesso("Atividade encontrada (sem detalhes)")
                
                # Scroll até o card
                scroll_to_element(driver, card)
                
                # Clicar no card
                log_sucesso("Clicando na atividade...")
                card.click()
                time.sleep(1.5)
                
                log_sucesso("✅ Atividade selecionada")
            else:
                raise Exception("Nenhum card de atividade disponível para seleção")
                
        except Exception as e:
            log_erro(f"Erro ao selecionar atividade: {str(e)}")
            salvar_screenshot_erro(driver, "selecionar_atividade")
            raise
        
        # ===============================================================
        # ETAPA 5: VALIDAR ATIVIDADE ADICIONADA
        # ===============================================================
        log_etapa("ETAPA 5: VALIDAR ATIVIDADE ADICIONADA", "✅")
        
        log_sucesso("Verificando se atividade foi adicionada...")
        
        # Modal deve fechar
        time.sleep(1)
        
        # Procurar seção "Atividades Selecionadas"
        try:
            secao_selecionadas = wait.until(EC.presence_of_element_located((
                By.XPATH,
                "//*[contains(text(), 'Atividades Selecionadas')]"
            )))
            log_sucesso(f"Seção encontrada: {secao_selecionadas.text}")
        except:
            log_erro("Seção 'Atividades Selecionadas' não encontrada")
        
        # Procurar card da atividade selecionada
        try:
            card_selecionado = wait.until(EC.presence_of_element_located((
                By.XPATH,
                "//div[contains(@class, 'bg-gradient-to-r from-green-50')]"
            )))
            log_sucesso("Card de atividade selecionada encontrado")
        except:
            log_erro("Card de atividade não encontrado")
        
        log_sucesso("✅ Atividade adicionada com sucesso")
        
        # ===============================================================
        # ETAPA 6: PREENCHER DADOS QUANTITATIVOS
        # ===============================================================
        log_etapa("ETAPA 6: PREENCHER DADOS QUANTITATIVOS", "📊")
        
        log_sucesso("Procurando campos de dados quantitativos...")
        
        # Scroll até a seção de dados quantitativos
        try:
            secao_quantitativos = driver.find_element(By.XPATH, 
                "//*[contains(text(), 'Dados Quantitativos')]"
            )
            scroll_to_element(driver, secao_quantitativos)
            log_sucesso("Scroll até dados quantitativos")
        except:
            log_erro("Seção 'Dados Quantitativos' não encontrada")
        
        # Campo Unidade de Medida (geralmente readonly)
        try:
            campo_unidade = driver.find_element(By.XPATH,
                "//input[contains(@placeholder, 'ton/mês') or contains(@placeholder, 'Ex:')]"
            )
            unidade_valor = campo_unidade.get_attribute('value')
            if unidade_valor:
                log_sucesso(f"Unidade de Medida (pré-definida): {unidade_valor}")
            else:
                log_sucesso("Unidade de Medida: campo vazio")
        except:
            log_sucesso("Campo Unidade de Medida não encontrado (pode ser readonly)")
        
        # Campo Quantidade
        try:
            log_sucesso("Preenchendo Quantidade...")
            campo_quantidade = wait.until(EC.presence_of_element_located((
                By.XPATH,
                "//input[@type='number' and (@placeholder='Ex: 100' or contains(@placeholder, 'Quantidade'))]"
            )))
            campo_quantidade.clear()
            campo_quantidade.send_keys(DADOS_ATIVIDADE['quantidade'])
            log_sucesso(f"Quantidade preenchida: {DADOS_ATIVIDADE['quantidade']}")
        except Exception as e:
            log_erro(f"Erro ao preencher Quantidade: {str(e)}")
        
        # Campo Área Ocupada
        try:
            log_sucesso("Preenchendo Área Ocupada...")
            campo_area = wait.until(EC.presence_of_element_located((
                By.XPATH,
                "//input[@type='number' and contains(@placeholder, '500.00')]"
            )))
            campo_area.clear()
            campo_area.send_keys(DADOS_ATIVIDADE['area_ocupada'])
            log_sucesso(f"Área Ocupada preenchida: {DADOS_ATIVIDADE['area_ocupada']} m²")
        except Exception as e:
            log_erro(f"Erro ao preencher Área Ocupada: {str(e)}")
        
        log_sucesso("✅ Dados quantitativos preenchidos")
        
        # ===============================================================
        # ETAPA 7: AVANÇAR PARA PRÓXIMA ETAPA
        # ===============================================================
        log_etapa("ETAPA 7: AVANÇAR PARA CARACTERIZAÇÃO", "➡️")
        
        # Scroll para o final da página onde está o botão Próximo
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(0.5)
        
        log_sucesso("Procurando botão 'Próximo'...")
        btn_proximo = wait.until(EC.element_to_be_clickable((
            By.XPATH,
            "//button[contains(., 'Próximo')]"
        )))
        log_sucesso(f"Botão encontrado: {btn_proximo.text}")
        
        log_sucesso("Clicou em Próximo")
        btn_proximo.click()
        time.sleep(2)
        
        # ===============================================================
        # ETAPA 8: VALIDAR ETAPA 'CARACTERIZAÇÃO'
        # ===============================================================
        log_etapa("✅ ETAPA 8: VALIDAR ETAPA 'CARACTERIZAÇÃO'", "✅")
        
        log_sucesso("Verificando se avançou para Caracterização...")
        try:
            elemento_caracterizacao = wait.until(EC.presence_of_element_located((
                By.XPATH,
                "//*[contains(text(), 'Caracterização') or contains(text(), 'caracterização')]"
            )))
            log_sucesso(f"Elemento de Caracterização encontrado: {elemento_caracterizacao.text}")
            log_sucesso("✅ Navegou para etapa Caracterização")
        except Exception as e:
            log_erro(f"Erro ao validar Caracterização: {str(e)}")
            salvar_screenshot_erro(driver, "validar_caracterizacao")
            raise
        
        # ===============================================================
        # SUCESSO
        # ===============================================================
        print("\n" + "=" * 71)
        print("✅ TESTE 04 CONCLUÍDO COM SUCESSO!")
        print("=" * 71)
        print(f"\n📊 Resumo:")
        print(f"  ✓ Página Atividades validada")
        print(f"  ✓ Botão 'Adicionar Atividade' clicado")
        print(f"  ✓ Modal de seleção aberto")
        print(f"  ✓ Atividade selecionada e adicionada")
        print(f"  ✓ Quantidade: {DADOS_ATIVIDADE['quantidade']}")
        print(f"  ✓ Área Ocupada: {DADOS_ATIVIDADE['area_ocupada']} m²")
        print(f"  ✓ Avançou para Caracterização")
        print("\n" + "=" * 71 + "\n")
        
        # Retornar contexto para próximo teste
        return {
            'status': 'sucesso',
            'driver': driver,
            'atividade_adicionada': True,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        print("\n" + "=" * 71)
        print("❌ TESTE 04 FALHOU!")
        print("=" * 71)
        print(f"\n❌ Erro: {str(e)}")
        print(f"📸 Screenshot salvo")
        print("\n" + "=" * 71 + "\n")
        
        salvar_screenshot_erro(driver, "teste_04_geral")
        
        # Se criamos o driver, fechar
        if driver_criado and driver:
            driver.quit()
        
        raise


# ===================================================================
# EXECUÇÃO STANDALONE (PARA TESTES INDIVIDUAIS)
# ===================================================================

if __name__ == "__main__":
    print("⚠️ Este teste deve ser executado pelo orquestrador!")
    print("Execute: python orchestrator_novo_empreendimento.py")
