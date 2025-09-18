-- Create ebooks bucket for storing PDF files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ebooks', 'ebooks', true);

-- Create RLS policies for ebooks bucket
CREATE POLICY "Anyone can view ebooks" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'ebooks');

CREATE POLICY "Service role can upload ebooks" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'ebooks' AND (auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Service role can update ebooks" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'ebooks' AND (auth.jwt() ->> 'role') = 'service_role');