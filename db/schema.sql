-- A master schema definition file for botto
-- This should contain all database table definition and can be used to
-- bring up a fresh instance of botto's database on a new install.

-- Definition for user quotes table, as referenced by `quotes` command
CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL UNIQUE PRIMARY KEY,
  nick VARCHAR(55) NOT NULL,
  logged_by VARCHAR(55) NOT NULL,
  chan VARCHAR(55) NOT NULL,
  message TEXT NOT NULL,
  date_spoken DATE NOT NULL
);

-- Definition for SHOUTQUOTES table, as referenced by `shout` observer
CREATE TABLE IF NOT EXISTS shouts (
  id SERIAL UNIQUE PRIMARY KEY,
  nick VARCHAR(55) NOT NULL,
  chan VARCHAR(55) NOT NULL,
  message TEXT UNIQUE NOT NULL,
  date_spoken DATE NOT NULL
);

-- Definition for replies table, as referenced by `replies` observer
CREATE TABLE IF NOT EXISTS replies (
  id SERIAL UNIQUE PRIMARY KEY,
  added_by VARCHAR(55) NOT NULL,
  trigger TEXT NOT NULL,
  reply TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  date_added DATE NOT NULL
);

-- Definition for ingored_users table
CREATE TABLE IF NOT EXISTS ignored_users (
  id SERIAL UNIQUE PRIMARY KEY,
  nick VARCHAR(55) NOT NULL,
  host VARCHAR(55) NOT NULL,
  banned_by VARCHAR(55) NOT NULL,
  date_added DATE NOT NULL
);

-- Definition for message table
CREATE TABLE IF NOT EXISTS tells (
  id SERIAL UNIQUE PRIMARY KEY,
  chan VARCHAR(55) NOT NULL,
  sender VARCHAR(55) NOT NULL,
  receiver VARCHAR(55) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  sent BOOLEAN DEFAULT FALSE
);

-- Definition for points table
CREATE TABLE IF NOT EXISTS points (
  id SERIAL UNIQUE PRIMARY KEY,
  score SMALLINT NOT NULL,
  nick VARCHAR(55) NOT NULL
);

-- Definition for last.fm 'now playing' table
CREATE TABLE IF NOT EXISTS last_fm_users (
  id SERIAL UNIQUE PRIMARY KEY,
  last_fm_username VARCHAR(255) NOT NULL,
  irc_nick VARCHAR(55) NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- Definition for user weather location table
CREATE TABLE IF NOT EXISTS weather_locations (
  id SERIAL UNIQUE PRIMARY KEY,
  nick VARCHAR(55) NOT NULL,
  location TEXT NOT NULL,
  date_updated TIMESTAMP NOT NULL
);

-- Definition for commands table
CREATE TABLE IF NOT EXISTS commands (
  id SERIAL UNIQUE PRIMARY KEY,
  name VARCHAR(55) NOT NULL,
  mounted BOOLEAN DEFAULT TRUE,
  admin BOOLEAN DEFAULT FALSE
);

-- Definition for observers table
CREATE TABLE IF NOT EXISTS observers (
  id SERIAL UNIQUE PRIMARY KEY,
  name VARCHAR(55) NOT NULL,
  mounted BOOLEAN DEFAULT TRUE
);

-- Definition for command_events table
CREATE TABLE IF NOT EXISTS command_events (
  time TIMESTAMP NOT NULL,
  command_id SMALLINT,
  message TEXT NOT NULL,
  nick VARCHAR(55) NOT NULL,
  sent_to VARCHAR(55) NOT NULL,
  response TEXT,
  PRIMARY KEY(command_id, time),
  CONSTRAINT fk_command FOREIGN KEY(command_id) REFERENCES commands(id)
);

-- Definition for observer_events table
CREATE TABLE IF NOT EXISTS observer_events (
  time TIMESTAMP NOT NULL,
  observer_id SMALLINT,
  message TEXT NOT NULL,
  nick VARCHAR(55) NOT NULL,
  sent_to VARCHAR(55) NOT NULL,
  response TEXT,
  PRIMARY KEY(observer_id, time),
  CONSTRAINT fk_observer FOREIGN KEY(observer_id) REFERENCES observers(id)
);

