/*
  # Create Form Wizard Steps Table

  1. New Tables
    - `form_wizard_steps`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `process_id` (text, optional process identifier)
      - `step_number` (integer, 1-6)
      - `step_data` (jsonb, stores form data for each step)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `form_wizard_steps` table
    - Add policy for users to read their own steps
    - Add policy for users to insert their own steps
    - Add policy for users to update their own steps
    - Add policy for users to delete their own steps

  3. Indexes
    - Index on user_id for faster queries
    - Index on step_number for filtering
    - Unique constraint on (user_id, step_number, process_id)
*/

CREATE TABLE IF NOT EXISTS form_wizard_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  process_id text DEFAULT NULL,
  step_number integer NOT NULL CHECK (step_number >= 1 AND step_number <= 6),
  step_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, step_number, process_id)
);

CREATE INDEX IF NOT EXISTS idx_form_wizard_steps_user_id ON form_wizard_steps(user_id);
CREATE INDEX IF NOT EXISTS idx_form_wizard_steps_step_number ON form_wizard_steps(step_number);
CREATE INDEX IF NOT EXISTS idx_form_wizard_steps_process_id ON form_wizard_steps(process_id);

ALTER TABLE form_wizard_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own form wizard steps"
  ON form_wizard_steps
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own form wizard steps"
  ON form_wizard_steps
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own form wizard steps"
  ON form_wizard_steps
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own form wizard steps"
  ON form_wizard_steps
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
