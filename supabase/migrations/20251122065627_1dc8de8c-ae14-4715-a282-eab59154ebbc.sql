-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum for user roles
create type public.app_role as enum ('admin', 'student');

-- Create profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  student_id text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create user_roles table (security-compliant role management)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

-- Create course_enrollments table
create table public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text not null,
  enrolled_at timestamptz not null default now(),
  progress_percentage integer not null default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
  last_accessed_at timestamptz,
  completed_at timestamptz,
  unique (user_id, course_id)
);

-- Create exercise_completions table
create table public.exercise_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text not null,
  exercise_id text not null,
  completed_at timestamptz not null default now(),
  score integer,
  time_spent_seconds integer,
  unique (user_id, course_id, exercise_id)
);

-- Create resource_bookmarks table
create table public.resource_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text not null,
  resource_type text not null,
  resource_id text not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, course_id, resource_id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.exercise_completions enable row level security;
alter table public.resource_bookmarks enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
create policy "Users can view their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on public.user_roles for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
  on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for course_enrollments
create policy "Users can view their own enrollments"
  on public.course_enrollments for select
  using (auth.uid() = user_id);

create policy "Users can create their own enrollments"
  on public.course_enrollments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own enrollments"
  on public.course_enrollments for update
  using (auth.uid() = user_id);

create policy "Admins can view all enrollments"
  on public.course_enrollments for select
  using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for exercise_completions
create policy "Users can view their own completions"
  on public.exercise_completions for select
  using (auth.uid() = user_id);

create policy "Users can create their own completions"
  on public.exercise_completions for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all completions"
  on public.exercise_completions for select
  using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for resource_bookmarks
create policy "Users can view their own bookmarks"
  on public.resource_bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can manage their own bookmarks"
  on public.resource_bookmarks for all
  using (auth.uid() = user_id);

create policy "Admins can view all bookmarks"
  on public.resource_bookmarks for select
  using (public.has_role(auth.uid(), 'admin'));

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Insert profile
  insert into public.profiles (id, full_name, student_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.raw_user_meta_data->>'student_id'
  );
  
  -- Assign default 'student' role
  insert into public.user_roles (user_id, role)
  values (new.id, 'student');
  
  return new;
end;
$$;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update timestamps
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for profile updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();

-- Function to calculate course progress
create or replace function public.calculate_course_progress(
  _user_id uuid,
  _course_id text,
  _total_exercises integer
)
returns integer
language plpgsql
as $$
declare
  completed_count integer;
begin
  select count(*)
  into completed_count
  from public.exercise_completions
  where user_id = _user_id
    and course_id = _course_id;
  
  return least(100, round((completed_count::float / _total_exercises) * 100));
end;
$$;

-- Create indexes for better performance
create index idx_profiles_full_name on public.profiles(full_name);
create index idx_user_roles_user_id on public.user_roles(user_id);
create index idx_user_roles_role on public.user_roles(role);
create index idx_course_enrollments_user_id on public.course_enrollments(user_id);
create index idx_course_enrollments_course_id on public.course_enrollments(course_id);
create index idx_exercise_completions_user_id on public.exercise_completions(user_id);
create index idx_exercise_completions_course_id on public.exercise_completions(course_id);
create index idx_resource_bookmarks_user_id on public.resource_bookmarks(user_id);
create index idx_resource_bookmarks_course_id on public.resource_bookmarks(course_id);