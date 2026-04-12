-- Fix pour le stockage Amouris v2

-- 1. Assurer la création de tous les buckets nécessaires
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('products', 'products', true),
  ('brands', 'brands', true),
  ('collections', 'collections', true),
  ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Politiques pour 'collections' (Public en lecture, Admin en écriture)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Collections Public Read'
    ) THEN
        CREATE POLICY "Collections Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'collections');
    END IF;
END $$;

-- Note: On utilise le service_role dans le code serveur, donc les politiques INSERT/UPDATE ne sont pas strictement nécessaires,
-- mais par sécurité, on les définit pour les utilisateurs authentifiés (Admins).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Collections Admin Insert'
    ) THEN
        CREATE POLICY "Collections Admin Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'collections');
    END IF;
END $$;
