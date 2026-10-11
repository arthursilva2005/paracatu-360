-- Etapa 20B: sinalizacoes comunitarias via RPC, sem identidades publicas.
-- Preserva schema, indices, policies, Storage e migrations 001-008.
begin;

-- Impede escrita entre a auditoria dos dados e a retirada dos grants diretos.
-- Nao apaga/corrige dados antigos. Fotos antigas ficam preservadas e ocultas.
lock table public.sinalizacoes_ocorrencias in share row exclusive mode;
do $$
begin
  if exists (
    select 1 from public.sinalizacoes_ocorrencias as s
    where s.desfeito_at is null
    group by s.ocorrencia_id, s.usuario_id
    having count(*) > 1
  ) or exists (
    select 1 from public.sinalizacoes_ocorrencias as s
    where s.tipo is null or s.tipo not in (
      'atendimento_iniciado', 'problema_resolvido', 'continua_igual', 'piorou'
    )
  ) then
    raise exception 'Sinalizacoes antigas inconsistentes. Revise os dados antes de aplicar; nenhum registro foi corrigido.'
      using errcode = 'P3625';
  end if;

  if exists (
    select 1 from public.sinalizacoes_ocorrencias as s
    where s.foto_storage_path is not null
  ) then
    raise notice 'Fotos antigas de sinalizacoes serao preservadas, mas nao expostas pelas novas RPCs.';
  end if;
end;
$$;

-- P3620: autenticacao necessaria.
-- P3621: ocorrencia inexistente/indisponivel (mesma resposta).
-- P3622: tipo invalido.
-- P3623: ocorrencia visivel, mas nao aceita criacao/troca.
-- P3624: estado esperado divergente; reler antes de tentar novamente.
-- P3625: dados antigos inconsistentes (somente aplicacao da migration).
-- P3626: isolamento incompativel com o protocolo de concorrencia.

