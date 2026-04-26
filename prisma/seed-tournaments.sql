-- =============================================================
-- Seed: Random Dota 2 Tournaments
-- Usage: run against the app's PostgreSQL database.
-- Requires at least one row in the "users" table.
-- The DO block picks the first available user as organizer.
-- =============================================================

DO $$
DECLARE
  org_id TEXT;
BEGIN
  -- Insert a seed user if none exists
  INSERT INTO users (id, name, email, created_at, updated_at)
  VALUES (
    'seed-user-id',
    'Seed Organizer',
    'seed@dota2tournament.local',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO NOTHING;

  SELECT id INTO org_id FROM users LIMIT 1;

  INSERT INTO tournaments (
    id, name, description, max_teams, start_date, registration_deadline,
    format, status, discord_url, stream_url, entry_fee, prize_pool,
    currency, region, max_rank_tier, organizer_id, created_at, updated_at
  ) VALUES

  -- 1
  (
    gen_random_uuid(),
    'Aegis Invitational 2026',
    'An elite 16-team single-elimination bracket for top-ranked players across Europe West. Spectators welcome on Twitch.',
    16,
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '20 days',
    'SINGLE_ELIMINATION', 'REGISTRATION_OPEN',
    'https://discord.gg/aegis2026',
    'https://twitch.tv/aegis2026',
    10.00, '$1,000 prize pool',
    'USD', 'EUW', 6,
    org_id, NOW(), NOW()
  ),

  -- 2
  (
    gen_random_uuid(),
    'SEA Clash Season 3',
    'Southeast Asia regional tournament open to all rank tiers. 8-team bracket, best of 3 finals.',
    8,
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '7 days',
    'SINGLE_ELIMINATION', 'REGISTRATION_OPEN',
    'https://discord.gg/seaclash',
    NULL,
    0.00, 'Glory & bragging rights',
    'USD', 'SEA', NULL,
    org_id, NOW(), NOW()
  ),

  -- 3
  (
    gen_random_uuid(),
    'NA West Friday Cup',
    'Weekly cup for US West players. Fast-paced single-elimination, all games same night.',
    8,
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '3 days',
    'SINGLE_ELIMINATION', 'DRAFT',
    NULL,
    NULL,
    5.00, '$200 to the winner',
    'USD', 'USW', NULL,
    org_id, NOW(), NOW()
  ),

  -- 4
  (
    gen_random_uuid(),
    'Roshan Cup — Brazil',
    'Torneio para equipes brasileiras de Dota 2. Premiação em dinheiro para o campeão.',
    16,
    NOW() + INTERVAL '45 days',
    NOW() + INTERVAL '30 days',
    'SINGLE_ELIMINATION', 'DRAFT',
    'https://discord.gg/roshancupbr',
    'https://twitch.tv/roshancupbr',
    25.00, 'R$ 2.000 em prêmios',
    'BRL', 'BR', 7,
    org_id, NOW(), NOW()
  ),

  -- 5
  (
    gen_random_uuid(),
    'CIS Winter League',
    'Russia/CIS region competitive league. Herald to Divine rank tiers welcome.',
    16,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '20 days',
    'SINGLE_ELIMINATION', 'REGISTRATION_CLOSED',
    'https://discord.gg/ciswinter',
    'https://twitch.tv/ciswinterleague',
    15.00, '€500',
    'EUR', 'RU', 8,
    org_id, NOW(), NOW()
  ),

  -- 6
  (
    gen_random_uuid(),
    'Perth Dota Open',
    'Australian community tournament, open bracket. No rank restriction.',
    8,
    NOW() + INTERVAL '21 days',
    NOW() + INTERVAL '14 days',
    'SINGLE_ELIMINATION', 'REGISTRATION_OPEN',
    NULL,
    NULL,
    0.00, NULL,
    'AUD', 'AU', NULL,
    org_id, NOW(), NOW()
  ),

  -- 7
  (
    gen_random_uuid(),
    'Dubai Desert Duel',
    'MENA invitational for Immortal and Divine-only teams. Sponsored event with casting.',
    8,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '15 days',
    'SINGLE_ELIMINATION', 'IN_PROGRESS',
    'https://discord.gg/dubaiduel',
    'https://twitch.tv/dubaiduel',
    50.00, '$500 USD',
    'USD', 'DUBAI', 8,
    org_id, NOW(), NOW()
  ),

  -- 8
  (
    gen_random_uuid(),
    'Santiago Showdown',
    'Torneo sudamericano para equipos de Chile y Perú. Cupos limitados.',
    8,
    NOW() + INTERVAL '60 days',
    NOW() + INTERVAL '50 days',
    'SINGLE_ELIMINATION', 'DRAFT',
    NULL,
    NULL,
    20.00, 'CLP $200.000',
    'CLP', 'CL', NULL,
    org_id, NOW(), NOW()
  ),

  -- 9
  (
    gen_random_uuid(),
    'EUE Immortal Cup',
    'Eastern Europe high-rank-only invitational. Minimum Immortal rank required.',
    16,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '40 days',
    'SINGLE_ELIMINATION', 'COMPLETED',
    'https://discord.gg/euecup',
    'https://twitch.tv/euecup',
    30.00, '€1,500',
    'EUR', 'EUE', 8,
    org_id, NOW(), NOW()
  ),

  -- 10
  (
    gen_random_uuid(),
    'India Community Cup',
    'Open to all Indian Dota 2 teams regardless of rank. Weekend warriors welcome!',
    16,
    NOW() + INTERVAL '10 days',
    NOW() + INTERVAL '6 days',
    'SINGLE_ELIMINATION', 'REGISTRATION_OPEN',
    'https://discord.gg/indiacup',
    NULL,
    0.00, 'Community trophy',
    'INR', 'IN', NULL,
    org_id, NOW(), NOW()
  );

END $$;
