-- Seed all non-admin commands
INSERT INTO commands (name)
VALUES 
  ('admins'),
  ('checkem'),
  ('crypto'),
  ('decide'),
  ('dictionary'),
  ('duckhunt'),
  ('gas'),
  ('giphy'),
  ('google'),
  ('help'),
  ('news'),
  ('nowplaying'),
  ('ping'),
  ('points'),
  ('remind'),
  ('shout'),
  ('stock'),
  ('tell'),
  ('twitter'),
  ('up'),
  ('urbandictionary'),
  ('version'),
  ('weather'),
  ('wikipedia');

-- Seed all admin commands
INSERT INTO commands (name, admin)
VALUES
  ('git', true),
  ('health', true),
  ('ignore', true),
  ('irc', true),
  ('logs', true),
  ('mount', true),
  ('reload', true),
  ('reply', true),
  ('restart', true),
  ('suppress', true),
  ('unmount', true);

-- Seed all observers
INSERT INTO observers (name)
VALUES
  ('botto'),
  ('duckhunt'),
  ('emoji'),
  ('epic'),
  ('markov'),
  ('points'),
  ('reply'),
  ('sed'),
  ('shout'),
  ('tell'),
  ('url');
