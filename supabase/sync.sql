-- A rejouer sans danger : rien ici n'efface les donnees deja synchronisees.
drop function if exists public.journal_sync_pousser(text, text, jsonb);
drop function if exists public.journal_sync_tirer(text, text, bigint);
-- Synchronisation du journal de trading entre appareils (ordinateur, telephone).
-- Une ligne par enregistrement du journal (un fill, un trade annote, une journee,
-- une note, une photo...). Chaque ecriture recoit un numero de revision croissant :
-- un appareil demande « tout ce qui a change depuis la revision N ».
-- Acces uniquement par les deux fonctions ci-dessous, avec la meme cle que le
-- profil public (journal_profils.secret_hash). La table elle-meme est fermee.

create sequence if not exists public.journal_sync_rev;

create table if not exists public.journal_sync (
  compte   text    not null,
  magasin  text    not null,
  cle      text    not null,
  valeur   jsonb,                       -- null quand l'enregistrement est supprime
  supprime boolean not null default false,
  t        bigint  not null default 0,  -- heure de l'ecriture sur l'appareil (ms), sert a departager
  appareil text,                        -- qui a ecrit : un appareil ne retelecharge pas ses propres envois
  rev      bigint  not null,
  maj      timestamptz not null default now(),
  primary key (compte, magasin, cle)
);
create index if not exists journal_sync_rev_idx on public.journal_sync (compte, rev);

alter table public.journal_sync enable row level security;
revoke all on public.journal_sync from anon, authenticated;
revoke all on sequence public.journal_sync_rev from anon, authenticated;

create or replace function public.journal_sync_verifier(p_compte text, p_secret text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_hash text;
begin
  if p_compte is null or p_secret is null or length(p_secret) < 8 then
    raise exception 'cle de synchronisation refusee';
  end if;
  select secret_hash into v_hash from public.journal_profils where id = p_compte;
  if v_hash is null or v_hash <> encode(sha256(convert_to(p_secret, 'UTF8')), 'hex') then
    raise exception 'cle de synchronisation refusee';
  end if;
end
$$;

-- p_lignes : [{ "m": magasin, "c": cle, "v": valeur ou null, "s": supprime, "t": ms }]
create or replace function public.journal_sync_pousser(p_compte text, p_secret text, p_lignes jsonb, p_appareil text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  l jsonb;
  v_rev bigint := 0;
  v_nb int := 0;
begin
  perform public.journal_sync_verifier(p_compte, p_secret);
  if jsonb_typeof(p_lignes) <> 'array' then
    raise exception 'lignes invalides';
  end if;
  if pg_column_size(p_lignes) > 8000000 then
    raise exception 'envoi trop volumineux';
  end if;
  for l in select * from jsonb_array_elements(p_lignes) loop
    if coalesce(l->>'m', '') !~ '^[a-z]{2,20}$' or coalesce(l->>'c', '') = '' then
      raise exception 'ligne invalide';
    end if;
    v_rev := nextval('public.journal_sync_rev');
    insert into public.journal_sync (compte, magasin, cle, valeur, supprime, t, appareil, rev, maj)
    values (p_compte, l->>'m', l->>'c',
            case when coalesce((l->>'s')::boolean, false) then null else l->'v' end,
            coalesce((l->>'s')::boolean, false), coalesce((l->>'t')::bigint, 0), p_appareil, v_rev, now())
    on conflict (compte, magasin, cle) do update
      set valeur = excluded.valeur, supprime = excluded.supprime, t = excluded.t,
          appareil = excluded.appareil, rev = excluded.rev, maj = excluded.maj
      -- une ecriture plus ancienne (heure de l'appareil) n'ecrase pas une plus recente
      where public.journal_sync.t <= excluded.t;
    v_nb := v_nb + 1;
  end loop;
  return jsonb_build_object('ok', true, 'nb', v_nb, 'rev', v_rev);
end
$$;

-- Tout ce qui a change depuis p_depuis, par paquets d'environ 3 Mo (les photos sont lourdes).
create or replace function public.journal_sync_tirer(p_compte text, p_secret text, p_depuis bigint, p_appareil text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  r record;
  v_lignes jsonb := '[]'::jsonb;
  v_taille bigint := 0;
  v_nb int := 0;
  v_dernier bigint := coalesce(p_depuis, 0);
  v_fin boolean := true;
begin
  perform public.journal_sync_verifier(p_compte, p_secret);
  for r in
    select magasin, cle, valeur, supprime, t, rev, appareil from public.journal_sync
     where compte = p_compte and rev > coalesce(p_depuis, 0)
     order by rev
  loop
    -- ce que cet appareil a lui-meme envoye : on avance sans le renvoyer
    if p_appareil is not null and r.appareil = p_appareil then
      v_dernier := r.rev;
      continue;
    end if;
    if v_nb > 0 and (v_taille > 3000000 or v_nb >= 1000) then
      v_fin := false;
      exit;
    end if;
    v_lignes := v_lignes || jsonb_build_array(jsonb_build_object(
      'm', r.magasin, 'c', r.cle, 'v', r.valeur, 's', r.supprime, 't', r.t));
    v_taille := v_taille + coalesce(pg_column_size(r.valeur), 0);
    v_nb := v_nb + 1;
    v_dernier := r.rev;
  end loop;
  return jsonb_build_object('lignes', v_lignes, 'rev', v_dernier, 'fin', v_fin);
end
$$;

-- combien de lignes et quel poids, pour l'ecran Reglages
create or replace function public.journal_sync_etat(p_compte text, p_secret text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v jsonb;
begin
  perform public.journal_sync_verifier(p_compte, p_secret);
  select jsonb_build_object(
    'lignes', count(*) filter (where not supprime),
    'photos', count(*) filter (where magasin = 'images' and not supprime),
    'octets', coalesce(sum(pg_column_size(valeur)), 0),
    'rev', coalesce(max(rev), 0))
    into v from public.journal_sync where compte = p_compte;
  return v;
end
$$;

revoke all on function public.journal_sync_verifier(text, text) from public, anon, authenticated;
grant execute on function public.journal_sync_pousser(text, text, jsonb, text) to anon;
grant execute on function public.journal_sync_tirer(text, text, bigint, text) to anon;
grant execute on function public.journal_sync_etat(text, text) to anon;
