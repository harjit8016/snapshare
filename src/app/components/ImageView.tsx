import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from './Header';
import { AdBanner } from './AdBanner';
import { PasswordDialog } from './PasswordDialog';
import { getImageBlob } from '../lib/db';
import { toast } from 'sonner';
import { Lock, Download, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Helmet } from 'react-helmet-async';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useLocation } from 'react-router-dom';

const SEO_CONFIG = {
  canonicalBase: "https://snapshare.netlify.app",
  siteName: "Snapshare"
};

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  size: string;
  isPrivate: boolean;
  password?: string;
}

export function ImageView() {
  const { trackEvent } = useAnalytics();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent("page_view", { page_name: "image_view", image_id: id, path: location.pathname });
    const loadData = async () => {
      if (!id) return;
      
      const stored = localStorage.getItem('snapshare_images');
      if (stored) {
        const images: UploadedImage[] = JSON.parse(stored);
        const found = images.find(img => img.id === id);
        if (found) {
          try {
            const blob = await getImageBlob(id);
            if (blob) {
              const url = URL.createObjectURL(blob);
              setImage({ ...found, url });
              setUnlocked(!found.isPrivate);
            }
          } catch (err) {
            console.error('Failed to load blob:', err);
            toast.error('Failed to load image content');
          }
        }
      }
      setLoading(false);
    };

    loadData();
  }, [id]);

  const handlePasswordSubmit = (password: string) => {
    if (image?.password === password) {
      setUnlocked(true);
      toast.success('Image unlocked!');
    } else {
      toast.error('Incorrect password');
    }
  };

  const handleDownload = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.name;
    link.click();
    trackEvent("download_image", { image_id: id, image_name: image.name });
  };

  if (loading) return null;

  if (!image) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <main className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Image Not Found</h2>
          <p className="text-gray-600 mb-8">The image you are looking for might have been deleted or never existed.</p>
          <Link to="/">
            <Button>Go Back Home</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Helmet>
        <title>{image.isPrivate ? 'Protected Image' : image.name} | {SEO_CONFIG.siteName}</title>
        <meta name="description" content={`View shared image "${image.name}" on ${SEO_CONFIG.siteName}. Free image sharing with original quality.`} />
        <link rel="canonical" href={`${SEO_CONFIG.canonicalBase}/i/${id}`} />
        <meta property="og:title" content={`${image.name} - ${SEO_CONFIG.siteName}`} />
        <meta property="og:description" content={`View shared image "${image.name}" on ${SEO_CONFIG.siteName}.`} />
        <meta property="og:url" content={`${SEO_CONFIG.canonicalBase}/i/${id}`} />
      </Helmet>
      <Header />
      
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex justify-center">
          <AdBanner 
            format="horizontal" 
            slot={import.meta.env.VITE_ADSENSE_SLOT_UPLOAD} 
          />
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium mb-8">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Snapshare
        </Link>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">{image.name}</h2>
                <p className="text-sm text-gray-500">{image.size}</p>
              </div>
              {unlocked && (
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>

            <div className="relative aspect-video bg-gray-50 flex items-center justify-center overflow-hidden">
              {!unlocked ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-3xl bg-white/20">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
                    <Lock className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">This image is private</h3>
                  <p className="text-gray-600 mb-6 px-4 text-center">Enter the password to view this image</p>
                  <PasswordDialog 
                    open={true} 
                    onOpenChange={() => {}} 
                    onSubmit={handlePasswordSubmit}
                    imageName={image.name}
                  />
                </div>
              ) : (
                <img 
                  src={image.url} 
                  alt={image.name ? image.name.replace(/[_-]/g, ' ') : "Free image shared online"} 
                  className="max-h-full max-w-full object-contain" 
                />
              )}
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <AdBanner 
              format="horizontal" 
              slot={import.meta.env.VITE_ADSENSE_SLOT_FOOTER} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}
