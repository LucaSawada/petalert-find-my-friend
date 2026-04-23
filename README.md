# 🐾 PetAlert — App Mobile de Alerta de Animais Perdidos

> Projeto acadêmico desenvolvido com foco em **UX para situações de urgência**, aplicando as **Heurísticas de Nielsen** e princípios de **Design Centrado no Usuário (DCU)**.

---

## 🎯 Missão do Projeto

Permitir que um alerta de animal perdido seja publicado em **menos de 30 segundos**, conectando tutores e a comunidade próxima em tempo real.

---

## 🧪 Justificativa Acadêmica das Decisões de UX

Cada decisão de design responde diretamente às perguntas do briefing e está vinculada às **10 Heurísticas de Usabilidade de Jakob Nielsen**:

### 1. Botão "Criar Alerta" em destaque (Heurística #6 — Reconhecimento em vez de memorização; Heurística #1 — Visibilidade do status)
- **Decisão**: FAB (Floating Action Button) circular, vermelho vivo, com animação pulsante ("animate-pulse-sos"), fixo no centro inferior da tela e **sempre visível** em todas as telas do app.
- **Justificativa**: Em momento de pânico, o usuário tem **carga cognitiva reduzida**. O botão precisa ser dominante visualmente e estar onde o polegar alcança naturalmente em uso a uma mão.

### 2. GPS automático (Heurística #7 — Flexibilidade e eficiência de uso)
- **Decisão**: Geolocalização capturada **na abertura do formulário**, com endereço preenchido automaticamente via reverse geocoding (Nominatim/OpenStreetMap).
- **Justificativa**: Reduz a fricção de digitação enquanto o usuário ainda está procurando o animal. Mantém o campo editável para correções (Heurística #3 — Controle do usuário).

### 3. Cards otimizados para reconhecimento de relance (Heurística #8 — Estética e design minimalista)
- **Decisão**: Hierarquia visual fixa: **foto grande (60% do card) → nome → espécie/raça → bairro → tempo desde sumiço → status**.
- **Justificativa**: Quem encontra um animal precisa identificá-lo em **menos de 2 segundos** ao folhear o feed. A foto domina, o resto serve de confirmação.

### 4. Feedback claro de "encontrado" (Heurística #1 — Visibilidade do status do sistema)
- **Decisão**: Card recebe **overlay verde "✓ ENCONTRADO"**, foto aplica filtro **grayscale**, animação de **confete** ao marcar e toast de confirmação.
- **Justificativa**: Múltiplos sinais redundantes (cor + ícone + saturação + texto) garantem que o caso resolvido seja inequívoco, evitando contatos desnecessários ao tutor.

### 5. Formulário enxuto (Heurística #8 — Minimalismo)
- **Decisão**: Apenas **4 campos obrigatórios** (foto, nome, espécie, local). Demais campos (raça, cor, porte, recompensa, contato alternativo) ficam em seção colapsável **"Mais detalhes (opcional)"**.
- **Justificativa**: Reduz tempo de publicação para a meta de **<30 segundos** sem privar o tutor da opção de enriquecer o alerta depois.

---

## 📊 Análise de Tarefas (Task Analysis) — Fluxo de Emergência

```
Tutor percebe que pet sumiu (estado: pânico)
   ↓
Abre o app PetAlert
   ↓
Vê botão SOS pulsante no centro inferior  ← (1 toque)
   ↓
Câmera abre automaticamente — tira foto   ← (2 toques)
   ↓
GPS já preencheu o endereço               ← (0 toques)
   ↓
Digita nome do pet + escolhe espécie      ← (~10s)
   ↓
Toca em "Publicar alerta"                 ← (1 toque)
   ↓
Alerta no ar — visível em tempo real

Tempo total estimado: 18-25 segundos ✓
```

---

## 🎨 Identidade Visual

| Elemento | Especificação | Justificativa |
|---|---|---|
| **Cor principal** | Vinho profundo (HSL 350 55% 27% ≈ #6B1F2C) | Sério, acolhedor, distante da estética "infantil" comum em apps de pets |
| **Fundo** | Bege quente (HSL 36 38% 92%) | Cria sensação de calor e proximidade |
| **Cor de sucesso** | Verde sálvia (HSL 145 30% 42%) | Sinaliza reencontros sem agressividade |
| **Cor de SOS** | Vermelho vivo (HSL 0 78% 48%) | Único elemento vermelho — reservado à emergência |
| **Headings** | Playfair Display (serif) | Elegância e confiança |
| **Corpo** | Inter (sans-serif) | Legibilidade em mobile |
| **Toque** | Áreas ≥ 48px | Acessibilidade WCAG 2.1 AAA |

---

## 🛠️ Tecnologias e Arquitetura

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui (custom design tokens HSL) |
| Roteamento | React Router v6 |
| Backend | Lovable Cloud (PostgreSQL + Auth + Storage + Realtime) |
| Mobile nativo | Capacitor (iOS + Android) |
| Geolocalização | Capacitor Geolocation + Web Geolocation API + Nominatim |
| Câmera | Capacitor Camera + File API (web) |
| Notificações em tempo real | Supabase Realtime (canais postgres_changes) |

### Modelo de Dados

- `profiles` — dados do tutor (nome, telefone, avatar)
- `pets` — alertas (foto, nome, espécie, descrição, GPS, status)
- `messages` — chat tutor ⇄ quem encontrou
- `user_roles` — papéis separados (Heurística de segurança: nunca armazenar role no perfil)

### Segurança (RLS)

- Todos podem **ler** alertas (caráter público da missão)
- Apenas o **dono** pode editar/deletar/marcar como encontrado
- Mensagens visíveis apenas para **remetente e destinatário**
- Função `has_role` com `SECURITY DEFINER` evita recursão em RLS

---

## 📱 Como rodar o app nativo (Capacitor)

Pré-requisitos: Node.js, Android Studio (Android) ou Xcode (iOS — Mac).

```bash
# 1. Exporte o projeto para o GitHub pelo botão "GitHub" no Lovable
# 2. Clone localmente:
git clone <seu-repo>
cd petalert

# 3. Instale as dependências
npm install

# 4. Adicione as plataformas nativas
npx cap add android   # ou: npx cap add ios

# 5. Gere o build web
npm run build

# 6. Sincronize com a plataforma nativa
npx cap sync

# 7. Execute em emulador ou dispositivo
npx cap run android   # ou: npx cap run ios
```

> **Hot-reload**: o `capacitor.config.ts` aponta para o sandbox do Lovable, então o app nativo recarrega ao vivo conforme você edita o código aqui.

---

## 🌐 Como rodar a versão web

```bash
npm install
npm run dev
```

Acesse `http://localhost:8080`.

---

## 📚 Referências Acadêmicas

- **Nielsen, J.** (1994). *10 Usability Heuristics for User Interface Design.*
- **Norman, D.** (2013). *The Design of Everyday Things.* — Princípios de affordance e signifiers.
- **ISO 9241-210:2019** — Design Centrado no Usuário (DCU).
- **WCAG 2.1** — Critérios de acessibilidade (área de toque ≥ 44×44 CSS px).

---

## ✅ Entregáveis

- [x] App funcional com backend real (Lovable Cloud)
- [x] Autenticação por e-mail + senha
- [x] Build Android/iOS via Capacitor
- [x] Fluxo de criação de alerta otimizado para <30s
- [x] Marcação visual clara de pets encontrados (overlay + grayscale + confete)
- [x] Chat em tempo real entre tutor e quem encontrou
- [x] Mapa com pinos dos alertas próximos
- [x] Documentação acadêmica em português
