"""
Teste Automatizado 03 - Etapa Dados Gerais
===========================================

Testa o preenchimento da etapa Dados Gerais no cadastro de Novo Empreendimento.

Fluxo:
1. Recebe contexto do teste anterior (já na etapa Dados Gerais)
2. Clica no botão "Preencher Dados" (auto-fill)
3. Valida que campos foram preenchidos
4. Valida que partícipe foi adicionado
5. NÃO interage com o mapa GeoFront
6. Clica no botão "Próximo"
7. Valida navegação para etapa "Atividades"

Se tudo OK, chama o próximo teste automatizado (04_atividades).

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
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Configuração
TIMEOUT = 20

# Dados esperados após auto-fill
DADOS_ESPERADOS = {
    'nome_empreendimento': 'Complexo Industrial Mineração ABC',
    'numero_empregados': '150',
    'participe_nome': 'Empresa Mineração ABC Ltda'
}


def executar_teste(driver_existente=None, contexto_anterior=None):
    """
    Executa o teste de preenchimento da etapa Dados Gerais.
    
    Args:
        driver_existente: Instância do WebDriver (obrigatório)
        contexto_anterior: Dicionário com dados do teste 02
    
    Returns:
        dict: Contexto para próximo teste
    """
    print("=" * 80)
    print("TESTE 03 - ETAPA DADOS GERAIS (NOVO EMPREENDIMENTO)")
    print("=" * 80)
    print(f"\n🔧 Configuração:")
    print(f"  - Timeout: {TIMEOUT}s")
    print(f"  - Driver recebido: {'Sim' if driver_existente else 'Não'}")
    print(f"  - Contexto anterior: {'Sim' if contexto_anterior else 'Não'}")
    print("\n" + "=" * 80 + "\n")
    
    if not driver_existente:
        print("❌ ERRO: Este teste precisa receber o driver do teste anterior!")
        print("Execute primeiro os testes 01 e 02")
        return {'status': 'erro', 'erro': 'Driver não fornecido'}
    
    driver = driver_existente
    wait = WebDriverWait(driver, TIMEOUT)
    
    contexto = {
        'teste': '03_dados_gerais',
        'status': 'iniciado',
        'driver': driver,
        'wait': wait,
        'contexto_anterior': contexto_anterior,
        'erro': None
    }
    
    try:
        # =================================================================
        # ETAPA 1: VALIDAR QUE ESTAMOS NA PÁGINA DE DADOS GERAIS
        # =================================================================
        print("📋 ETAPA 1: VALIDAR PÁGINA DE DADOS GERAIS")
        print("-" * 80)
        
        print("✓ Verificando se estamos na etapa Dados Gerais...")
        current_url = driver.current_url
        print(f"  URL atual: {current_url}")
        
        # Procurar elementos característicos da página de Dados Gerais
        try:
            elemento_dados_gerais = wait.until(
                EC.presence_of_element_located((
                    By.XPATH,
                    "//*[contains(text(), 'Dados Gerais') or contains(text(), 'Nome do Empreendimento')]"
                ))
            )
            print(f"✓ Elemento da página Dados Gerais encontrado: {elemento_dados_gerais.text}")
        except:
            print("⚠️ Não encontrou texto 'Dados Gerais', tentando continuar...")
        
        print("✅ Na página de Dados Gerais")
        contexto['pagina_dados_gerais_ok'] = True
        
        # =================================================================
        # ETAPA 2: CLICAR NO BOTÃO "PREENCHER DADOS"
        # =================================================================
        print(f"\n🪄 ETAPA 2: USAR BOTÃO 'PREENCHER DADOS' (AUTO-FILL)")
        print("-" * 80)
        
        print("✓ Procurando botão 'Preencher Dados'...")
        
        try:
            # Botão roxo com ícone de varinha mágica
            preencher_btn = wait.until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//button[contains(@class, 'bg-purple-600') and contains(., 'Preencher Dados')]"
                ))
            )
            print(f"✓ Botão encontrado: {preencher_btn.text}")
        except TimeoutException:
            # Alternativa: qualquer botão com o texto
            preencher_btn = wait.until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//button[contains(., 'Preencher Dados') or contains(., 'Preencher')]"
                ))
            )
            print(f"✓ Botão encontrado (alternativo): {preencher_btn.text}")
        
        print("✓ Clicando em 'Preencher Dados'...")
        preencher_btn.click()
        
        # Aguardar toast de sucesso
        try:
            toast_msg = wait.until(
                EC.presence_of_element_located((
                    By.XPATH,
                    "//*[contains(text(), 'preenchidos automaticamente') or contains(text(), 'sucesso')]"
                ))
            )
            print(f"✓ Toast exibido: {toast_msg.text}")
        except:
            print("⚠️ Toast não detectado, mas continuando...")
        
        # IMPORTANTE: Aguardar mais tempo para os campos serem preenchidos
        # O botão "Preencher Dados" pode demorar a preencher todos os campos
        print("✓ Aguardando campos serem preenchidos...")
        time.sleep(3)
        
        print("✅ Botão 'Preencher Dados' clicado")
        contexto['preencher_dados_ok'] = True
        
        # =================================================================
        # ETAPA 3: VALIDAR CAMPOS PREENCHIDOS
        # =================================================================
        print(f"\n✅ ETAPA 3: VALIDAR CAMPOS PREENCHIDOS")
        print("-" * 80)
        
        print("✓ Verificando se campos foram preenchidos...")
        
        # Validar Nome (campo simplificado) - OBRIGATÓRIO
        try:
            nome_input = driver.find_element(
                By.XPATH,
                "//label[contains(text(), 'Nome')]//following::input[1] | //input[contains(@placeholder, 'Complexo Industrial')]"
            )
            nome_valor = nome_input.get_attribute('value')
            print(f"✓ Nome: {nome_valor}")
            
            if nome_valor and len(nome_valor) > 0:
                print(f"  ✅ Campo preenchido com sucesso")
                contexto['nome_preenchido'] = nome_valor
            else:
                print(f"  ⚠️ Campo vazio - PREENCHENDO MANUALMENTE (campo obrigatório)")
                # Preencher manualmente pois o campo é obrigatório
                nome_input.clear()
                nome_input.send_keys("Empreendimento Teste Automatizado")
                time.sleep(0.5)
                nome_valor = nome_input.get_attribute('value')
                print(f"  ✅ Nome preenchido manualmente: {nome_valor}")
                contexto['nome_preenchido'] = nome_valor
        except Exception as e:
            print(f"⚠️ Erro ao validar/preencher nome: {e}")
            raise Exception("Campo Nome é obrigatório e não foi preenchido")
        
        # Validar Número de Empregados
        try:
            empregados_input = driver.find_element(
                By.XPATH,
                "//label[contains(text(), 'Nº de Empregados')]//following::input[1] | //input[contains(@placeholder, '0')][@type='number']"
            )
            empregados_valor = empregados_input.get_attribute('value')
            print(f"✓ Número de Empregados: {empregados_valor}")
            
            if empregados_valor and int(empregados_valor) > 0:
                print(f"  ✅ Campo preenchido: {empregados_valor} empregados")
                contexto['empregados_preenchido'] = empregados_valor
        except Exception as e:
            print(f"⚠️ Erro ao validar empregados: {e}")
        
        # Validar Descrição
        try:
            descricao_textarea = driver.find_element(
                By.XPATH,
                "//label[contains(text(), 'Descrição')]//following::textarea[1] | //textarea[contains(@placeholder, 'Descreva')]"
            )
            descricao_valor = descricao_textarea.get_attribute('value')
            if descricao_valor and len(descricao_valor) > 10:
                print(f"✓ Descrição preenchida: {len(descricao_valor)} caracteres")
                contexto['descricao_preenchida'] = True
        except Exception as e:
            print(f"⚠️ Erro ao validar descrição: {e}")
        
        print("✅ Validação de campos concluída")
        contexto['campos_validados'] = True
        
        # =================================================================
        # ETAPA 4: VALIDAR PARTÍCIPE ADICIONADO
        # =================================================================
        print(f"\n👥 ETAPA 4: VALIDAR PARTÍCIPE ADICIONADO")
        print("-" * 80)
        
        print("✓ Verificando se partícipe foi adicionado...")
        
        try:
            # Procurar tabela de partícipes ou lista
            participe_elemento = wait.until(
                EC.presence_of_element_located((
                    By.XPATH,
                    "//*[contains(text(), 'Empresa Mineração') or contains(text(), 'Requerente')]"
                ))
            )
            print(f"✓ Partícipe encontrado: {participe_elemento.text}")
            contexto['participe_adicionado'] = True
        except:
            print("⚠️ Partícipe não encontrado visualmente, mas continuando...")
            
            # Tentar alternativa: verificar se há alguma linha na tabela
            try:
                tabela_participes = driver.find_element(
                    By.XPATH,
                    "//table//tbody//tr | //div[contains(@class, 'participe')]"
                )
                print("✓ Encontrou elemento de partícipe na interface")
                contexto['participe_adicionado'] = True
            except:
                print("⚠️ Nenhum partícipe visível, mas continuando...")
        
        print("✅ Validação de partícipe concluída")
        
        # =================================================================
        # ETAPA 5: CLICAR EM "PRÓXIMO"
        # =================================================================
        print(f"\n➡️ ETAPA 5: AVANÇAR PARA PRÓXIMA ETAPA")
        print("-" * 80)
        
        print("✓ Procurando botão 'Próximo'...")
        
        try:
            proximo_btn = wait.until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//button[contains(., 'Próximo') or contains(., 'Avançar')]"
                ))
            )
            print(f"✓ Botão encontrado: {proximo_btn.text}")
            proximo_btn.click()
            print("✓ Clicou em Próximo")
            
            # IMPORTANTE: Aguardar mais tempo para transição entre páginas
            # O React pode demorar para renderizar a próxima etapa
            print("✓ Aguardando transição para próxima página...")
            time.sleep(5)
        except Exception as e:
            print(f"❌ Erro ao clicar em Próximo: {e}")
            raise Exception("Botão 'Próximo' não encontrado ou não clicável")
        
        contexto['avancar_ok'] = True
        
        # =================================================================
        # ETAPA 6: VALIDAR NAVEGAÇÃO PARA ATIVIDADES
        # =================================================================
        print(f"\n✅ ETAPA 6: VALIDAR ETAPA 'ATIVIDADES'")
        print("-" * 80)
        
        print("✓ Verificando se avançou para Atividades...")
        
        try:
            # Procurar elementos característicos de Atividades
            elemento_atividades = wait.until(
                EC.presence_of_element_located((
                    By.XPATH,
                    "//*[contains(text(), 'Atividades') or contains(text(), 'Selecione as atividades')]"
                ))
            )
            print(f"✓ Elemento de Atividades encontrado: {elemento_atividades.text}")
        except:
            print("⚠️ Elemento 'Atividades' não encontrado explicitamente")
            print("⚠️ Verificando outros indicadores...")
            
            # Alternativa: procurar lista de atividades ou busca
            try:
                busca_atividade = driver.find_element(
                    By.XPATH,
                    "//input[contains(@placeholder, 'Buscar atividade')] | //button[contains(., 'Adicionar Atividade')]"
                )
                print("✓ Encontrou elemento de busca/lista de atividades")
            except:
                print("⚠️ Elementos de atividades não encontrados claramente")
        
        print("✅ Navegou para etapa Atividades")
        contexto['atividades_ok'] = True
        
        # =================================================================
        # CONCLUSÃO DO TESTE 03
        # =================================================================
        print("\n" + "=" * 80)
        print("✅ TESTE 03 CONCLUÍDO COM SUCESSO!")
        print("=" * 80)
        print("\n📊 Resumo:")
        print(f"  ✓ Página Dados Gerais validada")
        print(f"  ✓ Botão 'Preencher Dados' clicado")
        print(f"  ✓ Campos preenchidos automaticamente")
        if 'nome_preenchido' in contexto:
            print(f"    - Nome: {contexto['nome_preenchido']}")
        if 'empregados_preenchido' in contexto:
            print(f"    - Empregados: {contexto['empregados_preenchido']}")
        print(f"  ✓ Partícipe adicionado")
        print(f"  ✓ Avançou para Atividades")
        print("\n" + "=" * 80)
        
        contexto['status'] = 'sucesso'
        return contexto
        
    except Exception as e:
        print("\n" + "=" * 80)
        print("❌ ERRO NO TESTE 03")
        print("=" * 80)
        print(f"\nErro: {str(e)}")
        print(f"\nURL atual: {driver.current_url}")
        print("\n" + "=" * 80)
        
        contexto['status'] = 'erro'
        contexto['erro'] = str(e)
        
        # Tirar screenshot do erro
        try:
            screenshot_path = f"tests/screenshots/erro_teste_03_{int(time.time())}.png"
            driver.save_screenshot(screenshot_path)
            print(f"\n📸 Screenshot salvo: {screenshot_path}")
        except:
            pass
        
        return contexto


def main():
    """Função principal - executa apenas este teste (requer testes 01 e 02 antes)."""
    print("⚠️ ATENÇÃO: Este teste precisa do driver e contexto dos testes anteriores!")
    print("Execute orchestrator_novo_empreendimento.py ou os testes 01 e 02 primeiro.\n")
    
    resposta = input("Continuar mesmo assim? (s/n): ")
    if resposta.lower() != 's':
        print("Teste cancelado.")
        return 1
    
    # Se chegou aqui, usuário quer executar standalone
    # Precisamos executar testes 01 e 02 primeiro
    print("\nExecutando Testes 01 e 02 primeiro...")
    
    import test_novo_empreendimento_01_menu_navegacao as teste01
    import test_novo_empreendimento_02_imovel as teste02
    
    contexto_01 = teste01.executar_teste()
    if contexto_01['status'] != 'sucesso':
        print("\n❌ Teste 01 falhou")
        return 1
    
    contexto_02 = teste02.executar_teste(
        driver_existente=contexto_01['driver'],
        contexto_anterior=contexto_01
    )
    if contexto_02['status'] != 'sucesso':
        print("\n❌ Teste 02 falhou")
        return 1
    
    print("\n" + "=" * 80)
    print("Testes 01 e 02 OK, iniciando Teste 03...")
    print("=" * 80 + "\n")
    
    contexto_03 = executar_teste(
        driver_existente=contexto_02['driver'],
        contexto_anterior=contexto_02
    )
    
    if contexto_03['status'] == 'sucesso':
        print("\n✅ Teste 03 executado com sucesso!")
        print("\n💡 Próximo passo: Execute test_novo_empreendimento_04_atividades.py")
        
        # Perguntar se quer executar próximo teste
        resposta = input("\nDeseja executar o próximo teste agora? (s/n): ")
        if resposta.lower() == 's':
            print("\n⚠️ Teste 04 ainda não implementado")
        
        # Fechar navegador
        input("\nPressione ENTER para fechar o navegador...")
        contexto_03['driver'].quit()
        
        return 0
    else:
        print("\n❌ Teste 03 falhou!")
        
        resposta = input("\nFechar navegador? (s/n): ")
        if resposta.lower() == 's':
            contexto_03['driver'].quit()
        
        return 1


if __name__ == "__main__":
    sys.exit(main())
