import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Upload,
  Sparkles,
  Camera,
  Lock,
  ArrowRight,
  Palette,
  Heart,
  Bookmark,
  ImageIcon,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressStepper } from '../components/ui/ProgressStepper';
import { cn } from '../utils/cn';
import { generateBridalLooks } from '../services/aiStudio';
import { savedLooksService } from '../services/savedLooks';
import { useAuthStore } from '../store/authStore';
import type { BridalStyle } from '../types';
import type { GeneratedLook } from '../services/aiStudio';
import toast from 'react-hot-toast';

const STYLES: { id: BridalStyle; label: string; description: string; colors: string }[] = [
  { id: 'Traditional North Indian', label: 'Traditional North Indian', description: 'Rich reds, golds, and classic bridal elegance', colors: 'from-red-500 to-gold-400' },
  { id: 'Fusion modern', label: 'Fusion Modern', description: 'Contemporary styles with a desi twist', colors: 'from-rose-400 to-purple-400' },
  { id: 'Minimalist chic', label: 'Minimalist Chic', description: 'Clean, understated, naturally beautiful', colors: 'from-ivory-300 to-rose-200' },
  { id: 'Heavy bridal', label: 'Heavy Bridal', description: 'Full glam — the whole nine yards', colors: 'from-amber-600 to-rose-600' },
];

const STEPS = [
  { label: 'Upload Photo', description: 'Your photo is safe with us' },
  { label: 'Choose Style', description: 'Pick your bridal aesthetic' },
  { label: 'See Results', description: 'AI generates your looks' },
  { label: 'Book This Look', description: 'Find artists for your style' },
];

