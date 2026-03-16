import { useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Lock, Globe, Eye, EyeOff } from 'lucide-react';

interface PrivacySelectorProps {
  value: 'public' | 'private';
  password: string;
  onChange: (privacy: 'public' | 'private', password: string) => void;
}

export function PrivacySelector({ value, password, onChange }: PrivacySelectorProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Privacy Setting</Label>
      
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as 'public' | 'private', password)}
      >
        <label
          htmlFor="public"
          className="flex items-start space-x-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer select-none"
        >
          <RadioGroupItem value="public" id="public" className="mt-1" />
          <div className="flex-1">
            <span className="font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-600" />
              Public
            </span>
            <p className="text-sm text-gray-600 mt-1">
              Anyone with the link can view this image
            </p>
          </div>
        </label>
        
        <label
          htmlFor="private"
          className="flex items-start space-x-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer select-none"
        >
          <RadioGroupItem value="private" id="private" className="mt-1" />
          <div className="flex-1">
            <span className="font-medium flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              Private (Password Protected)
            </span>
            <p className="text-sm text-gray-600 mt-1">
              Requires password to view the image
            </p>
          </div>
        </label>
      </RadioGroup>

      {value === 'private' && (
        <div className="space-y-2 pl-4 border-l-2 border-purple-300">
          <Label htmlFor="image-password" className="text-sm">
            Set Password
          </Label>
          <div className="relative">
            <Input
              id="image-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password (required)"
              value={password}
              onChange={(e) => onChange('private', e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Share this password with people you want to give access to
          </p>
        </div>
      )}
    </div>
  );
}
