create extension if not exists pgcrypto;

do $$
begin
  create type public.profile_sex as enum (
    'male',
    'female',
    'other',
    'prefer_not_to_say'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.exam_upload_status as enum (
    'uploaded',
    'processing',
    'needs_review',
    'confirmed',
    'failed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.exam_segment as enum (
    'left_arm',
    'right_arm',
    'trunk',
    'left_leg',
    'right_leg'
  );
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  sex public.profile_sex,
  birth_date date check (birth_date is null or birth_date <= current_date),
  height_cm numeric(5, 2) check (height_cm is null or height_cm between 30 and 300),
  reference_weight_kg numeric(5, 2) check (
    reference_weight_kg is null or reference_weight_kg between 1 and 500
  ),
  fitness_goal text check (
    fitness_goal is null or char_length(fitness_goal) <= 500
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exam_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  original_filename text not null,
  mime_type text not null check (
    mime_type in ('image/jpeg', 'image/png', 'application/pdf')
  ),
  file_size_bytes bigint not null check (file_size_bytes > 0),
  status public.exam_upload_status not null default 'uploaded',
  provider text,
  provider_model text,
  overall_confidence numeric(5, 4) check (
    overall_confidence is null or overall_confidence between 0 and 1
  ),
  extracted_payload jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exam_uploads_storage_path_owner check (
    split_part(storage_path, '/', 1) = user_id::text
  ),
  constraint exam_uploads_failed_error_message check (
    status <> 'failed' or error_message is not null
  ),
  constraint exam_uploads_id_user_id_unique unique (id, user_id)
);

create table if not exists public.body_composition_exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  upload_id uuid not null,
  exam_performed_at timestamptz,
  weight_kg numeric(5, 2) check (weight_kg is null or weight_kg between 1 and 500),
  skeletal_muscle_mass_kg numeric(5, 2) check (
    skeletal_muscle_mass_kg is null or skeletal_muscle_mass_kg between 0 and 250
  ),
  body_fat_mass_kg numeric(5, 2) check (
    body_fat_mass_kg is null or body_fat_mass_kg between 0 and 250
  ),
  body_fat_percentage numeric(5, 2) check (
    body_fat_percentage is null or body_fat_percentage between 0 and 100
  ),
  bmi numeric(5, 2) check (bmi is null or bmi between 1 and 100),
  inbody_score integer check (inbody_score is null or inbody_score between 0 and 150),
  total_body_water_l numeric(5, 2) check (
    total_body_water_l is null or total_body_water_l between 0 and 200
  ),
  protein_kg numeric(5, 2) check (protein_kg is null or protein_kg between 0 and 100),
  minerals_kg numeric(5, 2) check (minerals_kg is null or minerals_kg between 0 and 50),
  fat_free_mass_kg numeric(5, 2) check (
    fat_free_mass_kg is null or fat_free_mass_kg between 0 and 300
  ),
  basal_metabolic_rate_kcal integer check (
    basal_metabolic_rate_kcal is null or basal_metabolic_rate_kcal between 0 and 10000
  ),
  waist_hip_ratio numeric(4, 2) check (
    waist_hip_ratio is null or waist_hip_ratio between 0 and 3
  ),
  visceral_fat_level integer check (
    visceral_fat_level is null or visceral_fat_level between 0 and 100
  ),
  obesity_degree_percentage numeric(5, 2) check (
    obesity_degree_percentage is null or obesity_degree_percentage between 0 and 300
  ),
  ideal_weight_kg numeric(5, 2) check (
    ideal_weight_kg is null or ideal_weight_kg between 1 and 500
  ),
  weight_control_kg numeric(5, 2),
  fat_control_kg numeric(5, 2),
  muscle_control_kg numeric(5, 2),
  reviewed_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint body_composition_exams_upload_user_unique unique (upload_id, user_id),
  constraint body_composition_exams_upload_user_fk foreign key (upload_id, user_id)
    references public.exam_uploads(id, user_id) on delete restrict
);

