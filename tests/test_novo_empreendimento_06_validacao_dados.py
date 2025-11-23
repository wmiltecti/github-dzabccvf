"""
=======================================================================
TESTE 06 - VALIDAÇÃO DE DADOS NO BANCO (NOVO EMPREENDIMENTO)
=======================================================================

Este teste final valida se os dados de todas as abas foram gravados 
corretamente nas tabelas do Supabase.

Validações por aba:
1. Imóvel (test_02) -> Tabela: properties
2. Dados Gerais (test_03) -> Tabela: enterprises
3. Atividades (test_04) -> Tabela: enterprise_activities
4. Caracterização (test_05) -> Tabelas: enterprise_characterization, enterprise_energy_resources, etc.

Autor: Sistema de Testes Automatizados
Data: 23/11/2025
"""

import os
import sys
import time
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Carregar variáveis de ambiente
load_dotenv()

# ===================================================================
# CONFIGURAÇÃO
# ===================================================================

SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', '')

# Cliente Supabase (será inicializado na função)
supabase: Client = None


# ===================================================================
# FUNÇÕES AUXILIARES
# ===================================================================

def log_secao(titulo: str):
    """Log de seção"""
    print(f"\n{'=' * 71}")
    print(f"  {titulo.upper()}")
    print(f"{'=' * 71}")


def log_aba(aba: str, emoji: str = "📋"):
    """Log de aba"""
    print(f"\n{emoji} {aba}")
    print("-" * 71)


def log_validacao(campo: str, status: str, detalhes: str = ""):
    """Log de validação individual"""
    icone = "✓" if status == "OK" else "⚠️" if status == "AVISO" else "✗"
    msg = f"{icone} {campo}: {status}"
    if detalhes:
        msg += f" ({detalhes})"
    print(msg)


def contar_registros(tabela: str, filtros: dict = None) -> int:
    """Conta registros em uma tabela com filtros opcionais"""
    try:
        query = supabase.table(tabela).select('id', count='exact')
        
        if filtros:
            for campo, valor in filtros.items():
                query = query.eq(campo, valor)
        
        response = query.execute()
        return response.count if hasattr(response, 'count') else len(response.data)
    except Exception as e:
        print(f"⚠️ Erro ao contar registros em {tabela}: {e}")
        return -1


def buscar_registro(tabela: str, filtros: dict, campos: str = '*'):
    """Busca um registro específico"""
    try:
        query = supabase.table(tabela).select(campos)
        
        for campo, valor in filtros.items():
            query = query.eq(campo, valor)
        
        response = query.limit(1).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"⚠️ Erro ao buscar registro em {tabela}: {e}")
        return None


def buscar_ultimo_registro(tabela: str, campo_ordem: str = 'created_at'):
    """Busca o último registro inserido em uma tabela"""
    try:
        response = supabase.table(tabela).select('*').order(campo_ordem, desc=True).limit(1).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"⚠️ Erro ao buscar último registro em {tabela}: {e}")
        return None


# ===================================================================
# VALIDAÇÕES POR ABA
# ===================================================================

