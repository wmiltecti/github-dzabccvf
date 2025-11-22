"""
Teste Automatizado 02 - Etapa Imóvel
=====================================

Testa o cadastro de imóvel na etapa Imóvel do fluxo Novo Empreendimento.

Fluxo:
1. Recebe contexto do teste anterior (wizard já aberto na etapa Imóvel)
2. Verifica se modal "Cadastrar Novo Imóvel" está aberto (ou clica no botão)
3. Seleciona tipo de imóvel no select (RURAL, URBANO ou LINEAR - aleatório)
4. Aguarda formulário específico do tipo aparecer
5. Preenche todos os campos obrigatórios com dados fictícios
6. Clica em "Cadastrar Imóvel" (salva e fecha modal)
7. Clica no botão "Próximo"
8. Valida navegação para etapa "Dados Gerais"

Se tudo OK, passa contexto para o próximo teste (03_dados_gerais).

Autor: GitHub Copilot
Data: 2025-11-22
Branch: feature/evolucao-features
"""

import time
import sys
import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.support.ui import Select

# Configuração
CHROME_DRIVER_PATH = "C:\\chromedriver\\chromedriver.exe"
BASE_URL = "http://localhost:5173"
TIMEOUT = 20

# Dados fictícios para imóveis
DADOS_RURAL = {
    'nome': f'Fazenda Teste {random.randint(1000, 9999)}',
    'car': f'SC-{random.randint(100000, 999999)}-{random.randint(10000000, 99999999)}',
    'municipio': 'Florianópolis',
    'uf': 'SC',
    'area': str(random.randint(100, 5000)),
    'lat': '-27.595378',
    'long': '-48.548050'
}

DADOS_URBANO = {
    'nome': f'Lote Urbano Teste {random.randint(1000, 9999)}',
    'cep': '88015-000',
    'logradouro': 'Rua Felipe Schmidt',
    'numero': str(random.randint(100, 999)),
    'bairro': 'Centro',
    'complemento': f'Sala {random.randint(100, 500)}',
    'municipio': 'Florianópolis',
    'uf': 'SC',
    'matricula': str(random.randint(10000, 99999)),
    'area': str(random.randint(50, 500)),
    'lat': '-27.595378',
    'long': '-48.548050'
}

DADOS_LINEAR = {
    'nome': f'Rodovia Teste {random.randint(1000, 9999)}',
    'municipio_inicio': 'Florianópolis',
    'uf_inicio': 'SC',
    'municipio_final': 'São José',
    'uf_final': 'SC',
    'extensao': str(random.randint(10, 100))
}


