import React from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Search,
  Flag,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { StarRating } from '../../components/ui/StarRating';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer_name?: string;
  salon_name?: string;
  is_flagged: boolean;
  salon_reply: string | null;
  customer_id: string;
  salon_id: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = React.useState<ReviewRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'flagged'>('all');
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState('');

  React.useEffect(() => { loadReviews(); }, []);

  async function loadReviews() {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles!reviews_customer_id_fkey(name), salons!reviews_salon_id_fkey(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setReviews((data || []).map((r: any) => ({
        ...r,
        customer_name: r.profiles?.name || 'Anonymous',
        salon_name: r.salons?.name || 'Unknown',
      })));
    } catch (err: any) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }

  async function toggleFlag(id: string, current: boolean) {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_flagged: !current })
        .eq('id', id);
      if (error) throw error;
      setReviews(prev => prev.map(r => r.id === id ? { ...r, is_flagged: !current } : r));
      toast.success(current ? 'Review unflagged' : 'Review flagged');
    } catch {
      toast.error('Failed to update review');
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete review');
    }
  }

  async function submitReply(reviewId: string) {
    if (!replyText.trim()) return;
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ salon_reply: replyText.trim() })
        .eq('id', reviewId);
      if (error) throw error;
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, salon_reply: replyText.trim() } : r));
      setReplyingTo(null);
      setReplyText('');
      toast.success('Reply posted');
    } catch {
      toast.error('Failed to post reply');
    }
  }

  const filtered = filter === 'flagged' ? reviews.filter(r => r.is_flagged) : reviews;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1,2,3,4].map(i => <div key={i} className="card p-5 h-20" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {(['all', 'flagged'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              filter === f ? 'bg-rose-400 text-white' : 'bg-ivory-100 text-ivory-600 hover:bg-ivory-200'
            }`}
          >
            {f === 'all' ? 'All Reviews' : 'Flagged'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Star className="w-12 h-12" />}
          title="No reviews yet"
          description={filter === 'flagged' ? 'No flagged reviews to moderate' : 'Reviews will appear here once customers leave them'}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`card p-5 ${review.is_flagged ? 'border-red-200 bg-red-50/30' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-semibold text-ivory-900">{review.customer_name}</span>
                    <StarRating rating={review.rating} size="sm" />
                    <Badge variant="gray" className="text-[10px]">
                      {new Date(review.created_at).toLocaleDateString()}
                    </Badge>
                    {review.is_flagged && (
                      <Badge variant="rose" className="text-[10px] flex items-center gap-1">
                        <Flag className="w-3 h-3" /> Flagged
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-ivory-600 mb-2">For: {review.salon_name}</p>
                  {review.comment && (
                    <p className="text-sm text-ivory-900 mb-3">{review.comment}</p>
                  )}
                  {review.salon_reply && (
                    <div className="ml-4 pl-3 border-l-2 border-rose-200 text-xs text-ivory-600 italic">
                      <span className="font-medium text-ivory-900">Salon reply:</span> {review.salon_reply}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ivory-100">
                <button
                  onClick={() => {
                    setReplyingTo(replyingTo === review.id ? null : review.id);
                    setReplyText(review.salon_reply || '');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-ivory-600 hover:bg-ivory-100 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Reply
                </button>
                <button
                  onClick={() => toggleFlag(review.id, review.is_flagged)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    review.is_flagged ? 'text-red-600 hover:bg-red-50' : 'text-ivory-600 hover:bg-ivory-100'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" /> {review.is_flagged ? 'Unflag' : 'Flag'}
                </button>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>

              {/* Reply form */}
              {replyingTo === review.id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a salon reply to this review..."
                    className="input-field text-sm min-h-[60px] resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => submitReply(review.id)}>
                      Post Reply
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}