def validar_aba_imovel(contexto: dict) -> dict:
    """
    Valida se os dados da aba Imóvel foram salvos.
    Tabela: properties
    """
    log_aba("ABA 1: IMÓVEL", "🏠")
    
    resultado = {
        'aba': 'Imóvel',
        'tabela': 'properties',
        'validacoes': [],
        'sucesso': True
    }
    
    # Buscar último imóvel cadastrado
    imovel = buscar_ultimo_registro('properties')
    
    if not imovel:
        log_validacao("Registro", "ERRO", "Nenhum imóvel encontrado no banco")
        resultado['sucesso'] = False
        resultado['validacoes'].append({
            'campo': 'Registro',
            'status': 'ERRO',
            'mensagem': 'Nenhum imóvel encontrado'
        })
        return resultado
    
    # Armazenar ID do imóvel no contexto
    contexto['property_id'] = imovel['id']
    
    # Validar campos obrigatórios
    campos_obrigatorios = {
        'name': 'Nome do Imóvel',
        'property_type_id': 'Tipo de Imóvel',
        'state': 'Estado',
        'city': 'Município'
    }
    
    for campo, nome in campos_obrigatorios.items():
        valor = imovel.get(campo)
        if valor:
            log_validacao(nome, "OK", f"Valor: {valor}")
            resultado['validacoes'].append({
                'campo': nome,
                'status': 'OK',
                'valor': valor
            })
        else:
            log_validacao(nome, "ERRO", "Campo vazio")
            resultado['sucesso'] = False
            resultado['validacoes'].append({
                'campo': nome,
                'status': 'ERRO',
                'mensagem': 'Campo vazio'
            })
    
    # Validar coordenadas geográficas
    if imovel.get('latitude') and imovel.get('longitude'):
        log_validacao("Coordenadas", "OK", f"{imovel['latitude']}, {imovel['longitude']}")
        resultado['validacoes'].append({
            'campo': 'Coordenadas',
            'status': 'OK',
            'valor': f"{imovel['latitude']}, {imovel['longitude']}"
        })
    else:
        log_validacao("Coordenadas", "AVISO", "Coordenadas não preenchidas")
        resultado['validacoes'].append({
            'campo': 'Coordenadas',
            'status': 'AVISO',
            'mensagem': 'Não preenchidas'
        })
    
    return resultado


def validar_aba_dados_gerais(contexto: dict) -> dict:
    """
    Valida se os dados da aba Dados Gerais foram salvos.
    Tabela: enterprises
    """
    log_aba("ABA 2: DADOS GERAIS", "🏢")
    
    resultado = {
        'aba': 'Dados Gerais',
        'tabela': 'enterprises',
        'validacoes': [],
        'sucesso': True
    }
    
    property_id = contexto.get('property_id')
    if not property_id:
        log_validacao("Contexto", "ERRO", "ID do imóvel não encontrado no contexto")
        resultado['sucesso'] = False
        return resultado
    
    # Buscar empreendimento relacionado ao imóvel
    empreendimento = buscar_registro('enterprises', {'property_id': property_id})
    
    if not empreendimento:
        log_validacao("Registro", "ERRO", "Nenhum empreendimento encontrado para este imóvel")
        resultado['sucesso'] = False
        resultado['validacoes'].append({
            'campo': 'Registro',
            'status': 'ERRO',
            'mensagem': 'Empreendimento não encontrado'
        })
        return resultado
    
    # Armazenar ID do empreendimento
    contexto['enterprise_id'] = empreendimento['id']
    
    # Validar campos obrigatórios
    campos_obrigatorios = {
        'name': 'Nome do Empreendimento',
        'cnpj': 'CNPJ',
        'responsible_name': 'Nome do Responsável',
        'responsible_cpf': 'CPF do Responsável'
    }
    
    for campo, nome in campos_obrigatorios.items():
        valor = empreendimento.get(campo)
        if valor:
            log_validacao(nome, "OK", f"Valor: {valor}")
            resultado['validacoes'].append({
                'campo': nome,
                'status': 'OK',
                'valor': valor
            })
        else:
            log_validacao(nome, "ERRO", "Campo vazio")
            resultado['sucesso'] = False
            resultado['validacoes'].append({
                'campo': nome,
                'status': 'ERRO',
                'mensagem': 'Campo vazio'
            })
    
    return resultado


