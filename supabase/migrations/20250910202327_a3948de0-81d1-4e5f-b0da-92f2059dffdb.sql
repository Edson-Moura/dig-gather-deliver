-- Deletar todos os arquivos dos buckets de ebooks
DELETE FROM storage.objects WHERE bucket_id IN ('ebooks', 'Literatura');

-- Deletar os buckets
DELETE FROM storage.buckets WHERE id IN ('ebooks', 'Literatura');