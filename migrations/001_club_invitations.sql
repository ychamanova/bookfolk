CREATE TABLE IF NOT EXISTS book_club_members (
  club_id uuid NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (club_id, user_id)
);

CREATE INDEX IF NOT EXISTS book_club_members_user_idx
  ON book_club_members (user_id);

CREATE TABLE IF NOT EXISTS book_club_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
  invitee_email text NOT NULL CHECK (
    invitee_email = lower(btrim(invitee_email)) AND invitee_email <> ''
  ),
  invited_by uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  accepted_by uuid REFERENCES neon_auth."user"(id) ON DELETE SET NULL,
  CHECK ((status = 'accepted') = (accepted_at IS NOT NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS book_club_invitations_pending_unique
  ON book_club_invitations (club_id, invitee_email) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS book_club_invitations_email_idx
  ON book_club_invitations (invitee_email, created_at DESC) WHERE status = 'pending';

-- Only the server's database role should access these application tables.
REVOKE ALL ON book_club_members, book_club_invitations FROM PUBLIC;
