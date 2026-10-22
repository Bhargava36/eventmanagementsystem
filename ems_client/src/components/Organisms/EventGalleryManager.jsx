import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Plus,
  Trash2,
  UploadCloud,
  X,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import useToast from '../../Hooks/useToast';

export default function EventGalleryManager({ eventId }) {
  const toast = useToast();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    Caption: '',
    Images: [], // array of uploaded urls
  });

  const fetchGallery = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/gallery/event/${eventId}`);
      const data = await res.json();
      if (res.ok) {
        setGallery(data.gallery || []);
      }
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [eventId]);

  const handleOpenAdd = () => {
    setForm({
      Caption: '',
      Images: [],
    });
    setShowModal(true);
  };

  const handleMultipleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const fd = new FormData();
      files.forEach((f) => fd.append('files', f));

      const res = await fetch(`${API_BASE_URL}/api/upload/multiple`, {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (res.ok && data.urls) {
        setForm((prev) => ({
          ...prev,
          Images: [...prev.Images, ...data.urls],
        }));
        toast.success(`${data.urls.length} photos uploaded`);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveUploadedImage = (idx) => {
    setForm((prev) => ({
      ...prev,
      Images: prev.Images.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.Images.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }

    try {
      const items = form.Images.map((url, idx) => ({
        ImageUrl: url,
        Caption: form.Caption || null,
        Season: 'Highlights',
        DisplayOrder: idx,
      }));

      const res = await fetch(`${API_BASE_URL}/api/gallery/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          EventId: eventId,
          items,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`${form.Images.length} photos added to gallery`);
        setShowModal(false);
        fetchGallery();
      } else {
        throw new Error(data.message || 'Action failed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save photos to gallery');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this photo from gallery?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/gallery/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Photo removed');
        fetchGallery();
      } else {
        toast.error('Failed to remove photo');
      }
    } catch (err) {
      toast.error('Error removing photo');
    }
  };

  const modalContent = showModal ? (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setShowModal(false)}
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Camera className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Add Photos to Event Gallery
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Upload Photos *
              </label>
              <label className="border border-dashed border-slate-300 dark:border-zinc-700 hover:border-emerald-500 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 dark:bg-zinc-950 transition-colors">
                <UploadCloud className="w-6 h-6 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  {uploading ? 'Uploading photos...' : 'Click to select multiple photos'}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                  PNG, JPG, WEBP supported
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultipleFiles}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {form.Images.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                  <span>Selected Photos ({form.Images.length})</span>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, Images: [] }))}
                    className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-44 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                  {form.Images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800 aspect-square group"
                    >
                      <img
                        src={img.startsWith('/uploads') ? `${API_BASE_URL}${img}` : img}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveUploadedImage(idx)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Optional Caption
              </label>
              <input
                type="text"
                value={form.Caption}
                onChange={(e) => setForm({ ...form, Caption: e.target.value })}
                placeholder="e.g. Hackathon stage pitch, mentor circle, celebration"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || form.Images.length === 0}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                Save Photos ({form.Images.length})
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  ) : null;

  return (
    <div className="bg-white dark:bg-black rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Event Photo Gallery
              </h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800">
                {gallery.length} Photos
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Upload photos from event highlights, hackathon moments, and workshops.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Photos</span>
        </button>
      </div>

      {/* Gallery Photo Grid */}
      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">Loading gallery...</div>
      ) : gallery.length === 0 ? (
        <div className="py-8 px-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-center flex flex-col items-center justify-center">
          <Camera className="w-8 h-8 text-slate-300 dark:text-zinc-700 mb-2" />
          <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400">No photos added yet</p>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
            Click "Add Photos" to showcase event moments on the public details page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {gallery.map((item) => {
            const url = item.ImageUrl?.startsWith('/uploads')
              ? `${API_BASE_URL}${item.ImageUrl}`
              : item.ImageUrl;
            return (
              <div
                key={item.Id}
                className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-black aspect-square shadow-xs"
              >
                <img
                  src={url}
                  alt={item.Caption || 'Gallery'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute top-1.5 right-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleDelete(item.Id)}
                    className="p-1 rounded-md bg-black/70 hover:bg-rose-600 text-white backdrop-blur-md transition-colors shadow cursor-pointer"
                    title="Delete photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {item.Caption && (
                  <div className="absolute bottom-0 inset-x-0 p-1.5 bg-black/75 backdrop-blur-xs text-[10px] text-white truncate">
                    {item.Caption}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Render modal directly into document.body to fix tabs overlap bug */}
      {typeof document !== 'undefined' && modalContent && createPortal(modalContent, document.body)}
    </div>
  );
}
