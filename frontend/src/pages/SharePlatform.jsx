import React, { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Heart, MessageCircle, Share, Image as ImageIcon, Send } from 'lucide-react';
import Modal from '../components/Modal';
import { postAPI } from '../api';

const SharePlatform = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', details: '' });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await postAPI.getAll();
            setPosts(response.data);
        } catch (err) {
            console.error("Error fetching posts:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            await postAPI.create({
                ...newPost,
                date: 'Just now',
                likes: 0,
                comments: 0
            });
            fetchPosts();
            setIsCreateModalOpen(false);
            setNewPost({ title: '', details: '' });
        } catch (err) {
            console.error("Error creating post:", err);
        }
    };

    const handleShare = (post) => {
        alert(`Sharing: ${post.title}`);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-10 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Share Platform</h1>
                    <p className="text-slate-500 mt-1">Share updates and resources with your student community.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Create Post
                </button>
            </div>

            {/* Create Post Input Trigger */}
            <div
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 cursor-pointer hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 group"
                onClick={() => setIsCreateModalOpen(true)}
            >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <ImageIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 text-slate-400 font-medium">
                    What's on your mind? Share an update...
                </div>
                <div className="btn-secondary rounded-full p-2">
                    <Send className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
            </div>

            {/* Feed */}
            <div className="space-y-8">
                {posts.map((post) => (
                    <div key={post._id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 scale-in hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">
                                    {post.title?.charAt(0) || 'P'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">{post.title}</h3>
                                    <p className="text-xs text-slate-400 font-medium flex items-center uppercase tracking-widest leading-none mt-1">
                                        <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2 opacity-50"></span>
                                        {post.date || 'Recently'}
                                    </p>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                                <MoreHorizontal className="w-6 h-6" />
                            </button>
                        </div>

                        <p className="text-slate-600 text-base leading-relaxed mb-6 whitespace-pre-line px-1">{post.details}</p>

                        {post.image && (
                            <div className="aspect-video bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden mb-6 flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-slate-200" />
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                            <div className="flex gap-4">
                                <button className="flex items-center gap-2 px-4 py-2 hover:bg-rose-50 text-slate-500 hover:text-rose-500 rounded-2xl transition-all group">
                                    <Heart className="w-5 h-5 group-active:scale-125 transition-transform" />
                                    <span className="text-sm font-bold">{post.likes || 0}</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 hover:bg-sky-50 text-slate-500 hover:text-sky-500 rounded-2xl transition-all">
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="text-sm font-bold">{post.comments || 0}</span>
                                </button>
                            </div>
                            <button
                                onClick={() => handleShare(post)}
                                className="flex items-center gap-2 px-6 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-2xl font-bold text-sm transition-all shadow-sm"
                            >
                                <Share className="w-4 h-4" />
                                Share
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Post">
                <form onSubmit={handleCreatePost} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Title</label>
                        <input
                            className="input-field"
                            placeholder="Post Title"
                            value={newPost.title}
                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Details</label>
                        <textarea
                            rows={4}
                            className="input-field resize-none py-4"
                            placeholder="Share something with the community..."
                            value={newPost.details}
                            onChange={(e) => setNewPost({ ...newPost, details: e.target.value })}
                            required
                        ></textarea>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                        <button type="button" className="p-3 bg-slate-50 text-slate-500 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                            <ImageIcon className="w-6 h-6" />
                        </button>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                            <button type="submit" className="btn-primary px-8">Post Now</button>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SharePlatform;
