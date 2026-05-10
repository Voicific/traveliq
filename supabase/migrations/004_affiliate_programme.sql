-- ============================================================
-- Migration 004: Affiliate Programme — Profiles, Introductions, Commissions
-- TravelIQ | May 2026
-- Run in Supabase SQL Editor (Dashboard → SQL → New Query)
-- ============================================================

-- ─── 1. affiliate_profiles ───────────────────────────────────────────
-- One row per accepted affiliate. Created by admin when they accept an application.

CREATE TABLE IF NOT EXISTS public.affiliate_profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  uuid REFERENCES public.affiliate_applications(id) ON DELETE SET NULL,
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,  -- set once they create a hub login
  first_name      text NOT NULL,
  last_name       text NOT NULL,
  email           text NOT NULL UNIQUE,
  company         text,
  linkedin        text,
  tracking_code   text NOT NULL UNIQUE,         -- e.g. "JANE-TIQ" — used in affiliate link
  tier            text NOT NULL DEFAULT 'standard'
                    CHECK (tier IN ('standard', 'growth', 'strategic')),
  commission_rate numeric(4,2) NOT NULL DEFAULT 10.00,  -- 10.00, 15.00, or 20.00
  status          text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'paused', 'terminated')),
  notes           text,                                 -- internal admin notes
  onboarding_call_booked boolean DEFAULT false,
  accepted_at     timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER affiliate_profiles_updated_at
  BEFORE UPDATE ON public.affiliate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 2. affiliate_introductions ──────────────────────────────────────
-- Each introduction an affiliate registers for a supplier.

CREATE TABLE IF NOT EXISTS public.affiliate_introductions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id        uuid NOT NULL REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
  supplier_company    text NOT NULL,
  contact_name        text NOT NULL,
  contact_email       text NOT NULL,
  supplier_type       text NOT NULL,
  notes               text,

  -- Sales pipeline status
  status              text NOT NULL DEFAULT 'registered'
                        CHECK (status IN (
                          'registered',     -- affiliate has registered the intro
                          'contacted',      -- TravelIQ team has reached out
                          'demo_scheduled', -- demo booked
                          'demo_done',      -- demo completed
                          'proposal_sent',  -- pricing/contract sent
                          'signed',         -- supplier has signed — triggers commission
                          'lost',           -- supplier decided not to proceed
                          'duplicate'       -- already in system
                        )),

  -- Subscription details (set when status → signed)
  subscription_type   text CHECK (subscription_type IN ('monthly', 'annual')),
  subscription_value  numeric(10,2),   -- annual value in GBP (12 × monthly if monthly)
  signed_at           timestamptz,
  first_payment_at    timestamptz,

  -- Admin fields
  admin_notes         text,
  assigned_to         text,            -- TravelIQ team member handling this

  registered_at       timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER affiliate_introductions_updated_at
  BEFORE UPDATE ON public.affiliate_introductions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index for quick lookups by affiliate
CREATE INDEX IF NOT EXISTS idx_introductions_affiliate
  ON public.affiliate_introductions(affiliate_id);

CREATE INDEX IF NOT EXISTS idx_introductions_status
  ON public.affiliate_introductions(status);

-- ─── 3. affiliate_commissions ────────────────────────────────────────
-- One row per commission payment event (annual renewal or monthly payment).

CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id        uuid NOT NULL REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
  introduction_id     uuid NOT NULL REFERENCES public.affiliate_introductions(id) ON DELETE CASCADE,

  -- Commission details
  period_label        text NOT NULL,             -- e.g. "May 2026", "Annual 2026"
  subscription_type   text NOT NULL CHECK (subscription_type IN ('monthly', 'annual')),
  subscription_value  numeric(10,2) NOT NULL,    -- supplier's payment in GBP this period
  commission_rate     numeric(4,2) NOT NULL,     -- rate at time of payment (10/15/20)
  commission_amount   numeric(10,2) NOT NULL,    -- subscription_value × commission_rate / 100

  -- Payment tracking
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'paid', 'disputed')),
  due_date            date,           -- when we expect to pay the affiliate
  paid_at             timestamptz,
  payment_reference   text,          -- bank transfer reference

  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER affiliate_commissions_updated_at
  BEFORE UPDATE ON public.affiliate_commissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_commissions_affiliate
  ON public.affiliate_commissions(affiliate_id);

CREATE INDEX IF NOT EXISTS idx_commissions_status
  ON public.affiliate_commissions(status);

-- ─── 4. Convenience view: affiliate_summary ──────────────────────────
-- Used in admin to get per-affiliate totals at a glance.

