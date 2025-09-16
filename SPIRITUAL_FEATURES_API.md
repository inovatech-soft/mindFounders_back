# Mind Chat API - Funcionalidades Espirituais

## Visão Geral
Este documento detalha as três novas funcionalidades espirituais adicionadas ao Mind Chat API:
1. **Oração Guiada** - Gerenciamento de orações pessoais
2. **Estudos Temáticos** - Estudos bíblicos estruturados  
3. **Diário da Fé** - Registro de experiências espirituais

## 🙏 Oração Guiada (Prayer Management)

### Endpoints Disponíveis

#### `POST /api/prayers`
Cria uma nova oração.

**Campos obrigatórios:**
- `titulo` (string): Título da oração
- `categoria` (string): Categoria da oração
- `conteudo` (string): Conteúdo da oração

**Campos opcionais:**
- `emocoes` (array): Emoções associadas
- `tempoGasto` (number): Tempo gasto em minutos
- `privacidade` (string): "privada" ou "compartilhada"
- `isFavorita` (boolean): Marcar como favorita

**Categorias disponíveis:**
- `gratidao`, `pedido`, `intercession`, `contemplation`, `confissao`, `louvor`, `adoracao`, `petição`

#### `GET /api/prayers`
Lista orações do usuário com paginação e filtros.

**Query Parameters:**
- `page` (number): Página (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)
- `categoria` (string): Filtrar por categoria
- `favoritas` (boolean): Apenas favoritas
- `search` (string): Busca em título e conteúdo

#### `GET /api/prayers/:id`
Recupera uma oração específica.

#### `PUT /api/prayers/:id`
Atualiza uma oração existente.

#### `DELETE /api/prayers/:id`
Exclui uma oração.

#### `PATCH /api/prayers/:id/favorite`
Alterna status de favorita.

#### `GET /api/prayers/stats`
Estatísticas das orações do usuário.

#### `GET /api/prayers/categories`
Lista categorias disponíveis.

#### `GET /api/prayers/export`
Exporta orações para PDF.

**Query Parameters:**
- `categoria`, `favoritas`, `startDate`, `endDate`

---

## 📚 Estudos Temáticos (Thematic Studies)

### Endpoints Disponíveis

#### `GET /api/studies`
Lista todos os estudos disponíveis.

**Query Parameters:**
- `categoria` (string): Filtrar por categoria
- `page`, `limit`: Paginação

#### `GET /api/studies/:id`
Detalhes de um estudo específico com suas sessões.

#### `POST /api/studies/:id/start`
Inicia participação do usuário em um estudo.

#### `GET /api/studies/:id/participation`
Recupera participação do usuário em um estudo.

#### `PUT /api/studies/:id/progress`
Atualiza progresso do usuário no estudo.

**Body:**
- `sessaoAtual` (number): Número da sessão atual
- `respostasUsuario` (object): Respostas do usuário

#### `GET /api/studies/:id/session/:sessionNumber`
Conteúdo de uma sessão específica.

#### `GET /api/studies/my-participations`
Lista participações do usuário.

**Query Parameters:**
- `status`: "ativo" ou "finalizado"

#### `GET /api/studies/my-stats`
Estatísticas dos estudos do usuário.

#### `POST /api/studies`
Cria um novo estudo (função admin).

#### `GET /api/studies/categories`
Lista categorias de estudos disponíveis.

**Categorias disponíveis:**
- `fe`, `sabedoria`, `amor`, `perda`, `proposito`, `esperanca`, `perdao`, `gratidao`, `oração`, `familia`

---

## 📔 Diário da Fé (Faith Diary)

### Endpoints Disponíveis

#### `POST /api/diary`
Cria uma nova entrada no diário.

**Campos obrigatórios:**
- `conteudo` (string): Conteúdo da entrada

**Campos opcionais:**
- `titulo` (string): Título da entrada
- `emocoes` (array): Emoções sentidas
- `versiculos` (array): Versículos referenciados
- `gratidao` (array): Itens de gratidão
- `oracoes` (array): Orações mencionadas
- `reflexoes` (string): Reflexões pessoais
- `clima` (string): Clima emocional
- `privacidade` (string): "privada" ou "compartilhada"
- `isFavorito` (boolean): Marcar como favorito

