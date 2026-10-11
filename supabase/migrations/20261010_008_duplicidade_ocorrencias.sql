-- Etapa 19: duplicidade com vinculo direto, justificativa publica e historico.
-- Incremental: nao altera os arquivos 001-007, RLS ou grants das tabelas.
begin;

-- Fecha a janela entre conferir dados antigos e instalar as novas garantias.
-- A migration nao corrige registros: qualquer inconsistencia aborta tudo.
lock table public.ocorrencias in share row exclusive mode;
do $$
begin
  if exists (
    select 1
    from public.ocorrencias as origem
    left join public.ocorrencias as principal
      on principal.id = origem.ocorrencia_principal_id
    where (
      origem.status = 'duplicado'
      and (
        principal.id is null
        or principal.id = origem.id
        or principal.status not in ('em_analise', 'encaminhado', 'em_andamento', 'resolvido')
        or principal.ocorrencia_principal_id is not null
      )
    ) or (origem.status <> 'duplicado' and origem.ocorrencia_principal_id is not null)
  ) then
    raise exception 'Existem vinculos de duplicidade antigos incompativeis. Revise as principais e seus status antes de aplicar esta migration; nenhum dado foi corrigido.'
      using errcode = 'P3617';
  end if;
end;
$$;

-- Chave estavel (360, 19): Paracatu 360 / fluxo de status e duplicidade.
-- As RPCs esperam antes de bloquear ocorrencias. O trigger usa try-lock:
-- um futuro UPDATE que ja detenha uma linha nao pode esperar pelo lock global
-- e formar um deadlock com uma RPC que esteja aguardando essa mesma linha.
create function public.bloquear_fluxo_status_ocorrencia(p_aguardar boolean)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- As consultas apos o lock devem ver commits de operacoes anteriores.
  -- Nao aceita snapshot antigo de REPEATABLE READ/SERIALIZABLE neste protocolo.
  if pg_catalog.current_setting('transaction_isolation') <> 'read committed' then
    raise exception 'Este fluxo exige uma transacao READ COMMITTED.'
      using errcode = 'P3618';
  end if;

  if p_aguardar then
    perform pg_catalog.pg_advisory_xact_lock(360, 19);
  elsif not pg_catalog.pg_try_advisory_xact_lock(360, 19) then
    raise exception 'Existe outra operacao administrativa em andamento. Recarregue os dados e tente novamente.'
      using errcode = 'P3616';
  end if;
end;
$$;
revoke all on function public.bloquear_fluxo_status_ocorrencia(boolean)
  from public, anon, authenticated, service_role;

