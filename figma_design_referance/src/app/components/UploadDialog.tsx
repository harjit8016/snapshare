import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { PrivacySelector } from './PrivacySelector';
import { Upload } from 'lucide-react';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: File[];
  onConfirm: (privacy: 'public' | 'private', password: string) => void;
}

export function UploadDialog({ open, onOpenChange, files, onConfirm }: UploadDialogProps) {
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (open) {
      setPrivacy('public');
      setPassword('');
    }
  }, [open]);

  const handlePrivacyChange = (newPrivacy: 'public' | 'private', newPassword: string) => {
    setPrivacy(newPrivacy);
    setPassword(newPassword);
  };

  const handleConfirm = () => {
    if (privacy === 'private' && !password.trim()) {
      return;
    }
    onConfirm(privacy, password);
    onOpenChange(false);
  };

  const isValid = privacy === 'public' || (privacy === 'private' && password.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-600" />
            Upload Settings
          </DialogTitle>
          <DialogDescription>
            You're uploading {files.length} image{files.length > 1 ? 's' : ''}. Choose privacy settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <PrivacySelector
            value={privacy}
            password={password}
            onChange={handlePrivacyChange}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Upload {files.length} Image{files.length > 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
