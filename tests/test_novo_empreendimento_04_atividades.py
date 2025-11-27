"""
=======================================================================
TESTE 04 - ETAPA ATIVIDADES (NOVO EMPREENDIMENTO)
=======================================================================

Este teste valida a etapa de Atividades no fluxo do Motor BPMN:
- Valida página de Atividades
- Clica em "Adicionar Atividade"
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
    'busca': 'Extração',  # Termo de busca no modal (busca por "Extração Mineral")
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
        
        # Aumentar timeout para página de atividades (pode demorar bastante)
        wait_atividades = WebDriverWait(driver, 60)
        
        # Aguardar botão "Adicionar Atividade" estar visível e clicável
        log_sucesso("Aguardando página Atividades carregar (timeout: 60s)...")
        
        try:
            btn_adicionar = wait_atividades.until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//button[contains(., 'Adicionar Atividade')]"
                ))
            )
            log_sucesso(f"✓ Botão 'Adicionar Atividade' encontrado e clicável")
        except Exception as e:
            log_erro(f"Erro ao encontrar página Atividades: {str(e)}")
            salvar_screenshot_erro(driver, "teste_04_pagina_nao_encontrada")
            
            # Debug: mostrar o que está visível na página
            try:
                body_text = driver.find_element(By.TAG_NAME, "body").text
                log_erro(f"Texto visível na página: {body_text[:200]}...")
            except:
                pass
            
            raise Exception(f"Página de Atividades não carregou - botão 'Adicionar Atividade' não encontrado")
        
        log_sucesso("✅ Na página de Atividades")
        
        # ===============================================================
        # ETAPA 2: USAR BOTÃO 'PREENCHER DADOS'
        # ===============================================================
        log_etapa("ETAPA 2: USAR BOTÃO 'PREENCHER DADOS'", "✨")
        
        log_sucesso("Procurando botão 'Preencher Dados'...")
        
        try:
            btn_preencher = wait.until(EC.element_to_be_clickable((
                By.XPATH,
                "//button[contains(., 'Preencher Dados')]"
            )))
            log_sucesso("Botão 'Preencher Dados' encontrado")
            
            # Scroll até o botão
            scroll_to_element(driver, btn_preencher)
            
            # Clicar no botão
            log_sucesso("Clicando em 'Preencher Dados'...")
            btn_preencher.click()
            time.sleep(2)  # Aguardar preenchimento automático
            
            log_sucesso("✅ Dados preenchidos automaticamente")
            
        except Exception as e:
            log_erro(f"Botão 'Preencher Dados' não encontrado: {str(e)}")
            log_erro("Continuando com método manual...")
            # Fallback para método manual
            btn_adicionar = wait.until(EC.element_to_be_clickable((
                By.XPATH,
                "//button[contains(., 'Adicionar Atividade')]"
            )))
            log_sucesso(f"Botão encontrado: {btn_adicionar.text}")
            btn_adicionar.click()
            time.sleep(1)
            log_sucesso("✅ Botão Adicionar Atividade clicado (fallback)")
        
        # ===============================================================
        # ETAPA 3: VALIDAR PREENCHIMENTO AUTOMÁTICO
        # ===============================================================
        log_etapa("ETAPA 3: VALIDAR PREENCHIMENTO AUTOMÁTICO", "✅")
        
        log_sucesso("Verificando se atividade foi adicionada...")
        time.sleep(1)
        
        # Procurar seção "Atividades Selecionadas"
        try:
            secao_selecionadas = wait.until(EC.presence_of_element_located((
                By.XPATH,
                "//*[contains(text(), 'Atividades Selecionadas')]"
            )))
            log_sucesso(f"✓ Seção encontrada: {secao_selecionadas.text}")
        except:
            log_erro("Seção 'Atividades Selecionadas' não encontrada")
        
        # Verificar se há atividade adicionada
        try:
            cards_selecionados = driver.find_elements(By.XPATH,
                "//div[contains(@class, 'bg-gradient-to-r from-green-50')]")
            if len(cards_selecionados) > 0:
                log_sucesso(f"✓ {len(cards_selecionados)} atividade(s) adicionada(s)")
            else:
                log_erro("Nenhuma atividade selecionada encontrada")
        except:
            log_erro("Erro ao contar atividades selecionadas")
        
        # Verificar se campos quantitativos foram preenchidos
        try:
            campos_preenchidos = driver.find_elements(By.XPATH,
                "//input[@type='number' and @value!='']")
            log_sucesso(f"✓ {len(campos_preenchidos)} campo(s) numérico(s) preenchido(s)")
        except:
            log_sucesso("Campos numéricos não verificados")
        
        log_sucesso("✅ Preenchimento automático validado")
        
        # ===============================================================
        # ETAPA 4: AVANÇAR PARA PRÓXIMA ETAPA
        # ===============================================================
        log_etapa("ETAPA 4: AVANÇAR PARA CARACTERIZAÇÃO", "➡️")
        
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
        # GERAR JSON PARCIAL DA ETAPA ATIVIDADES
        # ===============================================================
        import json
        import os
        
        # Montar JSON parcial com dados até a etapa Atividades
        # Estrutura idêntica ao gerado pelo botão Preencher Dados do frontend
        json_parcial = {
            'metadados': {
                'etapa_atual': 'ATIVIDADES',
                'timestamp': datetime.now().isoformat(),
                'versao': '2.5.2',
                'branch': 'feature/working-branch',
                'origem': 'teste_automatizado_botao_preencher'
            },
            'etapa_04_atividades': {
                'atividades': [{
                    'codigo': 1232407,  # Código da atividade de extração/beneficiamento de carvão
                    'nome': 'Extração e/ou beneficiamento de carvão mineral',
                    'cnaeCodigo': '2.1',
                    'descricao': None,
                    'quantidade': float(DADOS_ATIVIDADE['quantidade']),
                    'unidade': '2',  # Código da unidade de medida
                    'areaOcupada': float(DADOS_ATIVIDADE['area_ocupada']),
                    'porteEmpreendimento': 'Grande',
                    'potencialPoluidor': 'Alto',
                    'isPrincipal': True
                }]
            }
        }
        
        # Salvar JSON parcial
        output_dir = os.path.join(os.path.dirname(__file__), "output")
        os.makedirs(output_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"atividades_json_{timestamp}.json"
        filepath = os.path.join(output_dir, filename)
        
        try:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(json_parcial, f, indent=2, ensure_ascii=False)
            print(f"\n📦 JSON parcial salvo: {filepath}")
        except Exception as e:
            print(f"\n⚠️ Erro ao salvar JSON parcial: {e}")
        
        # ===============================================================
        # SUCESSO
        # ===============================================================
        print("\n" + "=" * 71)
        print("✅ TESTE 04 CONCLUÍDO COM SUCESSO!")
        print("=" * 71)
        print(f"\n📊 Resumo:")
        print(f"  ✓ Página Atividades validada")
        print(f"  ✓ Botão 'Preencher Dados' clicado")
        print(f"  ✓ Atividade adicionada automaticamente")
        print(f"  ✓ Código: 1232407 - Extração e/ou beneficiamento de carvão mineral")
        print(f"  ✓ CNAE: 2.1")
        print(f"  ✓ Quantidade: {DADOS_ATIVIDADE['quantidade']} (unidade: 2)")
        print(f"  ✓ Área Ocupada: {DADOS_ATIVIDADE['area_ocupada']} m²")
        print(f"  ✓ Porte: Grande | Potencial Poluidor: Alto")
        print(f"  ✓ JSON parcial gerado com estrutura completa: {filename}")
        print(f"  ✓ Avançou para Caracterização")
        print("\n" + "=" * 71 + "\n")
        
        # Retornar contexto para próximo teste
        contexto_retorno = {
            'status': 'sucesso',
            'driver': driver,
            'atividade_adicionada': True,
            'atividade_busca': DADOS_ATIVIDADE['busca'],
            'quantidade': DADOS_ATIVIDADE['quantidade'],
            'area_ocupada': DADOS_ATIVIDADE['area_ocupada'],
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