-- Validador interno: chamado sob o lock transacional pelas RPCs/trigger.
-- Nenhuma identidade ou papel e aceito aqui como autorizacao.
create function public.validar_vinculo_duplicidade(
  p_ocorrencia_id uuid,
  p_status_origem text,
  p_ocorrencia_principal_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_status_principal text;
  v_vinculo_principal uuid;
begin
  if p_status_origem is null
    or p_status_origem not in ('registrado', 'em_analise', 'encaminhado', 'em_andamento')
  then
    raise exception 'O status da origem nao permite marcar duplicidade.'
      using errcode = 'P3609';
  end if;

  if p_ocorrencia_principal_id = p_ocorrencia_id then
    raise exception 'Uma ocorrencia nao pode ser a propria principal.'
      using errcode = 'P3611';
  end if;

  select p.status, p.ocorrencia_principal_id
  into v_status_principal, v_vinculo_principal
  from public.ocorrencias as p
  where p.id = p_ocorrencia_principal_id
  for update;

  if not found then
    raise exception 'Ocorrencia principal nao encontrada.' using errcode = 'P3610';
  end if;
  if v_status_principal = 'duplicado' or v_vinculo_principal is not null then
    raise exception 'A principal nao pode ser duplicada nem possuir vinculo com outra principal.'
      using errcode = 'P3613';
  end if;
  if v_status_principal not in ('em_analise', 'encaminhado', 'em_andamento', 'resolvido') then
    raise exception 'O status da principal nao permite este vinculo.'
      using errcode = 'P3612';
  end if;
end;
$$;
revoke all on function public.validar_vinculo_duplicidade(uuid, text, uuid)
  from public, anon, authenticated, service_role;

create or replace function public.validar_justificativa_status_ocorrencia(
  p_status_anterior text,
  p_status_novo text,
  p_justificativa text
)
returns text
language plpgsql
immutable
security invoker
set search_path = ''
as $$
declare
  v_justificativa text;
begin
  -- Trim tambem de tabs/quebras de linha; texto so de espacos vira NULL.
  v_justificativa := nullif(
    pg_catalog.regexp_replace(p_justificativa, '^[[:space:]]+|[[:space:]]+$', '', 'g'),
    ''
  );

  if pg_catalog.char_length(v_justificativa) > 500 then
    raise exception 'A justificativa pública deve ter no máximo 500 caracteres.'
      using errcode = 'P3607';
  end if;

  if v_justificativa is null and (
    p_status_novo in ('rejeitado', 'arquivado', 'duplicado')
    or (p_status_anterior, p_status_novo) in (
      ('resolvido', 'em_analise'),
      ('rejeitado', 'em_analise'),
      ('duplicado', 'em_analise'),
      ('arquivado', 'em_analise'),
      ('encaminhado', 'em_analise'),
      ('em_andamento', 'encaminhado')
    )
  ) then
    raise exception 'Informe uma justificativa pública para esta alteração.'
      using errcode = 'P3606';
  end if;

  return v_justificativa;
end;
$$;
revoke all on function public.validar_justificativa_status_ocorrencia(text, text, text)
  from public, anon, authenticated, service_role;

create or replace function public.validar_update_ocorrencia()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  papel_usuario text;
  papel_transicao text;
begin
  -- Backend é reconhecido somente pelo role assinado do Supabase.
  -- Ausência de usuário ou de JWT falha de forma segura.
  if coalesce(auth.role(), '') = 'service_role' then
    papel_usuario := 'backend';
  elsif auth.uid() is null then
    raise exception 'Contexto sem usuário autenticado não pode alterar ocorrências.'
      using errcode = '42501';
  else
    select papel
    into papel_usuario
    from public.profiles
    where id = auth.uid();
  end if;

  if papel_usuario = 'cidadao' then
    if old.autor_id is distinct from auth.uid()
      or old.status <> 'registrado'
    then
      raise exception 'O cidadão só pode editar sua ocorrência registrada.'
        using errcode = '42501';
    end if;

    if new.autor_id is distinct from old.autor_id
      or new.status is distinct from old.status
      or new.ocorrencia_principal_id is distinct from old.ocorrencia_principal_id
      or new.resolvida_at is distinct from old.resolvida_at
      or new.arquivada_at is distinct from old.arquivada_at
      or new.arquivada_por is distinct from old.arquivada_por
    then
      raise exception 'O cidadão não pode alterar campos administrativos.'
        using errcode = '42501';
    end if;
  elsif papel_usuario in ('moderador', 'administrador', 'backend') then
    if new.autor_id is distinct from old.autor_id
      or new.categoria_id is distinct from old.categoria_id
      or new.titulo is distinct from old.titulo
      or new.descricao is distinct from old.descricao
      or new.endereco is distinct from old.endereco
      or new.bairro is distinct from old.bairro
      or new.latitude is distinct from old.latitude
      or new.longitude is distinct from old.longitude
      or new.created_at is distinct from old.created_at
    then
      raise exception 'A equipe não pode reescrever o relato original.'
        using errcode = '42501';
    end if;

    if new.resolvida_at is distinct from old.resolvida_at
      or new.arquivada_at is distinct from old.arquivada_at
      or new.arquivada_por is distinct from old.arquivada_por
    then
      raise exception 'Datas e autoria administrativas são definidas automaticamente.'
        using errcode = '42501';
    end if;
  else
    raise exception 'Usuário sem papel autorizado para alterar ocorrências.'
      using errcode = '42501';
  end if;

  -- O vinculo nao pode ser reescrito silenciosamente mantendo o status.
  if new.status is not distinct from old.status
    and new.ocorrencia_principal_id is distinct from old.ocorrencia_principal_id
  then
    raise exception 'O vinculo so pode mudar no fluxo controlado de entrada ou saida de duplicado.'
      using errcode = 'P3615';
  end if;

  if new.status is distinct from old.status
    or new.ocorrencia_principal_id is distinct from old.ocorrencia_principal_id
  then
    perform public.bloquear_fluxo_status_ocorrencia(false);

    -- Impede tanto cadeias quanto uma duplicada publica apontando para
    -- principal rejeitada/arquivada. Usa ocorrencias_principal_id_idx.
    if new.status not in ('em_analise', 'encaminhado', 'em_andamento', 'resolvido')
      and exists (
        select 1 from public.ocorrencias as dependente
        where dependente.ocorrencia_principal_id = old.id
      )
    then
      raise exception 'Esta ocorrencia possui duplicadas vinculadas e nao pode assumir este status.'
        using errcode = 'P3614';
    end if;
  end if;

  if new.status is distinct from old.status then
    papel_transicao := papel_usuario;
    if papel_usuario = 'backend' then
      -- Service role nao ganha um papel de produto implicito.
      -- Mudanca oficial exige identidade real de moderador/administrador.
      if auth.uid() is null then
        raise exception 'Autenticação necessária para alterar status.'
          using errcode = 'P3601';
      end if;
      select p.papel into papel_transicao
      from public.profiles as p
      where p.id = auth.uid();
    end if;

    if new.status = 'duplicado' then
      -- O trigger SECURITY INVOKER valida a procedencia do contexto da RPC.
      -- Aqui continuam obrigatorias identidade, papel e regras reais de dados.
      if papel_transicao is null or papel_transicao not in ('moderador', 'administrador') then
        raise exception 'Papel nao autorizado para marcar duplicidade.' using errcode = 'P3602';
      end if;
      perform public.validar_vinculo_duplicidade(old.id, old.status, new.ocorrencia_principal_id);
    else
      -- O validador da 006 permanece intacto, inclusive o bloqueio P3608.
      perform public.validar_transicao_status_ocorrencia(
        old.status, new.status, papel_transicao
      );
    end if;
    if new.status = 'resolvido' then
      new.resolvida_at := now();
    else
      new.resolvida_at := null;
    end if;

    if new.status = 'arquivado' then
      if auth.uid() is null then
        raise exception 'Não é possível arquivar sem identificar o responsável.'
          using errcode = '42501';
      end if;

      new.arquivada_at := now();
      new.arquivada_por := auth.uid();
    else
      new.arquivada_at := null;
      new.arquivada_por := null;
    end if;
  end if;

  if (new.status = 'resolvido' and new.resolvida_at is null)
    or (new.status <> 'resolvido' and new.resolvida_at is not null)
  then
    raise exception 'O campo resolvida_at deve ser coerente com o status resolvido.'
      using errcode = '23514';
  end if;

  if (
    new.status = 'arquivado'
    and (new.arquivada_at is null or new.arquivada_por is null)
  ) or (
    new.status <> 'arquivado'
    and (new.arquivada_at is not null or new.arquivada_por is not null)
  )
  then
    raise exception 'Os campos de arquivamento devem ser coerentes com o status arquivado.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;
revoke all on function public.validar_update_ocorrencia()
  from public, anon, authenticated, service_role;

create or replace function public.alterar_status_ocorrencia(
  p_ocorrencia_id uuid,
  p_status_esperado text,
  p_novo_status text,
  p_justificativa text default null
)
returns table (
  id uuid,
  status text,
  updated_at timestamptz,
  resolvida_at timestamptz,
  arquivada_at timestamptz,
  ocorrencia_principal_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id uuid := auth.uid();
  v_papel text;
  v_status_atual text;
  v_justificativa text;
  v_contexto_anterior text;
begin
  if v_usuario_id is null then
    raise exception 'Autenticação necessária.'
      using errcode = 'P3601';
  end if;

  -- Identidade/papel nunca sao parametros nem metadados escolhidos pelo cliente.
  -- SHARE impede rebaixamento concorrente do ator durante esta transacao.
  select p.papel into v_papel
  from public.profiles as p
  where p.id = v_usuario_id
  for share;

  if v_papel is null or v_papel not in ('moderador', 'administrador') then
    raise exception 'Papel não autorizado para alterar status.'
      using errcode = 'P3602';
  end if;

  if p_novo_status = 'duplicado' then
    raise exception 'Entrada em duplicado nao esta disponivel nesta operacao; use a RPC especifica.'
      using errcode = 'P3608';
  end if;

  -- Mesmo protocolo da RPC de duplicidade, antes de ler/bloquear ocorrencias.
  perform public.bloquear_fluxo_status_ocorrencia(true);

  -- Os dois papeis podem ver todas as ocorrencias pelas policies da 002.
  -- Autoriza antes de consultar o UUID para nao revelar existencia a cidadaos.
  select o.status into v_status_atual
  from public.ocorrencias as o
  where o.id = p_ocorrencia_id
  for update;

  if not found then
    raise exception 'Ocorrência não encontrada ou indisponível.'
      using errcode = 'P3603';
  end if;

  if v_status_atual is distinct from p_status_esperado then
    raise exception 'O status foi alterado. Atualize a ocorrência antes de tentar novamente.'
      using errcode = 'P3604';
  end if;

  perform public.validar_transicao_status_ocorrencia(
    v_status_atual, p_novo_status, v_papel
  );
  v_justificativa := public.validar_justificativa_status_ocorrencia(
    v_status_atual, p_novo_status, p_justificativa
  );

  v_contexto_anterior := pg_catalog.current_setting('paracatu360.status_evento', true);
  begin
    -- true = LOCAL a transacao. A funcao restaura o valor tambem no sucesso,
    -- sem deixar a justificativa disponivel para outra escrita na mesma transacao.
    perform pg_catalog.set_config(
      'paracatu360.status_evento',
      pg_catalog.jsonb_build_object(
        'ocorrencia_id', p_ocorrencia_id,
        'status_anterior', v_status_atual,
        'status_novo', p_novo_status,
        'justificativa', v_justificativa
      )::text,
      true
    );

    return query
      update public.ocorrencias as o
      set status = p_novo_status,
          -- Unica mudanca de vinculo nesta etapa: saida de duplicado.
          -- A constraint da 001 exige NULL nos demais status.
          ocorrencia_principal_id = case
            when v_status_atual = 'duplicado' then null
            else o.ocorrencia_principal_id
          end
      where o.id = p_ocorrencia_id
      returning o.id, o.status, o.updated_at, o.resolvida_at,
                o.arquivada_at, o.ocorrencia_principal_id;
  exception when others then
    -- O sub-bloco reverte UPDATE e INSERT do trigger em conjunto.
    perform pg_catalog.set_config(
      'paracatu360.status_evento', coalesce(v_contexto_anterior, ''), true
    );
    raise;
  end;

  perform pg_catalog.set_config(
    'paracatu360.status_evento', coalesce(v_contexto_anterior, ''), true
  );
end;
$$;
revoke all on function public.alterar_status_ocorrencia(uuid, text, text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.alterar_status_ocorrencia(uuid, text, text, text)
  to authenticated;

-- RPC exclusiva de entrada em duplicado. O trigger de historico existente
-- permanece como unico escritor: esta funcao nunca insere historico manual.
create function public.marcar_ocorrencia_duplicada(
  p_ocorrencia_id uuid,
  p_status_esperado text,
  p_ocorrencia_principal_id uuid,
  p_justificativa text
)
returns table (
  id uuid,
  status text,
  updated_at timestamptz,
  resolvida_at timestamptz,
  arquivada_at timestamptz,
  ocorrencia_principal_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id uuid := auth.uid();
  v_papel text;
  v_status_atual text;
  v_justificativa text;
  v_contexto_status_anterior text;
  v_contexto_duplicidade_anterior text;
begin
  if v_usuario_id is null then
    raise exception 'Autenticacao necessaria.' using errcode = 'P3601';
  end if;

  -- Igual a RPC geral: bloqueia o profile contra rebaixamento concorrente.
  -- Nao consulta ocorrencias antes de autorizar o papel real.
  select p.papel into v_papel
  from public.profiles as p
  where p.id = v_usuario_id
  for share;
  if v_papel is null or v_papel not in ('moderador', 'administrador') then
    raise exception 'Papel nao autorizado para marcar duplicidade.' using errcode = 'P3602';
  end if;

  perform public.bloquear_fluxo_status_ocorrencia(true);

  -- Bloqueia ambas em ordem deterministica. As leituras/validacoes seguintes
  -- ocorrem depois do advisory lock e sob os locks das linhas existentes.
  perform o.id
  from public.ocorrencias as o
  where o.id in (p_ocorrencia_id, p_ocorrencia_principal_id)
  order by o.id
  for update;

  select o.status into v_status_atual
  from public.ocorrencias as o
  where o.id = p_ocorrencia_id
  for update;
  if not found then
    raise exception 'Ocorrencia nao encontrada ou indisponivel.' using errcode = 'P3603';
  end if;
  if v_status_atual is distinct from p_status_esperado then
    raise exception 'O status foi alterado. Atualize a ocorrencia antes de tentar novamente.'
      using errcode = 'P3604';
  end if;

  perform public.validar_vinculo_duplicidade(
    p_ocorrencia_id, v_status_atual, p_ocorrencia_principal_id
  );
  v_justificativa := public.validar_justificativa_status_ocorrencia(
    v_status_atual, 'duplicado', p_justificativa
  );

  v_contexto_status_anterior := pg_catalog.current_setting('paracatu360.status_evento', true);
  v_contexto_duplicidade_anterior := pg_catalog.current_setting('paracatu360.duplicidade_evento', true);
  begin
    perform pg_catalog.set_config(
      'paracatu360.status_evento',
      pg_catalog.jsonb_build_object(
        'ocorrencia_id', p_ocorrencia_id,
        'status_anterior', v_status_atual,
        'status_novo', 'duplicado',
        'justificativa', v_justificativa
      )::text,
      true
    );
    perform pg_catalog.set_config(
      'paracatu360.duplicidade_evento',
      pg_catalog.jsonb_build_object(
        'ocorrencia_id', p_ocorrencia_id,
        'ocorrencia_principal_id', p_ocorrencia_principal_id,
        'status_anterior', v_status_atual,
        'status_novo', 'duplicado',
        'usuario_id', v_usuario_id,
        'transacao', pg_catalog.txid_current()::text
      )::text,
      true
    );

    return query
      update public.ocorrencias as o
      set status = 'duplicado', ocorrencia_principal_id = p_ocorrencia_principal_id
      where o.id = p_ocorrencia_id
      returning o.id, o.status, o.updated_at, o.resolvida_at,
                o.arquivada_at, o.ocorrencia_principal_id;
  exception when others then
    perform pg_catalog.set_config('paracatu360.status_evento', coalesce(v_contexto_status_anterior, ''), true);
    perform pg_catalog.set_config('paracatu360.duplicidade_evento', coalesce(v_contexto_duplicidade_anterior, ''), true);
    raise;
  end;

  perform pg_catalog.set_config('paracatu360.status_evento', coalesce(v_contexto_status_anterior, ''), true);
  perform pg_catalog.set_config('paracatu360.duplicidade_evento', coalesce(v_contexto_duplicidade_anterior, ''), true);
end;
$$;
revoke all on function public.marcar_ocorrencia_duplicada(uuid, text, uuid, text)
  from public, anon, authenticated, service_role;
grant execute on function public.marcar_ocorrencia_duplicada(uuid, text, uuid, text)
  to authenticated;

-- Esta guarda e SECURITY INVOKER de proposito: observa o current_user do
-- UPDATE, antes da elevacao do validador SECURITY DEFINER existente.
-- Na RPC, current_user e seu dono; no UPDATE direto do cliente e authenticated.
-- Assim, forjar somente set_config nao habilita escrita de vinculo, mesmo
-- se um futuro grant liberar colunas. O validador ainda exige auth.uid/papel,
-- estado elegivel, principal valida, ausencia de dependentes e locking.
-- Como qualquer seguranca SQL, nao limita o dono/superusuario capaz de DDL.
create function public.proteger_fluxo_duplicidade()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_dono_rpc name;
  v_contexto_esperado text;
begin
  if tg_op = 'INSERT' then
    if new.status = 'duplicado' or new.ocorrencia_principal_id is not null then
      raise exception 'O vinculo de duplicidade so pode ser criado pela RPC especifica.'
        using errcode = 'P3615';
    end if;
    return new;
  end if;

  if new.status is not distinct from old.status
    and new.ocorrencia_principal_id is distinct from old.ocorrencia_principal_id
  then
    raise exception 'Nao e permitido trocar a principal sem sair de duplicado.'
      using errcode = 'P3615';
  end if;

  if new.status = 'duplicado' and old.status is distinct from new.status then
    select pg_catalog.pg_get_userbyid(p.proowner) into v_dono_rpc
    from pg_catalog.pg_proc as p
    where p.oid = 'public.marcar_ocorrencia_duplicada(uuid,text,uuid,text)'::pg_catalog.regprocedure;

    v_contexto_esperado := pg_catalog.jsonb_build_object(
      'ocorrencia_id', old.id,
      'ocorrencia_principal_id', new.ocorrencia_principal_id,
      'status_anterior', old.status,
      'status_novo', new.status,
      'usuario_id', auth.uid(),
      'transacao', pg_catalog.txid_current()::text
    )::text;

    if current_user is distinct from v_dono_rpc
      or new.id is distinct from old.id
      or pg_catalog.current_setting('paracatu360.duplicidade_evento', true) is distinct from v_contexto_esperado
    then
      raise exception 'O vinculo de duplicidade so pode ser criado pela RPC especifica.'
        using errcode = 'P3615';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.proteger_fluxo_duplicidade()
  from public, anon, authenticated, service_role;

create trigger ocorrencias_validar_contexto_duplicidade
before insert or update on public.ocorrencias
for each row execute function public.proteger_fluxo_duplicidade();

-- Preservados: constraints de coerencia/autorreferencia, indice principal_id,
-- RLS, grants de coluna, fotos/Storage, confirmacoes e escritor do historico.
-- O lock transacional serializa as RPCs administrativas; leitura publica e
-- edicao cidada sem mudanca de status/vinculo nao adquirem esse lock.
commit;
