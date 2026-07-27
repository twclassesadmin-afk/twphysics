-- Scheduled classes, syllabus topics, study materials, and tutor broadcasts
-- — all batch-scoped. Students can read their own batch's rows; tutors can
-- read/write for batches they teach; admin has full access.

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches (id) on delete cascade,
  subject text not null,
  topic text not null,
  tutor_id uuid not null references public.tutors (id) on delete cascade,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60,
  join_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index classes_batch_id_idx on public.classes (batch_id);
create index classes_tutor_id_idx on public.classes (tutor_id);

create trigger classes_set_updated_at
  before update on public.classes
  for each row execute function public.set_updated_at();

alter table public.classes enable row level security;

create policy "classes_select_staff_or_batch_student"
  on public.classes for select
  to authenticated
  using (
    (select public.is_admin())
    or (select public.is_tutor_for_batch(batch_id))
    or (select public.is_in_batch(batch_id))
  );

create policy "classes_write_admin_or_batch_tutor"
  on public.classes for all
  to authenticated
  using ((select public.is_admin()) or (select public.is_tutor_for_batch(batch_id)))
  with check ((select public.is_admin()) or (select public.is_tutor_for_batch(batch_id)));

-- Now that public.classes exists, wire up the FK left off attendance_entries.
alter table public.attendance_entries
  add constraint attendance_entries_class_id_fkey
  foreign key (class_id) references public.classes (id) on delete set null;

create index attendance_entries_class_id_idx on public.attendance_entries (class_id);

-- ============================================================
-- syllabus_items
-- ============================================================

create table public.syllabus_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches (id) on delete cascade,
  topic text not null,
  subject text not null,
  deadline date not null,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index syllabus_items_batch_id_idx on public.syllabus_items (batch_id);

create trigger syllabus_items_set_updated_at
  before update on public.syllabus_items
  for each row execute function public.set_updated_at();

alter table public.syllabus_items enable row level security;

create policy "syllabus_items_select_staff_or_batch_student"
  on public.syllabus_items for select
  to authenticated
  using (
    (select public.is_admin())
    or (select public.is_tutor_for_batch(batch_id))
    or (select public.is_in_batch(batch_id))
  );

create policy "syllabus_items_insert_admin_only"
  on public.syllabus_items for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "syllabus_items_update_admin_or_batch_tutor"
  on public.syllabus_items for update
  to authenticated
  using ((select public.is_admin()) or (select public.is_tutor_for_batch(batch_id)))
  with check ((select public.is_admin()) or (select public.is_tutor_for_batch(batch_id)));

-- ============================================================
-- study_materials
-- ============================================================

create table public.study_materials (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches (id) on delete cascade,
  title text not null,
  type text not null check (type in ('pdf', 'link')),
  url text not null,
  uploaded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create index study_materials_batch_id_idx on public.study_materials (batch_id);

alter table public.study_materials enable row level security;

create policy "study_materials_select_staff_or_batch_student"
  on public.study_materials for select
  to authenticated
  using (
    (select public.is_admin())
    or (select public.is_tutor_for_batch(batch_id))
    or (select public.is_in_batch(batch_id))
  );

create policy "study_materials_write_admin_or_batch_tutor"
  on public.study_materials for all
  to authenticated
  using ((select public.is_admin()) or (select public.is_tutor_for_batch(batch_id)))
  with check ((select public.is_admin()) or (select public.is_tutor_for_batch(batch_id)));

-- ============================================================
-- broadcasts — tutor-to-batch announcements
-- ============================================================

create table public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches (id) on delete cascade,
  tutor_id uuid not null references public.tutors (id) on delete cascade,
  message text not null,
  sent_at timestamptz not null default now()
);

create index broadcasts_batch_id_idx on public.broadcasts (batch_id);

alter table public.broadcasts enable row level security;

create policy "broadcasts_select_staff_or_batch_student"
  on public.broadcasts for select
  to authenticated
  using (
    (select public.is_admin())
    or (select public.is_tutor_for_batch(batch_id))
    or (select public.is_in_batch(batch_id))
  );

create policy "broadcasts_write_admin_or_batch_tutor"
  on public.broadcasts for all
  to authenticated
  using ((select public.is_admin()) or (select public.is_tutor_for_batch(batch_id)))
  with check ((select public.is_admin()) or (select public.is_tutor_for_batch(batch_id)));
