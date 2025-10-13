#!/usr/bin/env bash
set -e
pip install -r requirements.txt
# Usa a PORT definida pelo provedor (bolt.new) — com fallback para 8000 local
export PORT="${PORT:-8000}"
python main.py
