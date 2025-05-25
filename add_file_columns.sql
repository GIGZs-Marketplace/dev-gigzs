-- Check if columns exist and add them if they don't
DO $$
BEGIN
    -- Check if file_url column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'messages' AND column_name = 'file_url') THEN
        ALTER TABLE messages ADD COLUMN file_url TEXT;
    END IF;

    -- Check if file_name column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'messages' AND column_name = 'file_name') THEN
        ALTER TABLE messages ADD COLUMN file_name TEXT;
    END IF;

    -- Check if file_type column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'messages' AND column_name = 'file_type') THEN
        ALTER TABLE messages ADD COLUMN file_type TEXT;
    END IF;
END
$$;
