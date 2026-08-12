-- Wedding OS — reference/bootstrap data.
-- Run once after migrations, on a fresh database.

insert into roles (id, label, description) values
  ('admin', 'Admin', 'Full control: manage users, permissions, and all modules.'),
  ('organiser', 'Organiser', 'Can view/edit relevant wedding information and manage operational details.'),
  ('restricted', 'Restricted', 'Sees only assigned tasks and the modules relevant to them.');

insert into weddings (name, start_date, end_date) values
  ('Saumya and Clara', '2026-10-30', '2026-11-01');

insert into events (wedding_id, name, day_label, event_date, start_time, end_time, location)
select (select id from weddings limit 1), e.name, e.day_label, e.event_date::date,
       e.start_time::time, e.end_time::time, e.location
from (values
  ('Mehendi',      'Friday',   '2026-10-30', '17:00', null,    '1st-floor back terrace'),
  ('Haldi',        'Saturday', '2026-10-31', '09:00', null,    'Garden'),
  ('Mandva Havan', 'Saturday', '2026-10-31', '17:00', null,    '1st-floor front terrace'),
  ('Sangeet',      'Saturday', '2026-10-31', '19:00', null,    'Garden'),
  ('Mameru',       'Sunday',   '2026-11-01', '09:00', '12:00', 'Clubhouse indoor/outdoor game zone'),
  ('Wedding',      'Sunday',   '2026-11-01', '17:00', null,    'Poolside')
) as e(name, day_label, event_date, start_time, end_time, location);

insert into task_categories (wedding_id, name)
select (select id from weddings limit 1), c.name
from (values
  ('Venue'), ('Décor'), ('Food'), ('Music'), ('Guest'), ('Accommodation'),
  ('Transport'), ('Clothing'), ('Gifts'), ('Finance'), ('Documents'),
  ('Event preparation'), ('Rituals'), ('Logistics'), ('Other')
) as c(name);
