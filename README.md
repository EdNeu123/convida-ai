# Convida_Aí — deploy no Firebase

## O que mudou em relação ao protótipo original
- Agora tem **backend de verdade** (Firestore): as respostas dos convidados chegam até você, não ficam presas no navegador de cada um.
- **Painel admin protegido por login** (Firebase Auth) em `/admin` — só você compõe o convite e vê as respostas.
- **Convite público** em `/` (ou `/convite`) — página separada, sem acesso ao painel.
- Link do convite é **genérico único** (mesmo link pra todo mundo), como você pediu.

## Passo a passo

### 1. Criar o projeto no Firebase
1. Acesse https://console.firebase.google.com → **Adicionar projeto**.
2. Em **Build → Authentication → Sign-in method**, ative **E-mail/senha**.
3. Em **Build → Authentication → Users**, crie o seu usuário admin (e-mail + senha que você vai usar pra logar em `/admin`).
4. Em **Build → Firestore Database**, clique em **Criar banco de dados** (modo produção, região à sua escolha, ex: `southamerica-east1`).

### 2. Pegar as chaves do app Web
Em **Configurações do projeto → Geral → Seus apps**, clique no ícone `</>` para criar um app Web. Copie o objeto `firebaseConfig` e cole em:
```
public/firebase-init.js
```
(substitua os valores `"COLE_AQUI"`).

### 3. Instalar o Firebase CLI e logar
```bash
npm install -g firebase-tools
firebase login
```

### 4. Ligar esta pasta ao seu projeto
Dentro da pasta `convida-ai/`:
```bash
firebase use --add
```
Escolha o projeto que você criou.

### 5. Publicar as regras do Firestore e o site
```bash
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

Ao final, o terminal mostra a URL pública (algo como `https://seu-projeto.web.app`).
- `https://seu-projeto.web.app/` → convite (manda esse link pros convidados)
- `https://seu-projeto.web.app/admin` → seu painel (login com o usuário do passo 1.3)

### 6. Primeiro acesso
1. Abra `/admin`, logue com seu usuário.
2. Preencha os dados do convite (nome, data, local, tema, etc.) e clique em **Salvar convite**.
3. Copie o link e manda pros convidados.

## Decisão de privacidade que você pode revisar
As respostas (`rsvps`) hoje têm **leitura pública** no Firestore — é o que permite o convite mostrar "Fulano já confirmou presença" pra quem ainda não respondeu, sem precisar de login. Se preferir que ninguém além de você veja quem confirmou, é só trocar a linha `allow read: if true;` da subcoleção `rsvps` em `firestore.rules` para `allow read: if request.auth != null;` — só que aí a "prova social" some da tela do convidado (dá pra eu tirar essa parte do `guest.js` se quiser).

## Limitações que ainda ficaram de fora (do que listei antes)
- Link único por convidado — você optou por link genérico, então não tem controle de quem especificamente confirmou vs. quem nem abriu.
- Domínio próprio (ex: `convite.seunome.com`) — dá pra configurar em Hosting → Domínio personalizado depois do primeiro deploy.
- Fallback sem JavaScript e meta tags Open Graph com imagem de capa — posso adicionar se quiser.
