-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.persona_pillar (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pillar_name text NOT NULL,
  persona_text text NOT NULL,
  tone_rules text,
  updated_at timestamp without time zone DEFAULT now(),
  style_examples text,
  CONSTRAINT persona_pillar_pkey PRIMARY KEY (id)
);

CREATE TABLE public.angle_schedule (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pillar_name text NOT NULL,
  day_of_week text NOT NULL,
  time_slot text NOT NULL,
  angle text NOT NULL,
  CONSTRAINT angle_schedule_pkey PRIMARY KEY (id)
);

CREATE TABLE public.drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pillar_name text NOT NULL,
  angle text NOT NULL,
  topic text,
  status text DEFAULT 'pending_approval'::text,
  scheduled_time timestamp without time zone,
  actual_publish_time timestamp without time zone,
  telegram_message_id text,
  reminder_count integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  isi_caption text,
  edit_mode text,
  CONSTRAINT drafts_pkey PRIMARY KEY (id)
);

CREATE TABLE public.history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pillar_name text NOT NULL,
  angle text NOT NULL,
  topic text NOT NULL,
  caption text NOT NULL,
  published_at timestamp without time zone,
  CONSTRAINT history_pkey PRIMARY KEY (id)
);

CREATE TABLE public.thread_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  draft_id uuid,
  post_order integer NOT NULL,
  content text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT thread_posts_pkey PRIMARY KEY (id),
  CONSTRAINT thread_posts_draft_id_fkey FOREIGN KEY (draft_id) REFERENCES public.drafts(id)
);
