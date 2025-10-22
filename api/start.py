#!/usr/bin/env python3
"""
Script para iniciar a API Pravaler
"""
import os
import sys
import subprocess

def check_venv():
    """Verifica se está no ambiente virtual"""
    return hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)

def check_dependencies():
    """Verifica se as dependências estão instaladas"""
    try:
        import fastapi
        import uvicorn
        import sqlmodel
        return True
    except ImportError:
        return False

def main():
    """Função principal"""
    print("🚀 Iniciando API Pravaler...")
    print("=" * 40)
    
    # Verifica se está no ambiente virtual
    if not check_venv():
        print("⚠️  Aviso: Não está em um ambiente virtual!")
        print("Recomendamos ativar o ambiente virtual primeiro:")
        if os.name == 'nt':  # Windows
            print("venv\\Scripts\\activate")
        else:  # Linux/Mac
            print("source venv/bin/activate")
        print()
    
    # Verifica dependências
    if not check_dependencies():
        print("❌ Dependências não encontradas!")
        print("Execute: pip install -r requirements.txt")
        sys.exit(1)
    
    # Verifica arquivo .env
    if not os.path.exists('.env'):
        print("⚠️  Arquivo .env não encontrado!")
        print("Copie o arquivo env.example para .env e configure as variáveis")
        sys.exit(1)
    
    print("✅ Dependências verificadas")
    print("✅ Arquivo .env encontrado")
    print("\n🌐 Iniciando servidor...")
    print("📚 Documentação: http://localhost:8000/docs")
    print("🔗 API: http://localhost:8000")
    print("\nPressione Ctrl+C para parar o servidor")
    print("=" * 40)
    
    # Inicia o servidor
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--reload", 
            "--host", "0.0.0.0", 
            "--port", "8000"
        ])
    except KeyboardInterrupt:
        print("\n👋 Servidor parado. Até logo!")

if __name__ == "__main__":
    main()
