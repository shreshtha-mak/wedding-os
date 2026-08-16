-- Wedding OS — Name each outfit component, not just its status.
--
-- outfit_status/shoes_status/jewellery_status/accessories_status tracked
-- progress ("Ready", "In Making"...) but never *what* the item actually
-- is — there was no way to say "the outfit" is a red lehenga from XYZ vs.
-- just "Ready". Each component gets its own optional name/description,
-- independent of the generic `description` field (which stays as a
-- free-text note about the look overall).

alter table outfits
  add column outfit_name text,
  add column shoes_name text,
  add column jewellery_name text,
  add column accessories_name text;
