-- Listagem das próprias ocorrências sem conceder SELECT(autor_id).
-- A transação evita uma janela de EXECUTE público durante a criação.
begin;

create function public.minhas_ocorrencias()
returns table (
  id uuid,
  categoria_id uuid,
  titulo text,
  descricao text,
  status text,
  endereco text,
  bairro text,
  latitude double precision,
  longitude double precision,
  ocorrencia_principal_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  resolvida_at timestamptz,
  arquivada_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_usuario_id uuid := auth.uid();
begin
  -- Também exige identidade em chamadas de service_role; não há bypass.
  if v_usuario_id is null then
    raise exception 'Autenticação necessária.' using errcode = '42501';
  end if;

  -- SECURITY DEFINER exige este filtro explícito mesmo ao contornar RLS.
  -- A policy de leitura própria permite todos os status, inclusive
  -- rejeitado e arquivado. Nenhuma identidade é devolvida ao cliente.
  return query
    select
      o.id,
      o.categoria_id,
      o.titulo,
      o.descricao,
      o.status,
      o.endereco,
      o.bairro,
      o.latitude,
      o.longitude,
      o.ocorrencia_principal_id,
      o.created_at,
      o.updated_at,
      o.resolvida_at,
      o.arquivada_at
    from public.ocorrencias as o
    where o.autor_id = v_usuario_id
    order by o.created_at desc, o.id desc;
end;
$$;

revoke all on function public.minhas_ocorrencias()
  from public, anon, authenticated, service_role;
grant execute on function public.minhas_ocorrencias()
  to authenticated, service_role;

commit;
