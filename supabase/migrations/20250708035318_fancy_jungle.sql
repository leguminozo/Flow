/*
  # Add unique constraint to stores handle column

  1. Schema Changes
    - Add unique constraint to `handle` column in `stores` table
    - This will allow proper upsert operations using ON CONFLICT

  2. Data Integrity
    - Ensures each store has a unique handle
    - Prevents duplicate store entries
*/

-- Add unique constraint to handle column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'stores_handle_unique' 
    AND table_name = 'stores'
  ) THEN
    ALTER TABLE stores ADD CONSTRAINT stores_handle_unique UNIQUE (handle);
  END IF;
END $$;