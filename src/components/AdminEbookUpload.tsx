import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UploadCloud, CheckCircle, Loader2, Link as LinkIcon } from 'lucide-react';

const AdminEbookUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'Selecione um arquivo',
        description: 'Escolha o PDF do ebook para enviar.',
        variant: 'destructive',
      });
      return;
    }

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Arquivo inválido',
        description: 'Envie um arquivo no formato PDF.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);
      const contentBase64 = await toBase64(file);
      const filename = '10-erros-comuns.pdf';

      const { data, error } = await supabase.functions.invoke('upload-ebook', {
        body: { filename, contentBase64 },
      });

      if (error) throw error;

      const url = data?.publicUrl as string | undefined;
      setPublicUrl(url || null);

      toast({
        title: 'Upload concluído',
        description: 'Ebook atualizado com sucesso. Os próximos emails usarão o novo arquivo.',
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível enviar o ebook. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="py-8">
      <Card className="border-primary/20 shadow-elegant">
        <CardHeader>
          <CardTitle>Upload do Ebook (Admin)</CardTitle>
          <CardDescription>
            Envie o PDF que será anexado nos emails e disponibilizado para download.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-[1fr_auto] gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="ebook-file">Arquivo PDF</Label>
              <Input
                id="ebook-file"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={isUploading}
              />
            </div>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Enviar PDF
                </>
              )}
            </Button>
          </div>

          {publicUrl && (
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 mr-2 text-green" />
              <a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex items-center hover:underline">
                <LinkIcon className="w-3 h-3 mr-1" /> Ver arquivo público
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default AdminEbookUpload;
