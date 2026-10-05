-- Storage das fotos de ocorrências. As migrations 001 e 002 permanecem intactas.

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'ocorrencia-fotos',
  'ocorrencia-fotos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Compara texto não confiável com um UUID canônico; nunca faz cast do path.
-- O último segmento é um nome aleatório em formato UUID e extensão permitida.
create or replace function public.caminho_foto_ocorrencia_valido(
  p_path text,
  p_ocorrencia_id uuid
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    p_path ~ '^ocorrencias/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$'
    and split_part(p_path, '/', 2) = p_ocorrencia_id::text,
    false
  );
$$;

revoke all on function public.caminho_foto_ocorrencia_valido(text, uuid)
  from public;
grant execute on function public.caminho_foto_ocorrencia_valido(text, uuid)
  to authenticated, service_role;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.ocorrencia_fotos'::regclass
      and conname = 'ocorrencia_fotos_storage_path_ocorrencia_check'
  ) then
    alter table public.ocorrencia_fotos
      add constraint ocorrencia_fotos_storage_path_ocorrencia_check
      check (
        public.caminho_foto_ocorrencia_valido(
          storage_path, ocorrencia_id
        )
      );
  end if;
end;
$$;

create unique index if not exists ocorrencia_fotos_storage_path_unique_idx
  on public.ocorrencia_fotos (storage_path);

-- Um upload só entra na pasta da ocorrência registrada pelo próprio usuário.
create policy ocorrencia_fotos_storage_insert_autor
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'ocorrencia-fotos'
  and exists (
    select 1
    from public.ocorrencias o
    where public.caminho_foto_ocorrencia_valido(name, o.id)
      and public.usuario_pode_editar_ocorrencia(o.id)
  )
);

-- Apenas objetos efetivamente vinculados a fotos públicas são legíveis
-- por visitantes anônimos. O bucket privado não fornece URL pública.
create policy ocorrencia_fotos_storage_select_anon
on storage.objects
for select
to anon
using (
  bucket_id = 'ocorrencia-fotos'
  and exists (
    select 1
    from public.ocorrencia_fotos foto
    where foto.storage_path = name
      and public.ocorrencia_esta_publica(foto.ocorrencia_id)
  )
);

-- O autor pode consultar seu upload ainda sem metadados para concluir
-- o envio ou removê-lo se uma etapa posterior falhar.
create policy ocorrencia_fotos_storage_select_authenticated
on storage.objects
for select
to authenticated
using (
  bucket_id = 'ocorrencia-fotos'
  and (
    exists (
      select 1
      from public.ocorrencia_fotos foto
      where foto.storage_path = name
        and public.ocorrencia_esta_visivel(foto.ocorrencia_id)
    )
    or (
      owner_id = auth.uid()::text
      and not exists (
        select 1
        from public.ocorrencia_fotos foto
        where foto.storage_path = name
      )
      and exists (
        select 1
        from public.ocorrencias o
        where public.caminho_foto_ocorrencia_valido(name, o.id)
          and public.usuario_pode_editar_ocorrencia(o.id)
      )
    )
  )
);

-- A limpeza funciona com ou sem metadados, mas somente para o autor
-- e enquanto a ocorrência ainda estiver registrada.
create policy ocorrencia_fotos_storage_delete_autor
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'ocorrencia-fotos'
  and owner_id = auth.uid()::text
  and exists (
    select 1
    from public.ocorrencias o
    where public.caminho_foto_ocorrencia_valido(name, o.id)
      and public.usuario_pode_editar_ocorrencia(o.id)
  )
);

-- Nenhuma policy de UPDATE: o cliente não pode sobrescrever ou mover objetos.