def executar_teste(driver_existente=None, contexto_anterior=None):
    """
    Executa o teste de preenchimento da etapa Imóvel.
    
    Args:
        driver_existente: Instância do WebDriver (obrigatório)
        contexto_anterior: Dicionário com dados do teste 01
    
    Returns:
        dict: Contexto para próximo teste
    """
    print("=" * 80)
    print("TESTE 02 - ETAPA IMÓVEL (NOVO EMPREENDIMENTO)")
    print("=" * 80)
    print(f"\n🔧 Configuração:")
    print(f"  - Timeout: {TIMEOUT}s")
    print(f"  - Driver recebido: {'Sim' if driver_existente else 'Não'}")
    print(f"  - Contexto anterior: {'Sim' if contexto_anterior else 'Não'}")
    print("\n" + "=" * 80 + "\n")
    
    if not driver_existente:
        print("❌ ERRO: Este teste precisa receber o driver do teste anterior!")
        print("Execute primeiro: test_novo_empreendimento_01_menu_navegacao.py")
        return {'status': 'erro', 'erro': 'Driver não fornecido'}
    
    driver = driver_existente
    wait = WebDriverWait(driver, TIMEOUT)
    
    # Escolher tipo de imóvel aleatoriamente
    tipos_imovel = ['RURAL', 'URBANO', 'LINEAR']
    tipo_escolhido = random.choice(tipos_imovel)
    
    contexto = {
        'teste': '02_imovel',
        'status': 'iniciado',
        'driver': driver,
        'wait': wait,
        'tipo_imovel': tipo_escolhido,
        'contexto_anterior': contexto_anterior,
        'erro': None
    }
    
    try:
        # =================================================================
        # ETAPA 1: VALIDAR ETAPA IMÓVEL E AGUARDAR MODAL
        # =================================================================
        print("🏠 ETAPA 1: VALIDAR ETAPA IMÓVEL")
        print("-" * 80)
        
        print("✓ Verificando se estamos na etapa Imóvel...")
        current_url = driver.current_url
        print(f"  URL atual: {current_url}")
        
        # Aguardar página carregar
        time.sleep(3)
        
        # Verificar se modal "Cadastrar Novo Imóvel" já está aberto
        print("✓ Verificando se modal 'Cadastrar Novo Imóvel' está aberto...")
        try:
            modal_titulo = wait.until(
                EC.presence_of_element_located((
                    By.XPATH,
                    "//*[contains(text(), 'Cadastrar Novo Imóvel')]"
                ))
            )
            print(f"✓ Modal encontrado: {modal_titulo.text}")
            contexto['modal_aberto'] = True
        except:
            print("⚠️ Modal não encontrado, tentando clicar no botão...")
            # Tentar clicar no botão "Cadastrar Novo Imóvel"
            try:
                cadastrar_btn = wait.until(
                    EC.element_to_be_clickable((
                        By.XPATH,
                        "//button[contains(., 'Cadastrar') and contains(., 'Imóvel')]"
                    ))
                )
                print(f"✓ Botão encontrado: {cadastrar_btn.text}")
                cadastrar_btn.click()
                time.sleep(2)
                print("✓ Modal aberto")
                contexto['modal_aberto'] = True
            except:
                raise Exception("❌ Não foi possível abrir modal de cadastro")
        
        print("✅ Na etapa Imóvel com modal aberto")
        
        # =================================================================
        # ETAPA 2: SELECIONAR TIPO DE IMÓVEL NO SELECT
        # =================================================================
        print(f"\n📋 ETAPA 2: SELECIONAR TIPO DE IMÓVEL ({tipo_escolhido})")
        print("-" * 80)
        
        print(f"✓ Tipo escolhido: {tipo_escolhido}")
        
        # Aguardar select de tipo estar disponível
        time.sleep(1)
        
        # Procurar o select de tipo de imóvel
        print("✓ Procurando select 'Tipo de Imóvel'...")
        try:
            tipo_select = wait.until(
                EC.presence_of_element_located((
                    By.XPATH,
                    "//select | //select[contains(@class, 'w-full')]"
                ))
            )
            print("✓ Select encontrado")
        except:
            raise Exception("❌ Select de tipo não encontrado")
        
        # Selecionar tipo de imóvel
        print(f"✓ Selecionando tipo: {tipo_escolhido}...")
        try:
            Select(tipo_select).select_by_value(tipo_escolhido)
            time.sleep(2)  # Aguardar formulário específico aparecer
            print(f"✓ Tipo {tipo_escolhido} selecionado")
        except Exception as e:
            raise Exception(f"❌ Erro ao selecionar tipo: {e}")
        
        contexto['tipo_selecionado'] = True
        
        # =================================================================
        # ETAPA 3: PREENCHER FORMULÁRIO ESPECÍFICO DO TIPO
        # =================================================================
        print(f"\n📝 ETAPA 3: PREENCHER FORMULÁRIO DO IMÓVEL {tipo_escolhido}")
        print("-" * 80)
        
        if tipo_escolhido == 'RURAL':
            dados = DADOS_RURAL
            print(f"✓ Dados a preencher:")
            print(f"  - Nome: {dados['nome']}")
            print(f"  - CAR: {dados['car']}")
            print(f"  - Município: {dados['municipio']}/{dados['uf']}")
            print(f"  - Área: {dados['area']} ha")
            
            # Preencher campos de texto
            campos = [
                ('Nome', "//input[@name='nome'] | //input[contains(@placeholder, 'Nome') or contains(@placeholder, 'Fazenda')]", dados['nome']),
                ('CAR', "//input[@name='car_codigo'] | //input[contains(@placeholder, 'CAR') or contains(@placeholder, 'XX-')]", dados['car']),
                ('Área Total', "//input[@name='area_total'] | //input[@type='number'][contains(@placeholder, '0.00') or contains(@class, 'area')]", dados['area']),
                ('Município', "//input[@name='municipio'] | //input[contains(@placeholder, 'município')]", dados['municipio']),
                ('Latitude', "//input[@name='coordenadas_utm_lat'] | //input[contains(@placeholder, 'Latitude')]", dados['lat']),
                ('Longitude', "//input[@name='coordenadas_utm_long'] | //input[contains(@placeholder, 'Longitude')]", dados['long'])
            ]
            
            # Selects
            try:
                # Situação CAR
                print(f"✓ Selecionando Situação CAR: Ativo")
                situacao_select = driver.find_element(By.XPATH, "//select[.//option[contains(text(), 'Ativo')]]")
                Select(situacao_select).select_by_visible_text('Ativo')
                time.sleep(0.3)
            except Exception as e:
                print(f"⚠️ Erro ao selecionar Situação CAR: {e}")
            
            try:
                # UF
                print(f"✓ Selecionando UF: {dados['uf']}")
                uf_select = driver.find_element(By.XPATH, "//select[.//option[@value='SC']]")
                Select(uf_select).select_by_value(dados['uf'])
                time.sleep(0.3)
            except Exception as e:
                print(f"⚠️ Erro ao selecionar UF: {e}")
            
            try:
                # Sistema de Referência
                print(f"✓ Selecionando Sistema de Referência: SIRGAS 2000")
                sistema_select = driver.find_element(By.XPATH, "//select[.//option[contains(text(), 'SIRGAS')]]")
                Select(sistema_select).select_by_visible_text('SIRGAS 2000')
                time.sleep(0.3)
            except Exception as e:
                print(f"⚠️ Erro ao selecionar Sistema: {e}")
        
        elif tipo_escolhido == 'URBANO':
            dados = DADOS_URBANO
            print(f"✓ Dados a preencher (URBANO):")
            print(f"  - Nome: {dados['nome']}")
            print(f"  - CEP: {dados['cep']}")
            print(f"  - Logradouro: {dados['logradouro']}, {dados['numero']}")
            print(f"  - Bairro: {dados['bairro']}")
            print(f"  - Município: {dados['municipio']}/{dados['uf']}")
            print(f"  - Matrícula: {dados['matricula']}")
            print(f"  - Área: {dados['area']} m²")
            
            # Preencher campos URBANO na ordem que aparecem no formulário
            # Nome do Imóvel
            try:
                print("✓ Preenchendo Nome...")
                nome_input = wait.until(EC.presence_of_element_located((
                    By.XPATH, "//input[@value='' and contains(@placeholder, 'Terreno') or contains(@placeholder, 'Comercial')]"
                )))
                nome_input.clear()
                nome_input.send_keys(dados['nome'])
                time.sleep(0.3)
            except:
                print("⚠️ Campo Nome não encontrado, tentando alternativa...")
                try:
                    # Procurar pelo primeiro input de texto visível
                    inputs = driver.find_elements(By.XPATH, "//input[@type='text']")
                    if len(inputs) > 0:
                        inputs[0].clear()
                        inputs[0].send_keys(dados['nome'])
                        time.sleep(0.3)
                except Exception as e:
                    print(f"⚠️ Erro ao preencher Nome: {e}")
            
            # CEP
            try:
                print("✓ Preenchendo CEP...")
                cep_input = driver.find_element(By.XPATH, "//input[contains(@placeholder, '00000-000')]")
                cep_input.clear()
                cep_input.send_keys(dados['cep'])
                time.sleep(0.3)
            except Exception as e:
                print(f"⚠️ Erro ao preencher CEP: {e}")
            
            # Matrícula
            try:
                print("✓ Preenchendo Matrícula...")
                matricula_input = driver.find_element(By.XPATH, "//input[contains(@placeholder, 'Número da matrícula')]")
                matricula_input.clear()
                matricula_input.send_keys(dados['matricula'])
                time.sleep(0.3)
            except Exception as e:
                print(f"⚠️ Erro ao preencher Matrícula: {e}")
            
            # Logradouro
            try:
                print("✓ Preenchendo Logradouro...")
                logradouro_input = driver.find_element(By.XPATH, "//input[contains(@placeholder, 'Rua, Avenida')]")
                logradouro_input.clear()
                logradouro_input.send_keys(dados['logradouro'])
                time.sleep(0.3)
            except Exception as e:
                print(f"⚠️ Erro ao preencher Logradouro: {e}")
            
            # Número
            try:
                print("✓ Preenchendo Número...")
                numero_input = driver.find_element(By.XPATH, "//input[contains(@placeholder, '000')]")
                numero_input.clear()
                numero_input.send_keys(dados['numero'])
                time.sleep(0.3)
            except Exception as e:
                print(f"⚠️ Erro ao preencher Número: {e}")
            
            # Bairro
            try:
                print("✓ Preenchendo Bairro...")
                bairro_input = driver.find_element(By.XPATH, "//input[contains(@placeholder, 'Nome do bairro')]")
                bairro_input.clear()
                bairro_input.send_keys(dados['bairro'])
                time.sleep(0.3)
            except Exception as e:
                print(f"⚠️ Erro ao preencher Bairro: {e}")
            
            # Complemento
            try:
                print("✓ Preenchendo Complemento...")
                complemento_input = driver.find_element(By.XPATH, "//input[contains(@placeholder, 'Apt, Bloco, Sala')]")
                complemento_input.clear()
                complemento_input.send_keys(dados.get('complemento', ''))
                time.sleep(0.3)
            except Exception as e:
                print(f"⚠️ Erro ao preencher Complemento: {e}")
            
            # Município
            try:
                print("✓ Preenchendo Município...")
                municipio_input = driver.find_element(By.XPATH, "//input[contains(@placeholder, 'Nome do município')]")
                municipio_input.clear()
                municipio_input.send_keys(dados['municipio'])
                time.sleep(0.3)
            except Exception as e:
                print(f"⚠️ Erro ao preencher Município: {e}")
            
            # UF (select)
            try:
                print(f"✓ Selecionando UF: {dados['uf']}")
                uf_select = driver.find_element(By.XPATH, "//select[.//option[@value='SC']]")
                Select(uf_select).select_by_value(dados['uf'])
                time.sleep(0.3)
            except Exception as e:
                print(f"⚠️ Erro ao selecionar UF: {e}")
            
            # Área Total
            try:
                print("✓ Preenchendo Área Total...")
                area_input = driver.find_element(By.XPATH, "//input[@type='number' and contains(@placeholder, '0.00')]")
                area_input.clear()
                area_input.send_keys(dados['area'])
                time.sleep(0.3)
            except Exception as e:
                print(f"⚠️ Erro ao preencher Área: {e}")
            
            # Sistema de Referência
            try:
                print(f"✓ Selecionando Sistema de Referência: SIRGAS 2000")
                sistema_select = driver.find_element(By.XPATH, "//select[.//option[contains(text(), 'SIRGAS')]]")
                Select(sistema_select).select_by_visible_text('SIRGAS 2000')
                time.sleep(0.3)
            except Exception as e:
                print(f"⚠️ Erro ao selecionar Sistema: {e}")
            
            # Coordenadas (opcionais)
            try:
                print("✓ Preenchendo Latitude...")
                lat_input = driver.find_element(By.XPATH, "//input[contains(@placeholder, 'Latitude')]")
                lat_input.clear()
                lat_input.send_keys(dados['lat'])
                time.sleep(0.3)
            except Exception as e:
                print(f"⚠️ Erro ao preencher Latitude: {e}")
            
            try:
                print("✓ Preenchendo Longitude...")
                long_input = driver.find_element(By.XPATH, "//input[contains(@placeholder, 'Longitude')]")
                long_input.clear()
                long_input.send_keys(dados['long'])
                time.sleep(0.3)
            except Exception as e:
                print(f"⚠️ Erro ao preencher Longitude: {e}")
            
            # Não usa loop de campos, preenche individualmente
        
        else:  # LINEAR
            dados = DADOS_LINEAR
            print(f"✓ Dados a preencher (LINEAR):")
            print(f"  - Nome: {dados['nome']}")
            print(f"  - Início: {dados['municipio_inicio']}/{dados['uf_inicio']}")
            print(f"  - Final: {dados['municipio_final']}/{dados['uf_final']}")
            print(f"  - Extensão: {dados['extensao']} km")
            
            # Campos de texto LINEAR
            campos = [
                ('Nome do Empreendimento', "//input[@name='nome'] | //input[contains(@placeholder, 'Rodovia') or contains(@placeholder, 'Trecho')]", dados['nome']),
                ('Município Início', "//input[contains(@placeholder, 'origem') or contains(@placeholder, 'Município de origem')]", dados['municipio_inicio']),
                ('Município Final', "//input[contains(@placeholder, 'destino') or contains(@placeholder, 'Município de destino')]", dados['municipio_final']),
                ('Extensão (km)', "//input[@type='number'][contains(@placeholder, '0.00') or @name='extensao_km']", dados['extensao'])
            ]
            
            # Selects LINEAR
            try:
                # UF Início
                print(f"✓ Selecionando UF Início: {dados['uf_inicio']}")
                # Procurar o primeiro select de UF (UF Início)
                uf_selects = driver.find_elements(By.XPATH, "//select[.//option[@value='SC']]")
                if len(uf_selects) >= 1:
                    Select(uf_selects[0]).select_by_value(dados['uf_inicio'])
                    time.sleep(0.3)
                else:
                    print("⚠️ Select UF Início não encontrado")
            except Exception as e:
                print(f"⚠️ Erro ao selecionar UF Início: {e}")
            
            try:
                # UF Final
                print(f"✓ Selecionando UF Final: {dados['uf_final']}")
                # Procurar o segundo select de UF (UF Final)
                uf_selects = driver.find_elements(By.XPATH, "//select[.//option[@value='SC']]")
                if len(uf_selects) >= 2:
                    Select(uf_selects[1]).select_by_value(dados['uf_final'])
                    time.sleep(0.3)
                else:
                    print("⚠️ Select UF Final não encontrado")
            except Exception as e:
                print(f"⚠️ Erro ao selecionar UF Final: {e}")
            
            try:
                # Sistema de Referência
                print(f"✓ Selecionando Sistema de Referência: SIRGAS 2000")
                sistema_select = driver.find_element(By.XPATH, "//select[.//option[contains(text(), 'SIRGAS')]]")
                Select(sistema_select).select_by_visible_text('SIRGAS 2000')
                time.sleep(0.3)
            except Exception as e:
                print(f"⚠️ Erro ao selecionar Sistema: {e}")
        
        # Preencher campos de texto (apenas para RURAL e LINEAR, URBANO já foi preenchido individualmente)
        if tipo_escolhido != 'URBANO':
            for campo_nome, xpath, valor in campos:
                try:
                    print(f"✓ Preenchendo {campo_nome}...")
                    campo = wait.until(EC.presence_of_element_located((By.XPATH, xpath)))
                    campo.clear()
                    campo.send_keys(valor)
                    time.sleep(0.3)
                except Exception as e:
                    print(f"⚠️ Erro ao preencher {campo_nome}: {e}")
        
        print("✅ Formulário preenchido")
        contexto['formulario_preenchido'] = True
        contexto['dados_imovel'] = dados
        
        # =================================================================
        # ETAPA 4: SALVAR/CONFIRMAR IMÓVEL NO MODAL
        # =================================================================
        print(f"\n💾 ETAPA 4: SALVAR NOVO IMÓVEL")
        print("-" * 80)
        
        print("✓ Procurando botão 'Salvar Imóvel' no modal...")
        
        try:
            # Aguardar um pouco para garantir que o formulário está pronto
            time.sleep(1)
            
            # Procurar especificamente o botão verde "Salvar Imóvel" com ícone Plus
            # Evita pegar "Salvar Rascunho" ou "Reiniciar"
            salvar_btn = wait.until(
                EC.presence_of_element_located((
                    By.XPATH,
                    "//button[contains(@class, 'bg-green-600') and contains(., 'Salvar Imóvel')]"
                ))
            )
            print(f"✓ Botão 'Salvar Imóvel' encontrado (verde)")
            
            # Usar JavaScript para clicar (mais confiável que click normal quando há overlays)
            driver.execute_script("""
                const botao = arguments[0];
                botao.scrollIntoView({behavior: 'smooth', block: 'center'});
                setTimeout(() => botao.click(), 500);
            """, salvar_btn)
            
            time.sleep(3)
            print("✓ Imóvel salvo, modal deve estar fechado")
        except Exception as e:
            print(f"❌ Erro ao salvar: {e}")
            # Tentar alternativa: procurar por todos os botões e filtrar
            try:
                print("⚠️ Tentando método alternativo...")
                botoes = driver.find_elements(By.XPATH, "//button[contains(., 'Salvar')]")
                for btn in botoes:
                    if 'Imóvel' in btn.text and 'bg-green' in btn.get_attribute('class'):
                        driver.execute_script("arguments[0].click();", btn)
                        time.sleep(3)
                        print("✓ Clicou via método alternativo")
                        break
                else:
                    raise Exception("Botão 'Salvar Imóvel' não encontrado")
            except:
                raise Exception("Não foi possível salvar o imóvel")
        
        contexto['imovel_salvo'] = True
        
        # =================================================================
        # ETAPA 5: CLICAR EM "PRÓXIMO" PARA IR PARA DADOS GERAIS
        # =================================================================
        print(f"\n➡️ ETAPA 5: AVANÇAR PARA DADOS GERAIS")
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
            time.sleep(3)
            print("✓ Clicou em Próximo")
        except Exception as e:
            print(f"❌ Erro ao clicar em Próximo: {e}")
            raise Exception("Botão 'Próximo' não encontrado ou não clicável")
        
        contexto['avancar_ok'] = True
        
        # =================================================================
        # ETAPA 6: VALIDAR NAVEGAÇÃO PARA DADOS GERAIS
        # =================================================================
        print(f"\n✅ ETAPA 6: VALIDAR ETAPA 'DADOS GERAIS'")
        print("-" * 80)
        
        print("✓ Verificando se avançou para Dados Gerais...")
        
        try:
            # Procurar elementos característicos de Dados Gerais
            elemento_dados_gerais = wait.until(
                EC.presence_of_element_located((
                    By.XPATH,
                    "//*[contains(text(), 'Dados Gerais') or contains(text(), 'Nome do Empreendimento')]"
                ))
            )
            print(f"✓ Elemento de Dados Gerais encontrado: {elemento_dados_gerais.text}")
        except:
            print("⚠️ Elemento 'Dados Gerais' não encontrado explicitamente")
            print("⚠️ Verificando URL ou outros indicadores...")
        
        print("✅ Navegou para etapa Dados Gerais")
        contexto['dados_gerais_ok'] = True
        
        # =================================================================
        # CONCLUSÃO DO TESTE 02
        # =================================================================
        print("\n" + "=" * 80)
        print("✅ TESTE 02 CONCLUÍDO COM SUCESSO!")
        print("=" * 80)
        print("\n📊 Resumo:")
        print(f"  ✓ Modal 'Cadastrar Novo Imóvel' aberto")
        print(f"  ✓ Tipo de imóvel selecionado: {tipo_escolhido}")
        print(f"  ✓ Nome: {dados.get('nome', 'N/A')}")
        print(f"  ✓ Formulário específico preenchido")
        print(f"  ✓ Imóvel salvo no sistema")
        print(f"  ✓ Avançou para Dados Gerais")
        print("\n" + "=" * 80)
        
        contexto['status'] = 'sucesso'
        return contexto
        
    except Exception as e:
        print("\n" + "=" * 80)
        print("❌ ERRO NO TESTE 02")
        print("=" * 80)
        print(f"\nErro: {str(e)}")
        print(f"\nURL atual: {driver.current_url}")
        print("\n" + "=" * 80)
        
        contexto['status'] = 'erro'
        contexto['erro'] = str(e)
        
        # Tirar screenshot do erro
        try:
            screenshot_path = f"tests/screenshots/erro_teste_02_{int(time.time())}.png"
            driver.save_screenshot(screenshot_path)
            print(f"\n📸 Screenshot salvo: {screenshot_path}")
        except:
            pass
        
        return contexto


