
# PetAlert — App Mobile de Alerta de Animais Perdidos

Projeto acadêmico focado em **UX para situações de urgência**, aplicando heurísticas de Nielsen e princípios de Design Centrado no Usuário (DCU). Entrega como **app nativo via Capacitor** (Android/iOS), com **backend completo (Lovable Cloud)** para autenticação, banco de dados, upload de fotos e geolocalização.

---

## 1. Decisões de UX (justificativa acadêmica)

Cada tela responde diretamente às perguntas do enunciado:

| Pergunta do briefing | Decisão de design |
|---|---|
| Botão "Criar Alerta" em destaque? | **FAB (Floating Action Button) gigante e fixo** no centro inferior, cor de alerta, sempre visível em todas as telas, com rótulo "🚨 SOS — Perdi meu pet" |
| GPS automático? | Geolocalização capturada **na abertura do formulário**, com endereço preenchido automaticamente via reverse geocoding. Usuário pode ajustar arrastando pino no mapa |
| Informações de relance? | Card padronizado: **foto grande (60% do card)** + nome + raça + bairro + tempo desde sumiço + selo de status |
| Feedback de "encontrado"? | Card recebe **overlay verde "ENCONTRADO ✓"**, foto fica em escala de cinza, animação de confete ao marcar, toast de confirmação |
| Campos desnecessários? | Formulário enxuto: **apenas 4 campos obrigatórios** (foto, nome, espécie, local). Demais campos ficam em "Adicionar mais detalhes (opcional)" colapsável |

---

## 2. Identidade Visual

- **Paleta**: Vinho profundo (#6B1F2C) como cor principal + Bege quente (#E8D9C0) como fundo + Branco off para cards + Verde sálvia para "encontrado" + Vermelho vivo apenas no botão SOS
- **Tipografia**: Headings em fonte serif elegante (Playfair Display), corpo em sans-serif limpa (Inter)
- **Tom**: Sério, acolhedor, confiável — afasta a estética "infantil" comum em apps de pets e reforça o caráter de urgência
- **Mobile-first**: Toda interface desenhada para toque, áreas de toque ≥ 48px

---

## 3. Telas e Fluxos

### 3.1 Autenticação
- Login/Cadastro com **e-mail e senha** + **Google**
- Tabela `profiles` para nome, telefone (para contato) e avatar
- Tela de boas-vindas explicando a missão

### 3.2 Home — Feed de Alertas
- Lista vertical de cards de pets perdidos próximos ao usuário
- Filtros rápidos no topo: **Todos | Cães | Gatos | Outros | Encontrados**
- **Botão SOS flutuante** sempre visível
- Pull-to-refresh

### 3.3 Criar Alerta (meta: <30 segundos)
Fluxo em **etapa única** (sem wizard de múltiplos passos):
1. Câmera abre direto ao tocar em "+ Foto" (ou galeria)
2. GPS pega localização automaticamente → mostra endereço editável
3. Campos mínimos: nome, espécie (cão/gato/outro)
4. Botão grande **"Publicar alerta"**
5. Seção colapsável "Mais detalhes (opcional)": raça, cor, porte, características, recompensa, contato alternativo

### 3.4 Mapa
- Mapa interativo com **pins coloridos** dos alertas ativos por região
- Toque no pin → preview do card → abre detalhes
- Botão "Centralizar em mim"

### 3.5 Detalhes do Pet
- Foto em destaque (full-width)
- Informações organizadas em hierarquia visual: status > foto > nome/local > tempo > descrição > contato
- Botões de ação: **"Encontrei este pet"** (abre chat) + **"WhatsApp do tutor"** (link direto)
- Se já foi encontrado: overlay verde + data de resolução + mensagem do tutor

### 3.6 Chat
- Conversa em tempo real entre quem encontrou e o tutor
- Lista de conversas por alerta
- Notificação visual de novas mensagens

### 3.7 Meus Alertas
- Lista dos pets que o usuário publicou
- Botão **"Marcar como encontrado"** com confirmação + animação de celebração
- Histórico de casos resolvidos

### 3.8 Perfil
- Dados do usuário, foto, telefone de contato, logout

---

## 4. Backend (Lovable Cloud)

**Tabelas:**
- `profiles` — dados do tutor
- `pets` — alertas (foto_url, nome, espécie, raça, descrição, latitude, longitude, endereço, status [`active`/`found`], created_at, found_at, user_id)
- `messages` — chat (pet_id, sender_id, receiver_id, content, created_at)
- `user_roles` — segurança (sem roles no profile)

**Storage:** bucket público `pet-photos` para upload das imagens

**RLS:** todos podem ler alertas ativos; apenas o dono edita/marca como encontrado; mensagens visíveis apenas para remetente e destinatário

**Realtime:** ativado em `pets` (atualização de status) e `messages` (chat)

---

## 5. Capacitor (App Nativo)

- Configuração de `capacitor.config.ts` com appId e hot-reload da sandbox
- Plugins necessários: **Geolocation** (GPS), **Camera** (foto direta), **Push Notifications** (alertas próximos — opcional)
- Instruções no README para `npx cap add android/ios`, `npm run build`, `npx cap sync` e execução em emulador/dispositivo

---

## 6. Documentação Acadêmica (incluída no projeto)

Um `README.md` acadêmico contendo:
- Justificativa de cada decisão de UX vinculada às heurísticas de Nielsen
- Análise de tarefas (task analysis) do fluxo de emergência
- Diagrama do fluxo principal (criar alerta em <30s)
- Tecnologias utilizadas e arquitetura
- Instruções de instalação e execução

---

## Entregáveis

✅ App funcional com backend real
✅ Build Android/iOS via Capacitor
✅ Documentação acadêmica em português no README
✅ Fluxo de criação de alerta otimizado para <30s
✅ Marcação visual clara de pets encontrados
✅ Chat em tempo real entre tutor e quem encontrou
