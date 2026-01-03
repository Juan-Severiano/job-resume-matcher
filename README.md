# Job Resume Matcher (JRM)

Gerador de currículos otimizados para ATS (Applicant Tracking Systems) usando IA.

## 🚀 Configuração Rápida

### 1. Instalar dependências
```bash
pnpm install
```

### 2. Configurar OpenAI API Key (IMPORTANTE!)

**⚠️ SEM A API KEY, O SISTEMA USA MOCK (QUALIDADE BAIXA)**

```bash
export OPENAI_API_KEY='sk-your-key-here'
```

Ou crie um arquivo `.env`:
```
OPENAI_API_KEY=sk-your-key-here
```

### 3. Verificar se a IA está configurada

```bash
pnpm --filter @jrm/cli dev --check-ai
```

Você verá:
- ✅ `OPENAI_API_KEY is configured!` - Tudo certo, IA funcionando
- ❌ `OPENAI_API_KEY is NOT configured!` - Vai usar mock (ruim)

## 📝 Uso

### Gerar currículo otimizado

```bash
jrm --input post.md --resume resume.md -o output.html
```

### Durante a execução, você verá:

**Se a IA estiver configurada:**
```
✅ Using OpenAI API (GPT-4o-mini)
Extracting job information...
Job: iOS Developer (senior)
...
Rewriting bullets with AI...
```

**Se NÃO estiver configurada:**
```
⚠️  WARNING: OPENAI_API_KEY not found! Using MOCK provider (low quality).
   Set OPENAI_API_KEY environment variable for real AI processing.
```

## 🔍 Como saber se a IA está funcionando?

1. **Execute com `--check-ai`:**
   ```bash
   jrm --check-ai
   ```

2. **Observe os logs durante a execução:**
   - Se aparecer `✅ Using OpenAI API` = IA funcionando
   - Se aparecer `⚠️ WARNING: Using MOCK provider` = IA NÃO está funcionando

3. **Qualidade do resultado:**
   - **Com IA:** Bullets reescritos de forma inteligente, contexto da vaga aplicado
   - **Com Mock:** Apenas capitalização básica, sem reescrita real

## 📦 Estrutura

```
packages/
  core/      - Modelos e algoritmos de scoring
  parser/    - Parser de markdown para Resume
  llm/       - Integração com OpenAI (com fallback para mock)
  ats/       - Validação ATS
  generator/ - Geração de HTML

apps/
  cli/       - Interface de linha de comando
```

## 🛠️ Desenvolvimento

```bash
# Build todos os packages
pnpm build

# Verificar tipos
pnpm check-types

# Executar CLI em modo dev
pnpm --filter @jrm/cli dev --input post.md --resume resume.md -o output.html
```
