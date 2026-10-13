-- Seed ClinicFlow — mot de passe de tous les comptes : password123 (bcrypt, cost 10)
INSERT INTO users (full_name, email, password_hash, role) VALUES
  ('Admin ClinicFlow', 'admin@clinicflow.com',  '$2a$10$kuRD0vUNq7VuyOoapVJpPer7zFn5sPj5m7xV1i/dYql9Jusj5PRJu', 'admin'),
  ('Sara Staff',       'staff1@clinicflow.com', '$2a$10$kuRD0vUNq7VuyOoapVJpPer7zFn5sPj5m7xV1i/dYql9Jusj5PRJu', 'staff'),
  ('Youssef Staff',    'staff2@clinicflow.com', '$2a$10$kuRD0vUNq7VuyOoapVJpPer7zFn5sPj5m7xV1i/dYql9Jusj5PRJu', 'staff');

INSERT INTO patients (full_name, cin, phone, birth_date, address) VALUES
  ('Amine El Idrissi', 'AB123456', '0612345678', '1985-03-12', '12 Rue Atlas, Casablanca'),
  ('Fatima Zahra Benali', 'CD234567', '0623456789', '1992-07-25', '5 Av. Hassan II, Rabat'),
  ('Karim Ouazzani', 'EF345678', '0634567890', '1978-11-03', NULL),
  ('Nadia Tazi', 'GH456789', '0645678901', '2001-01-18', '33 Bd Zerktouni, Marrakech'),
  ('Omar Chraibi', 'IJ567890', '0656789012', '1969-09-30', '8 Rue de Fès, Tanger');

-- 10 RDV : dates relatives à aujourd'hui pour que le dashboard affiche des données
INSERT INTO appointments (patient_id, appointment_date, status, reason, notes, created_by)
SELECT p.id, (CURRENT_DATE + v.day_offset + v.at_time)::timestamptz, v.status::appointment_status, v.reason, v.notes, u.id
FROM (VALUES
  ('AB123456',  0, TIME '09:00', 'confirmed', 'Consultation générale', NULL,                   'staff1@clinicflow.com'),
  ('AB123456',  0, TIME '14:00', 'pending',   'Résultats analyses',    'Apporter le bilan',    'staff1@clinicflow.com'),
  ('CD234567',  0, TIME '10:30', 'confirmed', 'Suivi tension',         NULL,                   'staff2@clinicflow.com'),
  ('EF345678',  0, TIME '11:00', 'cancelled', 'Douleur dorsale',       'Annulé par le patient','admin@clinicflow.com'),
  ('GH456789',  1, TIME '09:30', 'pending',   'Vaccination',           NULL,                   'staff2@clinicflow.com'),
  ('IJ567890',  1, TIME '15:00', 'confirmed', 'Contrôle diabète',      'À jeun',               'staff1@clinicflow.com'),
  ('CD234567',  2, TIME '16:00', 'pending',   'Certificat médical',    NULL,                   'admin@clinicflow.com'),
  ('EF345678', -1, TIME '08:30', 'confirmed', 'Radio thorax',          NULL,                   'staff2@clinicflow.com'),
  ('GH456789', -2, TIME '12:00', 'cancelled', 'Consultation ORL',      NULL,                   'staff1@clinicflow.com'),
  ('IJ567890',  3, TIME '10:00', 'pending',   'Bilan annuel',          NULL,                   'staff2@clinicflow.com')
) AS v(cin, day_offset, at_time, status, reason, notes, creator)
JOIN patients p ON p.cin = v.cin
JOIN users u ON u.email = v.creator;
