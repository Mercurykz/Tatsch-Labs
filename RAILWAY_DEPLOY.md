# Deploy para Railway

## Pré-requisitos

- Conta em [Railway.app](https://railway.app)
- GitHub account com o repositório `Mercurykz/Tatsch-Labs` já linkado
- PostgreSQL database (Railway cria automaticamente)

## Passos de Deploy

### 1. Conectar repositório GitHub ao Railway

1. Abra [railway.app](https://railway.app) e faça login
2. Clique em **"New Project"** → **"Deploy from GitHub repo"**
3. Selecione a organização **Mercurykz** e repositório **Tatsch-Labs**
4. Railway detectará automaticamente o `Procfile` e `package.json`

### 2. Configurar variáveis de ambiente

1. No Railway dashboard do projeto, vá para **"Variables"**
2. Adicione:
   - `NODE_ENV` = `production`
   - `PORT` = `8080` (ou deixe Railway atribuir automaticamente)
   - `DATABASE_URL` = (será preenchida automaticamente se você usar o serviço Postgres do Railway)

### 3. Adicionar PostgreSQL plugin

1. No projeto Railway, clique em **"Add Service"**
2. Selecione **"Add from Marketplace"** → **"PostgreSQL"**
3. Railway gerará automaticamente a variável `DATABASE_URL` com a conexão Postgres
4. O servidor Express inicializará as tabelas `patients` e `uploads` automaticamente

### 4. Deploy

1. Railway detectará o `Procfile` e fará build/deploy automaticamente
2. Você pode monitorar logs em **"Deployments"** → **"Logs"**
3. A URL pública estará visível em **"Railway Deployment"** ou **"Domains"**

## Verificar Deploy

Após o deploy estar **"Active"**, teste:

```bash
curl https://<seu-railway-url>/health
```

Deve retornar a página HTML da aplicação (Express redireciona `/health` para `index.html`).

## Conectar ao banco de dados

Se quiser acessar o PostgreSQL da Railway localmente (para testes):

1. No Railway, vá para **Postgres service** → **"Connect"**
2. Copie a string de conexão
3. Use em uma ferramenta como `psql` ou DBeaver:

```bash
psql <copied-connection-string>
```

## Troubleshooting

- **"DATABASE_URL not set"**: Verifique se a variável está configurada nas Variables do Railway
- **Build falha**: Certifique-se de que `npm install` e `npm run build` rodam localmente sem erros
- **App não inicia**: Verifique os logs: **Deployments** → **View Logs**

## Notas

- O banco de dados é criado automaticamente na primeira inicialização do servidor
- Uploads e dados de pacientes são armazenados em PostgreSQL
- O frontend é buildado e servido estaticamente da pasta `dist/`
