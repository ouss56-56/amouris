-- Add missing columns for invoice management
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='invoice_generated') THEN
        ALTER TABLE public.orders ADD COLUMN invoice_generated BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='invoice_data') THEN
        ALTER TABLE public.orders ADD COLUMN invoice_data JSONB;
    END IF;
END $$;
