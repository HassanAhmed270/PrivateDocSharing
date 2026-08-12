import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiUpload, HiDocumentText, HiArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import FormField from '../components/FormField.jsx';
import { uploadDocument } from '../services/documents.js';

function DocumentUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFileChange(event) {
    const selected = event.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!title) {
        setTitle(selected.name);
      }
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    if (!title.trim()) {
      toast.error('Document title is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('description', description.trim());

      await uploadDocument(formData);

      toast.success('Document uploaded successfully!');
      navigate('/documents', { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to upload document.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/documents"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"
      >
        <HiArrowLeft className="h-4 w-4" />
        Back to documents
      </Link>

      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-white/10 pb-6">
          <div className="rounded-2xl bg-brand-500/20 p-3 text-brand-300">
            <HiUpload className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Upload New Document</h1>
            <p className="text-sm text-slate-400">
              Only Owner and Reviewer roles can upload documents to the secure vault.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
          {/* File Drag / Drop zone */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Document File
            </label>
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-slate-950/60 p-8 text-center transition hover:border-brand-500/50">
              <HiDocumentText className="h-12 w-12 text-brand-400/80 mb-2" />
              {file ? (
                <div>
                  <p className="font-semibold text-white">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-slate-300">Click to choose a file</p>
                  <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX, TXT (Max 10MB)</p>
                </div>
              )}
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.txt,.png,.jpg"
                className="mt-4 text-sm text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-brand-500/20 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-brand-200 hover:file:bg-brand-500/30"
              />
            </div>
          </div>

          <FormField
            id="title"
            label="Document Title"
            name="title"
            type="text"
            placeholder="e.g. Executive Summary Q3.pdf"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Add optional reviewer notes or description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl border border-white/15 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-brand-500 px-5 py-3.5 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-brand-500/25"
          >
            {isSubmitting ? 'Uploading document…' : 'Upload Document'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DocumentUpload;
