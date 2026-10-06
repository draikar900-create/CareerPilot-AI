-- ====================================================================
-- CAREERPILOT AI - MIGRATION 13: CONTACT MANAGEMENT SYSTEM
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived', 'resolved')),
  college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Policies
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Contact messages insertable by all" ON public.contact_messages;
CREATE POLICY "Contact messages insertable by all" ON public.contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Contact messages viewable by admins" ON public.contact_messages;
CREATE POLICY "Contact messages viewable by admins" ON public.contact_messages FOR SELECT USING (true);
