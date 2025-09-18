-- Create table for ebook leads
CREATE TABLE public.ebook_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ebook_leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert their email (for lead capture)
CREATE POLICY "Anyone can register for ebook" 
ON public.ebook_leads 
FOR INSERT 
WITH CHECK (true);

-- Create policy to prevent reading other users' data
CREATE POLICY "Users cannot read ebook leads" 
ON public.ebook_leads 
FOR SELECT 
USING (false);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ebook_leads_updated_at
BEFORE UPDATE ON public.ebook_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for email lookups
CREATE INDEX idx_ebook_leads_email ON public.ebook_leads(email);