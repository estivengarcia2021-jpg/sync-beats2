# SyncBeats 🎵⚡

> **Plataforma pioneira de Social Listening e Streaming Síncrono de Baixa Latência**

O **SyncBeats** transforma a audição passiva de música em uma experiência coletiva e interativa em tempo real. Usuários podem criar salas digitais de audição, convidar amigos via links diretos e escutar a mesma faixa com tolerância inferior a 200 milissegundos, interagindo simultaneamente através de chat e reações visuais.

---

## 🏗️ 1. Arquitetura e Pilares de Engenharia

O sistema utiliza uma arquitetura híbrida projetada para suportar alta concorrência e mitigar sobrecargas de I/O:

```
                  +-----------------------------------+
                  |         Cliente Frontend          |
                  |     (Flutter / React / Web)       |
                  +-----------------+-----------------+
                                    |
                HTTP / REST (JWT)   |   WebSocket (Socket.io)
                                    v
                  +-----------------------------------+
                  |            API Gateway            |
                  |         (Node.js / NestJS)        |
                  +--------+-----------------+--------+
                           |                 |
     Persistência Relacional|                 | Cache & Sincronia Rápida
                           v                 v
            +--------------------+    +--------------------+
            |     PostgreSQL     |    |       Redis        |
            |   (Usuários, DDL,  |    |  (Buffer de Chat,  |
            |     Assinaturas)   |    |  Presença, Sync)   |
            +--------------------+    +--------------------+
```

* **Motor de Sincronia (< 200ms):** Algoritmo de compensação de latência baseado em NTP (Network Time Protocol), calculando o RTT (Round-Trip Time) individual de cada ouvinte.
* **Buffer Volátil em Redis:** Histórico do chat limitado às últimas 50 mensagens por sala (`LPUSH`/`LTRIM`) e controle de presença (`user:{id}:status`) sem onerar o banco primário.
* **Persistência Estrita em PostgreSQL:** Gestão de contas, assinaturas recorrentes, integridade de pagamentos e autorização de planos.

---

## 📋 2. Regras de Negócio Críticas (RNs)

* **RN01 - Paywall de Salas Privadas:** Apenas contas `is_premium = true` podem criar salas protegidas por senha ou acessar áudio em qualidade Hi-Fi.
* **RN06 - Tolerância de Sincronia Estrita:** O áudio dos ouvintes deve ser compensado contra o relógio global com desvio máximo de 200ms.
* **RN07 - Autoridade do Host:** Apenas o criador da sala possui privilégio para emitir comandos de transporte (`player:play`, `player:pause`, `player:skip`).
* **RN08 - Moderação de Fila:** Ouvintes sugerem músicas (`queue:suggest`), que necessitam de aprovação do Host (`queue:approve`) antes de entrar no buffer.
* **RN09 - DRM & Antipirataria:** Uploads manuais de áudio são vetados. A reprodução é restrita a fluxos HLS protegidos e catálogo validado.
* **RN15 - Gestão de Estado Efêmero:** Mensagens de chat ativas e status de presença vivem exclusivamente na camada Redis em memória.

---

## 🔌 3. Contrato de Eventos WebSockets

| Evento | Emissor | Payload | Descrição |
| :--- | :--- | :--- | :--- |
| `room:join` | Cliente | `{ roomId, token }` | Entra no canal da sala e sincroniza relógio. |
| `player:sync` | Servidor | `{ songId, timestampMs, serverTime }` | Dispara ajuste e buffer no reprodutor local. |
| `player:play` | Host | `{ roomId, timestampMs }` | Inicia a reprodução simultânea. |
| `player:pause` | Host | `{ roomId, timestampMs }` | Pausa a reprodução para todos os membros. |
| `chat:send` | Cliente | `{ roomId, message }` | Envia mensagem (armazenada nas últimas 50 via Redis). |
| `reaction:send` | Cliente | `{ roomId, emojiId }` | Emite reação visual flutuante sobre a capa. |

---

## ⚙️ 4. Variáveis de Ambiente (`.env`)

Crie um arquivo `.env` na raiz do projeto antes da inicialização:

```env
# Aplicação
PORT=3000
NODE_ENV=development
JWT_SECRET=supersecret_jwt_key_syncbeats

# Banco de Dados (PostgreSQL)
DB_HOST=postgres
DB_PORT=5432
DB_USER=syncbeats_admin
DB_PASSWORD=syncbeats_secret
DB_NAME=syncbeats_db
DATABASE_URL=postgresql://syncbeats_admin:syncbeats_secret@postgres:5432/syncbeats_db

# Cache & In-Memory (Redis)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379

# Pagamentos (Stripe / Mercado Pago)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🚀 5. Como Executar com Docker Compose

### Pré-requisitos
* Docker instalado (versão 24+)
* Docker Compose instalado

### Passo a Passo

1. **Clonar o Repositório:**
   ```bash
   git clone https://github.com/estivengarcia2021-jpg/sync-beats2.git
   cd sync-beats2
   ```

2. **Configurar as Variáveis:**
   ```bash
   cp .env.example .env
   ```

3. **Subir os Contêineres:**
   ```bash
   docker compose up -d --build
   ```

4. **Verificar os Serviços:**
   ```bash
   docker compose ps
   ```

5. **Acompanhar os Logs da API:**
   ```bash
   docker compose logs -f api
   ```

A API estará acessível em `http://localhost:3000` e a interface web/landing page em `http://localhost:8080`.
