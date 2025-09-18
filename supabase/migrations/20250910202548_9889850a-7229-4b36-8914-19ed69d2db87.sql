-- Deletar todos os arquivos do bucket restante
DELETE FROM storage.objects WHERE bucket_id = '10 Erros Comuns de Aprendizado  de Ingles';

-- Deletar o bucket restante
DELETE FROM storage.buckets WHERE id = '10 Erros Comuns de Aprendizado  de Ingles';