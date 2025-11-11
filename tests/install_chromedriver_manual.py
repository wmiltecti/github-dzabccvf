# Script para baixar ChromeDriver correto manualmente
import os
import zipfile
import urllib.request
import shutil

print("🔧 Instalando ChromeDriver manualmente...")

# Versão do Chrome: 142.0.7444.61
chrome_version = "142.0.7444.61"
major_version = chrome_version.split('.')[0]

print(f"📌 Versão do Chrome: {chrome_version}")
print(f"📌 Major version: {major_version}")

# URL do ChromeDriver
url = f"https://storage.googleapis.com/chrome-for-testing-public/{chrome_version}/win64/chromedriver-win64.zip"
print(f"🔗 URL: {url}")

# Diretório de destino
dest_dir = r"C:\chromedriver"
zip_path = os.path.join(dest_dir, "chromedriver.zip")
extract_dir = os.path.join(dest_dir, "extracted")

# Criar diretório se não existir
os.makedirs(dest_dir, exist_ok=True)
os.makedirs(extract_dir, exist_ok=True)

try:
    # Baixar
    print("📥 Baixando ChromeDriver...")
    urllib.request.urlretrieve(url, zip_path)
    print(f"✅ Baixado: {zip_path}")
    
    # Extrair
    print("📦 Extraindo...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_dir)
    print(f"✅ Extraído em: {extract_dir}")
    
    # Encontrar chromedriver.exe
    chromedriver_exe = None
    for root, dirs, files in os.walk(extract_dir):
        if 'chromedriver.exe' in files:
            chromedriver_exe = os.path.join(root, 'chromedriver.exe')
            break
    
    if chromedriver_exe:
        # Copiar para raiz do diretório
        final_path = os.path.join(dest_dir, 'chromedriver.exe')
        shutil.copy2(chromedriver_exe, final_path)
        print(f"✅ ChromeDriver copiado para: {final_path}")
        
        # Limpar
        os.remove(zip_path)
        shutil.rmtree(extract_dir)
        print("✅ Arquivos temporários removidos")
        
        print("\n" + "="*60)
        print("🎉 SUCESSO! ChromeDriver instalado manualmente")
        print("="*60)
        print(f"\n📍 Caminho: {final_path}")
        print("\n💡 Use este caminho nos testes:")
        print(f"   service = Service(r'{final_path}')")
        
    else:
        print("❌ chromedriver.exe não encontrado no arquivo ZIP")
        
except Exception as e:
    print(f"\n❌ ERRO: {e}")
    import traceback
    traceback.print_exc()