def validar_aba_atividades(contexto: dict) -> dict:
    """
    Valida se as atividades foram salvas.
    Tabela: enterprise_activities
    """
    log_aba("ABA 3: ATIVIDADES", "⚡")
    
    resultado = {
        'aba': 'Atividades',
        'tabela': 'enterprise_activities',
        'validacoes': [],
        'sucesso': True
    }
    
    enterprise_id = contexto.get('enterprise_id')
    if not enterprise_id:
        log_validacao("Contexto", "ERRO", "ID do empreendimento não encontrado")
        resultado['sucesso'] = False
        return resultado
    
    # Contar atividades vinculadas ao empreendimento
    total_atividades = contar_registros('enterprise_activities', {'enterprise_id': enterprise_id})
    
    if total_atividades > 0:
        log_validacao("Total de Atividades", "OK", f"{total_atividades} atividade(s)")
        resultado['validacoes'].append({
            'campo': 'Total de Atividades',
            'status': 'OK',
            'valor': total_atividades
        })
        
        # Buscar detalhes das atividades
        try:
            response = supabase.table('enterprise_activities')\
                .select('*, activities(name)')\
                .eq('enterprise_id', enterprise_id)\
                .execute()
            
            for idx, atividade in enumerate(response.data, 1):
                activity_name = atividade.get('activities', {}).get('name', 'Sem nome')
                log_validacao(f"Atividade {idx}", "OK", activity_name)
                resultado['validacoes'].append({
                    'campo': f'Atividade {idx}',
                    'status': 'OK',
                    'valor': activity_name
                })
                
                # Validar dados quantitativos
                if atividade.get('quantity'):
                    log_validacao(f"  └─ Quantidade", "OK", f"{atividade['quantity']} {atividade.get('unit', '')}")
                else:
                    log_validacao(f"  └─ Quantidade", "AVISO", "Não preenchida")
        
        except Exception as e:
            log_validacao("Detalhes", "ERRO", str(e))
    else:
        log_validacao("Total de Atividades", "ERRO", "Nenhuma atividade encontrada")
        resultado['sucesso'] = False
        resultado['validacoes'].append({
            'campo': 'Total de Atividades',
            'status': 'ERRO',
            'mensagem': 'Nenhuma atividade encontrada'
        })
    
    return resultado


def validar_aba_caracterizacao(contexto: dict) -> dict:
    """
    Valida se os dados de caracterização foram salvos.
    Tabelas: enterprise_characterization, enterprise_energy_resources, etc.
    """
    log_aba("ABA 4: CARACTERIZAÇÃO", "🌿")
    
    resultado = {
        'aba': 'Caracterização',
        'tabelas': ['enterprise_characterization', 'enterprise_energy_resources'],
        'validacoes': [],
        'sucesso': True
    }
    
    enterprise_id = contexto.get('enterprise_id')
    if not enterprise_id:
        log_validacao("Contexto", "ERRO", "ID do empreendimento não encontrado")
        resultado['sucesso'] = False
        return resultado
    
    # Validar tabela principal de caracterização
    caracterizacao = buscar_registro('enterprise_characterization', {'enterprise_id': enterprise_id})
    
    if caracterizacao:
        log_validacao("Caracterização Ambiental", "OK", "Registro encontrado")
        resultado['validacoes'].append({
            'campo': 'Caracterização Ambiental',
            'status': 'OK',
            'mensagem': 'Registro encontrado'
        })
        
        # Validar campos específicos
        campos = {
            'water_origin': 'Origem da Água',
            'water_consumption_human': 'Consumo Humano',
            'effluent_destination': 'Destino de Efluentes'
        }
        
        for campo, nome in campos.items():
            valor = caracterizacao.get(campo)
            if valor:
                log_validacao(f"  └─ {nome}", "OK", str(valor))
            else:
                log_validacao(f"  └─ {nome}", "AVISO", "Não preenchido")
    else:
        log_validacao("Caracterização Ambiental", "ERRO", "Registro não encontrado")
        resultado['sucesso'] = False
        resultado['validacoes'].append({
            'campo': 'Caracterização Ambiental',
            'status': 'ERRO',
            'mensagem': 'Registro não encontrado'
        })
    
    # Validar recursos energéticos
    total_recursos = contar_registros('enterprise_energy_resources', {'enterprise_id': enterprise_id})
    log_validacao("Recursos Energéticos", "OK" if total_recursos >= 0 else "ERRO", 
                  f"{total_recursos} registro(s)" if total_recursos >= 0 else "Erro ao consultar")
    
    return resultado


# ===================================================================
# FUNÇÃO PRINCIPAL
# ===================================================================

