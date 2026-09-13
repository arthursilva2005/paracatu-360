-- =========================================================
-- PARACATU 360
-- Segurança, automações e regras de acesso
-- =========================================================


-- =========================================================
-- 1. FUNÇÕES AUXILIARES DE SEGURANÇA
-- =========================================================

create or replace function public.usuario_tem_papel(p_papeis text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and papel = any (p_papeis)
  );
$$;

revoke all on function public.usuario_tem_papel(text[]) from public;
grant execute on function public.usuario_tem_papel(text[]) to authenticated;

create or replace function public.ocorrencia_esta_publica(p_ocorrencia_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.ocorrencias
    where id = p_ocorrencia_id
      and status not in ('rejeitado', 'arquivado')
  );
$$;

revoke all on function public.ocorrencia_esta_publica(uuid) from public;
grant execute on function public.ocorrencia_esta_publica(uuid)
  to anon, authenticated;

create or replace function public.ocorrencia_esta_visivel(p_ocorrencia_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.ocorrencias
    where id = p_ocorrencia_id
      and (
        status not in ('rejeitado', 'arquivado')
        or autor_id = auth.uid()
        or public.usuario_tem_papel(array['moderador', 'administrador'])
      )
  );
$$;

revoke all on function public.ocorrencia_esta_visivel(uuid) from public;
grant execute on function public.ocorrencia_esta_visivel(uuid)
  to authenticated;

create or replace function public.usuario_pode_editar_ocorrencia(
  p_ocorrencia_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.ocorrencias
    where id = p_ocorrencia_id
      and autor_id = auth.uid()
      and status = 'registrado'
  );
$$;

revoke all on function public.usuario_pode_editar_ocorrencia(uuid) from public;
grant execute on function public.usuario_pode_editar_ocorrencia(uuid)
  to authenticated;

create or replace function public.usuario_eh_autor_ocorrencia(
  p_ocorrencia_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.ocorrencias
    where id = p_ocorrencia_id
      and autor_id = auth.uid()
  );
$$;

revoke all on function public.usuario_eh_autor_ocorrencia(uuid) from public;
grant execute on function public.usuario_eh_autor_ocorrencia(uuid)
  to authenticated;


-- =========================================================
-- 2. ATUALIZAÇÃO AUTOMÁTICA DE UPDATED_AT
-- =========================================================

create or replace function public.definir_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.definir_updated_at()
  from public, anon, authenticated;

create trigger profiles_definir_updated_at
before update on public.profiles
for each row
execute function public.definir_updated_at();

create trigger ocorrencias_definir_updated_at
before update on public.ocorrencias
for each row
execute function public.definir_updated_at();


-- =========================================================
-- 3. CRIAÇÃO AUTOMÁTICA DE PROFILE
-- O papel nunca é aceito dos metadados enviados pelo cliente.
-- Todo novo usuário começa como cidadão.
-- =========================================================

create or replace function public.criar_profile_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  nome_profile text;
begin
  nome_profile := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'nome'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Usuário'
  );

  insert into public.profiles (id, nome, papel)
  values (new.id, nome_profile, 'cidadao')
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.criar_profile_novo_usuario()
  from public, anon, authenticated;

create trigger auth_users_criar_profile
after insert on auth.users
for each row
execute function public.criar_profile_novo_usuario();


-- =========================================================
-- 4. PROTEÇÃO DO PAPEL DOS PROFILES
-- Somente um administrador autenticado ou o service role
-- explicitamente identificado pode alterar o papel de um profile.
-- =========================================================

create or replace function public.proteger_papel_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.papel is distinct from old.papel then
    if coalesce(auth.role(), '') = 'service_role' then
      return new;
    end if;

    if auth.uid() is null
      or not exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and papel = 'administrador'
      )
    then
      raise exception 'Somente administradores podem alterar papéis.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.proteger_papel_profile()
  from public, anon, authenticated;

create trigger profiles_proteger_papel
before update of papel on public.profiles
for each row
execute function public.proteger_papel_profile();


-- =========================================================
-- 5. AUTORIZAÇÃO DAS ALTERAÇÕES EM OCORRENCIAS
-- RLS limita as linhas. Este trigger também limita as colunas
-- conforme o papel registrado no profile do usuário.
-- =========================================================

create or replace function public.validar_update_ocorrencia()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  papel_usuario text;
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
  from public, anon, authenticated;

create trigger ocorrencias_validar_update
before update on public.ocorrencias
for each row
execute function public.validar_update_ocorrencia();


