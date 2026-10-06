import { useRef, useState } from 'react';
import { Can } from '@vgururaj/auth';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FileDropzone,
  Progress,
  toast,
} from '@vgururaj/ui';
import { uploadFile } from './api/uploads-api';
import { type UploadStatus } from './schemas/upload';

export function UploadsPage() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function startUpload(file: File) {
    setFileName(file.name);
    setStatus('uploading');
    setProgress(0);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await uploadFile({
        file,
        signal: controller.signal,
        onProgress: setProgress,
      });
      setStatus('success');
      setProgress(100);
      toast.success('Upload complete');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setStatus('idle');
        setProgress(0);
        toast.message('Upload cancelled');
        return;
      }
      setStatus('error');
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      abortRef.current = null;
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-4" data-testid="uploads-page">
      <div>
        <h1 className="text-2xl font-semibold">Uploads</h1>
        <p className="text-sm text-muted-foreground">
          FileDropzone + uploadWithProgress against MSW (~1.5s delay)
        </p>
      </div>
      <Can
        permission="files:write"
        mode="hide"
        fallback={
          <Alert variant="destructive">
            <AlertTitle>Missing files:write</AlertTitle>
            <AlertDescription>Viewer cannot upload. Use admin or user.</AlertDescription>
          </Alert>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Upload a file</CardTitle>
            <CardDescription>
              Progress is driven by XHR upload events (mocked by MSW)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileDropzone
              data-testid="file-dropzone"
              multiple={false}
              disabled={status === 'uploading'}
              onFiles={(files) => {
                const file = files[0];
                if (file) void startUpload(file);
              }}
            />
            {fileName ? (
              <p className="text-sm text-muted-foreground">Selected: {fileName}</p>
            ) : null}
            <div className="space-y-2">
              <Progress value={progress} data-testid="upload-progress" />
              <p className="text-sm" data-testid="upload-status">
                {status === 'idle' && 'Idle'}
                {status === 'uploading' && `Uploading… ${progress}%`}
                {status === 'success' && 'Upload successful'}
                {status === 'error' && 'Upload failed'}
              </p>
            </div>
            {status === 'uploading' ? (
              <Button
                variant="outline"
                data-testid="upload-cancel"
                onClick={() => abortRef.current?.abort()}
              >
                Cancel
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </Can>
    </div>
  );
}
