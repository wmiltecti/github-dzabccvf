"""
ORQUESTRADOR - Testes Automatizados de Novo Empreendimento
===========================================================

Este orquestrador gerencia a execução sequencial de todos os testes
do fluxo de cadastro de Novo Empreendimento.

Arquitetura:
- Cada teste é um "agente" especializado em uma etapa
- Testes são executados em cadeia (um chama o próximo)
- Se um teste falha, a execução para e mostra relatório
- Contexto é passado entre testes (driver, dados, etc)

Testes Disponíveis:
01 - Menu e Navegação: Abre wizard de Novo Empreendimento
02 - Imóvel: Cria e seleciona imóvel (Rural/Urbano/Linear)
03 - Dados Gerais: Preenche dados do empreendimento
04 - Atividades: Seleciona atividades e preenche quantidades
05 - Caracterização: Preenche caracterização completa

Autor: GitHub Copilot
Data: 2025-11-22
Branch: feature/evolucao-features
"""

import time
import sys
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service

# Configuração
CHROME_DRIVER_PATH = "C:\\chromedriver\\chromedriver.exe"
BASE_URL = "http://localhost:5173"

# Importar testes
import test_novo_empreendimento_01_menu_navegacao as teste01
import test_novo_empreendimento_02_imovel as teste02
import test_novo_empreendimento_03_dados_gerais as teste03
import test_novo_empreendimento_04_atividades as teste04
import test_novo_empreendimento_05_caracterizacao as teste05