-- =========================================================
-- 6. HISTÓRICO AUTOMÁTICO DO STATUS OFICIAL
-- O registro inicial e cada mudança de status são preservados.
-- =========================================================

create or replace function public.registrar_historico_status_ocorrencia()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.historico_ocorrencias (
      ocorrencia_id,
      status_anterior,
      status_novo,
      alterado_por
    )
    values (
      new.id,
      null,
      new.status,
      auth.uid()
    );
  elsif old.status is distinct from new.status then
    insert into public.historico_ocorrencias (
      ocorrencia_id,
      status_anterior,
      status_novo,
      alterado_por
    )
    values (
      new.id,
      old.status,
      new.status,
      auth.uid()
    );
  end if;

  return new;
end;
$$;

revoke all on function public.registrar_historico_status_ocorrencia()
  from public, anon, authenticated;

create trigger ocorrencias_registrar_historico_status
after insert or update of status on public.ocorrencias
for each row
execute function public.registrar_historico_status_ocorrencia();


-- =========================================================
-- 7. VALIDAÇÃO DA AUTORIA NAS CONFIRMAÇÕES
-- A regra também é aplicada por trigger para proteger escritas
-- privilegiadas futuras que não passem pelas policies de RLS.
-- =========================================================

create or replace function public.validar_confirmacao_nao_autor()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.ocorrencias
    where id = new.ocorrencia_id
      and autor_id = new.usuario_id
  ) then
    raise exception 'O autor não pode confirmar a própria ocorrência.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function public.validar_confirmacao_nao_autor()
  from public, anon, authenticated;

create trigger confirmacoes_validar_nao_autor
before insert or update of ocorrencia_id, usuario_id on public.confirmacoes
for each row
execute function public.validar_confirmacao_nao_autor();


-- =========================================================
-- 8. ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles enable row level security;
alter table public.categorias enable row level security;
alter table public.ocorrencias enable row level security;
alter table public.ocorrencia_fotos enable row level security;
alter table public.confirmacoes enable row level security;
alter table public.historico_ocorrencias enable row level security;
alter table public.sinalizacoes_ocorrencias enable row level security;


-- =========================================================
-- 9. POLICIES: PROFILES
-- Cidadãos acessam apenas o próprio perfil.
-- Moderadores e administradores podem consultar os perfis.
-- A alteração de papel permanece reservada ao backend seguro.
-- =========================================================

create policy profiles_select_proprio
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy profiles_select_equipe
on public.profiles
for select
to authenticated
using (
  public.usuario_tem_papel(array['moderador', 'administrador'])
);

create policy profiles_update_proprio
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy profiles_update_administrador
on public.profiles
for update
to authenticated
using (
  public.usuario_tem_papel(array['administrador'])
)
with check (
  public.usuario_tem_papel(array['administrador'])
);


-- =========================================================
-- 10. POLICIES: CATEGORIAS
-- Categorias ativas são públicas. Apenas administradores
-- gerenciam o catálogo.
-- =========================================================

create policy categorias_select_ativas_anon
on public.categorias
for select
to anon
using (ativa);

create policy categorias_select_ativas_authenticated
on public.categorias
for select
to authenticated
using (ativa);

create policy categorias_select_administrador
on public.categorias
for select
to authenticated
using (
  public.usuario_tem_papel(array['administrador'])
);

create policy categorias_insert_administrador
on public.categorias
for insert
to authenticated
with check (
  public.usuario_tem_papel(array['administrador'])
);

create policy categorias_update_administrador
on public.categorias
for update
to authenticated
using (
  public.usuario_tem_papel(array['administrador'])
)
with check (
  public.usuario_tem_papel(array['administrador'])
);

create policy categorias_delete_administrador
on public.categorias
for delete
to authenticated
using (
  public.usuario_tem_papel(array['administrador'])
);


-- =========================================================
-- 11. POLICIES: OCORRENCIAS
-- Rejeitadas e arquivadas não fazem parte da leitura pública.
-- O autor continua podendo consultar seus próprios registros.
-- =========================================================

create policy ocorrencias_select_publicas_anon
on public.ocorrencias
for select
to anon
using (status not in ('rejeitado', 'arquivado'));

create policy ocorrencias_select_publicas_authenticated
on public.ocorrencias
for select
to authenticated
using (status not in ('rejeitado', 'arquivado'));

create policy ocorrencias_select_proprias
on public.ocorrencias
for select
to authenticated
using (autor_id = auth.uid());

create policy ocorrencias_select_equipe
on public.ocorrencias
for select
to authenticated
using (
  public.usuario_tem_papel(array['moderador', 'administrador'])
);