create table if not exists public.exam_segmental_analyses (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.body_composition_exams(id) on delete cascade,
  segment public.exam_segment not null,
  lean_mass_kg numeric(5, 2) check (
    lean_mass_kg is null or lean_mass_kg between 0 and 100
  ),
  lean_mass_percentage numeric(5, 2) check (
    lean_mass_percentage is null or lean_mass_percentage between 0 and 300
  ),
  fat_mass_kg numeric(5, 2) check (
    fat_mass_kg is null or fat_mass_kg between 0 and 100
  ),
  fat_mass_percentage numeric(5, 2) check (
    fat_mass_percentage is null or fat_mass_percentage between 0 and 300
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exam_segmental_analyses_exam_segment_unique unique (exam_id, segment)
);

create index if not exists exam_uploads_user_created_at_idx
  on public.exam_uploads (user_id, created_at desc);

create index if not exists body_composition_exams_user_performed_at_idx
  on public.body_composition_exams (user_id, exam_performed_at desc nulls last);

create index if not exists exam_segmental_analyses_exam_id_idx
  on public.exam_segmental_analyses (exam_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_exam_uploads_updated_at on public.exam_uploads;
create trigger set_exam_uploads_updated_at
  before update on public.exam_uploads
  for each row execute function public.set_updated_at();

drop trigger if exists set_body_composition_exams_updated_at on public.body_composition_exams;
create trigger set_body_composition_exams_updated_at
  before update on public.body_composition_exams
  for each row execute function public.set_updated_at();

drop trigger if exists set_exam_segmental_analyses_updated_at
  on public.exam_segmental_analyses;
create trigger set_exam_segmental_analyses_updated_at
  before update on public.exam_segmental_analyses
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.exam_uploads enable row level security;
alter table public.body_composition_exams enable row level security;
alter table public.exam_segmental_analyses enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can delete own profile"
  on public.profiles for delete
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can view own exam uploads"
  on public.exam_uploads for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own exam uploads"
  on public.exam_uploads for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own exam uploads"
  on public.exam_uploads for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own exam uploads"
  on public.exam_uploads for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can view own body composition exams"
  on public.body_composition_exams for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own body composition exams"
  on public.body_composition_exams for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.exam_uploads
      where exam_uploads.id = upload_id
        and exam_uploads.user_id = (select auth.uid())
    )
  );

create policy "Users can update own body composition exams"
  on public.body_composition_exams for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own body composition exams"
  on public.body_composition_exams for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can view own segmental analyses"
  on public.exam_segmental_analyses for select
  to authenticated
  using (
    exists (
      select 1
      from public.body_composition_exams
      where body_composition_exams.id = exam_id
        and body_composition_exams.user_id = (select auth.uid())
    )
  );

create policy "Users can insert own segmental analyses"
  on public.exam_segmental_analyses for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.body_composition_exams
      where body_composition_exams.id = exam_id
        and body_composition_exams.user_id = (select auth.uid())
    )
  );

create policy "Users can update own segmental analyses"
  on public.exam_segmental_analyses for update
  to authenticated
  using (
    exists (
      select 1
      from public.body_composition_exams
      where body_composition_exams.id = exam_id
        and body_composition_exams.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.body_composition_exams
      where body_composition_exams.id = exam_id
        and body_composition_exams.user_id = (select auth.uid())
    )
  );

create policy "Users can delete own segmental analyses"
  on public.exam_segmental_analyses for delete
  to authenticated
  using (
    exists (
      select 1
      from public.body_composition_exams
      where body_composition_exams.id = exam_id
        and body_composition_exams.user_id = (select auth.uid())
    )
  );

insert into storage.buckets (id, name, public)
values ('exam-files', 'exam-files', false)
on conflict (id) do update
set public = false;

create policy "Users can view own exam files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'exam-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can insert own exam files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'exam-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can update own exam files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'exam-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'exam-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete own exam files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'exam-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
