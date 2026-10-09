-- Etapa 18B: fluxo oficial de status e justificativa PUBLICA.
-- Migration incremental: nao modifica os arquivos 001-005.
-- Nenhuma nota interna deve ser armazenada em historico_ocorrencias.observacao.
begin;

-- Validadores internos compartilhados pela RPC e pelos triggers.
-- Nao consultam dados nem elevam privilegios; nao sao RPCs para o cliente.
create function public.validar_transicao_status_ocorrencia(
  p_status_anterior text,
  p_status_novo text,
  p_papel text
)
returns void
language plpgsql
immutable
security invoker
set search_path = ''
as $$
begin
  if p_papel is null or p_papel not in ('moderador', 'administrador') then
    raise exception 'Papel não autorizado para alterar status.'
      using errcode = 'P3602';
  end if;

  if p_status_novo = 'duplicado' then
    raise exception 'Marcação de duplicidade ainda não disponível.'
      using errcode = 'P3608';
  end if;

  if not coalesce(
    (p_status_anterior, p_status_novo) in (
      ('registrado', 'em_analise'),
      ('em_analise', 'encaminhado'),
      ('encaminhado', 'em_andamento'),
      ('em_andamento', 'resolvido'),
      ('em_analise', 'rejeitado'),
      ('encaminhado', 'rejeitado'),
      ('em_andamento', 'rejeitado'),
      ('resolvido', 'arquivado'),
      ('rejeitado', 'arquivado'),
      ('duplicado', 'arquivado')
    )
    or (
      p_papel = 'administrador'
      and (p_status_anterior, p_status_novo) in (
        ('resolvido', 'em_analise'),
        ('rejeitado', 'em_analise'),
        ('duplicado', 'em_analise'),
        ('arquivado', 'em_analise'),
        ('encaminhado', 'em_analise'),
        ('em_andamento', 'encaminhado')
      )
    ),
    false
  ) then
    -- Inclui retorno a registrado, repeticao do status e valores nulos/invalidos.
    raise exception 'Transição de status não permitida.'
      using errcode = 'P3605';
  end if;
end;
$$;

revoke all on function public.validar_transicao_status_ocorrencia(text, text, text)
  from public, anon, authenticated, service_role;

create function public.validar_justificativa_status_ocorrencia(
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
    p_status_novo in ('rejeitado', 'arquivado')
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

-- Mantem as protecoes da 002 e acrescenta a matriz de transicoes no trigger.
-- Mesmo um futuro grant de coluna nao permite contornar essas regras.

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

    perform public.validar_transicao_status_ocorrencia(
      old.status, new.status, papel_transicao
    );
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

-- O trigger existente permanece instalado e continua sendo o unico escritor
-- do evento de status. Nao ha INSERT de historico na RPC nem UPDATE posterior.
create or replace function public.registrar_historico_status_ocorrencia()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contexto jsonb;
  v_justificativa text;
begin
  if tg_op = 'INSERT' then
    -- Cadastro normal nao consome contexto administrativo.
    insert into public.historico_ocorrencias (
      ocorrencia_id, status_anterior, status_novo, alterado_por
    )
    values (new.id, null, new.status, auth.uid());
  elsif old.status is distinct from new.status then
    v_contexto := nullif(
      pg_catalog.current_setting('paracatu360.status_evento', true), ''
    )::jsonb;

    -- Contexto transporta apenas a observacao publica. Nunca autoriza a escrita,
    -- escolhe ator ou desativa regras. Vinculo evita reutiliza-lo em outro evento.
    if v_contexto ->> 'ocorrencia_id' = new.id::text
      and v_contexto ->> 'status_anterior' = old.status
      and v_contexto ->> 'status_novo' = new.status
    then
      v_justificativa := v_contexto ->> 'justificativa';
    end if;

    -- Defesa adicional: obrigatoriedade e limite valem tambem fora da RPC.
    -- Sem contexto, transicoes opcionais gravam NULL; obrigatorias falham.
    v_justificativa := public.validar_justificativa_status_ocorrencia(
      old.status, new.status, v_justificativa
    );

    insert into public.historico_ocorrencias (
      ocorrencia_id, status_anterior, status_novo, alterado_por, observacao
    )
    values (
      new.id, old.status, new.status, auth.uid(), v_justificativa
    );
  end if;

  return new;
end;
$$;

revoke all on function public.registrar_historico_status_ocorrencia()
  from public, anon, authenticated, service_role;

-- A RLS/policies ficam intactas. Somente a RPC passa a escrever campos
-- administrativos em nome de um usuario de equipe autenticado.
-- Revoga eventual grant de tabela e os grants de coluna administrativos.
-- Permanecem os grants existentes de edicao cidada: categoria_id, titulo,
-- descricao, endereco, bairro, latitude, longitude (sujeitos a RLS/trigger).
revoke update on public.ocorrencias from authenticated;
revoke update (
  status, ocorrencia_principal_id, resolvida_at, arquivada_at, arquivada_por
) on public.ocorrencias from authenticated;

create function public.alterar_status_ocorrencia(
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

-- Sem uso de backend nesta RPC: somente sessao authenticated, com papel
-- moderador/administrador verificado dentro da funcao. PUBLIC inclui anon.
revoke all on function public.alterar_status_ocorrencia(uuid, text, text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.alterar_status_ocorrencia(uuid, text, text, text)
  to authenticated;

-- Nenhum trigger adicional: ocorrencias_validar_update e
-- ocorrencias_registrar_historico_status usam as funcoes substituidas acima.
-- INSERT, SELECT, DELETE, Storage, confirmacoes e policies nao mudam.
-- Ao impedir toda transicao de volta a registrado no trigger, a policy
-- cidada de DELETE nao recupera acesso apos a primeira mudanca oficial.
-- Nao corrige retroativamente dados anteriores nem restringe superusuarios
-- capazes de desabilitar triggers/alterar DDL.

commit;