create policy ocorrencias_insert_cidadao
on public.ocorrencias
for insert
to authenticated
with check (
  autor_id = auth.uid()
  and status = 'registrado'
  and ocorrencia_principal_id is null
  and resolvida_at is null
  and arquivada_at is null
  and arquivada_por is null
  and exists (
    select 1
    from public.categorias
    where categorias.id = categoria_id
      and categorias.ativa
  )
);

create policy ocorrencias_update_autor_registrada
on public.ocorrencias
for update
to authenticated
using (
  autor_id = auth.uid()
  and status = 'registrado'
)
with check (
  autor_id = auth.uid()
  and status = 'registrado'
  and ocorrencia_principal_id is null
  and resolvida_at is null
  and arquivada_at is null
  and arquivada_por is null
  and exists (
    select 1
    from public.categorias
    where categorias.id = categoria_id
      and categorias.ativa
  )
);

create policy ocorrencias_update_equipe
on public.ocorrencias
for update
to authenticated
using (
  public.usuario_tem_papel(array['moderador', 'administrador'])
)
with check (
  public.usuario_tem_papel(array['moderador', 'administrador'])
);

create policy ocorrencias_delete_autor_registrada
on public.ocorrencias
for delete
to authenticated
using (
  autor_id = auth.uid()
  and status = 'registrado'
);


-- =========================================================
-- 12. POLICIES: OCORRENCIA_FOTOS
-- =========================================================

create policy ocorrencia_fotos_select_publicas_anon
on public.ocorrencia_fotos
for select
to anon
using (
  public.ocorrencia_esta_publica(ocorrencia_id)
);

create policy ocorrencia_fotos_select_authenticated
on public.ocorrencia_fotos
for select
to authenticated
using (
  public.ocorrencia_esta_visivel(ocorrencia_id)
);

create policy ocorrencia_fotos_insert_autor_registrada
on public.ocorrencia_fotos
for insert
to authenticated
with check (
  public.usuario_pode_editar_ocorrencia(ocorrencia_id)
);

create policy ocorrencia_fotos_update_autor_registrada
on public.ocorrencia_fotos
for update
to authenticated
using (
  public.usuario_pode_editar_ocorrencia(ocorrencia_id)
)
with check (
  public.usuario_pode_editar_ocorrencia(ocorrencia_id)
);

create policy ocorrencia_fotos_delete_autor_registrada
on public.ocorrencia_fotos
for delete
to authenticated
using (
  public.usuario_pode_editar_ocorrencia(ocorrencia_id)
);

-- =========================================================
-- 13. POLICIES: CONFIRMACOES
-- Registros ativos podem alimentar a contagem pública, sem
-- liberar o identificador do usuário que confirmou.
-- =========================================================

create policy confirmacoes_select_ativas_anon
on public.confirmacoes
for select
to anon
using (
  desfeito_at is null
  and public.ocorrencia_esta_publica(ocorrencia_id)
);

create policy confirmacoes_select_ativas_authenticated
on public.confirmacoes
for select
to authenticated
using (
  desfeito_at is null
  and public.ocorrencia_esta_visivel(ocorrencia_id)
);

create policy confirmacoes_select_proprias
on public.confirmacoes
for select
to authenticated
using (usuario_id = auth.uid());

create policy confirmacoes_select_equipe
on public.confirmacoes
for select
to authenticated
using (
  public.usuario_tem_papel(array['moderador', 'administrador'])
);

create policy confirmacoes_insert_usuario
on public.confirmacoes
for insert
to authenticated
with check (
  usuario_id = auth.uid()
  and desfeito_at is null
  and public.ocorrencia_esta_publica(ocorrencia_id)
  and not public.usuario_eh_autor_ocorrencia(ocorrencia_id)
);

create policy confirmacoes_update_desfazer_propria
on public.confirmacoes
for update
to authenticated
using (
  usuario_id = auth.uid()
  and desfeito_at is null
)
with check (
  usuario_id = auth.uid()
  and desfeito_at is not null
);


-- =========================================================
-- 14. POLICIES: HISTORICO_OCORRENCIAS
-- O histórico é criado pelo trigger e não recebe escrita direta
-- dos clientes autenticados.
-- =========================================================

create policy historico_select_publico_anon
on public.historico_ocorrencias
for select
to anon
using (
  public.ocorrencia_esta_publica(ocorrencia_id)
);

create policy historico_select_authenticated
on public.historico_ocorrencias
for select
to authenticated
using (
  public.ocorrencia_esta_visivel(ocorrencia_id)
);

