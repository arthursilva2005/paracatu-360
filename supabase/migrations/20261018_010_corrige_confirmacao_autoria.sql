-- Rejeita identidade forjada antes de consultar autoria no trigger BEFORE.
-- CREATE OR REPLACE preserva os grants e o trigger existentes.
begin;

create or replace function public.validar_confirmacao_nao_autor()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario_id uuid := auth.uid();
begin
  -- Sem bypass para contexto privilegiado: confirmar exige identidade própria.
  -- A mesma falha antecede qualquer leitura da ocorrência, inclusive sem sessão.
  if v_usuario_id is null or new.usuario_id is distinct from v_usuario_id then
    raise exception 'Identidade inválida para confirmar ocorrência.'
      using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.ocorrencias as o
    where o.id = new.ocorrencia_id
      and o.autor_id = v_usuario_id
  ) then
    raise exception 'O autor não pode confirmar a própria ocorrência.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

commit;