#### `GET /api/diary`
Lista entradas do diário com paginação e filtros.

**Query Parameters:**
- `page`, `limit`: Paginação
- `clima` (string): Filtrar por clima emocional
- `favoritos` (boolean): Apenas favoritos
- `search` (string): Busca em conteúdo
- `startDate`, `endDate`: Filtro por data

#### `GET /api/diary/:id`
Recupera uma entrada específica.

#### `PUT /api/diary/:id`
Atualiza uma entrada existente.

#### `DELETE /api/diary/:id`
Exclui uma entrada.

#### `PATCH /api/diary/:id/favorite`
Alterna status de favorito.

#### `GET /api/diary/stats`
Estatísticas do diário do usuário.

#### `GET /api/diary/search`
Busca avançada nas entradas.

**Query Parameters:**
- `q` (string): Termo de busca (obrigatório)
- `limit` (number): Máximo de resultados

#### `GET /api/diary/date-range`
Entradas em um período específico.

**Query Parameters:**
- `startDate`, `endDate` (obrigatórios)

#### `GET /api/diary/climates`
Lista climas emocionais disponíveis.

#### `GET /api/diary/emotions`
Lista emoções comuns.

#### `GET /api/diary/export`
Exporta entradas para PDF.

**Query Parameters:**
- `clima`, `favoritos`, `startDate`, `endDate`

---

## 🔧 Funcionalidades Técnicas

### Autenticação
Todos os endpoints (exceto listas públicas) requerem autenticação via Bearer Token.

### Paginação
Resposta padrão de paginação:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### Exportação PDF
As funcionalidades de oração e diário incluem exportação para PDF com:
- Layout responsivo e print-friendly
- Formatação elegante com tipografia serif
- Resumos estatísticos
- Filtros aplicáveis
- Download automático

### Estrutura de Resposta
Todas as respostas seguem o padrão:
```json
{
  "success": true,
  "message": "Mensagem descritiva",
  "data": {
    // Dados da resposta
  }
}
```

### Códigos de Status
- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Dados inválidos
- `401`: Não autorizado
- `404`: Não encontrado
- `409`: Conflito (ex: já participando do estudo)

---

## 💾 Modelos de Dados

### Oração (Prayer)
```typescript
{
  id: string
  titulo: string
  categoria: string
  conteudo: string
  emocoes: string[]
  tempoGasto?: number
  privacidade: 'privada' | 'compartilhada'
  isFavorita: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Estudo Temático (Study)
```typescript
{
  id: string
  titulo: string
  descricao: string
  categoria: string
  tempoEstimado: number
  sessoes: StudySession[]
  createdAt: Date
}
```

### Sessão de Estudo (StudySession)
```typescript
{
  id: string
  numero: number
  titulo: string
  conteudo: string
  versiculo?: string
  reflexao: string
}
```

### Participação em Estudo (StudyParticipation)
```typescript
{
  id: string
  userId: string
  estudoId: string
  sessaoAtual: number
  progresso: number (0-100)
  respostasUsuario?: object
  iniciadoEm: Date
  finalizadoEm?: Date
}
```

### Entrada do Diário (DiaryEntry)
```typescript
{
  id: string
  titulo?: string
  conteudo: string
  emocoes: string[]
  versiculos: string[]
  gratidao: string[]
  oracoes: string[]
  reflexoes?: string
  clima?: string
  privacidade: 'privada' | 'compartilhada'
  isFavorito: boolean
  createdAt: Date
  updatedAt: Date
}
```

---

## 🚀 Como Usar

1. **Autentique-se** via `/api/auth/login`
2. **Explore estudos** disponíveis em `/api/studies`
3. **Inicie uma participação** em um estudo
4. **Crie orações** e **entradas do diário** 
5. **Acompanhe seu progresso** via endpoints de estatísticas
6. **Exporte dados** em PDF quando necessário

Todas as funcionalidades estão totalmente documentadas via Swagger em `/api-docs` quando o servidor estiver rodando.