create policy historico_select_equipe
on public.historico_ocorrencias
for select
to authenticated
using (
  public.usuario_tem_papel(array['moderador', 'administrador'])
);


-- =========================================================
-- 15. POLICIES: SINALIZACOES_OCORRENCIAS
-- Sinalizações preservam histórico e não alteram o status.
-- =========================================================

create policy sinalizacoes_select_ativas_anon
on public.sinalizacoes_ocorrencias
for select
to anon
using (
  desfeito_at is null
  and public.ocorrencia_esta_publica(ocorrencia_id)
);

create policy sinalizacoes_select_ativas_authenticated
on public.sinalizacoes_ocorrencias
for select
to authenticated
using (
  desfeito_at is null
  and public.ocorrencia_esta_visivel(ocorrencia_id)
);

create policy sinalizacoes_select_proprias
on public.sinalizacoes_ocorrencias
for select
to authenticated
using (usuario_id = auth.uid());

create policy sinalizacoes_select_equipe
on public.sinalizacoes_ocorrencias
for select
to authenticated
using (
  public.usuario_tem_papel(array['moderador', 'administrador'])
);

create policy sinalizacoes_insert_usuario
on public.sinalizacoes_ocorrencias
for insert
to authenticated
with check (
  usuario_id = auth.uid()
  and desfeito_at is null
  and public.ocorrencia_esta_publica(ocorrencia_id)
);

create policy sinalizacoes_update_desfazer_propria
on public.sinalizacoes_ocorrencias
for update
to authenticated
using (
  usuario_id = auth.uid()
  and desfeito_at is null
)
with check (
  usuario_id = auth.uid()
  and desfeito_at is not null
);


-- =========================================================
-- 16. PRIVILÉGIOS DE TABELA E COLUNA
-- RLS controla linhas; os grants abaixo também protegem as
-- colunas de autoria e os identificadores de outros usuários.
-- =========================================================

grant usage on schema public to anon, authenticated;

revoke all on public.profiles from anon, authenticated;
revoke all on public.categorias from anon, authenticated;
revoke all on public.ocorrencias from anon, authenticated;
revoke all on public.ocorrencia_fotos from anon, authenticated;
revoke all on public.confirmacoes from anon, authenticated;
revoke all on public.historico_ocorrencias from anon, authenticated;
revoke all on public.sinalizacoes_ocorrencias from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (nome, papel) on public.profiles to authenticated;

grant select on public.categorias to anon, authenticated;
grant insert, update, delete on public.categorias to authenticated;

grant select (
  id,
  categoria_id,
  titulo,
  descricao,
  status,
  endereco,
  bairro,
  latitude,
  longitude,
  ocorrencia_principal_id,
  created_at,
  updated_at,
  resolvida_at,
  arquivada_at
) on public.ocorrencias to anon, authenticated;

grant insert (
  autor_id,
  categoria_id,
  titulo,
  descricao,
  endereco,
  bairro,
  latitude,
  longitude
) on public.ocorrencias to authenticated;

grant update (
  categoria_id,
  titulo,
  descricao,
  status,
  endereco,
  bairro,
  latitude,
  longitude,
  ocorrencia_principal_id,
  resolvida_at,
  arquivada_at,
  arquivada_por
) on public.ocorrencias to authenticated;

grant delete on public.ocorrencias to authenticated;

grant select on public.ocorrencia_fotos to anon, authenticated;
grant insert (ocorrencia_id, storage_path, ordem)
  on public.ocorrencia_fotos to authenticated;
grant update (storage_path, ordem)
  on public.ocorrencia_fotos to authenticated;
grant delete on public.ocorrencia_fotos to authenticated;

grant select (id, ocorrencia_id, created_at, desfeito_at)
  on public.confirmacoes to anon, authenticated;
grant insert (ocorrencia_id, usuario_id)
  on public.confirmacoes to authenticated;
grant update (desfeito_at)
  on public.confirmacoes to authenticated;

grant select (
  id,
  ocorrencia_id,
  status_anterior,
  status_novo,
  observacao,
  created_at
) on public.historico_ocorrencias to anon, authenticated;

grant select (
  id,
  ocorrencia_id,
  tipo,
  foto_storage_path,
  created_at,
  desfeito_at
) on public.sinalizacoes_ocorrencias to anon, authenticated;
grant insert (ocorrencia_id, usuario_id, tipo, foto_storage_path)
  on public.sinalizacoes_ocorrencias to authenticated;
grant update (desfeito_at)
  on public.sinalizacoes_ocorrencias to authenticated;