export default function AIStudioPage() {
  const [step, setStep] = useState(0);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<BridalStyle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLooks, setGeneratedLooks] = useState<GeneratedLook[] | null>(null);
  const [savingLookIds, setSavingLookIds] = useState<Set<string>>(new Set());
  const [savedLookIds, setSavedLookIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isAuthenticated } = useAuthStore();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
        setStep(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setError(null);
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
        setStep(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!photoFile || !selectedStyle) return;

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateBridalLooks(photoFile, selectedStyle, user?.skinTone);
      setGeneratedLooks(result.looks);
      setStep(2);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveLook = async (look: GeneratedLook) => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to save looks');
      return;
    }

    if (savedLookIds.has(look.id)) {
      toast('Already saved!');
      return;
    }

    setSavingLookIds((prev) => new Set(prev).add(look.id));
    try {
      await savedLooksService.saveLook({
        userId: user.id,
        imageUrl: look.imageUrl,
        style: look.style,
        features: look.features,
        makeupDescription: look.makeupDescription,
        colorScheme: look.colorScheme,
        sourcePhotoUrl: photoPreview || undefined,
      });
      setSavedLookIds((prev) => new Set(prev).add(look.id));
      toast.success('Look saved!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save look');
    } finally {
      setSavingLookIds((prev) => {
        const next = new Set(prev);
        next.delete(look.id);
        return next;
      });
    }
  };

  const resetToStart = () => {
    setStep(0);
    setPhotoPreview(null);
    setPhotoFile(null);
    setGeneratedLooks(null);
    setSelectedStyle(null);
    setError(null);
    setSavedLookIds(new Set());
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="max-w-xl mx-auto text-center">
            <div
              className={cn(
                'border-2 border-dashed border-ivory-400 rounded-2xl p-12 md:p-20 transition-colors cursor-pointer',
                'hover:border-rose-400 hover:bg-rose-50/50'
              )}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-6">
                <Camera className="w-10 h-10 text-rose-400" />
              </div>
              <h3 className="font-heading text-xl text-ivory-900 mb-2">
                Upload your photo
              </h3>
              <p className="text-ivory-600 text-sm mb-6">
                Drag and drop or tap to choose a clear, front-facing photo
              </p>
              <Button variant="primary" size="md">
                <Upload className="w-4 h-4 mr-2" /> Choose Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Privacy notice */}
            <div className="mt-6 p-4 bg-ivory-50 rounded-xl flex items-start gap-3">
              <Lock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-left text-xs text-ivory-600">
                <p className="font-medium text-ivory-900">Your privacy matters</p>
                <p className="mt-0.5">Photo is deleted within 24 hours. Never used for AI training or shared with third parties.</p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Photo preview */}
              <div className="card p-4">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Your photo"
                    className="w-full h-64 md:h-80 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-64 md:h-80 bg-ivory-100 rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-ivory-400" />
                  </div>
                )}
                <button
                  onClick={() => { setPhotoPreview(null); setPhotoFile(null); setStep(0); }}
                  className="mt-3 text-sm text-rose-400 hover:text-rose-600 cursor-pointer"
                >
                  Re-upload photo
                </button>
              </div>

              {/* Style selection */}
              <div>
                <h3 className="font-heading text-xl text-rose-800 mb-4">Choose your bridal style</h3>
                <div className="space-y-3">
                  {STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={cn(
                        'w-full text-left p-4 rounded-xl border-2 transition-all',
                        selectedStyle === style.id
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-ivory-200 hover:border-ivory-400'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-12 h-12 rounded-lg bg-gradient-to-br shrink-0',
                          style.colors
                        )} />
                        <div>
                          <p className="font-medium text-ivory-900">{style.label}</p>
                          <p className="text-sm text-ivory-600">{style.description}</p>
                        </div>
                        {selectedStyle === style.id && (
                          <CheckCircle2 className="w-5 h-5 text-rose-400 ml-auto shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="mt-6">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={!selectedStyle || isGenerating}
                    onClick={handleGenerate}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" /> Generate My Looks
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="max-w-5xl mx-auto">
            {isGenerating ? (
              <div className="text-center py-20">
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <Sparkles className="w-24 h-24 text-rose-200 animate-pulse" />
                  <RefreshCw className="w-12 h-12 text-rose-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                </div>
                <h3 className="font-heading text-xl text-rose-800 mb-2">Our AI is styling you...</h3>
                <p className="text-ivory-600">Creating 3 personalised bridal looks just for you</p>
              </div>
            ) : generatedLooks ? (
              <div>
                <div className="text-center mb-8">
                  <h3 className="font-heading text-2xl text-rose-800 mb-2">Your Bridal Looks</h3>
                  <p className="text-ivory-600">Browse your AI-generated bridal styles below</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {generatedLooks.map((look, i) => (
                    <motion.div
                      key={look.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.2, duration: 0.4 }}
                      className="card overflow-hidden group"
                    >
                      <div className="relative bg-ivory-50">
                        <img
                          src={look.imageUrl}
                          alt={look.style}
                          className="w-full h-72 object-contain"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge variant="gold">Look {i + 1}</Badge>
                        </div>
                        {/* Save button */}
                        {isAuthenticated && (
                          <button
                            onClick={() => handleSaveLook(look)}
                            disabled={savingLookIds.has(look.id)}
                            className={cn(
                              'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer',
                              savedLookIds.has(look.id)
                                ? 'bg-rose-500 text-white'
                                : 'bg-white/90 text-rose-400 hover:bg-rose-50 opacity-0 group-hover:opacity-100'
                            )}
                          >
                            {savingLookIds.has(look.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : savedLookIds.has(look.id) ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-heading text-lg text-ivory-900">{look.style}</h4>
                        <p className="text-xs text-ivory-600 mt-1">{look.makeupDescription}</p>
                        <ul className="mt-3 space-y-1.5">
                          {look.features.map((feature) => (
                            <li key={feature} className="text-xs text-ivory-600 flex items-center gap-1.5">
                              <Palette className="w-3 h-3 text-rose-400 shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 pt-3 border-t border-ivory-100">
                          <Link to={`/search?style=${encodeURIComponent(selectedStyle || '')}&look=${encodeURIComponent(look.style)}`}>
                            <Button variant="primary" size="sm" className="w-full">
                              Find artists for this look <ArrowRight className="w-4 h-4 ml-1.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center mt-10 space-y-3">
                  <Badge variant="rose" className="inline-block">
                    <Heart className="w-3 h-3 inline mr-1" /> Not quite right? Try another style
                  </Badge>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => { setStep(1); setGeneratedLooks(null); }}
                    >
                      <RefreshCw className="w-4 h-4 mr-1.5" /> Try another style
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetToStart}
                    >
                      Start over
                    </Button>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <h3 className="font-heading text-xl text-ivory-900 mb-2">Generation failed</h3>
                <p className="text-ivory-600 mb-6">{error}</p>
                <Button variant="primary" size="md" onClick={() => { setStep(1); setError(null); }}>
                  Try again
                </Button>
              </div>
            ) : null}
          </div>
        );

      case 3:
        return (
          <div className="max-w-2xl mx-auto text-center">
            <div className="p-12">
              <Sparkles className="w-16 h-16 text-rose-400 mx-auto mb-4" />
              <h3 className="font-heading text-2xl text-rose-800 mb-2">Your style is set!</h3>
              <p className="text-ivory-600 mb-8">
                We found salons that specialise in {selectedStyle?.toLowerCase()} looks
              </p>
              <Link to={`/search?style=${encodeURIComponent(selectedStyle || '')}`}>
                <Button variant="primary" size="lg">
                  Show me salons for this look <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20">
      <Helmet>
        <title>AI Bridal Studio — Shringar</title>
        <meta name="description" content="See yourself as a bride before booking. Upload your photo and our AI generates 3 personalised bridal looks." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Badge variant="gold" className="mb-4 text-sm">✨ AI-Powered</Badge>
          <h1 className="font-heading text-3xl md:text-4xl text-rose-800 mb-2">AI Bridal Studio</h1>
          <p className="text-ivory-600">Upload your photo and see 3 bridal looks in seconds</p>
        </div>

        <ProgressStepper
          steps={STEPS}
          currentStep={step}
          className="max-w-3xl mx-auto mb-12"
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}