create function public.minha_sinalizacao_ativa(p_ocorrencia_id uuid)
returns table (id uuid, tipo text, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_usuario_id uuid := auth.uid();
begin
  if v_usuario_id is null then
    raise exception 'Autenticacao necessaria.' using errcode = 'P3620';
  end if;

  -- Retorna exclusivamente a propria ativa, mesmo se a ocorrencia deixou
  -- de ser visivel, para reconstruir o ID esperado e permitir desfazer apos F5.
  -- Sem propria ativa (ou ocorrencia inexistente), a consulta retorna ausencia.
  if p_ocorrencia_id is null then
    return;
  end if;

  return query
    select s.id, s.tipo, s.created_at
    from public.sinalizacoes_ocorrencias as s
    where s.ocorrencia_id = p_ocorrencia_id
      and s.usuario_id = v_usuario_id
      and s.desfeito_at is null
    limit 1;
end;
$$;

create function public.definir_sinalizacao_ocorrencia(
  p_ocorrencia_id uuid,
  p_tipo text,
  p_sinalizacao_esperada_id uuid
)
returns table (id uuid, tipo text, created_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id uuid := auth.uid();
  v_status text;
  v_ativa public.sinalizacoes_ocorrencias%rowtype;
begin
  if v_usuario_id is null then
    raise exception 'Autenticacao necessaria.' using errcode = 'P3620';
  end if;
  if p_tipo is null or p_tipo not in (
    'atendimento_iniciado', 'problema_resolvido', 'continua_igual', 'piorou'
  ) then
    raise exception 'Tipo de sinalizacao invalido.' using errcode = 'P3622';
  end if;
  -- Como na 008, leituras apos esperar pelo lock devem enxergar commits
  -- anteriores. Nao permite snapshot antigo em REPEATABLE READ/SERIALIZABLE.
  if pg_catalog.current_setting('transaction_isolation') <> 'read committed' then
    raise exception 'Este fluxo exige uma transacao READ COMMITTED.'
      using errcode = 'P3626';
  end if;

  -- Mesmo recurso bloqueado pelas RPCs administrativas da 008, mas sem
  -- adquirir o advisory lock de status: esta funcao nao altera ocorrencias.
  -- Bloquear so a sinalizacao seria insuficiente quando ainda nao existe.
  select o.status into v_status
  from public.ocorrencias as o
  where o.id = p_ocorrencia_id
  for update;

  if not found then
    raise exception 'Ocorrencia nao encontrada ou indisponivel.' using errcode = 'P3621';
  end if;
  -- Verifica novamente sob o lock, depois de eventual alteracao de status.
  if not coalesce(public.ocorrencia_esta_visivel(p_ocorrencia_id), false) then
    raise exception 'Ocorrencia nao encontrada ou indisponivel.' using errcode = 'P3621';
  end if;
  if v_status not in (
    'registrado', 'em_analise', 'encaminhado', 'em_andamento', 'resolvido', 'duplicado'
  ) then
    raise exception 'Esta ocorrencia nao aceita novas sinalizacoes.' using errcode = 'P3623';
  end if;

  -- Autor, cidadao e equipe participam sem peso especial. Identidade nunca
  -- vem de parametro; o ID esperado serve exclusivamente para concorrencia.
  select s.* into v_ativa
  from public.sinalizacoes_ocorrencias as s
  where s.ocorrencia_id = p_ocorrencia_id
    and s.usuario_id = v_usuario_id
    and s.desfeito_at is null
  for update;

  if v_ativa.id is distinct from p_sinalizacao_esperada_id then
    raise exception 'Sua sinalizacao mudou. Recarregue os dados antes de tentar novamente.'
      using errcode = 'P3624';
  end if;
  -- A comparacao do esperado vem ANTES do no-op: aba antiga nao e aceita
  -- silenciosamente, mesmo que por acaso tenha solicitado o mesmo tipo.
  if v_ativa.id is not null and v_ativa.tipo = p_tipo then
    return query select v_ativa.id, v_ativa.tipo, v_ativa.created_at;
    return;
  end if;

  if v_ativa.id is not null then
    -- now() e o inicio da transacao. Se uma espera por lock encontrou linha
    -- criada depois desse instante, exige nova transacao, sem violar datas
    -- nem inventar timestamp. Tambem falha seguramente para data futura antiga.
    if v_ativa.created_at > pg_catalog.now() then
      raise exception 'Recarregue os dados e tente novamente em uma nova transacao.'
        using errcode = 'P3624';
    end if;
    update public.sinalizacoes_ocorrencias as s
    set desfeito_at = pg_catalog.now()
    where s.id = v_ativa.id
      and s.usuario_id = v_usuario_id
      and s.desfeito_at is null;
  end if;

  -- Defaults geram id/created_at; foto fora do escopo. Erros nao sao capturados:
  -- se o INSERT falhar, o encerramento anterior sofre rollback junto.
  return query
    insert into public.sinalizacoes_ocorrencias as s (
      ocorrencia_id, usuario_id, tipo, foto_storage_path
    ) values (p_ocorrencia_id, v_usuario_id, p_tipo, null)
    returning s.id, s.tipo, s.created_at;
end;
$$;

create function public.desfazer_sinalizacao_ocorrencia(
  p_ocorrencia_id uuid,
  p_sinalizacao_esperada_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id uuid := auth.uid();
  v_ativa public.sinalizacoes_ocorrencias%rowtype;
begin
  if v_usuario_id is null then
    raise exception 'Autenticacao necessaria.' using errcode = 'P3620';
  end if;
  if pg_catalog.current_setting('transaction_isolation') <> 'read committed' then
    raise exception 'Este fluxo exige uma transacao READ COMMITTED.'
      using errcode = 'P3626';
  end if;

  perform o.id from public.ocorrencias as o
  where o.id = p_ocorrencia_id
  for update;
  if not found then
    raise exception 'Ocorrencia nao encontrada ou indisponivel.' using errcode = 'P3621';
  end if;

  -- Excecao intencional a visibilidade: quem ja participou pode retirar
  -- a propria sinalizacao apos rejeicao/arquivamento. Nao informa nada
  -- sobre ocorrencias ocultas sem participacao do proprio usuario.
  if not coalesce(public.ocorrencia_esta_visivel(p_ocorrencia_id), false)
    and not exists (
      select 1 from public.sinalizacoes_ocorrencias as s
      where s.ocorrencia_id = p_ocorrencia_id and s.usuario_id = v_usuario_id
    )
  then
    raise exception 'Ocorrencia nao encontrada ou indisponivel.' using errcode = 'P3621';
  end if;

  select s.* into v_ativa
  from public.sinalizacoes_ocorrencias as s
  where s.ocorrencia_id = p_ocorrencia_id
    and s.usuario_id = v_usuario_id
    and s.desfeito_at is null
  for update;

  if v_ativa.id is null then
    if p_sinalizacao_esperada_id is null or exists (
      select 1 from public.sinalizacoes_ocorrencias as s
      where s.id = p_sinalizacao_esperada_id
        and s.ocorrencia_id = p_ocorrencia_id
        and s.usuario_id = v_usuario_id
        and s.desfeito_at is not null
    ) then
      -- false: nada alterado; esperado proprio ja desfeito ou nenhuma ativa.
      return false;
    end if;
    raise exception 'Sua sinalizacao mudou. Recarregue os dados antes de tentar novamente.'
      using errcode = 'P3624';
  end if;

  if v_ativa.id is distinct from p_sinalizacao_esperada_id then
    raise exception 'Sua sinalizacao mudou. Recarregue os dados antes de tentar novamente.'
      using errcode = 'P3624';
  end if;
  if v_ativa.created_at > pg_catalog.now() then
    raise exception 'Recarregue os dados e tente novamente em uma nova transacao.'
      using errcode = 'P3624';
  end if;

  update public.sinalizacoes_ocorrencias as s
  set desfeito_at = pg_catalog.now()
  where s.id = v_ativa.id
    and s.usuario_id = v_usuario_id
    and s.desfeito_at is null;
  return true;
end;
$$;

create function public.contar_sinalizacoes_ocorrencia(p_ocorrencia_id uuid)
returns table (
  atendimento_iniciado bigint,
  problema_resolvido bigint,
  continua_igual bigint,
  piorou bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  -- Sem usuario nao ganha privilegio: so pode ler agregados publicos.
  -- Uma unica linha com zeros significa ocorrencia acessivel sem votos.
  -- Ausencia de linha significa inexistente/nao acessivel, sem distingui-las.
  if auth.role() = 'authenticated' and auth.uid() is not null then
    if not coalesce(public.ocorrencia_esta_visivel(p_ocorrencia_id), false) then
      return;
    end if;
  elsif not coalesce(public.ocorrencia_esta_publica(p_ocorrencia_id), false) then
    return;
  end if;

  return query
    select
      count(*) filter (where s.tipo = 'atendimento_iniciado'),
      count(*) filter (where s.tipo = 'problema_resolvido'),
      count(*) filter (where s.tipo = 'continua_igual'),
      count(*) filter (where s.tipo = 'piorou')
    from public.sinalizacoes_ocorrencias as s
    where s.ocorrencia_id = p_ocorrencia_id and s.desfeito_at is null;
end;
$$;

-- Nenhuma RPC precisa de service_role. Revoga inclusive grants automaticos
-- de default privileges, antes de liberar exclusivamente os clientes previstos.
revoke all on function public.minha_sinalizacao_ativa(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.definir_sinalizacao_ocorrencia(uuid, text, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.desfazer_sinalizacao_ocorrencia(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.contar_sinalizacoes_ocorrencia(uuid)
  from public, anon, authenticated, service_role;

grant execute on function public.minha_sinalizacao_ativa(uuid) to authenticated;
grant execute on function public.definir_sinalizacao_ocorrencia(uuid, text, uuid) to authenticated;
grant execute on function public.desfazer_sinalizacao_ocorrencia(uuid, uuid) to authenticated;
grant execute on function public.contar_sinalizacoes_ocorrencia(uuid) to anon, authenticated;

-- REVOKE de tabela nao remove os grants de coluna da 002. Revoga todas as
-- sete colunas, inclusive usuario_id, defensivamente, sem conceder nada novo.
revoke all privileges on table public.sinalizacoes_ocorrencias
  from public, anon, authenticated;
revoke select (id, ocorrencia_id, usuario_id, tipo, foto_storage_path, created_at, desfeito_at),
  insert (id, ocorrencia_id, usuario_id, tipo, foto_storage_path, created_at, desfeito_at),
  update (id, ocorrencia_id, usuario_id, tipo, foto_storage_path, created_at, desfeito_at)
  on table public.sinalizacoes_ocorrencias from public, anon, authenticated;

-- Detecta privilegios efetivos herdados inesperados em vez de presumir que
-- os REVOKEs bastaram. Aborta a migration inteira sem alterar outros roles.
do $$
declare
  v_role text;
begin
  foreach v_role in array array['anon', 'authenticated'] loop
    if pg_catalog.has_any_column_privilege(v_role, 'public.sinalizacoes_ocorrencias', 'SELECT')
      or pg_catalog.has_any_column_privilege(v_role, 'public.sinalizacoes_ocorrencias', 'INSERT')
      or pg_catalog.has_any_column_privilege(v_role, 'public.sinalizacoes_ocorrencias', 'UPDATE')
      or pg_catalog.has_table_privilege(v_role, 'public.sinalizacoes_ocorrencias', 'DELETE')
    then
      raise exception 'Ainda existem privilegios diretos herdados em sinalizacoes. Revise os grants antes de aplicar.'
        using errcode = '42501';
    end if;
  end loop;
end;
$$;

-- Policies/RLS permanecem, mas nao concedem acesso sem grants. A API cliente
-- passa a ser somente RPC; as definers validam explicitamente cada operacao.
-- Nenhum UPDATE em ocorrencias, escrita de historico oficial ou acao de Storage.
commit;
