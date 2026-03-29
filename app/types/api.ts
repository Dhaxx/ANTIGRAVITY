// Tipos gerados a partir do OpenAPI QuickPed

// ─── Adicionais ───────────────────────────────────────────────────────────────

export interface AdicionalPublic {
  id: number
  nome: string
  preco: number
}

export interface AdicionalRead {
  id: number
  nome: string
  preco: string
  grupo_id: number
}

// ─── Categorias ───────────────────────────────────────────────────────────────

export interface CategoriaPublic {
  id: number
  nome: string
  ordem: number
  produtos: ProdutoPublic[]
}

export interface CategoriaProdutoCreate {
  nome: string
  icone?: string | null
  ordem?: number
  estabelecimento_id: number
  produzido_por?: number | null
}

export interface CategoriaProdutoUpdate {
  nome?: string
  icone?: string | null
  ordem?: number
  estabelecimento_id?: number | null
  ativo?: boolean | null
  produzido_por?: number | null
}

export interface CategoriaProdutoRead {
  id: number
  nome: string
  icone?: string | null
  ordem: number
  estabelecimento_id: number
  ativo: boolean
  criado_em: string
  atualizado_em: string
  produzido_por?: number | null
}

// ─── Produtos ─────────────────────────────────────────────────────────────────

export interface ProdutoPublic {
  id: number
  nome: string
  descricao: string | null
  preco: number
  imagem_url: string | null
  disponivel: boolean
  adicionais: AdicionalPublic[]
}

export interface ProdutoCreateInput {
  nome: string
  descricao?: string | null
  preco: number | string
  imagem_url?: string | null
  categoria_id: number
  produzido_por?: number | null
}

export interface ProdutoUpdate {
  nome?: string
  descricao?: string | null
  preco?: number | string | null
  imagem_url?: string | null
  categoria_id?: number | null
  estabelecimento_id?: number | null
  ativo?: boolean | null
  produzido_por?: number | null
}

export interface ProdutoRead {
  id: number
  nome: string
  descricao?: string | null
  preco: string
  imagem_url?: string | null
  categoria_id: number
  estabelecimento_id: number
  ativo: boolean
  criado_em: string
  atualizado_em: string
  produzido_por?: number | null
}

// ─── Estabelecimento ──────────────────────────────────────────────────────────

export interface EstabelecimentoPublic {
  nome: string
  aberto: boolean
}

// ─── Cardápio ─────────────────────────────────────────────────────────────────

export interface CardapioPublicResponse {
  estabelecimento: EstabelecimentoPublic
  categorias: CategoriaPublic[]
}

// ─── Pedido ───────────────────────────────────────────────────────────────────

export interface PedidoItemAdicionalInput {
  id: number
  nome?: string | null
  preco: number | string
}

export interface PedidoItemInput {
  produto_id: number
  nome_produto: string
  preco_unitario: number | string
  quantidade: number
  adicionais: PedidoItemAdicionalInput[]
}

export interface PedidoItemAdicionalOutput {
  id: number
  nome?: string | null
  preco: string
}

export interface PedidoItemOutput {
  produto_id: number
  nome_produto: string
  preco_unitario: string
  quantidade: number
  adicionais: PedidoItemAdicionalOutput[]
}

export interface PedidoCreate {
  nome_cliente: string
  numero_mesa: number
  mesa_token?: string
  obs?: string | null
  itens: PedidoItemInput[]
}

export interface PedidoRead {
  id: number
  nome_cliente: string
  numero_mesa: number
  obs?: string | null
  itens: PedidoItemOutput[]
  status: string
  total: string
  criado_em?: string
}

// ─── Usuário ───────────────────────────────────────────────────────────────────

export interface UsuarioRead {
  id: number
  usuario: string
  estabelecimento_id: number
  ativo: boolean
  admin: boolean
}

// ─── Carrinho (estado local) ───────────────────────────────────────────────────

export interface AdicionalSelecionado {
  id: number
  nome: string
  preco: number
}

export interface CarrinhoItem {
  uid: string // id único local (produto_id + timestamp)
  produto: ProdutoPublic
  quantidade: number
  adicionaisSelecionados: AdicionalSelecionado[]
  obs?: string
  precoTotal: number // preço unitário + adicionais * quantidade
}