class OrquestradorNovoEmpreendimento:
    """Orquestra a execução dos testes de Novo Empreendimento."""
    
    def __init__(self):
        self.testes = []
        self.resultados = []
        self.driver = None
        self.inicio = None
        self.fim = None
        
    def adicionar_teste(self, nome, funcao, ativo=True):
        """Adiciona um teste à lista de execução."""
        self.testes.append({
            'nome': nome,
            'funcao': funcao,
            'ativo': ativo,
            'status': 'pendente'
        })
    
    def executar_todos(self):
        """Executa todos os testes em sequência."""
        print("=" * 100)
        print(" " * 25 + "ORQUESTRADOR DE TESTES - NOVO EMPREENDIMENTO")
        print("=" * 100)
        print(f"\n📅 Data/Hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
        print(f"🌐 URL Base: {BASE_URL}")
        print(f"🔧 ChromeDriver: {CHROME_DRIVER_PATH}")
        print(f"📋 Total de testes: {len([t for t in self.testes if t['ativo']])}")
        print("\n" + "=" * 100 + "\n")
        
        self.inicio = time.time()
        contexto_anterior = None
        
        for idx, teste in enumerate(self.testes, 1):
            if not teste['ativo']:
                print(f"⏭️  Teste {idx} - {teste['nome']}: DESATIVADO")
                teste['status'] = 'desativado'
                continue
            
            print(f"\n{'=' * 100}")
            print(f"▶️  EXECUTANDO TESTE {idx}/{len(self.testes)}: {teste['nome']}")
            print(f"{'=' * 100}\n")
            
            try:
                # Primeiro teste não recebe driver
                if idx == 1:
                    contexto = teste['funcao']()
                else:
                    # Testes subsequentes recebem driver e contexto
                    contexto = teste['funcao'](
                        driver_existente=self.driver,
                        contexto_anterior=contexto_anterior
                    )
                
                # Salvar driver para próximos testes
                if 'driver' in contexto:
                    self.driver = contexto['driver']
                
                # Verificar status
                if contexto['status'] == 'sucesso':
                    teste['status'] = 'sucesso'
                    teste['contexto'] = contexto
                    contexto_anterior = contexto
                    
                    print(f"\n✅ Teste {idx} - {teste['nome']}: SUCESSO")
                    
                    # Pequena pausa entre testes
                    time.sleep(2)
                else:
                    teste['status'] = 'erro'
                    teste['erro'] = contexto.get('erro', 'Erro desconhecido')
                    
                    print(f"\n❌ Teste {idx} - {teste['nome']}: FALHOU")
                    print(f"   Erro: {teste['erro']}")
                    
                    # Parar execução
                    print(f"\n🛑 EXECUÇÃO INTERROMPIDA NO TESTE {idx}")
                    break
                    
            except Exception as e:
                teste['status'] = 'erro'
                teste['erro'] = str(e)
                
                print(f"\n❌ Teste {idx} - {teste['nome']}: EXCEÇÃO")
                print(f"   Erro: {str(e)}")
                
                # Parar execução
                print(f"\n🛑 EXECUÇÃO INTERROMPIDA NO TESTE {idx}")
                break
        
        self.fim = time.time()
        self.gerar_relatorio()
    
    def gerar_relatorio(self):
        """Gera relatório final da execução."""
        print("\n" + "=" * 100)
        print(" " * 35 + "RELATÓRIO FINAL")
        print("=" * 100 + "\n")
        
        tempo_total = self.fim - self.inicio
        
        sucesso = len([t for t in self.testes if t['status'] == 'sucesso'])
        erro = len([t for t in self.testes if t['status'] == 'erro'])
        desativado = len([t for t in self.testes if t['status'] == 'desativado'])
        pendente = len([t for t in self.testes if t['status'] == 'pendente'])
        
        print(f"⏱️  Tempo total: {tempo_total:.2f}s")
        print(f"📊 Resumo:")
        print(f"   ✅ Sucesso: {sucesso}")
        print(f"   ❌ Erro: {erro}")
        print(f"   ⏭️  Desativado: {desativado}")
        print(f"   ⏸️  Pendente: {pendente}")
        print("\n" + "-" * 100 + "\n")
        
        print("📋 Detalhes:")
        for idx, teste in enumerate(self.testes, 1):
            status_icon = {
                'sucesso': '✅',
                'erro': '❌',
                'desativado': '⏭️',
                'pendente': '⏸️'
            }.get(teste['status'], '❓')
            
            print(f"   {idx}. {status_icon} {teste['nome']}: {teste['status'].upper()}")
            
            if teste['status'] == 'erro' and 'erro' in teste:
                print(f"      ↳ Erro: {teste['erro']}")
        
        print("\n" + "=" * 100 + "\n")
        
        # Resultado final
        if erro > 0:
            print("❌ EXECUÇÃO FALHOU - Corrija os erros antes de prosseguir")
            print(f"   Primeiro erro no teste: {[t['nome'] for t in self.testes if t['status'] == 'erro'][0]}")
        elif pendente > 0:
            print("⏸️  EXECUÇÃO PARCIAL - Alguns testes não foram executados")
        else:
            print("🎉 TODOS OS TESTES EXECUTADOS COM SUCESSO!")
        
        print("\n" + "=" * 100 + "\n")
    
    def fechar_navegador(self):
        """Fecha o navegador se estiver aberto."""
        if self.driver:
            try:
                self.driver.quit()
                print("🔒 Navegador fechado")
            except:
                pass


def main():
    """Função principal."""
    print("\n🚀 Iniciando Orquestrador de Testes - Novo Empreendimento\n")
    
    # Criar orquestrador
    orquestrador = OrquestradorNovoEmpreendimento()
    
    # Adicionar testes na ordem de execução
    orquestrador.adicionar_teste(
        nome="01 - Menu e Navegação",
        funcao=teste01.executar_teste,
        ativo=True
    )
    
    orquestrador.adicionar_teste(
        nome="02 - Etapa Imóvel",
        funcao=teste02.executar_teste,
        ativo=True
    )
    
    orquestrador.adicionar_teste(
        nome="03 - Etapa Dados Gerais",
        funcao=teste03.executar_teste,
        ativo=True
    )
    
    orquestrador.adicionar_teste(
        nome="04 - Etapa Atividades",
        funcao=teste04.executar_teste_atividades,
        ativo=True
    )
    
    orquestrador.adicionar_teste(
        nome="05 - Etapa Caracterização",
        funcao=teste05.executar_teste_caracterizacao,
        ativo=True
    )
    
    # Executar todos os testes
    try:
        orquestrador.executar_todos()
    except KeyboardInterrupt:
        print("\n\n⚠️  Execução interrompida pelo usuário (Ctrl+C)")
    finally:
        # Perguntar se quer fechar navegador
        if orquestrador.driver:
            resposta = input("\nFechar navegador? (s/n): ")
            if resposta.lower() == 's':
                orquestrador.fechar_navegador()
            else:
                print("🔍 Navegador mantido aberto para debug")
    
    # Retornar código de saída apropriado
    if any(t['status'] == 'erro' for t in orquestrador.testes):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
