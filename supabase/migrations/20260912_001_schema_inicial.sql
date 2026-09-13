-- =========================================================
-- PARACATU 360
-- Migration inicial do banco de dados
-- =========================================================


-- =========================================================
-- 1. PROFILES
-- Complementa os usuários autenticados do Supabase Auth.
-- O id é o mesmo utilizado em auth.users.
-- =========================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  papel text not null default 'cidadao',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_nome_check
    check (char_length(trim(nome)) > 0),

  constraint profiles_papel_check
    check (papel in ('cidadao', 'moderador', 'administrador'))
);


-- =========================================================
-- 2. CATEGORIAS
-- Catálogo oficial de categorias das ocorrências.
-- =========================================================

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null unique,
  ordem smallint not null unique,
  ativa boolean not null default true,
  created_at timestamptz not null default now(),

  constraint categorias_codigo_check
    check (char_length(trim(codigo)) > 0),

  constraint categorias_nome_check
    check (char_length(trim(nome)) > 0),

  constraint categorias_ordem_check
    check (ordem > 0)
);


-- =========================================================
-- Categorias oficiais do Paracatu 360
-- =========================================================

insert into public.categorias (codigo, nome, ordem)
values
  ('transito_vias', 'Trânsito e Vias', 1),
  ('infraestrutura', 'Infraestrutura', 2),
  ('limpeza_urbana', 'Limpeza Urbana', 3),
  ('meio_ambiente', 'Meio Ambiente', 4),
  ('agua_saneamento', 'Água e Saneamento', 5),
  ('seguranca', 'Segurança', 6),
  ('outros', 'Outros', 7);

  -- =========================================================
-- 3. OCORRENCIAS
-- Tabela principal dos registros urbanos do Paracatu 360.
-- =========================================================

