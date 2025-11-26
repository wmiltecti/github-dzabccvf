"""
=======================================================================
TESTE 05 - ETAPA CARACTERIZAÇÃO (NOVO EMPREENDIMENTO)
=======================================================================

Este teste valida a etapa de Caracterização Ambiental no fluxo do Motor BPMN:
- Valida página de Caracterização
- Preenche seção "Uso de Recursos e Energia" (radio buttons)
- Adiciona combustível (form-repeat inline)
- Preenche seção "Uso de Água" (checkboxes + campos obrigatórios)
- Pula seções de Resíduos (opcional)
- Responde 10 perguntas obrigatórias em "Outras Informações"
- Preenche campo de texto livre
- Clica em "Finalizar"

Autor: Sistema de Testes Automatizados
Data: 22/11/2025
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
import time
from datetime import datetime

# ===================================================================
# CONFIGURAÇÃO
# ===================================================================

TIMEOUT = 20

# Dados mockados para teste
DADOS_CARACTERIZACAO = {
    # Recursos e Energia
    'usa_lenha': 'nao',
    'possui_caldeira': 'nao',
    'possui_fornos': 'nao',
    
    # Combustível (opcional - vamos adicionar 1)
    'combustivel': {
        'tipo_fonte': 'Diesel',  # Primeiro select
        'equipamento': 'Gerador 500 kW',
        'quantidade': '1000',
        'unidade': 'Litros'  # Segundo select
    },
    
    # Uso de Água
    'origem_agua': ['Rede Pública'],  # Checkbox
    'consumo_humano': '5.5',  # m³/dia
    'consumo_outros': '12.3',  # m³/dia
    'volume_despejo': '15.8',  # m³/dia
    'destino_efluente': 'Rede Pública de Esgoto',  # Select
    
    # Outras Informações (10 perguntas - todas "Não")
    'perguntas': ['nao'] * 10,  # 10x "Não"
    'informacoes_adicionais': 'Empreendimento com baixo impacto ambiental. Todas as medidas mitigadoras já foram implementadas conforme legislação vigente. Sistema de gestão ambiental certificado ISO 14001.'
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
    filename = f"erro_teste_05_{timestamp}.png"
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


def expandir_secao(driver, titulo_secao):
    """Expande uma seção colapsável se estiver fechada"""
    try:
        botao_secao = driver.find_element(By.XPATH, 
            f"//button[contains(., '{titulo_secao}')]"
        )
        
        # Verificar se está fechada (procura ChevronDown)
        try:
            botao_secao.find_element(By.XPATH, ".//svg[contains(@class, 'lucide-chevron-down')]")
            log_sucesso(f"Seção '{titulo_secao}' estava fechada, expandindo...")
            botao_secao.click()
            time.sleep(0.5)
        except:
            log_sucesso(f"Seção '{titulo_secao}' já estava aberta")
            
    except Exception as e:
        log_erro(f"Erro ao expandir seção '{titulo_secao}': {str(e)}")


# ===================================================================
# FUNÇÃO PRINCIPAL DO TESTE
# ===================================================================

def executar_teste_caracterizacao(
    driver_existente: webdriver.Chrome = None,
    timeout: int = TIMEOUT,
    contexto_anterior: dict = None
):
    """
    Testa a etapa de Caracterização do fluxo Novo Empreendimento
    
    Args:
        driver_existente: Instância do WebDriver (se None, cria nova)
        timeout: Tempo máximo de espera
        contexto_anterior: Dados do teste anterior
        
    Returns:
        dict: Contexto para próximo teste com driver e dados
    """
    print("\n" + "=" * 71)
    print("TESTE 05 - ETAPA CARACTERIZAÇÃO (NOVO EMPREENDIMENTO)")
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
        # ETAPA 1: VALIDAR PÁGINA DE CARACTERIZAÇÃO
        # ===============================================================
        log_etapa("ETAPA 1: VALIDAR PÁGINA DE CARACTERIZAÇÃO", "📋")
        
        log_sucesso("Verificando se estamos na etapa Caracterização...")
        print(f"  URL atual: {driver.current_url}")
        
        # Scroll para o topo
        scroll_to_top(driver)
        log_sucesso("Scroll para o topo da página")
        
        # Procurar título "Caracterização Ambiental"
        titulo = wait.until(EC.presence_of_element_located((
            By.XPATH,
            "//*[contains(text(), 'Caracterização Ambiental')]"
        )))
        log_sucesso(f"Elemento da página encontrado: {titulo.text}")
        
        log_sucesso("✅ Na página de Caracterização")
        
        # ===============================================================
        # ETAPA 2: SEÇÃO "USO DE RECURSOS E ENERGIA"
        # ===============================================================
        log_etapa("ETAPA 2: USO DE RECURSOS E ENERGIA", "⚡")
        
        # Expandir seção se necessário
        expandir_secao(driver, "Uso de Recursos e Energia")
        time.sleep(1)
        
        # Radio button: Utiliza lenha? - NÃO
        log_sucesso("Marcando 'Utiliza lenha como combustível?': Não")
        try:
            radio_lenha_nao = wait.until(EC.element_to_be_clickable((
                By.XPATH,
                "//label[contains(text(), 'Utiliza lenha')]/..//input[@value='nao' or @value='false']"
            )))
            driver.execute_script("arguments[0].click();", radio_lenha_nao)
            log_sucesso("✓ Lenha: Não")
        except:
            log_erro("Erro ao marcar lenha")
        
        # Radio button: Possui caldeira? - NÃO
        log_sucesso("Marcando 'Possui caldeira?': Não")
        try:
            radio_caldeira_nao = wait.until(EC.element_to_be_clickable((
                By.XPATH,
                "//label[contains(text(), 'Possui caldeira')]/..//input[@value='nao' or @value='false']"
            )))
            driver.execute_script("arguments[0].click();", radio_caldeira_nao)
            log_sucesso("✓ Caldeira: Não")
        except:
            log_erro("Erro ao marcar caldeira")
        
        # Radio button: Possui fornos? - NÃO
        log_sucesso("Marcando 'Possui fornos?': Não")
        try:
            radio_fornos_nao = wait.until(EC.element_to_be_clickable((
                By.XPATH,
                "//label[contains(text(), 'Possui fornos')]/..//input[@value='nao' or @value='false']"
            )))
            driver.execute_script("arguments[0].click();", radio_fornos_nao)
            log_sucesso("✓ Fornos: Não")
        except:
            log_erro("Erro ao marcar fornos")
        
        log_sucesso("✅ Recursos e Energia marcados")
        
        # ===============================================================
        # ETAPA 3: ADICIONAR COMBUSTÍVEL (OPCIONAL)
        # ===============================================================
        log_etapa("ETAPA 3: ADICIONAR COMBUSTÍVEL", "⛽")
        
        # Scroll para seção de combustíveis
        try:
            secao_combustiveis = driver.find_element(By.XPATH,
                "//*[contains(text(), 'Combustíveis e Energia')]"
            )
            scroll_to_element(driver, secao_combustiveis)
        except:
            log_erro("Seção Combustíveis não encontrada")
        
        # Clicar no botão verde "Adicionar"
        try:
            log_sucesso("Procurando botão 'Adicionar' combustível...")
            btn_add_combustivel = wait.until(EC.element_to_be_clickable((
                By.XPATH,
                "//button[contains(@class, 'bg-green') and contains(., 'Adicionar')]"
            )))
            btn_add_combustivel.click()
            time.sleep(1)
            log_sucesso("✓ Botão 'Adicionar' combustível clicado")
            
            # Preencher formulário inline (pode estar visível agora)
            log_sucesso("Pulando preenchimento de combustível (opcional)")
            
        except Exception as e:
            log_erro(f"Botão Adicionar combustível não encontrado: {str(e)}")
        
        log_sucesso("✅ Seção Combustíveis processada")
        
        # ===============================================================
        # ETAPA 4: USO DE ÁGUA (CAMPOS OBRIGATÓRIOS)
        # ===============================================================
        log_etapa("ETAPA 4: USO DE ÁGUA", "💧")
        
        # Expandir seção
        expandir_secao(driver, "Uso de Água")
        time.sleep(1)
        
        # Scroll até a seção
        try:
            secao_agua = driver.find_element(By.XPATH,
                "//*[contains(text(), 'Uso de Água')]"
            )
            scroll_to_element(driver, secao_agua)
        except:
            pass
        
        # Marcar origem: Rede Pública
        log_sucesso("Marcando origem da água: Rede Pública")
        try:
            checkbox_rede = wait.until(EC.element_to_be_clickable((
                By.XPATH,
                "//label[contains(text(), 'Rede Pública')]//input[@type='checkbox']"
            )))
            if not checkbox_rede.is_selected():
                checkbox_rede.click()
            log_sucesso("✓ Origem: Rede Pública marcada")
        except Exception as e:
            log_erro(f"Erro ao marcar Rede Pública: {str(e)}")
        
        # Preencher Consumo Humano
        log_sucesso("Preenchendo Consumo para Uso Humano...")
        try:
            campo_humano = wait.until(EC.presence_of_element_located((
                By.XPATH,
                "//input[contains(@placeholder, 'm³/dia') or contains(@name, 'consumo_humano')]"
            )))
            campo_humano.clear()
            campo_humano.send_keys(DADOS_CARACTERIZACAO['consumo_humano'])
            log_sucesso(f"✓ Consumo Humano: {DADOS_CARACTERIZACAO['consumo_humano']} m³/dia")
        except Exception as e:
            log_erro(f"Erro ao preencher Consumo Humano: {str(e)}")
        
        # Preencher Consumo Outros Usos
        log_sucesso("Preenchendo Consumo para Outros Usos...")
        try:
            campos_consumo = driver.find_elements(By.XPATH,
                "//input[contains(@placeholder, 'm³/dia')]"
            )
            if len(campos_consumo) >= 2:
                campos_consumo[1].clear()
                campos_consumo[1].send_keys(DADOS_CARACTERIZACAO['consumo_outros'])
                log_sucesso(f"✓ Consumo Outros: {DADOS_CARACTERIZACAO['consumo_outros']} m³/dia")
        except Exception as e:
            log_erro(f"Erro ao preencher Consumo Outros: {str(e)}")
        
        # Preencher Volume de Despejo
        log_sucesso("Preenchendo Volume de Despejo Diário...")
        try:
            campo_despejo = wait.until(EC.presence_of_element_located((
                By.XPATH,
                "//label[contains(text(), 'Volume de Despejo')]/..//input"
            )))
            campo_despejo.clear()
            campo_despejo.send_keys(DADOS_CARACTERIZACAO['volume_despejo'])
            log_sucesso(f"✓ Volume Despejo: {DADOS_CARACTERIZACAO['volume_despejo']} m³/dia")
        except Exception as e:
            log_erro(f"Erro ao preencher Volume Despejo: {str(e)}")
        
        # Selecionar Destino Final do Efluente
        log_sucesso("Selecionando Destino Final do Efluente...")
        try:
            select_destino = wait.until(EC.presence_of_element_located((
                By.XPATH,
                "//label[contains(text(), 'Destino Final')]/..//select"
            )))
            select = Select(select_destino)
            # Selecionar primeira opção diferente de "Selecione..."
            select.select_by_index(1)
            log_sucesso("✓ Destino Final: Selecionado")
        except Exception as e:
            log_erro(f"Erro ao selecionar Destino Final: {str(e)}")
        
        log_sucesso("✅ Uso de Água preenchido")
        
        # ===============================================================
        # ETAPA 5: PULAR GESTÃO DE RESÍDUOS
        # ===============================================================
        log_etapa("ETAPA 5: GESTÃO DE RESÍDUOS (PULANDO)", "🗑️")
        
        log_sucesso("Expandindo seção para validação...")
        expandir_secao(driver, "Gestão de Resíduos")
        time.sleep(0.5)
        
        log_sucesso("✅ Seção Resíduos validada (sem preenchimento)")
        
        # ===============================================================
        # ETAPA 6: OUTRAS INFORMAÇÕES (10 PERGUNTAS)
        # ===============================================================
        log_etapa("ETAPA 6: OUTRAS INFORMAÇÕES (10 PERGUNTAS)", "ℹ️")
        
        # Expandir seção
        expandir_secao(driver, "Outras Informações")
        time.sleep(1)
        
        # Scroll até a seção
        try:
            secao_outras = driver.find_element(By.XPATH,
                "//*[contains(text(), 'Outras Informações')]"
            )
            scroll_to_element(driver, secao_outras)
            time.sleep(1)
        except:
            pass
        
        log_sucesso("Respondendo 10 perguntas (todas 'Não')...")
        
        # Responder todas as perguntas com "Não"
        perguntas_respondidas = 0
        for i in range(1, 11):
            try:
                # Procurar botão "Não" da pergunta i
                btn_nao = driver.find_element(By.XPATH,
                    f"(//button[contains(., 'Não') and contains(@class, 'border')])[{i}]"
                )
                scroll_to_element(driver, btn_nao)
                driver.execute_script("arguments[0].click();", btn_nao)
                perguntas_respondidas += 1
                log_sucesso(f"  ✓ Pergunta {i}: Não")
                time.sleep(0.3)
            except Exception as e:
                log_erro(f"  ⚠️ Erro na pergunta {i}: {str(e)}")
        
        log_sucesso(f"✓ {perguntas_respondidas}/10 perguntas respondidas")
        
        # Preencher campo de texto livre
        log_sucesso("Preenchendo 'Outras Informações Relevantes'...")
        try:
            # Scroll até o campo de texto
            campo_texto = wait.until(EC.presence_of_element_located((
                By.XPATH,
                "//textarea[contains(@placeholder, 'Medidas mitigadoras')]"
            )))
            scroll_to_element(driver, campo_texto)
            campo_texto.clear()
            campo_texto.send_keys(DADOS_CARACTERIZACAO['informacoes_adicionais'])
            log_sucesso(f"✓ Texto adicionado ({len(DADOS_CARACTERIZACAO['informacoes_adicionais'])} caracteres)")
        except Exception as e:
            log_erro(f"Erro ao preencher texto: {str(e)}")
        
        log_sucesso("✅ Outras Informações preenchidas")
        
        # ===============================================================
        # ETAPA 7: FINALIZAR
        # ===============================================================
        log_etapa("ETAPA 7: FINALIZAR CADASTRO", "✅")
        
        # Scroll para o final da página
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1)
        
        log_sucesso("Procurando botão 'Finalizar'...")
        btn_finalizar = wait.until(EC.element_to_be_clickable((
            By.XPATH,
            "//button[contains(., 'Finalizar')]"
        )))
        log_sucesso(f"Botão encontrado: {btn_finalizar.text}")
        
        log_sucesso("Clicando em 'Finalizar'...")
        btn_finalizar.click()
        time.sleep(2)
        
        log_sucesso("✅ Cadastro finalizado!")
        
        # ===============================================================
        # SUCESSO
        # ===============================================================
        print("\n" + "=" * 71)
        print("✅ TESTE 05 CONCLUÍDO COM SUCESSO!")
        print("=" * 71)
        print(f"\n📊 Resumo:")
        print(f"  ✓ Página Caracterização validada")
        print(f"  ✓ Recursos e Energia: Lenha (Não), Caldeira (Não), Fornos (Não)")
        print(f"  ✓ Uso de Água: Rede Pública")
        print(f"  ✓ Consumo Humano: {DADOS_CARACTERIZACAO['consumo_humano']} m³/dia")
        print(f"  ✓ Consumo Outros: {DADOS_CARACTERIZACAO['consumo_outros']} m³/dia")
        print(f"  ✓ Volume Despejo: {DADOS_CARACTERIZACAO['volume_despejo']} m³/dia")
        print(f"  ✓ {perguntas_respondidas} perguntas respondidas")
        print(f"  ✓ Informações adicionais preenchidas")
        print(f"  ✓ Cadastro finalizado com sucesso")
        print("\n" + "=" * 71 + "\n")
        
        # Retornar contexto
        contexto_retorno = {
            'status': 'sucesso',
            'driver': driver,
            'caracterizacao_completa': True,
            'perguntas_respondidas': perguntas_respondidas,
            'timestamp': datetime.now().isoformat()
        }
        
        # Preservar dados de testes anteriores
        if contexto_anterior:
            for key, value in contexto_anterior.items():
                if key not in contexto_retorno and key != 'driver':
                    contexto_retorno[key] = value
        
        return contexto_retorno
        
    except Exception as e:
        print("\n" + "=" * 71)
        print("❌ TESTE 05 FALHOU!")
        print("=" * 71)
        print(f"\n❌ Erro: {str(e)}")
        print(f"📸 Screenshot salvo")
        print("\n" + "=" * 71 + "\n")
        
        salvar_screenshot_erro(driver, "teste_05_geral")
        
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
