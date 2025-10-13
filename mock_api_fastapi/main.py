import os, base64, json, secrets, time
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from users_seed import USERS

app = FastAPI(title="Mock API #licenciamentoambiental", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ajuste se quiser restringir
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def issue_mock_token(payload: dict) -> str:
    header = base64.urlsafe_b64encode(json.dumps({"alg":"MOCK","typ":"JWT"}).encode()).decode().rstrip("=")
    body   = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    sig    = secrets.token_urlsafe(8)
    return f"{header}.{body}.{sig}"

def find_user_pf_pj_passaporte(login: str, senha: str):
    for u in USERS:
        if u["login"] == login and u["senha"] == senha and u["tipo"] != "ESTRANGEIRO":
            return u
    return None

def find_user_estrangeiro(login: str, senha: str, tipoDeIdentificacao: str):
    for u in USERS:
        if (
            u["tipo"] == "ESTRANGEIRO"
            and u["login"] == login
            and u["senha"] == senha
            and u.get("tipoDeIdentificacao") == tipoDeIdentificacao
        ):
            return u
    return None

@app.get("/health")
def health():
    return {"status": "ok", "time": int(time.time())}

@app.post("/usuarios/login")
def usuarios_login(payload: dict):
    login = payload.get("login")
    senha = payload.get("senha")
    tipoDeIdentificacao: Optional[str] = payload.get("tipoDeIdentificacao")

    if not login or not senha:
        raise HTTPException(status_code=400, detail={"message": "Campos obrigatórios: login, senha."})

    if tipoDeIdentificacao:
        u = find_user_estrangeiro(login, senha, tipoDeIdentificacao)
        if not u:
            raise HTTPException(status_code=401, detail={"message": "Credenciais inválidas para identificação estrangeira."})
        token = issue_mock_token({"sub": u["login"], "tipo": u["tipo"], "tdi": tipoDeIdentificacao})
        return {"token": token, "nome": u.get("nome"), "perfil": u.get("perfil"), "userId": u["login"]}

    u = find_user_pf_pj_passaporte(login, senha)
    if not u:
        raise HTTPException(status_code=401, detail={"message": "Credenciais inválidas."})

    token = issue_mock_token({"sub": u["login"], "tipo": u["tipo"]})
    return {"token": token, "nome": u.get("nome"), "perfil": u.get("perfil"), "userId": u["login"]}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))  # usa a porta do ambiente do bolt
    uvicorn.run("main:app", host="0.0.0.0", port=port)
