import { useState } from 'react';
import { Copy, Check, Download, Trash2, Lock, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Badge } from './ui/badge';

interface ImageCardProps {
  id: string;
  url: string;
  name: string;
  size: string;
  isPrivate: boolean;
  password?: string;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export function ImageCard({ id, url, name, size, isPrivate, password, onDelete, onView }: ImageCardProps) {
  const [copied, setCopied] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleCopyPassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopiedPassword(true);
      toast.success('Password copied to clipboard!');
      setTimeout(() => setCopiedPassword(false), 2000);
    } catch (err) {
      toast.error('Failed to copy password');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    toast.success('Download started!');
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
      <div className="aspect-video bg-gray-100 overflow-hidden relative">
        <img
          src={url}
          alt={name}
          className="w-full h-full object-cover"
        />
        {isPrivate && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-purple-600 text-white">
              <Lock className="w-3 h-3 mr-1" />
              Private
            </Badge>
          </div>
        )}
        {!isPrivate && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-green-600 text-white">
              <Globe className="w-3 h-3 mr-1" />
              Public
            </Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            onClick={handleCopyLink}
            variant="secondary"
            size="sm"
            className="mr-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
          <Button
            onClick={handleDownload}
            variant="secondary"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate mb-1">
              {name}
            </h3>
            <p className="text-sm text-gray-500">
              {size}
            </p>
          </div>
          <Button
            onClick={() => onDelete(id)}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        {isPrivate && password && (
          <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-purple-900 mb-1">Password</p>
                <p className="text-sm font-mono text-purple-700 truncate">{password}</p>
              </div>
              <Button
                onClick={handleCopyPassword}
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
              >
                {copiedPassword ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-purple-600 mt-1">Share this password with recipients</p>
          </div>
        )}
        
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700 truncate font-mono">
            {url.substring(0, 40)}...
          </div>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}