def executar_validacao_completa(contexto: dict = None):
    """
    Executa validação completa de todas as abas.
    
    Args:
        contexto: Dicionário com IDs de registros (opcional)
    
    Returns:
        dict: Relatório completo da validação
    """
    global supabase
    
    # Validar credenciais
    if not SUPABASE_URL or not SUPABASE_KEY or SUPABASE_URL == 'your_supabase_url_here':
        print("\n❌ ERRO: Credenciais do Supabase não configuradas")
        print("Configure SUPABASE_URL e SUPABASE_KEY no arquivo tests/.env")
        return {
            'sucesso_geral': False,
            'erro': 'Credenciais do Supabase não configuradas',
            'resultados': []
        }
    
    # Inicializar cliente Supabase
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"\n❌ ERRO ao conectar com Supabase: {e}")
        return {
            'sucesso_geral': False,
            'erro': f'Erro ao conectar com Supabase: {e}',
            'resultados': []
        }
    
    log_secao("VALIDAÇÃO DE DADOS NO BANCO - NOVO EMPREENDIMENTO")
    
    print(f"\n🕐 Início: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔗 Supabase URL: {SUPABASE_URL}")
    
    if contexto is None:
        contexto = {}
    
    # Executar validações
    resultados = []
    
    try:
        # 1. Validar Imóvel
        resultado_imovel = validar_aba_imovel(contexto)
        resultados.append(resultado_imovel)
        
        # 2. Validar Dados Gerais
        resultado_dados = validar_aba_dados_gerais(contexto)
        resultados.append(resultado_dados)
        
        # 3. Validar Atividades
        resultado_atividades = validar_aba_atividades(contexto)
        resultados.append(resultado_atividades)
        
        # 4. Validar Caracterização
        resultado_caracterizacao = validar_aba_caracterizacao(contexto)
        resultados.append(resultado_caracterizacao)
        
    except Exception as e:
        print(f"\n❌ ERRO FATAL: {e}")
        return {
            'sucesso_geral': False,
            'erro': str(e),
            'resultados': resultados
        }
    
    # Gerar relatório final
    log_secao("RESUMO DA VALIDAÇÃO")
    
    total_abas = len(resultados)
    abas_ok = sum(1 for r in resultados if r['sucesso'])
    abas_erro = total_abas - abas_ok
    
    print(f"\n📊 ESTATÍSTICAS:")
    print(f"   • Total de abas testadas: {total_abas}")
    print(f"   • Abas validadas com sucesso: {abas_ok} ✓")
    print(f"   • Abas com erro: {abas_erro} ✗")
    print(f"   • Taxa de sucesso: {(abas_ok/total_abas*100):.1f}%")
    
    print(f"\n📋 DETALHAMENTO POR ABA:")
    for resultado in resultados:
        status_icon = "✓" if resultado['sucesso'] else "✗"
        status_text = "OK" if resultado['sucesso'] else "ERRO"
        aba_nome = resultado.get('aba', 'Desconhecida')
        total_validacoes = len(resultado.get('validacoes', []))
        
        print(f"   {status_icon} {aba_nome}: {status_text} ({total_validacoes} validações)")
    
    sucesso_geral = abas_ok == total_abas
    
    print(f"\n{'='* 71}")
    if sucesso_geral:
        print("✓ VALIDAÇÃO CONCLUÍDA COM SUCESSO!")
        print("  Todos os dados foram salvos corretamente nas tabelas.")
    else:
        print("⚠️ VALIDAÇÃO CONCLUÍDA COM PROBLEMAS")
        print(f"  {abas_erro} aba(s) apresentaram erros na gravação.")
    print(f"{'='* 71}")
    
    print(f"\n🕐 Fim: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return {
        'sucesso_geral': sucesso_geral,
        'total_abas': total_abas,
        'abas_ok': abas_ok,
        'abas_erro': abas_erro,
        'resultados': resultados,
        'contexto': contexto
    }


# ===================================================================
# PONTO DE ENTRADA
# ===================================================================

if __name__ == "__main__":
    print("=" * 71)
    print(" TESTE 06 - VALIDAÇÃO DE DADOS NO BANCO")
    print("=" * 71)
    
    # Executar validação
    relatorio = executar_validacao_completa()
    
    # Retornar código de saída
    sys.exit(0 if relatorio['sucesso_geral'] else 1)