CREATE OR REPLACE VIEW public.affiliate_summary AS
SELECT
  p.id,
  p.first_name || ' ' || p.last_name AS full_name,
  p.email,
  p.tier,
  p.commission_rate,
  p.status AS affiliate_status,
  p.accepted_at,
  COUNT(DISTINCT i.id)                                              AS total_introductions,
  COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'signed')          AS signed_count,
  COUNT(DISTINCT i.id) FILTER (WHERE i.subscription_type = 'annual' AND i.status = 'signed')
                                                                    AS annual_count,
  COUNT(DISTINCT i.id) FILTER (WHERE i.subscription_type = 'monthly' AND i.status = 'signed')
                                                                    AS monthly_count,
  COALESCE(SUM(c.commission_amount) FILTER (WHERE c.status IN ('approved','paid')), 0)
                                                                    AS total_commission_earned,
  COALESCE(SUM(c.commission_amount) FILTER (WHERE c.status = 'pending'), 0)
                                                                    AS commission_pending
FROM public.affiliate_profiles p
LEFT JOIN public.affiliate_introductions i ON i.affiliate_id = p.id
LEFT JOIN public.affiliate_commissions c ON c.affiliate_id = p.id
GROUP BY p.id;

-- ─── 5. RLS Policies ─────────────────────────────────────────────────

ALTER TABLE public.affiliate_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_introductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions   ENABLE ROW LEVEL SECURITY;

-- Affiliates can read their own profile
CREATE POLICY "affiliate_read_own_profile"
  ON public.affiliate_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Affiliates can read their own introductions
CREATE POLICY "affiliate_read_own_introductions"
  ON public.affiliate_introductions FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliate_profiles WHERE user_id = auth.uid()
    )
  );

-- Affiliates can insert their own introductions
CREATE POLICY "affiliate_insert_introductions"
  ON public.affiliate_introductions FOR INSERT
  WITH CHECK (
    affiliate_id IN (
      SELECT id FROM public.affiliate_profiles WHERE user_id = auth.uid()
    )
  );

-- Affiliates can read their own commissions
CREATE POLICY "affiliate_read_own_commissions"
  ON public.affiliate_commissions FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliate_profiles WHERE user_id = auth.uid()
    )
  );

-- Admins (service role / anon with admin flag) get full access via service key
-- Use Supabase service role key in admin operations — do not expose to browser.

-- ─── 6. Helper: accept_application() ────────────────────────────────
-- Call this function from the admin UI to accept an application and
-- automatically create the affiliate_profile row.

CREATE OR REPLACE FUNCTION public.accept_affiliate_application(
  p_application_id  uuid,
  p_tracking_code   text,
  p_notes           text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_app    record;
  v_new_id uuid;
BEGIN
  -- Fetch the application
  SELECT * INTO v_app
  FROM public.affiliate_applications
  WHERE id = p_application_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or already processed: %', p_application_id;
  END IF;

  -- Create the profile
  INSERT INTO public.affiliate_profiles (
    application_id, first_name, last_name, email, company,
    linkedin, tracking_code, notes
  ) VALUES (
    v_app.id,
    v_app.first_name,
    v_app.last_name,
    v_app.email,
    v_app.company,
    v_app.linkedin,
    p_tracking_code,
    p_notes
  )
  RETURNING id INTO v_new_id;

  -- Update application status
  UPDATE public.affiliate_applications
  SET status = 'accepted'
  WHERE id = p_application_id;

  RETURN v_new_id;
END;
$$;

-- ─── 7. Helper: record_commission() ─────────────────────────────────
-- Call after confirming a supplier payment to log the commission.

CREATE OR REPLACE FUNCTION public.record_affiliate_commission(
  p_introduction_id uuid,
  p_period_label    text,
  p_sub_type        text,   -- 'monthly' or 'annual'
  p_sub_value       numeric,
  p_due_date        date DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_intro   record;
  v_profile record;
  v_amount  numeric;
  v_new_id  uuid;
BEGIN
  SELECT * INTO v_intro
  FROM public.affiliate_introductions
  WHERE id = p_introduction_id AND status = 'signed';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Introduction not found or not yet signed: %', p_introduction_id;
  END IF;

  SELECT * INTO v_profile
  FROM public.affiliate_profiles
  WHERE id = v_intro.affiliate_id;

  v_amount := ROUND(p_sub_value * v_profile.commission_rate / 100, 2);

  INSERT INTO public.affiliate_commissions (
    affiliate_id, introduction_id, period_label,
    subscription_type, subscription_value, commission_rate,
    commission_amount, due_date
  ) VALUES (
    v_intro.affiliate_id, p_introduction_id, p_period_label,
    p_sub_type, p_sub_value, v_profile.commission_rate,
    v_amount, p_due_date
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

-- ─── Done ─────────────────────────────────────────────────────────────
-- Tables created:
--   public.affiliate_profiles
--   public.affiliate_introductions
--   public.affiliate_commissions
-- View:
--   public.affiliate_summary
-- Functions:
--   public.accept_affiliate_application(application_id, tracking_code, notes)
--   public.record_affiliate_commission(introduction_id, period_label, sub_type, sub_value, due_date)
