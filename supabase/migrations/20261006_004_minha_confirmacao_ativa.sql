-- Leitura da própria confirmação ativa sem conceder SELECT(usuario_id).
-- A transação evita uma janela de EXECUTE público durante a criação.
begin;

create function public.minha_confirmacao_ativa(p_ocorrencia_id uuid)
returns uuid
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

  -- Não distingue ocorrência inexistente de ocorrência não visível.
  if p_ocorrencia_id is null
    or not coalesce(public.ocorrencia_esta_visivel(p_ocorrencia_id), false)
  then
    return null;
  end if;

  -- O índice único parcial garante no máximo uma linha ativa por par.
  -- Sem linha, a subconsulta escalar retorna NULL; nunca retorna usuario_id.
  return (
    select c.id
    from public.confirmacoes as c
    where c.ocorrencia_id = p_ocorrencia_id
      and c.usuario_id = v_usuario_id
      and c.desfeito_at is null
  );
end;
$$;

revoke all on function public.minha_confirmacao_ativa(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.minha_confirmacao_ativa(uuid)
  to authenticated, service_role;

commit;
