import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ImageCard } from './components/ImageCard';
import { UploadDialog } from './components/UploadDialog';
import { PasswordDialog } from './components/PasswordDialog';
import { AdBanner } from './components/AdBanner';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { ImageIcon } from 'lucide-react';
import { saveImageBlob, getImageBlob, deleteImageBlob } from './lib/db';
import { ImageView } from './components/ImageView';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import '../firebase/config';
import { useAnalytics } from '../hooks/useAnalytics';
import { useLocation } from 'react-router-dom';

const SEO_CONFIG = {
  title: "Free Image Sharing | Upload & Store Photos Online Free",
  description: "Share and upload images online for free. No signup needed. Free image hosting, unlimited photo storage and instant shareable links.",
  keywords: "free image sharing, upload photos online, image hosting site, photo sharing website, share images online, free photo upload site, online image gallery, free image uploader, photo storage online, cloud photo storage free, store photos online free, free picture hosting, image sharing app, photo album online, imgur alternative, image link sharing, free image sharing website no signup, best free photo sharing site 2025, upload multiple photos online free, free image hosting without account, upload images and get shareable link, free cloud storage for photos, unlimited photo storage free, free image backup online, no cost photo storage, store images online free forever, free photo cloud backup, best free photo storage app, upload photos without sign up free",
  canonical: "https://snapshare.netlify.app",
  siteName: "Snapshare"
};

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  size: string;
  isPrivate: boolean;
  password?: string;
  unlocked?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function Home() {
  const { trackEvent } = useAnalytics();
  const location = useLocation();
  const galleryRef = useRef<HTMLDivElement>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [passwordDialogState, setPasswordDialogState] = useState<{
    open: boolean;
    imageId: string;
    imageName: string;
  }>({
    open: false,
    imageId: '',
    imageName: '',
  });

  // Load metadata from localStorage and Blobs from IndexedDB
  useEffect(() => {
    trackEvent("page_view", { page_name: "home", path: location.pathname });
    const loadImages = async () => {
      const stored = localStorage.getItem('snapshare_images');
      if (stored) {
        const images: UploadedImage[] = JSON.parse(stored);
        const imagesWithUrls = await Promise.all(
          images.map(async (img) => {
            const blob = await getImageBlob(img.id);
            if (blob) {
              return { ...img, url: URL.createObjectURL(blob) };
            }
            return img;
          })
        );
        setUploadedImages(imagesWithUrls.filter(img => img.url));
      }
    };
    loadImages();
  }, []);

  // Track view_gallery when images exist
  useEffect(() => {
    if (uploadedImages.length > 0) {
      trackEvent("view_gallery", { count: uploadedImages.length });
    }
  }, [uploadedImages.length]);

  // Sync metadata to localStorage (excluding URLs)
  useEffect(() => {
    const metadata = uploadedImages.map(({ url, ...rest }) => rest);
    localStorage.setItem('snapshare_images', JSON.stringify(metadata));
  }, [uploadedImages]);

  const handleFilesSelected = (files: File[]) => {
    setPendingFiles(files);
    setShowUploadDialog(true);
  };

  const handleUploadConfirm = async (privacy: 'public' | 'private', password: string) => {
    const newImages = await Promise.all(
      pendingFiles.map(async (file) => {
        const id = Math.random().toString(36).substring(7);
        await saveImageBlob(id, file);
        return {
          id,
          url: URL.createObjectURL(file),
          name: file.name,
          size: formatFileSize(file.size),
          isPrivate: privacy === 'private',
          password: privacy === 'private' ? password : undefined,
          unlocked: privacy === 'public',
        };
      })
    );

    newImages.forEach(img => {
      trackEvent("upload_image", { 
        file_type: "image", 
        file_size: img.size,
        privacy: privacy 
      });
    });

    setUploadedImages(prev => [...newImages, ...prev]);
    toast.success(`${pendingFiles.length} image${pendingFiles.length > 1 ? 's' : ''} uploaded successfully!`);
    setPendingFiles([]);

    // Auto-scroll to gallery after DOM update
    setTimeout(() => {
      galleryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDelete = async (id: string) => {
    await deleteImageBlob(id);
    trackEvent("delete_image", { image_id: id });
    setUploadedImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image && image.url) {
        URL.revokeObjectURL(image.url);
      }
      return prev.filter(img => img.id !== id);
    });
    toast.success('Image deleted');
  };

  const handleViewImage = (id: string) => {
    const image = uploadedImages.find(img => img.id === id);
    if (!image) return;

    if (image.isPrivate && !image.unlocked) {
      setPasswordDialogState({
        open: true,
        imageId: id,
        imageName: image.name,
      });
    }
  };

  const handlePasswordSubmit = (password: string) => {
    const image = uploadedImages.find(img => img.id === passwordDialogState.imageId);
    if (!image) return;

    if (image.password === password) {
      setUploadedImages(prev =>
        prev.map(img =>
          img.id === passwordDialogState.imageId
            ? { ...img, unlocked: true }
            : img
        )
      );
      toast.success('Image unlocked successfully!');
      setPasswordDialogState({ open: false, imageId: '', imageName: '' });
    } else {
      toast.error('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Helmet>
        <title>{SEO_CONFIG.title}</title>
        <meta name="description" content={SEO_CONFIG.description} />
        <meta name="keywords" content={SEO_CONFIG.keywords} />
        <link rel="canonical" href={SEO_CONFIG.canonical} />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SEO_CONFIG.canonical} />
        <meta property="og:title" content={SEO_CONFIG.title} />
        <meta property="og:description" content={SEO_CONFIG.description} />
        <meta property="og:image" content={`${SEO_CONFIG.canonical}/og-image.png`} />
        <meta property="og:site_name" content={SEO_CONFIG.siteName} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={SEO_CONFIG.canonical} />
        <meta name="twitter:title" content={SEO_CONFIG.title} />
        <meta name="twitter:description" content={SEO_CONFIG.description} />
        <meta name="twitter:image" content={`${SEO_CONFIG.canonical}/og-image.png`} />
      </Helmet>
      <Header />
      
      {/* Top Ad Banner */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex justify-center">
          <AdBanner 
            format="horizontal" 
            slot={import.meta.env.VITE_ADSENSE_SLOT_UPLOAD} 
          />
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Free image sharing (Original quality)
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload, share, and manage your images with ease. Fast, simple, and reliable with password protection.
          </p>
        </div>

        {/* Upload Zone */}
        <div className="mb-16">
          <UploadZone onUpload={handleFilesSelected} />
        </div>

        {/* Features */}
        {uploadedImages.length === 0 && (
          <div className="max-w-4xl mx-auto mb-16">
            <h3 className="text-2xl font-semibold text-center text-gray-800 mb-8">
              Why Choose Snapshare?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Fast Upload</h4>
                <p className="text-gray-600 text-sm">
                  Drag and drop or click to upload multiple images instantly
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Password Protected</h4>
                <p className="text-gray-600 text-sm">
                  Keep your images private with password protection
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Easy Sharing</h4>
                <p className="text-gray-600 text-sm">
                  Copy shareable links with one click and share anywhere
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Uploaded Images Gallery */}
        {uploadedImages.length > 0 && (
          <div ref={galleryRef} className="max-w-7xl mx-auto scroll-mt-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-gray-800">
                    Your Images ({uploadedImages.length})
                  </h3>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  {uploadedImages.map(image => (
                    <ImageCard
                      key={image.id}
                      id={image.id}
                      url={image.url}
                      name={image.name}
                      size={image.size}
                      isPrivate={image.isPrivate}
                      password={image.password}
                      onDelete={handleDelete}
                      onView={handleViewImage}
                    />
                  ))}
                </div>
              </div>

              {/* Sidebar Ad */}
              <div className="lg:w-[320px]">
                <div className="sticky top-4">
                  <AdBanner 
                    format="rectangle" 
                    slot={import.meta.env.VITE_ADSENSE_SLOT_GALLERY} 
                    className="mx-auto" 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Ad Banner */}
        {uploadedImages.length > 0 && (
          <div className="mt-16 flex justify-center">
            <AdBanner 
              format="horizontal" 
              slot={import.meta.env.VITE_ADSENSE_SLOT_FOOTER} 
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>© 2026 Snapshare. A simple and free image hosting service.</p>
        </div>
      </footer>

      {/* Dialogs */}
      <UploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        files={pendingFiles}
        onConfirm={handleUploadConfirm}
      />

      <PasswordDialog
        open={passwordDialogState.open}
        onOpenChange={(open) =>
          setPasswordDialogState(prev => ({ ...prev, open }))
        }
        onSubmit={handlePasswordSubmit}
        imageName={passwordDialogState.imageName}
      />

      <Toaster position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/i/:id" element={<ImageView />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}
