-- SETARA — skema MySQL 8
-- Jalankan lewat phpMyAdmin/HeidiSQL atau: mysql -u root < sql/schema.sql

CREATE DATABASE IF NOT EXISTS setara
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE setara;

CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(40)  NOT NULL,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nim           VARCHAR(40)  NOT NULL DEFAULT '',
  prodi         VARCHAR(80)  NOT NULL DEFAULT 'Ilmu Komputer',
  semester      VARCHAR(40)  NOT NULL DEFAULT 'Semester 5',
  university    VARCHAR(120) NOT NULL DEFAULT 'Universitas Halu Oleo',
  preferences   JSON         NOT NULL,
  custom_courses JSON        NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Token login (opaque, disimpan sebagai hash SHA-256).
CREATE TABLE IF NOT EXISTS auth_tokens (
  token_hash CHAR(64)     NOT NULL,
  user_id    VARCHAR(40)  NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME     NOT NULL,
  PRIMARY KEY (token_hash),
  KEY idx_auth_tokens_user (user_id),
  CONSTRAINT fk_auth_tokens_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tasks (
  pk       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id       VARCHAR(80)     NOT NULL,
  user_id  VARCHAR(40)     NOT NULL,
  title    VARCHAR(200)    NOT NULL,
  course   VARCHAR(120)    NOT NULL,
  deadline CHAR(10)        NOT NULL,
  time     CHAR(5)         NOT NULL DEFAULT '23.59',
  priority VARCHAR(16)     NOT NULL DEFAULT 'Sedang',
  status   VARCHAR(16)     NOT NULL DEFAULT 'belum',
  notes    TEXT            NOT NULL,
  reminder VARCHAR(80)     NOT NULL DEFAULT 'H-1 · 08.00',
  position INT             NOT NULL DEFAULT 0,
  PRIMARY KEY (pk),
  UNIQUE KEY uq_tasks_user_id (user_id, id),
  KEY idx_tasks_user (user_id),
  CONSTRAINT fk_tasks_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subtasks (
  pk       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id       VARCHAR(80)     NOT NULL,
  task_pk  BIGINT UNSIGNED NOT NULL,
  title    VARCHAR(200)    NOT NULL,
  done     TINYINT(1)      NOT NULL DEFAULT 0,
  position INT             NOT NULL DEFAULT 0,
  PRIMARY KEY (pk),
  UNIQUE KEY uq_subtasks_task_id (task_pk, id),
  KEY idx_subtasks_task (task_pk),
  CONSTRAINT fk_subtasks_task FOREIGN KEY (task_pk)
    REFERENCES tasks (pk) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS class_sessions (
  pk      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id      VARCHAR(80)     NOT NULL,
  user_id VARCHAR(40)     NOT NULL,
  course  VARCHAR(120)    NOT NULL,
  day     TINYINT         NOT NULL,
  `start` CHAR(5)         NOT NULL,
  `end`   CHAR(5)         NOT NULL,
  room    VARCHAR(120)    NOT NULL DEFAULT '',
  status  VARCHAR(16)     NOT NULL DEFAULT 'terjadwal',
  PRIMARY KEY (pk),
  UNIQUE KEY uq_class_sessions_user_id (user_id, id),
  KEY idx_class_sessions_user (user_id),
  CONSTRAINT fk_class_sessions_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS agendas (
  pk        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id        VARCHAR(80)     NOT NULL,
  user_id   VARCHAR(40)     NOT NULL,
  title     VARCHAR(200)    NOT NULL,
  date      CHAR(10)        NOT NULL,
  time      CHAR(5)         NOT NULL,
  end_time  CHAR(5)         NULL,
  type      VARCHAR(16)     NOT NULL DEFAULT 'lainnya',
  location  VARCHAR(160)    NULL,
  PRIMARY KEY (pk),
  UNIQUE KEY uq_agendas_user_id (user_id, id),
  KEY idx_agendas_user (user_id),
  CONSTRAINT fk_agendas_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS session_overrides (
  pk         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    VARCHAR(40)     NOT NULL,
  session_id VARCHAR(80)     NOT NULL,
  date       CHAR(10)        NOT NULL,
  title      VARCHAR(200)    NULL,
  `start`    CHAR(5)         NULL,
  `end`      CHAR(5)         NULL,
  room       VARCHAR(160)    NULL,
  type       VARCHAR(16)     NULL,
  hidden     TINYINT(1)      NOT NULL DEFAULT 0,
  PRIMARY KEY (pk),
  UNIQUE KEY uq_overrides_user_session_date (user_id, session_id, date),
  KEY idx_overrides_user (user_id),
  CONSTRAINT fk_overrides_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reminders (
  pk      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id      VARCHAR(80)     NOT NULL,
  user_id VARCHAR(40)     NOT NULL,
  title   VARCHAR(200)    NOT NULL,
  detail  TEXT            NOT NULL,
  date    CHAR(10)        NOT NULL,
  time    CHAR(5)         NOT NULL,
  enabled TINYINT(1)      NOT NULL DEFAULT 1,
  kind    VARCHAR(16)     NOT NULL DEFAULT 'harian',
  PRIMARY KEY (pk),
  UNIQUE KEY uq_reminders_user_id (user_id, id),
  KEY idx_reminders_user (user_id),
  CONSTRAINT fk_reminders_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS calendar_reminders (
  pk      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id      VARCHAR(80)     NOT NULL,
  user_id VARCHAR(40)     NOT NULL,
  time    CHAR(5)         NOT NULL,
  label   VARCHAR(200)    NOT NULL,
  enabled TINYINT(1)      NOT NULL DEFAULT 1,
  PRIMARY KEY (pk),
  UNIQUE KEY uq_calendar_reminders_user_id (user_id, id),
  KEY idx_calendar_reminders_user (user_id),
  CONSTRAINT fk_calendar_reminders_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
