/*
# Create useful links table

1. New Tables
- `useful_links` stores public mathematics resources displayed on the Useful Links page.
- `id` is the unique identifier for each link.
- `title` is the visible link name shown to visitors.
- `url` is the destination address opened when a card is selected.
- `created_at` records when the link was added.

2. Initial Data
- Adds the requested VBE formulas sheet for A level as the first useful link.

3. Security
- Enables row level security on `useful_links`.
- Allows the public no-login app to read, add, update, and delete shared links through separate CRUD policies.

4. Important Notes
- This is intentionally a shared single-tenant list because the app does not have sign-in.
- The policies use public access for the shared content and are scoped to the anon and authenticated roles.
*/

CREATE TABLE IF NOT EXISTS public.useful_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 200),
  url text NOT NULL CHECK (char_length(trim(url)) BETWEEN 1 AND 2048),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.useful_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read useful links" ON public.useful_links;
CREATE POLICY "Public can read useful links"
  ON public.useful_links FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can add useful links" ON public.useful_links;
CREATE POLICY "Public can add useful links"
  ON public.useful_links FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update useful links" ON public.useful_links;
CREATE POLICY "Public can update useful links"
  ON public.useful_links FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete useful links" ON public.useful_links;
CREATE POLICY "Public can delete useful links"
  ON public.useful_links FOR DELETE
  TO anon, authenticated
  USING (true);

INSERT INTO public.useful_links (title, url)
SELECT 'VBE formulių lapas (A lygis)', 'https://www.nsa.smsm.lt/wp-content/uploads/2026/06/MAT-VBE-A-formules.pdf'
WHERE NOT EXISTS (
  SELECT 1 FROM public.useful_links
  WHERE url = 'https://www.nsa.smsm.lt/wp-content/uploads/2026/06/MAT-VBE-A-formules.pdf'
);
