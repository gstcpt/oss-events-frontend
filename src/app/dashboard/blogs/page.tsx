"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { getAllCompanies, getCompanyById } from "@/lib/api/companies";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import DisplayIcon from "@/components/ui/DisplayIcon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Textarea from "@/components/ui/textarea";
import { Blog, BlogComment, BlogRating, BlogMedia } from "@/types/blogs";
import {
    getBlogs,
    getBlogDetails,
    createBlog,
    updateBlog,
    deleteBlog,
    createBlogComment,
    createBlogRating,
    deleteBlogMedia,
} from "@/lib/api/blogs";
import { deleteComment, patchComment } from "@/lib/api/comments";
import { getAllUsers } from "@/lib/api/user";
import { Star, Image as ImageIcon, UploadCloud, X, Plus, Trash2, MessageCircle, Eye, Share2, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

export default function BlogsPage() {
    const t = useTranslations('Dashboard.blogs');
    const { user } = useAuth();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [currentBlog, setCurrentBlog] = useState<Partial<Blog> | null>(null);
    const [blogTags, setBlogTags] = useState<string[]>([]);
    const [blogCategories, setBlogCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [tableColumns, setColumns] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteOpen] = useState(false);
    const [showBlogDetails, setShowBlogDetails] = useState(false);
    const [newComment, setNewComment] = useState<string>("");
    const [userRating, setUserRating] = useState<number>(0);
    const [companies, setCompanies] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [isCommentDeleteModalOpen, setIsCommentDeleteModalOpen] = useState(false);
    const [commentAction, setCommentAction] = useState<{ id: number; type: 'soft' | 'hard' | 'restore' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isRootUser = Number(user?.role_id) === 1;

    const getImageSrc = (image: string | undefined): string => {
        if (!image) return "/images/default.jpg";
        if (image.startsWith("data:image/")) {
            try {
                const base64Part = image.split(",")[1];
                if (base64Part && atob(base64Part)) {
                    return image;
                }
            } catch (e) {
                toast.warning(t('invalidBase64'));
            }
            return "/images/default.jpg";
        }
        if (image.startsWith("http") || image.startsWith("/")) {
            return image;
        }
        return `/${image}`;
    };
    const getAuthorName = (userId: number): string => {
        if (!users || users.length === 0) return `User ID: ${userId}`;
        const author = users.find((u) => u.id === userId);
        if (author) {
            return `${author.firstname || ""} ${author.lastname || ""}`.trim() || `User ${userId}`;
        }
        return `User ${userId}`;
    };
    const handleOpenModal = () => {
        const initialState: Partial<Blog> = {
            title: "",
            content: "",
            image: "",
            date: new Date().toISOString().split("T")[0],
            blogTags: [],
            blogCategories: [],
        };
        if (user?.role_id === 2 && user?.company_id) {
            initialState.company_id = user.company_id;
        }
        setCurrentBlog(initialState);
        setBlogTags([]);
        setBlogCategories([]);
        setMediaFiles([]);
        setPreviewImages([]);
        setIsOpen(true);
    };
    const handleEditBlog = (blog: Blog) => {
        setCurrentBlog(blog);
        setBlogTags(blog.blogTags?.map((tag) => tag.tag_title) || []);
        setBlogCategories(blog.blogCategories?.map((category) => category.category_title) || []);
        setMediaFiles([]);
        setPreviewImages([]);
        setIsOpen(true);
    };
    const handleSave = async () => {
        if (!currentBlog) return;
        try {
            // Destructure to remove fields that shouldn't be sent to the API
            const {
                blogTags: _,
                blogCategories: __,
                blog_media: ___,
                users: ____,
                companies: _____,
                stats: ______,
                ...restOfCurrentBlog
            } = currentBlog;

            const blogData = {
                ...restOfCurrentBlog,
                tags: blogTags,
                categories: blogCategories,
            };
            if (currentBlog.id) {
                await updateBlog(currentBlog.id, blogData as Partial<Blog>, mediaFiles);
                toast.success(t('blogUpdated'));
            } else {
                await createBlog(blogData as Omit<Blog, "id">, mediaFiles);
                toast.success(t('blogCreated'));
            }
            const fetchedBlogs = await getBlogs();
            setBlogs(fetchedBlogs);
            setIsOpen(false);
            setCurrentBlog(null);
            setMediaFiles([]);
            setPreviewImages([]);
        } catch (error) {
            toast.error(t('errorSaving'));
        }
    };
    const handleDelete = async () => {
        try {
            if (currentBlog?.id) {
                await deleteBlog(currentBlog.id);
                toast.success(t('blogDeleted'));
                setBlogs(blogs.filter((b) => b.id !== currentBlog.id));
                setIsDeleteOpen(false);
                setCurrentBlog(null);
            }
        } catch (error) {
            toast.error(t('errorDeleting'));
        }
    };
    const handleViewBlogDetails = async (blog: Blog) => {
        try {
            const blogDetails = await getBlogDetails(blog.id);
            setCurrentBlog(blogDetails);
            setUserRating(blogDetails.user_rating || 0);
            setShowBlogDetails(true);
        } catch (error) {
            toast.error(t('errorLoading'));
        }
    };
    const handleAddComment = async () => {
        if (!newComment.trim() || !currentBlog?.id || !user) return;
        try {
            const commentData = { comment: newComment };
            await createBlogComment(currentBlog.id, commentData);
            const blogDetails = await getBlogDetails(currentBlog.id);
            setCurrentBlog(blogDetails);
            setNewComment("");
            toast.success(t('commentAdded'));
        } catch (error) {
            toast.error(t('errorAddingComment'));
        }
    };
    const handleRateBlog = async (ratingValue: number) => {
        if (!currentBlog?.id || !user) return;
        try {
            const ratingData = { rating: ratingValue };
            await createBlogRating(currentBlog.id, ratingData);
            const blogDetails = await getBlogDetails(currentBlog.id);
            setCurrentBlog(blogDetails);
            setUserRating(blogDetails.user_rating || 0);
            toast.success(t('ratingSubmitted'));
        } catch (error) {
            toast.error(t('errorSubmittingRating'));
        }
    };

    const handleMediaFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validFiles: File[] = [];
            const previews: string[] = [];

            files.forEach((file) => {
                // Check if file is an image or video
                if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
                    validFiles.push(file);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        previews.push(reader.result as string);
                        if (previews.length === validFiles.length) {
                            setPreviewImages((prev) => [...prev, ...previews]);
                        }
                    };
                    reader.readAsDataURL(file);
                } else {
                    toast.warning(t('invalidFileType'));
                }
            });

            setMediaFiles((prev) => [...prev, ...validFiles]);
        }
    };

    const removeMediaFile = (index: number) => {
        setMediaFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingMedia = async (mediaId: number) => {
        if (!currentBlog?.id) return;

        try {
            await deleteBlogMedia(mediaId);

            const updatedBlog = {
                ...currentBlog,
                blog_media: currentBlog.blog_media?.filter((media) => media.id !== mediaId) || [],
            };
            setCurrentBlog(updatedBlog as Partial<Blog>);
            toast.success(t('mediaRemoved'));
        } catch (error) {
            toast.error(t('errorRemovingMedia'));
        }
    };

    /** Admin/Root: soft-delete — backend sets is_deleted=true via PATCH */
    const handleSoftDeleteComment = (commentId: number) => {
        setCommentAction({ id: commentId, type: 'soft' });
        setIsCommentDeleteModalOpen(true);
    };

    /** Root: hard-delete — backend permanently removes row via DELETE */
    const handleHardDeleteComment = (commentId: number) => {
        setCommentAction({ id: commentId, type: 'hard' });
        setIsCommentDeleteModalOpen(true);
    };

    /** Root: restore — backend sets is_deleted=false via PATCH */
    const handleRestoreComment = (commentId: number) => {
        setCommentAction({ id: commentId, type: 'restore' });
        setIsCommentDeleteModalOpen(true);
    };

    const confirmCommentAction = async () => {
        if (!commentAction) return;
        try {
            if (commentAction.type === 'hard') {
                await deleteComment(commentAction.id);
            } else if (commentAction.type === 'soft') {
                await patchComment(commentAction.id, { isDeleted: true });
            } else if (commentAction.type === 'restore') {
                await patchComment(commentAction.id, { isDeleted: false });
            }

            if (currentBlog?.id) {
                const blogDetails = await getBlogDetails(currentBlog.id);
                setCurrentBlog(blogDetails);
            }

            const messages = {
                hard: t('commentPermanentlyDeleted'),
                soft: t('commentDeletedSuccessfully'),
                restore: t('commentRestoredSuccessfully')
            };
            toast.success(messages[commentAction.type]);
            setIsCommentDeleteModalOpen(false);
            setCommentAction(null);
        } catch (error) {
            toast.error("Failed to process comment action");
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };
    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const fetchedBlogs = await getBlogs();
                setBlogs(fetchedBlogs);
            } catch (error) {
                toast.error(t('errorLoading'));
            } finally {
                setLoading(false);
            }
        };
        const fetchCompanies = async () => {
            try {
                const data = await getAllCompanies();
                setCompanies(data);
            } catch (error) {
                toast.error(t('errorLoadingCompanies') + ": " + error);
            }
        };

        const fetchUsers = async () => {
            try {
                const userData = await getAllUsers();
                setUsers(userData);
            } catch (error) {
                toast.error(t('errorLoadingUsers') + ": " + error);
            }
        };
        fetchBlogs();
        fetchUsers();
        if (user?.role_id === 1) {
            fetchCompanies();
        }
    }, [user]);
    const handleOpenDeleteModal = (blog: Blog) => {
        setCurrentBlog(blog);
        setIsDeleteOpen(true);
    };
    const columns = [
        { header: t('id'), accessor: "id" },
        {
            header: t('image'),
            accessor: "image",
            cell: (row: any) => (
                <div className="w-12 h-12 relative">
                    <Image src={getImageSrc(row.image)} alt={row.title} fill sizes="48px" className="object-cover rounded-md" />
                </div>
            ),
        },
        { header: t('title_field'), accessor: "title" },
        { header: t('content'), accessor: "content", cell: (row: any) => <span className="truncate max-w-xs block">{row.content}</span> },
        { header: t('author'), accessor: "user_id", cell: (row: any) => <span>{getAuthorName(row.user_id)}</span> },
        ...(isRootUser ? [{
            header: "Company",
            accessor: "companies",
            cell: (l: any) => <span className="">{l.companies?.title || "System Core"}</span>
        }] : []),
        { header: t('date'), accessor: "date", cell: (row: any) => <span className="whitespace-nowrap">{row.date ? new Date(row.date).toLocaleDateString() : "N/A"}</span>, className: "w-32" },
    ];
    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Button
                    key={i}
                    onClick={() => handleRateBlog(i)}
                    className={`text-xl bg-transparent hover:bg-gray-200 ${i <= rating ? "text-yellow-500" : "text-gray-300"}`}
                >
                    <Star className="w-5 h-5" />
                </Button>
            );
        }
        return <div className="flex">{stars}</div>;
    };
    return (
        <div className="space-y-8">
            <div className="card">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{t('blogsManagement')}</h2>
                    <Button onClick={handleOpenModal} className="addNewBtn">
                        <i className="fa fa-plus mr-2"></i>{t('addNewBlog')}
                    </Button>
                </div>
                <div className="p-6">
                    <DataTable
                        columns={columns}
                        data={blogs as any[]}
                        onEdit={handleEditBlog}
                        onDelete={handleOpenDeleteModal}
                        onCustomAction={handleViewBlogDetails}
                        customActionLabel={t('view')}
                        iconCustomAction="fas fa-eye text-xs"
                        showEdit={true}
                        showDelete={true}
                        showSettings={true}
                        defaultSort={{ key: "id", direction: "descending" }}
                    />
                </div>
            </div>
            {isOpen && (
                <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={currentBlog?.id ? t('editBlog') : t('addNewBlog')}>
                    {loading ? (
                        <div className="text-center py-8">Loading blog...</div>
                    ) : (
                        <>
                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="title">{t('title_field')}</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        type="text"
                                        className="w-full"
                                        defaultValue={currentBlog?.title || ""}
                                        onChange={(e) => {
                                            setCurrentBlog({ ...currentBlog, title: e.target.value });
                                        }}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="content">{t('content')}</Label>
                                    <Textarea
                                        id="content"
                                        name="content"
                                        className="w-full"
                                        rows={4}
                                        defaultValue={currentBlog?.content || ""}
                                        onChange={(e) => {
                                            setCurrentBlog({ ...currentBlog, content: e.target.value });
                                        }}
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block font-medium">{t('coverImage')}</Label>
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:border-blue-400 transition-all cursor-pointer group bg-gray-50/30"
                                        onClick={() => document.getElementById('imageFile')?.click()}
                                    >
                                        <Input
                                            id="imageFile"
                                            name="imageFile"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    const file = e.target.files[0];
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setCurrentBlog({ ...currentBlog, image: reader.result as string });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        {currentBlog?.image ? (
                                            <div className="relative w-full h-56 group-hover:opacity-90 transition-opacity">
                                                <Image
                                                    src={getImageSrc(currentBlog.image)}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover rounded-lg shadow-sm"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                    <span className="text-white font-medium flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                                                        <ImageIcon className="w-4 h-4" /> {t('changeImage')}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 py-4">
                                                <div className="bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                                    <UploadCloud className="w-8 h-8 text-blue-500" />
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="font-semibold text-gray-700 block">{t('clickToUpload')}</span>
                                                    <span className="text-xs text-gray-400 block">{t('uploadHint')}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <Label className="font-medium">{t('galleryMedia')}</Label>
                                        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">{mediaFiles.length + (currentBlog?.blog_media?.length || 0)} files</span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {/* Upload Button Card */}
                                        <div
                                            onClick={triggerFileInput}
                                            className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group relative overflow-hidden"
                                        >
                                            <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform z-10">
                                                <Plus className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <span className="text-xs font-bold text-blue-700 z-10">{t('addMedia')}</span>
                                        </div>

                                        <Input
                                            ref={fileInputRef}
                                            id="mediaFiles"
                                            name="mediaFiles"
                                            type="file"
                                            accept="image/*,video/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleMediaFilesChange}
                                        />

                                        {/* Existing Media */}
                                        {currentBlog?.blog_media?.map((media, index) => (
                                            <div key={`existing-${index}`} className="relative group rounded-xl overflow-hidden border bg-gray-50 aspect-square shadow-sm hover:shadow-md transition-all">
                                                {media.media_type?.startsWith("video/") ? (
                                                    <video src={media.file} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Image src={media.file} alt="Media" fill className="object-cover" />
                                                )}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center z-20">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveExistingMedia(media.id)}
                                                        className="bg-white text-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 shadow-lg hover:bg-red-50"
                                                        title="Remove file"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm z-10">
                                                    Saved
                                                </span>
                                            </div>
                                        ))}

                                        {/* New Previews */}
                                        {previewImages.map((preview, index) => (
                                            <div key={`new-${index}`} className="relative group rounded-xl overflow-hidden border bg-gray-50 aspect-square shadow-sm hover:shadow-md transition-all">
                                                {preview.startsWith("data:video/") ? (
                                                    <video src={preview} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Image src={preview} alt="Preview" fill className="object-cover" />
                                                )}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center z-20">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMediaFile(index)}
                                                        className="bg-white text-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 shadow-lg hover:bg-red-50"
                                                        title="Remove file"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <span className="absolute bottom-2 right-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm z-10">
                                                    New
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="date">{t('date')}</Label>
                                    <Input
                                        id="date"
                                        name="date"
                                        type="date"
                                        className="w-full"
                                        defaultValue={currentBlog?.date && !isNaN(new Date(currentBlog.date).getTime()) ? new Date(currentBlog.date).toISOString().split("T")[0] : ""}
                                        onChange={(e) => {
                                            setCurrentBlog({ ...currentBlog, date: e.target.value });
                                        }}
                                    />
                                </div>

                                {/* Modern Tag Input */}
                                <div>
                                    <Label>{t('tags')}</Label>
                                    <div className="flex flex-wrap gap-2 p-2 border rounded-md focus-within:ring-2 focus-within:ring-blue-500 bg-white min-h-[42px]">
                                        {blogTags.map((tag, index) => (
                                            <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => setBlogTags(blogTags.filter((_, i) => i !== index))}
                                                    className="hover:text-blue-600 focus:outline-none"
                                                >
                                                    Ã—
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            className="flex-1 outline-none min-w-[120px] bg-transparent text-sm"
                                            placeholder={blogTags.length === 0 ? t('tagPlaceholder') : ""}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ',') {
                                                    e.preventDefault();
                                                    const val = e.currentTarget.value.trim();
                                                    if (val && !blogTags.includes(val)) {
                                                        setBlogTags([...blogTags, val]);
                                                        e.currentTarget.value = '';
                                                    }
                                                } else if (e.key === 'Backspace' && e.currentTarget.value === '' && blogTags.length > 0) {
                                                    setBlogTags(blogTags.slice(0, -1));
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{t('tagHint')}</p>
                                </div>

                                {/* Modern Category Input */}
                                <div>
                                    <Label>{t('categories')}</Label>
                                    <div className="flex flex-wrap gap-2 p-2 border rounded-md focus-within:ring-2 focus-within:ring-green-500 bg-white min-h-[42px]">
                                        {blogCategories.map((cat, index) => (
                                            <span key={index} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                                                {cat}
                                                <button
                                                    type="button"
                                                    onClick={() => setBlogCategories(blogCategories.filter((_, i) => i !== index))}
                                                    className="hover:text-green-600 focus:outline-none"
                                                >
                                                    Ã—
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            className="flex-1 outline-none min-w-[120px] bg-transparent text-sm"
                                            placeholder={blogCategories.length === 0 ? t('categoryPlaceholder') : ""}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ',') {
                                                    e.preventDefault();
                                                    const val = e.currentTarget.value.trim();
                                                    if (val && !blogCategories.includes(val)) {
                                                        setBlogCategories([...blogCategories, val]);
                                                        e.currentTarget.value = '';
                                                    }
                                                } else if (e.key === 'Backspace' && e.currentTarget.value === '' && blogCategories.length > 0) {
                                                    setBlogCategories(blogCategories.slice(0, -1));
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{t('categoryHint')}</p>
                                </div>

                                {user?.role_id === 1 && (
                                    <div>
                                        <Label htmlFor="company_id">{t('company')}</Label>
                                        <select
                                            id="company_id"
                                            name="company_id"
                                            className="w-full border rounded-md px-3 py-2"
                                            defaultValue={currentBlog?.company_id || ""}
                                            onChange={(e) => {
                                                setCurrentBlog({ ...currentBlog, company_id: Number(e.target.value) });
                                            }}
                                        >
                                            <option value="">{t('selectCompany')}</option>
                                            {companies.map((company) => (
                                                <option key={company.id} value={company.id}>
                                                    {company.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {user?.role_id === 2 && (
                                    <Input
                                        type="hidden"
                                        id="company_id"
                                        name="company_id"
                                        value={user?.company_id || ""}
                                        onChange={(e) => {
                                            setCurrentBlog({ ...currentBlog, company_id: Number(e.target.value) });
                                        }}
                                    />
                                )}
                            </div>
                            <div className="mt-6 flex justify-end space-x-4">
                                <Button type="button" onClick={handleSave} className={currentBlog?.id ? "updateBtn" : "createBtn"}>{currentBlog?.id ? t('update') : t('create')}</Button>
                                <Button type="button" className="closeBtn" onClick={() => { setIsOpen(false); setCurrentBlog(null); }}>{t('close')}</Button>
                            </div>
                        </>
                    )}
                </Modal>
            )
            }
            {
                isDeleteModalOpen && (
                    <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteOpen(false)} title={t('deleteBlog')}>
                        <p className="text-gray-700">{t('confirmDeleteBlog')} <strong>{currentBlog?.title}</strong>?</p>
                        <p className="text-sm text-gray-600">{t('deleteWarning')}</p>
                        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                            <Button onClick={handleDelete} className="deleteBtn">{t('delete')}</Button>
                            <Button onClick={() => setIsDeleteOpen(false)} className="closeBtn">{t('close')}</Button>
                        </div>
                    </Modal>
                )
            }
            {
                showBlogDetails && currentBlog && (
                    <Modal isOpen={showBlogDetails} onClose={() => setShowBlogDetails(false)} title={t('blogDetails')} widthClass="max-w-7xl">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            {/* Left Column: Content */}
                            <div className="md:col-span-8 space-y-6">
                                {/* 1. Title */}
                                <h3 className="text-3xl font-bold text-gray-900">{currentBlog.title}</h3>

                                {/* 2. Principal Image */}
                                {currentBlog.image && (
                                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-md w-full">
                                        <Image
                                            src={getImageSrc(currentBlog.image)}
                                            alt={currentBlog.title || ""}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}

                                {/* 3. Author and Date */}
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">{t('author')}:</span>
                                        {currentBlog.user_id ? getAuthorName(Number(currentBlog.user_id)) : "N/A"}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">{t('date')}:</span>
                                        {currentBlog.date ? new Date(currentBlog.date).toLocaleDateString() : "N/A"}
                                    </div>
                                </div>

                                {/* 4. Description */}
                                <div className="prose max-w-none text-gray-700">
                                    <p className="whitespace-pre-line">{currentBlog.content}</p>
                                </div>

                                {/* 5. Gallery Images */}
                                {currentBlog.blog_media && currentBlog.blog_media.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-lg">{t('galleryMedia')}</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {currentBlog.blog_media.map((media, index) => (
                                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-white shadow-sm hover:opacity-90 transition-opacity">
                                                    {media.media_type?.startsWith("video/") ? (
                                                        <video src={media.file} className="w-full h-full object-cover" controls />
                                                    ) : (
                                                        <Image
                                                            src={media.file}
                                                            alt={`Media ${index}`}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Sidebar (Stats & Comments) */}
                            <div className="md:col-span-4 space-y-6">
                                {/* 6. Stats Row */}
                                <div className="bg-gray-50 rounded-xl space-y-3 p-4">
                                    <h4 className="font-bold text-gray-900 mb-2">{t('statistics')}</h4>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between" title={t('views')}>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Eye className="w-5 h-5 text-blue-500" />
                                                <span>{t('views')}</span>
                                            </div>
                                            <span className="font-semibold">{currentBlog.stats?.views ?? 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between" title={t('shares')}>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Share2 className="w-5 h-5 text-cyan-500" />
                                                <span>{t('shares')}</span>
                                            </div>
                                            <span className="font-semibold">{currentBlog.stats?.shares ?? 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between" title={t('likes')}>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <ThumbsUp className="w-5 h-5 text-green-500" />
                                                <span>{t('likes')}</span>
                                            </div>
                                            <span className="font-semibold">{currentBlog.stats?.likes ?? 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between" title={t('dislikes')}>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <ThumbsDown className="w-5 h-5 text-red-500" />
                                                <span>{t('dislikes')}</span>
                                            </div>
                                            <span className="font-semibold">{currentBlog.stats?.dislikes ?? 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 mt-1" title={t('rating')}>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                                <span>{t('rating')}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-semibold block">{currentBlog.stats?.ratings?.average?.toFixed(1) || "0.0"}</span>
                                                <span className="text-xs text-gray-400">({currentBlog.stats?.ratings?.count ?? 0} {t('reviews')})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 7. Comments Counter and Comments List */}
                                <div className="rounded-xl flex flex-col h-[500px] sticky to bg-white shadow-sm">
                                    <div className="bg-gray-50 px-4 py-3 flex justify-between items-center rounded-t-xl">
                                        <h4 className="font-bold flex items-center gap-2">
                                            <MessageCircle className="w-5 h-5" />
                                            {t('comments')} ({currentBlog.comments?.length || 0})
                                        </h4>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-6">
                                        {currentBlog.comments && currentBlog.comments.length > 0 ? (
                                            currentBlog.comments.map((comment: any) => (
                                                <div key={comment.id} className="group flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-600">
                                                        {comment.user?.firstname?.[0] || 'U'}
                                                    </div>
                                                    <div className={`flex-1 rounded-2xl rounded-tl-none p-3 relative hover:bg-gray-100 transition-colors ${comment.isDeleted ? 'bg-red-50' : 'bg-gray-50'}`}>
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="font-semibold text-sm flex items-center gap-2">
                                                                {comment.user
                                                                    ? `${comment.user.firstname} ${comment.user.lastname}`
                                                                    : `User ${comment.userId}`}
                                                                {comment.isDeleted && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded tracking-wide font-bold">{t('deleted')}</span>}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 mr-20">
                                                                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'N/A'}
                                                            </span>
                                                        </div>
                                                        <p className={`text-sm break-words ${comment.isDeleted ? 'text-gray-500 italic' : 'text-gray-700'}`}>{comment.content}</p>

                                                        {/* Comment Actions — role-based */}
                                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {/* Root only: restore */}
                                                            {user?.role === 'Root' && comment.isDeleted && (
                                                                <button
                                                                    onClick={() => handleRestoreComment(comment.id)}
                                                                    className="text-gray-400 hover:text-green-600 p-1 rounded transition-colors"
                                                                    title={t('restoreComment')}
                                                                >
                                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                            {/* Admin: soft-delete (hide from public) */}
                                                            {(user?.role === 'Admin' || user?.role === 'Root') && !comment.isDeleted && (
                                                                <button
                                                                    onClick={() => handleSoftDeleteComment(comment.id)}
                                                                    className="text-gray-400 hover:text-primary/50 p-1 rounded transition-colors"
                                                                    title={t('deleteComment')}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                            {/* Root only: hard-delete (permanent) */}
                                                            {user?.role === 'Root' && (
                                                                <button
                                                                    onClick={() => handleHardDeleteComment(comment.id)}
                                                                    className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                                                                    title={t('deletePermanently')}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                                <div className="bg-gray-50 rounded-full mb-2">
                                                    <MessageCircle className="w-6 h-6" />
                                                </div>
                                                <p>{t('noComments')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                            <Button type="button" onClick={() => { setCurrentBlog(null); setShowBlogDetails(false); }} className="closeBtn">{t('close')}</Button>
                        </div>
                    </Modal>
                )
            }

            {isCommentDeleteModalOpen && (
                <Modal isOpen={isCommentDeleteModalOpen} onClose={() => setIsCommentDeleteModalOpen(false)} title={commentAction?.type === 'hard' ? t('deletePermanently') : commentAction?.type === 'restore' ? t('restoreComment') : t('delete')}>

                    <p className="text-gray-600">
                        {commentAction?.type === 'hard'
                            ? t('confirmHardDeleteComment')
                            : commentAction?.type === 'restore'
                                ? t('confirmRestoreComment')
                                : t('confirmSoftDeleteComment')}
                    </p>
                    <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                        <Button onClick={confirmCommentAction} className={commentAction?.type === 'hard' ? "deleteBtn" : commentAction?.type === 'restore' ? "createBtn" : "updateBtn"}>{commentAction?.type === 'hard' ? t('deletePermanently') : commentAction?.type === 'restore' ? t('restore') : t('delete')}</Button>
                        <Button onClick={() => setIsCommentDeleteModalOpen(false)} className="closeBtn">{t('close')}</Button>
                    </div>
                </Modal>
            )}
        </div >
    );
}
