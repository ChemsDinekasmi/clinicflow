-- ClinicFlow schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE user_role AS ENUM ('admin', 'staff');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled');

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  role          user_role    NOT NULL DEFAULT 'staff',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE patients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   VARCHAR(120) NOT NULL,
  cin         VARCHAR(20)  NOT NULL UNIQUE,
  phone       VARCHAR(20)  NOT NULL,
  birth_date  DATE         NOT NULL,
  address     TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

-- Fenêtre de 30 min centrée sur le RDV : deux fenêtres se chevauchent ssi |a - b| < 30 min.
-- timestamptz - interval est STABLE (à cause des intervalles en jours/mois) ; ici on n'utilise
-- que des minutes, le résultat est indépendant du fuseau, donc IMMUTABLE est sûr.
CREATE FUNCTION appointment_window(ts TIMESTAMPTZ) RETURNS TSTZRANGE
  LANGUAGE sql IMMUTABLE PARALLEL SAFE AS
$$ SELECT tstzrange(ts - INTERVAL '15 minutes', ts + INTERVAL '15 minutes', '[)') $$;

CREATE TABLE appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_date TIMESTAMPTZ NOT NULL,
  status           appointment_status NOT NULL DEFAULT 'pending',
  reason           VARCHAR(255) NOT NULL,
  notes            TEXT,
  created_by       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Règle métier : pas 2 RDV confirmés du même patient à moins de 30 minutes
  CONSTRAINT no_overlapping_confirmed_appointments
    EXCLUDE USING gist (patient_id WITH =, appointment_window(appointment_date) WITH &&)
    WHERE (status = 'confirmed')
);

-- Index de recherche / filtrage
CREATE INDEX idx_patients_full_name ON patients (full_name);
CREATE INDEX idx_patients_full_name_lower ON patients (LOWER(full_name) text_pattern_ops);
CREATE INDEX idx_patients_cin ON patients (cin); -- couvert aussi par UNIQUE, explicite pour la lisibilité
CREATE INDEX idx_patients_deleted_at ON patients (deleted_at);
CREATE INDEX idx_appointments_date ON appointments (appointment_date);
CREATE INDEX idx_appointments_status ON appointments (status);
CREATE INDEX idx_appointments_patient_date ON appointments (patient_id, appointment_date);
CREATE INDEX idx_appointments_created_by ON appointments (created_by);
