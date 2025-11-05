### Stack de Testes

| Ferramenta | Versão | Propósito |
|-----------|--------|----------|
| **Vitest** | ^4.0.7 | Executor de testes rápido e moderno |
| **@testing-library/react** | ^16.3.0 | Testes de componentes React |
| **@testing-library/jest-dom** | ^6.9.1 | Matchers customizados para DOM |
| **MSW** | ^2.12.0 | Mock Service Worker para APIs |
| **happy-dom** | ^20.0.10 | Ambiente DOM leve para testes |

---

## 📁 Estrutura de Diretórios

```
__tests__/
├── services/
│   ├── authService.test.ts          # Testes de autenticação
│   └── favoritesService.test.ts     # Testes de favoritos
│
├── hooks/
│   └── useFavorites.test.ts         # Testes do hook de favoritos
│
├── stores/
│   ├── store.test.ts                # Testes das lojas Zustand
│   └── notificationStore.test.ts    # Testes da loja de notificações
│
├── helpers/
│   └── testUtils.ts                 # Utilitários e dados mock compartilhados
│
└── README.md                         # Este arquivo
```

---

## 🚀 Começando

### Instalação

Os pacotes de teste já estão instalados. Para reinstalá-los:

```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom msw happy-dom @vitejs/plugin-react @vitest/coverage-v8
```

### Configuração

A configuração está em dois arquivos:

- **vitest.config.ts** - Configuração principal do Vitest
- **vitest.setup.ts** - Setup global, mocks do Next.js e variáveis de ambiente

---

## 🧪 Executar Testes

### Comandos Disponíveis

```bash
# Executar todos os testes uma vez
npm test

# Modo watch (re-executar ao salvar arquivos)
npm test -- --watch

# Interface visual do Vitest
npm test:ui

# Cobertura de testes
npm run test:coverage

# Executar arquivo específico
npm run test -- authService.test.ts

# Executar com padrão
npm run test -- --grep "addFavorite"
```

### Modo Watch

O modo watch é perfeito durante desenvolvimento:

```bash
npm test -- --watch
```

Pressione:
- `q` para sair
- `p` para filtrar por nome de arquivo
- `t` para filtrar por nome de teste
- `w` para ver mais opções

---

## 📊 Estrutura de Testes

### Padrão Básico

Todos os testes seguem este padrão:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { functionToTest } from '../../path/to/function';

// Mock das dependências
vi.mock('../../path/to/dependency');

describe('functionToTest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('comportamento específico', () => {
    it('deve fazer algo quando condição ocorre', async () => {
      // Arrange (Preparar)
      const input = 'test';

      // Act (Agir)
      const result = await functionToTest(input);

      // Assert (Afirmar)
      expect(result).toBe('expected');
    });
  });
});
```

### Exemplo de Teste Real

Veja `__tests__/services/authService.test.ts` para um exemplo completo.

---

## ✍️ Escrevendo Novos Testes

### 1. Criar Arquivo de Teste

Crie um arquivo com o padrão `[name].test.ts` no diretório apropriado.

### 2. Importar Dependências

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { functionToTest } from '../../lib/path/to/function';
import * as moduleToMock from '../../lib/path/to/module';

// Mock the module
vi.mock('../../lib/path/to/module');
```

### 3. Usar Utilitários Auxiliares

```typescript
import { mockMovieData, mockUserData } from '../helpers/testUtils';

// Usar dados mock predefinidos
const movie = mockMovieData.basic;
const user = mockUserData.authenticated;
```

### 4. Estruturar com describe/it

```typescript
describe('MyFunction', () => {
  describe('quando condição A', () => {
    it('deve retornar X', () => {
      expect(result).toBe(X);
    });
  });

  describe('quando condição B', () => {
    it('deve lançar erro', () => {
      expect(() => myFunction()).toThrow();
    });
  });
});
```

### 5. Exemplo Completo

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addFavorite } from '../../lib/services/favoritesService';
import * as supabaseModule from '../../lib/services/supabaseClient';
import { mockMovieData } from '../helpers/testUtils';

vi.mock('../../lib/services/supabaseClient');

describe('addFavorite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve adicionar um favorito com sucesso', async () => {
    const mockSupabase = supabaseModule.supabase as any;
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    });

    const result = await addFavorite('user-123', mockMovieData.basic);

    expect(result.success).toBe(true);
  });
});
```

---

## 🏆 Melhores Práticas

### 1. Nomenclatura Clara

✅ **Bom:**
```typescript
it('deve retornar true quando o usuário está logado', () => {});
it('deve lançar erro quando as credenciais são inválidas', () => {});
```

❌ **Ruim:**
```typescript
it('testa login', () => {});
it('funciona com erro', () => {});
```

### 2. Limpeza Após Testes

```typescript
afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
  cleanup();
});
```

### 3. Mocking de Dependências

```typescript
// Mock antes de importar o módulo que o usa
vi.mock('../../lib/services/supabaseClient');