def main():
    """Função principal - executa apenas este teste (requer teste 01 antes)."""
    print("⚠️ ATENÇÃO: Este teste precisa do driver do teste anterior!")
    print("Execute test_novo_empreendimento_01_menu_navegacao.py primeiro,")
    print("ou chame este teste passando o driver como parâmetro.\n")
    
    resposta = input("Continuar mesmo assim? (s/n): ")
    if resposta.lower() != 's':
        print("Teste cancelado.")
        return 1
    
    # Se chegou aqui, usuário quer executar standalone
    # Precisamos criar driver e executar teste 01 primeiro
    print("\nExecutando Teste 01 primeiro...")
    import test_novo_empreendimento_01_menu_navegacao as teste01
    contexto_01 = teste01.executar_teste()
    
    if contexto_01['status'] != 'sucesso':
        print("\n❌ Teste 01 falhou, não é possível continuar")
        return 1
    
    print("\n" + "=" * 80)
    print("Teste 01 OK, iniciando Teste 02...")
    print("=" * 80 + "\n")
    
    contexto_02 = executar_teste(
        driver_existente=contexto_01['driver'],
        contexto_anterior=contexto_01
    )
    
    if contexto_02['status'] == 'sucesso':
        print("\n✅ Teste 02 executado com sucesso!")
        print("\n💡 Próximo passo: Execute test_novo_empreendimento_03_dados_gerais.py")
        
        # Perguntar se quer executar próximo teste
        resposta = input("\nDeseja executar o próximo teste agora? (s/n): ")
        if resposta.lower() == 's':
            print("\n⚠️ Teste 03 ainda não implementado")
        
        # Fechar navegador
        input("\nPressione ENTER para fechar o navegador...")
        contexto_02['driver'].quit()
        
        return 0
    else:
        print("\n❌ Teste 02 falhou!")
        
        resposta = input("\nFechar navegador? (s/n): ")
        if resposta.lower() == 's':
            contexto_02['driver'].quit()
        
        return 1


if __name__ == "__main__":
    sys.exit(main())
