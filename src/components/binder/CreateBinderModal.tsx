import React, { useState } from 'react';
import { Book, Plus } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface CreateBinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => Promise<void>;
}

const CreateBinderModal: React.FC<CreateBinderModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onCreate(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Custom Binder"
      titleIcon={<Book size={24} />}
      size="md"
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label htmlFor="binder-name" className="block text-sm font-medium text-lorcana-ink mb-1">
            Binder Name
          </label>
          <input
            id="binder-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Custom Binder"
            className="w-full px-3 py-2 border-2 border-lorcana-gold rounded-sm bg-lorcana-cream text-lorcana-ink focus:ring-2 focus:ring-lorcana-gold/50 focus:border-lorcana-navy"
            maxLength={100}
            autoFocus
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="binder-desc" className="block text-sm font-medium text-lorcana-ink mb-1">
            Description <span className="text-lorcana-navy/50 font-normal">(optional)</span>
          </label>
          <textarea
            id="binder-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this binder for?"
            className="w-full px-3 py-2 border-2 border-lorcana-gold rounded-sm bg-lorcana-cream text-lorcana-ink focus:ring-2 focus:ring-lorcana-gold/50 focus:border-lorcana-navy resize-none"
            rows={2}
            maxLength={300}
            disabled={loading}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-sm hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 btn-lorcana flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={!name.trim() || loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={16} />
                Create Binder
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateBinderModal;