create table public.ocorrencias (
  id uuid primary key default gen_random_uuid(),

  autor_id uuid not null
    references public.profiles(id),

  categoria_id uuid not null
    references public.categorias(id),

  titulo text not null,
  descricao text not null,
  status text not null default 'registrado',

  endereco text not null,
  bairro text not null,

  latitude double precision,
  longitude double precision,

  ocorrencia_principal_id uuid
    references public.ocorrencias(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  resolvida_at timestamptz,
  arquivada_at timestamptz,

  arquivada_por uuid
    references public.profiles(id),

  constraint ocorrencias_titulo_check
    check (char_length(trim(titulo)) between 5 and 80),

  constraint ocorrencias_descricao_check
  check (
    char_length(trim(descricao)) between 1 and 300
  ),

  constraint ocorrencias_status_check
    check (
      status in (
        'registrado',
        'em_analise',
        'encaminhado',
        'em_andamento',
        'resolvido',
        'rejeitado',
        'duplicado',
        'arquivado'
      )
    ),

  constraint ocorrencias_latitude_check
    check (latitude is null or latitude between -90 and 90),

  constraint ocorrencias_longitude_check
    check (longitude is null or longitude between -180 and 180),

  constraint ocorrencias_nao_autorreferente_check
    check (
      ocorrencia_principal_id is null
      or ocorrencia_principal_id <> id
    ),

  constraint ocorrencias_duplicidade_check
    check (
      (status = 'duplicado' and ocorrencia_principal_id is not null)
      or
      (status <> 'duplicado' and ocorrencia_principal_id is null)
    )
);

-- =========================================================
-- 4. OCORRENCIA_FOTOS
-- Fotos vinculadas às ocorrências.
-- O arquivo será armazenado futuramente no Supabase Storage.
-- =========================================================

create table public.ocorrencia_fotos (
  id uuid primary key default gen_random_uuid(),

  ocorrencia_id uuid not null
    references public.ocorrencias(id) on delete cascade,

  storage_path text not null,
  ordem smallint not null,

  created_at timestamptz not null default now(),

  constraint ocorrencia_fotos_storage_path_check
    check (char_length(trim(storage_path)) > 0),

  constraint ocorrencia_fotos_ordem_check
    check (ordem between 1 and 3),

  constraint ocorrencia_fotos_ocorrencia_ordem_unique
    unique (ocorrencia_id, ordem)
);


-- =========================================================
-- 5. CONFIRMACOES
-- Representa "Também encontrei este problema".
-- Registros desfeitos são preservados para histórico.
-- =========================================================

create table public.confirmacoes (
  id uuid primary key default gen_random_uuid(),

  ocorrencia_id uuid not null
    references public.ocorrencias(id) on delete cascade,

  usuario_id uuid not null
    references public.profiles(id),

  created_at timestamptz not null default now(),
  desfeito_at timestamptz,

  constraint confirmacoes_datas_check
    check (
      desfeito_at is null
      or desfeito_at >= created_at
    )
);

-- =========================================================
-- 6. HISTORICO_OCORRENCIAS
-- Preserva todas as alterações oficiais de status.
-- =========================================================

create table public.historico_ocorrencias (
  id uuid primary key default gen_random_uuid(),

  ocorrencia_id uuid not null
    references public.ocorrencias(id) on delete cascade,

  status_anterior text,
  status_novo text not null,

  alterado_por uuid
    references public.profiles(id),

  observacao text,

  created_at timestamptz not null default now(),

  constraint historico_status_anterior_check
    check (
      status_anterior is null
      or status_anterior in (
        'registrado',
        'em_analise',
        'encaminhado',
        'em_andamento',
        'resolvido',
        'rejeitado',
        'duplicado',
        'arquivado'
      )
    ),

  constraint historico_status_novo_check
    check (
      status_novo in (
        'registrado',
        'em_analise',
        'encaminhado',
        'em_andamento',
        'resolvido',
        'rejeitado',
        'duplicado',
        'arquivado'
      )
    )
);


-- =========================================================
-- 7. SINALIZACOES_OCORRENCIAS
-- Sinais enviados pela comunidade sobre uma ocorrência.
-- Não alteram automaticamente o status oficial no MVP.
-- =========================================================

create table public.sinalizacoes_ocorrencias (
  id uuid primary key default gen_random_uuid(),

  ocorrencia_id uuid not null
    references public.ocorrencias(id) on delete cascade,

  usuario_id uuid not null
    references public.profiles(id),

  tipo text not null,

  foto_storage_path text,

  created_at timestamptz not null default now(),
  desfeito_at timestamptz,

  constraint sinalizacoes_tipo_check
    check (
      tipo in (
        'atendimento_iniciado',
        'problema_resolvido',
        'continua_igual',
        'piorou'
      )
    ),

  constraint sinalizacoes_foto_path_check
    check (
      foto_storage_path is null
      or char_length(trim(foto_storage_path)) > 0
    ),

  constraint sinalizacoes_datas_check
    check (
      desfeito_at is null
      or desfeito_at >= created_at
    )
);

-- =========================================================
-- 8. INDICES
-- =========================================================

create index ocorrencias_categoria_id_idx
  on public.ocorrencias (categoria_id);

create index ocorrencias_status_idx
  on public.ocorrencias (status);

create index ocorrencias_bairro_idx
  on public.ocorrencias (bairro);

create index ocorrencias_created_at_idx
  on public.ocorrencias (created_at desc);

create index ocorrencias_status_created_at_idx
  on public.ocorrencias (status, created_at desc);

create index ocorrencias_autor_id_idx
  on public.ocorrencias (autor_id);

create index ocorrencias_principal_id_idx
  on public.ocorrencias (ocorrencia_principal_id);


create index ocorrencia_fotos_ocorrencia_id_idx
  on public.ocorrencia_fotos (ocorrencia_id);


create index confirmacoes_ocorrencia_id_idx
  on public.confirmacoes (ocorrencia_id);

create index confirmacoes_usuario_id_idx
  on public.confirmacoes (usuario_id);

create unique index confirmacoes_ativas_unique_idx
  on public.confirmacoes (ocorrencia_id, usuario_id)
  where desfeito_at is null;


create index historico_ocorrencias_ocorrencia_created_at_idx
  on public.historico_ocorrencias (ocorrencia_id, created_at desc);

create index historico_ocorrencias_alterado_por_idx
  on public.historico_ocorrencias (alterado_por);


create index sinalizacoes_ocorrencia_id_idx
  on public.sinalizacoes_ocorrencias (ocorrencia_id);

create index sinalizacoes_ocorrencia_tipo_created_at_idx
  on public.sinalizacoes_ocorrencias (
    ocorrencia_id,
    tipo,
    created_at desc
  );

create unique index sinalizacoes_ativas_unique_idx
  on public.sinalizacoes_ocorrencias (
    ocorrencia_id,
    usuario_id
  )
  where desfeito_at is null;