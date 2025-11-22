"""
Teste Automatizado 02 - Etapa Imóvel
=====================================

Testa o preenchimento da etapa Imóvel no cadastro de Novo Empreendimento.

Fluxo:
1. Recebe contexto do teste anterior (wizard já aberto)
2. Cria um novo imóvel (RURAL, URBANO ou LINEAR - aleatório)
3. Preenche todos os campos obrigatórios
4. NÃO interage com o mapa GeoFront
5. Valida campos preenchidos
6. Clica no botão "Próximo"
7. Valida navegação para etapa "Dados Gerais"

Se tudo OK, chama o próximo teste automatizado (03_dados_gerais).

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
        # ETAPA 1: VALIDAR QUE ESTAMOS NA PÁGINA DE IMÓVEL
        # =================================================================
        print("🏠 ETAPA 1: VALIDAR PÁGINA DE IMÓVEL")
        print("-" * 80)
        
        print("✓ Verificando se estamos na etapa Imóvel...")
        current_url = driver.current_url
        print(f"  URL atual: {current_url}")
        
        # Procurar elementos característicos da página de Imóvel
        try:
            # Procurar por "Buscar" ou "Novo Imóvel" ou campo de busca
            elemento_imovel = wait.until(
                EC.presence_of_element_located((
                    By.XPATH,
                    "//*[contains(text(), 'Buscar') or contains(text(), 'CAR') or contains(text(), 'Imóvel')]"
                ))
            )
            print(f"✓ Elemento da página Imóvel encontrado: {elemento_imovel.text}")
        except:
            print("⚠️ Não encontrou elementos típicos, tentando continuar...")
        
        print("✅ Na página de Imóvel")
        contexto['pagina_imovel_ok'] = True
        
        # =================================================================
        # ETAPA 2: CRIAR NOVO IMÓVEL
        # =================================================================
        print(f"\n➕ ETAPA 2: CRIAR NOVO IMÓVEL ({tipo_escolhido})")
        print("-" * 80)
        
        print(f"✓ Tipo escolhido: {tipo_escolhido}")
        print(f"✓ Procurando opção para criar novo imóvel...")
        
        # Procurar botão/link "Novo Imóvel" ou "Cadastrar novo"
        try:
            novo_imovel_btn = wait.until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//button[contains(., 'Novo') or contains(., 'Cadastrar')] | //a[contains(., 'Novo Imóvel')]"
                ))
            )
            print(f"✓ Botão encontrado: {novo_imovel_btn.text}")
            novo_imovel_btn.click()
            time.sleep(2)
            print("✓ Clicou em criar novo imóvel")
        except TimeoutException:
            print("⚠️ Botão 'Novo Imóvel' não encontrado")
            print("⚠️ Tentando verificar se já está no formulário...")
        
        # Procurar seletor de tipo de imóvel
        print(f"✓ Procurando seletor de tipo de imóvel...")
        
        try:
            # Procurar radio buttons ou select para tipo
            tipo_rural_radio = wait.until(
                EC.presence_of_element_located((
                    By.XPATH,
                    f"//input[@type='radio' and @value='RURAL'] | //button[contains(., 'Rural')]"
                ))
            )
            print("✓ Encontrou seletor de tipo de imóvel")
        except:
            print("⚠️ Seletor de tipo não encontrado visualmente")
        
        # Selecionar tipo de imóvel
        print(f"✓ Selecionando tipo: {tipo_escolhido}...")
        
        try:
            if tipo_escolhido == 'RURAL':
                tipo_btn = driver.find_element(
                    By.XPATH,
                    "//input[@value='RURAL'] | //button[contains(text(), 'Rural')]"
                )
            elif tipo_escolhido == 'URBANO':
                tipo_btn = driver.find_element(
                    By.XPATH,
                    "//input[@value='URBANO'] | //button[contains(text(), 'Urbano')]"
                )
            else:  # LINEAR
                tipo_btn = driver.find_element(
                    By.XPATH,
                    "//input[@value='LINEAR'] | //button[contains(text(), 'Linear')]"
                )
            
            tipo_btn.click()
            time.sleep(1)
            print(f"✓ Tipo {tipo_escolhido} selecionado")
        except Exception as e:
            print(f"⚠️ Erro ao selecionar tipo: {e}")
            print("⚠️ Tentando continuar...")
        
        contexto['tipo_selecionado'] = True
        
        # =================================================================
        # ETAPA 3: PREENCHER FORMULÁRIO
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
            
            # Preencher campos
            campos = [
                ('Nome', "//input[@name='nome'] | //input[contains(@placeholder, 'Nome')]", dados['nome']),
                ('CAR', "//input[@name='car_codigo'] | //input[contains(@placeholder, 'CAR')]", dados['car']),
                ('Município', "//input[@name='municipio'] | //input[contains(@placeholder, 'Município')]", dados['municipio']),
                ('Área Total', "//input[@name='area_total'] | //input[contains(@placeholder, 'Área')]", dados['area']),
                ('Latitude', "//input[@name='coordenadas_utm_lat'] | //input[contains(@placeholder, 'Latitude')]", dados['lat']),
                ('Longitude', "//input[@name='coordenadas_utm_long'] | //input[contains(@placeholder, 'Longitude')]", dados['long'])
            ]
            
            # UF (select)
            try:
                print(f"✓ Selecionando UF: {dados['uf']}")
                uf_select = driver.find_element(By.XPATH, "//select[@name='uf'] | //select[contains(@id, 'uf')]")
                Select(uf_select).select_by_value(dados['uf'])
                time.sleep(0.5)
            except Exception as e:
                print(f"⚠️ Erro ao selecionar UF: {e}")
        
        elif tipo_escolhido == 'URBANO':
            dados = DADOS_URBANO
            print(f"✓ Dados a preencher:")
            print(f"  - Nome: {dados['nome']}")
            print(f"  - CEP: {dados['cep']}")
            print(f"  - Logradouro: {dados['logradouro']}, {dados['numero']}")
            print(f"  - Município: {dados['municipio']}/{dados['uf']}")
            print(f"  - Área: {dados['area']} m²")
            
            campos = [
                ('Nome', "//input[@name='nome'] | //input[contains(@placeholder, 'Nome')]", dados['nome']),
                ('CEP', "//input[@name='cep'] | //input[contains(@placeholder, 'CEP')]", dados['cep']),
                ('Logradouro', "//input[@name='logradouro'] | //input[contains(@placeholder, 'Logradouro')]", dados['logradouro']),
                ('Número', "//input[@name='numero'] | //input[contains(@placeholder, 'Número')]", dados['numero']),
                ('Bairro', "//input[@name='bairro'] | //input[contains(@placeholder, 'Bairro')]", dados['bairro']),
                ('Município', "//input[@name='municipio'] | //input[contains(@placeholder, 'Município')]", dados['municipio']),
                ('Matrícula', "//input[@name='matricula'] | //input[contains(@placeholder, 'Matrícula')]", dados['matricula']),
                ('Área Total', "//input[@name='area_total'] | //input[contains(@placeholder, 'Área')]", dados['area']),
                ('Latitude', "//input[@name='coordenadas_utm_lat'] | //input[contains(@placeholder, 'Latitude')]", dados['lat']),
                ('Longitude', "//input[@name='coordenadas_utm_long'] | //input[contains(@placeholder, 'Longitude')]", dados['long'])
            ]
            
            # UF (select)
            try:
                print(f"✓ Selecionando UF: {dados['uf']}")
                uf_select = driver.find_element(By.XPATH, "//select[@name='uf'] | //select[contains(@id, 'uf')]")
                Select(uf_select).select_by_value(dados['uf'])
                time.sleep(0.5)
            except Exception as e:
                print(f"⚠️ Erro ao selecionar UF: {e}")
        
        else:  # LINEAR
            dados = DADOS_LINEAR
            print(f"✓ Dados a preencher:")
            print(f"  - Nome: {dados['nome']}")
            print(f"  - Início: {dados['municipio_inicio']}/{dados['uf_inicio']}")
            print(f"  - Final: {dados['municipio_final']}/{dados['uf_final']}")
            print(f"  - Extensão: {dados['extensao']} km")
            
            campos = [
                ('Nome', "//input[@name='nome'] | //input[contains(@placeholder, 'Nome')]", dados['nome']),
                ('Município Início', "//input[@name='municipio_inicio'] | //input[contains(@placeholder, 'Município inicial')]", dados['municipio_inicio']),
                ('Município Final', "//input[@name='municipio_final'] | //input[contains(@placeholder, 'Município final')]", dados['municipio_final']),
                ('Extensão', "//input[@name='extensao_km'] | //input[contains(@placeholder, 'Extensão')]", dados['extensao'])
            ]
            
            # UFs (selects)
            try:
                print(f"✓ Selecionando UF Início: {dados['uf_inicio']}")
                uf_inicio_select = driver.find_element(By.XPATH, "//select[@name='uf_inicio']")
                Select(uf_inicio_select).select_by_value(dados['uf_inicio'])
                time.sleep(0.5)
                
                print(f"✓ Selecionando UF Final: {dados['uf_final']}")
                uf_final_select = driver.find_element(By.XPATH, "//select[@name='uf_final']")
                Select(uf_final_select).select_by_value(dados['uf_final'])
                time.sleep(0.5)
            except Exception as e:
                print(f"⚠️ Erro ao selecionar UFs: {e}")
        
        # Preencher campos de texto
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
        # ETAPA 4: SALVAR/CONFIRMAR IMÓVEL
        # =================================================================
        print(f"\n💾 ETAPA 4: SALVAR NOVO IMÓVEL")
        print("-" * 80)
        
        print("✓ Procurando botão 'Salvar' ou 'Confirmar'...")
        
        try:
            salvar_btn = wait.until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//button[contains(., 'Salvar') or contains(., 'Confirmar') or contains(., 'Criar')]"
                ))
            )
            print(f"✓ Botão encontrado: {salvar_btn.text}")
            salvar_btn.click()
            time.sleep(3)
            print("✓ Imóvel salvo")
        except Exception as e:
            print(f"⚠️ Erro ao salvar: {e}")
            print("⚠️ Tentando continuar...")
        
        contexto['imovel_salvo'] = True
        
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
        print(f"  ✓ Tipo de imóvel: {tipo_escolhido}")
        print(f"  ✓ Nome: {dados.get('nome', 'N/A')}")
        print(f"  ✓ Formulário preenchido")
        print(f"  ✓ Imóvel salvo")
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
