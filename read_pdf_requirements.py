import PyPDF2
import os
import sys

# Configurar stdout para UTF-8
sys.stdout.reconfigure(encoding='utf-8')

pdf_dir = r"D:\code\python\github-dzabccvf\documentos\requisitos"
pdf_files = [
    "espec_requisitos_licenciamento_ambeintal_v4.pdf",
    "espec_requisitos_licenciamento_ambeintal_v5.pdf"
]

for pdf_file in pdf_files:
    pdf_path = os.path.join(pdf_dir, pdf_file)
    output_file = pdf_path.replace('.pdf', '_content.txt')
    
    print(f"\nProcessando: {pdf_file}")
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            
            # Extrair todo o texto
            full_text = []
            full_text.append(f"{'='*80}\n")
            full_text.append(f"ARQUIVO: {pdf_file}\n")
            full_text.append(f"Total de páginas: {num_pages}\n")
            full_text.append(f"{'='*80}\n\n")
            
            for i in range(num_pages):
                try:
                    page = pdf_reader.pages[i]
                    text = page.extract_text()
                    full_text.append(f"\n{'='*80}\n")
                    full_text.append(f"PÁGINA {i+1}\n")
                    full_text.append(f"{'='*80}\n\n")
                    full_text.append(text)
                    full_text.append("\n\n")
                except Exception as e:
                    full_text.append(f"\n[Erro ao extrair página {i+1}: {e}]\n\n")
            
            # Salvar em arquivo
            with open(output_file, 'w', encoding='utf-8') as out:
                out.write("".join(full_text))
            
            print(f"✓ Salvo em: {output_file}")
                
    except Exception as e:
        print(f"✗ Erro ao processar {pdf_file}: {e}")

print("\n✓ Processamento concluído!")