// Depois, acesse o mock
const mockSupabase = supabaseModule.supabase as any;
mockSupabase.auth.signIn.mockResolvedValue({ data: { user }, error: null });
```

### 4. Testes de Hooks React

Use `renderHook` do React Testing Library:

```typescript
import { renderHook, waitFor } from '@testing-library/react';

const { result } = renderHook(() => useMyHook());

await waitFor(() => {
  expect(result.current.value).toBe(expectedValue);
});
```

### 5. Testes Assíncronos

```typescript
it('deve fazer algo assíncrono', async () => {
  const promise = asyncFunction();

  await expect(promise).resolves.toBe(expectedValue);
});

it('deve rejeitar com erro', async () => {
  await expect(asyncFunction()).rejects.toThrow('Erro esperado');
});
```

### 6. Timers Falsos

Para testar auto-remoção de notificações:

```typescript
it('deve remover notificação após duração', () => {
  vi.useFakeTimers();

  addNotification('Test', 'success', 3000);
  expect(getNotifications()).toHaveLength(1);

  vi.advanceTimersByTime(3000);
  expect(getNotifications()).toHaveLength(0);

  vi.useRealTimers();
});
```

---

## 📚 Referência de Utilitários

### mockMovieData

Dados de filme para uso em testes:

```typescript
import { mockMovieData } from '../helpers/testUtils';

mockMovieData.basic      // Fight Club (bem classificado)
mockMovieData.alternative // Se7en (alternativo)
mockMovieData.lowRated   // Filme com baixa classificação
```

### mockUserData

Dados de usuário para uso em testes:

```typescript
import { mockUserData } from '../helpers/testUtils';

mockUserData.authenticated  // { id: 'user-123', email: 'test@example.com' }
mockUserData.alternative    // { id: 'user-456', email: 'another@example.com' }
```

### mockNotificationData

Dados de notificação para uso em testes:

```typescript
import { mockNotificationData } from '../helpers/testUtils';

mockNotificationData.success // { message: 'Operação bem-sucedida', type: 'success' }
mockNotificationData.error   // { message: 'Operação falhou', type: 'error' }
mockNotificationData.info    // { message: 'Informação', type: 'info' }
```

### assertions

Verificadores customizados:

```typescript
import { assertions } from '../helpers/testUtils';

assertions.isMovie(obj);           // Verifica se é um filme válido
assertions.isUser(obj);            // Verifica se é um usuário válido
assertions.isSuccessResponse(obj); // Verifica resposta de sucesso
assertions.isErrorResponse(obj);   // Verifica resposta de erro
```

---

## 🔍 Solução de Problemas

### Teste Falha com "Cannot find module"

**Problema:** Import inválido em um arquivo de teste.

**Solução:** Verifique o caminho relativo:
```typescript
// ✅ Correto
import { func } from '../../lib/services/myService';

// ❌ Incorreto
import { func } from '@/lib/services/myService'; // Alias não funciona em testes
```

### Mock não está funcionando

**Problema:** Mock foi definido após importação.

**Solução:** Mock deve ser definido antes da importação do módulo:
```typescript
// ✅ Correto
vi.mock('../../lib/services/supabaseClient');
import { supabase } from '../../lib/services/supabaseClient';

// ❌ Incorreto
import { supabase } from '../../lib/services/supabaseClient';
vi.mock('../../lib/services/supabaseClient');
```

### Teste Assíncrono Timeout

**Problema:** Teste com `async` não aguarda operações.

**Solução:** Use `await` ou `waitFor`:
```typescript
// ✅ Correto
await result.current.addFavorite(movie);

// Ou com waitFor
await waitFor(() => {
  expect(mockFunction).toHaveBeenCalled();
});
```

### Estado do Store Persiste Entre Testes

**Problema:** Um teste afeta o resultado de outro.

**Solução:** Limpe o estado no `beforeEach`:
```typescript
beforeEach(() => {
  useMyStore.setState({ /* estado inicial */ });
  vi.clearAllMocks();
});
```

### Timers Fictícios Causam Problemas

**Problema:** Testes com `vi.useFakeTimers()` afetam testes subsequentes.

**Solução:** Sempre use `vi.useRealTimers()` no `afterEach`:
```typescript
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});
```

---

## 📈 Cobertura de Testes Atual

A cobertura de testes abrange:

| Arquivo | Tipo | Testes | Cobertura |
|---------|------|--------|-----------|
| `authService.ts` | Serviço | ✅ Completo | 100% |
| `favoritesService.ts` | Serviço | ✅ Completo | 100% |
| `useFavorites.ts` | Hook | ✅ Completo | 95%+ |
| `store.ts` | Zustand | ✅ Completo | 100% |
| `notificationStore.ts` | Zustand | ✅ Completo | 100% |

---

## 🔗 Recursos Úteis

- [Documentação do Vitest](https://vitest.dev/)
- [Documentação do React Testing Library](https://testing-library.com/react)
- [Documentação do Zustand Testing](https://github.com/pmndrs/zustand#testing)
- [Best Practices de Testes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

