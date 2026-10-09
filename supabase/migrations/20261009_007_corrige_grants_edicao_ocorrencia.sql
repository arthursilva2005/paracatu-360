-- Restaura somente os grants de coluna para edicao cidada apos a migration 006.
-- Autoria, status e papel continuam protegidos por RLS e validar_update_ocorrencia().
grant update (
  categoria_id,
  titulo,
  descricao,
  endereco,
  bairro,
  latitude,
  longitude
)
on public.ocorrencias
to authenticated;
