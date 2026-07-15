import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Heart, Share2, Tag, Calendar, Plus, MessageCircle, AlertCircle, HelpCircle } from 'lucide-react';

export const Forum: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New post form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  // Active expanded thread for viewing comments
  const [activePost, setActivePost] = useState<any | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/forum/list');
      if (res.data && res.data.success) {
        setPosts(res.data.posts);
      }
    } catch (err) {
      console.error('Failed to load forum posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setError('Title and content are required.');
      return;
    }

    setError('');
    setCreating(true);

    const tagsArray = tags.split(',').map(t => t.trim().replace('#', '')).filter(t => t !== '');

    try {
      const res = await api.post('/forum/create', {
        title,
        content,
        tags: tagsArray
      });

      if (res.data && res.data.success) {
        setShowCreateModal(false);
        setTitle('');
        setContent('');
        setTags('');
        fetchPosts();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit post.');
    } finally {
      setCreating(false);
    }
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/forum/like/${postId}`);
      if (res.data && res.data.success) {
        setPosts(prev => prev.map(p => {
          if (p._id === postId) {
            const isLiked = res.data.isLiked;
            const updatedLikes = isLiked 
              ? [...p.likes, user?.id] 
              : p.likes.filter((uid: string) => uid !== user?.id);
            return {
              ...p,
              likes: updatedLikes
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleExpandPost = async (postId: string) => {
    try {
      const res = await api.get(`/forum/details/${postId}`);
      if (res.data && res.data.success) {
        setActivePost(res.data.post);
      }
    } catch (err) {
      console.error('Failed to fetch thread detail:', err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !activePost) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/forum/comment/${activePost._id}`, {
        content: commentInput
      });

      if (res.data && res.data.success) {
        setCommentInput('');
        
        // Refresh active post comment panel
        setActivePost((prev: any) => ({
          ...prev,
          comments: res.data.comments
        }));

        // Refresh main listing comments count
        setPosts(prev => prev.map(p => {
          if (p._id === activePost._id) {
            return {
              ...p,
              commentsCount: res.data.comments.length
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatPostDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Community Forum Board</h1>
          <p className="text-emerald-100 text-xs md:text-sm mt-1 font-medium">Ask questions, share crop results, discuss weather alerts, and consult certified experts.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-white text-brand-800 hover:bg-brand-50 font-bold rounded-xl text-xs md:text-sm transition-all duration-150 flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          <Plus size={16} /> Create Thread
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Posts feed list (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20 bg-white dark:bg-dark-900 border rounded-3xl">
              <div className="w-8 h-8 border-4 border-t-transparent border-brand-500 rounded-full animate-spin"></div>
            </div>
          ) : posts.length > 0 ? (
            posts.map((item) => {
              const isLiked = item.likes.includes(user?.id);
              return (
                <div
                  key={item._id}
                  onClick={() => handleExpandPost(item._id)}
                  className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/40 rounded-3xl p-6 shadow-sm hover:shadow-md cursor-pointer text-left transition-all duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-brand-100 dark:bg-brand-900/50 rounded-full flex items-center justify-center font-bold text-brand-700 dark:text-brand-400 text-xs uppercase">
                        {item.author?.name?.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-gray-800 dark:text-dark-200">{item.author?.name}</h4>
                        <span className="text-[9px] px-1.5 py-0.5 bg-gray-150 dark:bg-dark-800 text-gray-505 dark:text-dark-400 font-bold rounded uppercase">
                          {item.author?.role}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-0.5">
                      <Calendar size={11} /> {formatPostDate(item.createdAt)}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-50 tracking-tight mt-4 line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-dark-400 mt-2 line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-4">
                      {item.tags.map((tag: string, tIdx: number) => (
                        <span key={tIdx} className="px-2 py-0.5 bg-gray-100 dark:bg-dark-800/60 text-gray-500 dark:text-dark-400 font-semibold rounded text-[10px] flex items-center gap-0.5">
                          <Tag size={9} /> #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions summary */}
                  <div className="border-t border-gray-50 dark:border-dark-850 mt-5 pt-3.5 flex items-center gap-6">
                    <button
                      onClick={(e) => handleLike(item._id, e)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                        isLiked 
                          ? 'text-red-500' 
                          : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
                      <span>{item.likes?.length || 0}</span>
                    </button>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                      <MessageCircle size={15} />
                      <span>{item.comments?.length || 0} Comments</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white dark:bg-dark-900 rounded-3xl p-12 text-center border">
              <HelpCircle size={48} className="text-gray-300 dark:text-dark-800 mx-auto mb-3" />
              <p className="font-bold text-sm text-gray-700 dark:text-dark-200">No community posts yet</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Be the first to ask a question! Click Create Thread above.</p>
            </div>
          )}
        </div>

        {/* Detailed Thread Comments Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-dark-900 rounded-3xl p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm min-h-[350px] sticky top-[90px]">
          {activePost ? (
            <div className="flex flex-col h-[600px] justify-between">
              {/* Post Content Header */}
              <div className="overflow-y-auto pr-1 flex-1 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-dark-850 pb-3 mb-2">
                  <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider">Active Discussion</span>
                  <button onClick={() => setActivePost(null)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-dark-200">✕ Close</button>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-gray-850 dark:text-dark-50 leading-tight">{activePost.title}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1 font-semibold">
                    <span>By {activePost.author?.name}</span>
                    <span>•</span>
                    <span>{formatPostDate(activePost.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-dark-300 leading-relaxed bg-gray-50 dark:bg-dark-850/40 p-3 rounded-2xl border border-gray-150/40 dark:border-dark-850 mt-3">
                    {activePost.content}
                  </p>
                </div>

                {/* Comments list logs */}
                <div className="border-t border-gray-100 dark:border-dark-850 pt-4 space-y-3">
                  <h4 className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-2">Replies Feed ({activePost.comments?.length || 0})</h4>
                  {activePost.comments && activePost.comments.length > 0 ? (
                    activePost.comments.map((comm: any, cIdx: number) => (
                      <div key={cIdx} className="text-xs bg-gray-50/50 dark:bg-dark-850/20 p-3 rounded-xl border border-gray-150/40 dark:border-dark-800/30">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-gray-700 dark:text-dark-200 uppercase">{comm.name}</span>
                          <span className="text-[9px] text-gray-400">{new Date(comm.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        <p className="text-gray-655 dark:text-dark-350 leading-relaxed">{comm.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-[11px] text-gray-450 py-6">No answers yet. Post a comment below to reply.</p>
                  )}
                </div>
              </div>

              {/* Submit comment input */}
              <form onSubmit={handleSubmitComment} className="border-t border-gray-50 dark:border-dark-850 pt-3 mt-3 flex gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Type your reply comment..."
                  className="custom-input text-xs"
                  disabled={submittingComment}
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentInput.trim()}
                  className="px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-100 dark:disabled:bg-dark-800 disabled:text-gray-400 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
                >
                  Reply
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 h-full">
              <MessageSquare size={36} className="text-gray-300 dark:text-dark-800 mb-2" />
              <p className="font-bold text-xs">No active thread selected</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Click on a forum card in the left list to review detailed responses or add comments.</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE POST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-fade-in text-left">
            <button
              onClick={() => { setShowCreateModal(false); setError(''); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-dark-100 font-extrabold text-lg p-2"
            >
              ✕
            </button>

            <h2 className="text-xl font-extrabold text-gray-800 dark:text-dark-50 tracking-tight mb-4">
              Create Forum Thread
            </h2>

            {error && (
              <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-955 border border-red-200/50 rounded-xl text-xs text-red-600">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1">Thread Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Help needed with whitefly infestation in cotton"
                  className="custom-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1">Question Description</label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide details about symptoms, field location, sowing dates..."
                  className="custom-input h-32 resize-none py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1">Category Tags (comma separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. cotton, pests, disease"
                  className="custom-input text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="btn-primary w-full py-3 mt-2"
              >
                {creating ? 'Submitting post...' : 'Publish Thread'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
