'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  Image, 
  Settings, 
  Upload, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  Menu, 
  X, 
  Users, 
  BarChart3, 
  FileText, 
  Home,
  UserPlus,
  ChevronDown,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { ServiceModal } from '@/components/admin/ServiceModal';
import { ProjectModal } from '@/components/admin/ProjectModal';
import { BlogModal } from '@/components/admin/BlogModal';
import SEOTab from '@/components/admin/SEOTab';
import InternalLinksTab from '@/components/admin/InternalLinksTab';
import { Service } from '@/types/services';
import { Project } from '@/types/projects';
import { BlogPost, BlogCategory } from '@/types/blog';
import { useLanguage } from '@/contexts/LanguageContext';

interface BannerImage {
  _id: string;
  filename: string;
  contentType: string;
  metadata: {
    title: string;
    titleAr?: string;
    description: string;
    descriptionAr?: string;
    order: number;
    isActive: boolean;
    showTitle?: boolean;
    showDescription?: boolean;
    page?: string; // Which page this banner belongs to
  };
}

interface AdminUser {
  username: string;
  email: string;
  lastLogin?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [bannerImages, setBannerImages] = useState<BannerImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pagebanners' | 'services' | 'projects' | 'blog' | 'seo' | 'internal-links'>('pagebanners');
  const [activePageTab, setActivePageTab] = useState<'home' | 'about' | 'services' | 'work' | 'blog' | 'contact'>('home');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [projectCategories, setProjectCategories] = useState([]);
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);

  // Auto logout after inactivity
  useEffect(() => {
    const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
    let timer: ReturnType<typeof setTimeout> | null = null;

    const logoutAndRedirect = () => {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      router.push('/admin');
    };

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(logoutAndRedirect, INACTIVITY_TIMEOUT_MS);
    };

    // Start timer
    resetTimer();
    // Reset on user activity
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    return () => {
      if (timer) clearTimeout(timer);
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [router]);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    if (!token || !user) {
      router.push('/admin');
      return;
    }

    try {
      setAdminUser(JSON.parse(user));
      fetchBannerImages();
    } catch (error) {
      console.error('Error parsing admin user:', error);
      router.push('/admin');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const fetchBannerImages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/gridfs/images', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin');
        return;
      }
      
      const result = await response.json();
      if (result.success) {
        setBannerImages(result.data);
      }
    } catch (error) {
      console.error('Error fetching banner images:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin');
  };

  const handleUpload = async (formData: FormData) => {
    setUploading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      // If replacing an existing image, use PUT; otherwise POST to create
      const method = formData.has('_id') ? 'PUT' : 'POST';
      const response = await fetch('/api/gridfs/images', {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin');
        return;
      }

      const result = await response.json();

      if (result.success) {
        setMessage(formData.has('_id') ? t('admin.dashboard.messages.imageUpdated') || 'Image updated successfully' : t('admin.dashboard.messages.imageAdded'));
        setShowUploadForm(false);
        fetchBannerImages();
      } else {
        setMessage(result.error || t('admin.dashboard.messages.operationFailed'));
      }
    } catch (error) {
      setMessage(t('admin.dashboard.messages.operationFailed'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.dashboard.messages.deleteConfirm'))) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/gridfs/images?_id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin');
        return;
      }

      const result = await response.json();
      if (result.success) {
        setMessage(t('admin.dashboard.messages.imageDeleted'));
        fetchBannerImages();
      } else {
        setMessage(result.error || t('admin.dashboard.messages.deleteFailed'));
      }
    } catch (error) {
      setMessage(t('admin.dashboard.messages.deleteFailed'));
    }
  };

  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    order: 1,
    isActive: true,
    showTitle: true,
    showDescription: true
  });

  // Modal functions
  const openAddModal = () => {
    setModalType('add');
    setShowModal(true);
  };

  const openEditModal = (image: BannerImage) => {
    setEditingImage(image._id);
    setEditFormData({
      title: image.metadata.title,
      titleAr: image.metadata.titleAr || '',
      description: image.metadata.description,
      descriptionAr: image.metadata.descriptionAr || '',
      order: image.metadata.order,
      isActive: image.metadata.isActive,
      showTitle: image.metadata.showTitle ?? true,
      showDescription: image.metadata.showDescription ?? true
    });
    setModalType('edit');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setEditingImage(null);
  };

  const openServiceModal = (service?: Service) => {
    setEditingService(service || null);
    setShowServiceModal(true);
  };

  const closeServiceModal = () => {
    setShowServiceModal(false);
    setEditingService(null);
  };

  const openProjectModal = (project?: Project) => {
    setEditingProject(project || null);
    setShowProjectModal(true);
  };

  const closeProjectModal = () => {
    setShowProjectModal(false);
    setEditingProject(null);
  };

  const openBlogModal = (post?: BlogPost) => {
    setEditingBlogPost(post || null);
    setShowBlogModal(true);
  };

  const closeBlogModal = () => {
    setShowBlogModal(false);
    setEditingBlogPost(null);
  };

  const handleServiceSave = async (serviceData: Service) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingService ? '/api/admin/services' : '/api/admin/services';
      const method = editingService ? 'PUT' : 'POST';
      
      const payload = editingService 
        ? { _id: editingService._id, ...serviceData }
        : serviceData;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage(editingService ? 'Service updated successfully' : 'Service created successfully');
        closeServiceModal();
        // Refresh services list in ServicesTab
        window.dispatchEvent(new CustomEvent('refreshServices'));
      } else {
        setMessage(result.error || 'Failed to save service');
      }
    } catch (error) {
      setMessage('Failed to save service');
    }
  };

  const handleProjectSave = async (projectData: Project) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingProject ? '/api/admin/projects' : '/api/admin/projects';
      const method = editingProject ? 'PUT' : 'POST';
      
      const payload = editingProject 
        ? { _id: editingProject._id, ...projectData }
        : projectData;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage(editingProject ? 'Project updated successfully' : 'Project created successfully');
        closeProjectModal();
        window.dispatchEvent(new CustomEvent('refreshProjects'));
      } else {
        setMessage(result.error || 'Failed to save project');
      }
    } catch (error) {
      setMessage('Failed to save project');
    }
  };

  const handleBlogSave = async (blogData: BlogPost) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingBlogPost ? '/api/admin/blog/posts' : '/api/admin/blog/posts';
      const method = editingBlogPost ? 'PUT' : 'POST';
      
      const payload = editingBlogPost 
        ? { _id: editingBlogPost._id, wasPublished: editingBlogPost.isPublished, ...blogData }
        : blogData;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage(editingBlogPost ? 'Blog post updated successfully' : 'Blog post created successfully');
        closeBlogModal();
        window.dispatchEvent(new CustomEvent('refreshBlogPosts'));
      } else {
        setMessage(result.error || 'Failed to save blog post');
      }
    } catch (error) {
      setMessage('Failed to save blog post');
    }
  };

  const toggleImageStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/gridfs/images', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _id: id,
          isActive: !currentStatus
        })
      });
      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin');
        return;
      }

      const result = await response.json();
      if (result.success) {
        setMessage('Image status updated successfully');
        fetchBannerImages();
      } else {
        setMessage(result.error || 'Failed to update image status');
      }
    } catch (error) {
      setMessage('Failed to update image status');
    }
  };

  const saveEdit = async (id: string, data?: typeof editFormData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/gridfs/images', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _id: id,
          ...(data ?? editFormData)
        })
      });
      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin');
        return;
      }

      const result = await response.json();
      if (result.success) {
        setMessage('Image updated successfully');
        closeModal();
        fetchBannerImages();
      } else {
        setMessage(result.error || 'Failed to update image');
      }
    } catch (error) {
      setMessage('Failed to update image');
    }
  };

  const getBannerImagesForPage = (page: string) => {
    const pageImages = bannerImages
      .filter(img => (img.metadata.page === page) || (!img.metadata.page && page === 'home'))
      .sort((a, b) => (a.metadata?.order || 0) - (b.metadata?.order || 0));

    // Show all banner images for all pages
    return pageImages;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="ml-2 text-lg font-semibold text-slate-900">Admin Panel</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar - Full Height on PC */}
        <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:h-screen border-r border-slate-700/50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-20 px-8 border-b border-slate-700/60 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg ring-1 ring-amber-300/20">
                <span className="text-white font-bold text-lg">AF</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Admin Panel</h2>
                <p className="text-xs text-slate-400 font-medium">Ebdaa Falcon</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200 hover:scale-105"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User Profile Section */}
          <div className="p-8 border-b border-slate-700/60 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg ring-1 ring-blue-400/20">
                <span className="text-white font-semibold text-lg">
                    {adminUser?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate tracking-tight">{adminUser?.username}</p>
                <p className="text-xs text-slate-400 truncate font-medium">{adminUser?.email}</p>
                <div className="flex items-center mt-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-2 shadow-sm ring-1 ring-green-300/30"></div>
                  <span className="text-xs text-green-400 font-medium">Online</span>
                </div>
                </div>
              </div>
            </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="space-y-1 px-6">
              {[
                { key: 'pagebanners', label: 'Page Banners', icon: Image, color: 'from-purple-500 to-purple-600' },
                { key: 'services', label: 'Services', icon: Settings, color: 'from-blue-500 to-blue-600' },
                { key: 'projects', label: 'Projects', icon: FileText, color: 'from-green-500 to-green-600' },
                { key: 'blog', label: 'Blog', icon: FileText, color: 'from-orange-500 to-orange-600' },
                { key: 'seo', label: 'SEO', icon: Settings, color: 'from-emerald-500 to-emerald-600' },
                { key: 'internal-links', label: 'Internal Links', icon: Settings, color: 'from-violet-500 to-violet-600' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg shadow-slate-900/20 transform scale-[1.02]'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:transform hover:scale-[1.01] hover:shadow-md'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
                    activeTab === tab.key 
                      ? `bg-gradient-to-br ${tab.color} shadow-lg ring-1 ring-white/10` 
                      : 'bg-slate-600 group-hover:bg-slate-500 group-hover:shadow-md'
                  }`}>
                    <tab.icon className="h-5 w-5" />
                  </div>
                  <span className="flex-1 text-left font-medium tracking-tight">{tab.label}</span>
                  {activeTab === tab.key && (
                    <div className="h-2 w-2 bg-white rounded-full shadow-sm"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-slate-700/60 backdrop-blur-sm">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 group hover:shadow-md hover:scale-[1.01]"
            >
              <LogOut className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
              <span className="font-medium tracking-tight">Logout</span>
            </button>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0 overflow-y-auto">
          {/* Desktop Header */}
          <div className="hidden lg:block bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200/60">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
          <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                    {activeTab === 'pagebanners' && 'Page Banners'}
                    {activeTab === 'services' && 'Services Management'}
                    {activeTab === 'projects' && 'Projects Management'}
                    {activeTab === 'blog' && 'Blog Management'}
                    {activeTab === 'seo' && 'SEO Management'}
                    {activeTab === 'internal-links' && 'Internal Links Management'}
                    {activeTab === 'users' && 'User Management'}
                    {activeTab === 'content' && 'Content Management'}
                    {activeTab === 'analytics' && 'Analytics'}
                    {activeTab === 'settings' && 'Settings'}
            </h1>
                  <p className="text-slate-600 font-medium">
                    {activeTab === 'pagebanners' && 'Manage banner images for different pages'}
                    {activeTab === 'services' && 'Manage services and service categories'}
                    {activeTab === 'projects' && 'Manage projects and project portfolios'}
                    {activeTab === 'blog' && 'Manage blog posts and content'}
                    {activeTab === 'seo' && 'Manage SEO settings for all pages'}
                    {activeTab === 'internal-links' && 'Manage internal links and site navigation'}
                    {activeTab === 'users' && 'Manage user accounts and permissions'}
                    {activeTab === 'content' && 'Manage website content and pages'}
                    {activeTab === 'analytics' && 'View website analytics and reports'}
                    {activeTab === 'settings' && 'Configure system settings'}
            </p>
          </div>
                <div className="flex items-center space-x-4">
                  {activeTab === 'pagebanners' && (
                    <button
                      onClick={openAddModal}
                      className="flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 border border-transparent rounded-xl hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ring-1 ring-purple-500/20"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Banner
                    </button>
                  )}
                  {activeTab === 'services' && (
            <button
                      onClick={() => openServiceModal()}
                      className="flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ring-1 ring-blue-500/20"
            >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Service
            </button>
                  )}
                  {activeTab === 'projects' && (
                    <button
                      onClick={() => openProjectModal()}
                      className="flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 border border-transparent rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ring-1 ring-green-500/20"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Project
                    </button>
                  )}
                  {activeTab === 'blog' && (
                    <button
                      onClick={() => openBlogModal()}
                      className="flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-700 border border-transparent rounded-xl hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ring-1 ring-orange-500/20"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Blog Post
                    </button>
                  )}
          </div>
        </div>
        </div>
      </div>

          {/* Content Area */}
          <div className="p-6 lg:p-8">
        {/* Message */}
        {message && (
              <div className={`p-4 rounded-xl mb-8 shadow-lg ${
            message.includes('Error') || message.includes('Failed') 
                  ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200' 
                  : 'bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200'
              }`}>
                <div className="flex items-center">
                  {message.includes('Error') || message.includes('Failed') ? (
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className="ml-3">
                    <p className="text-sm font-medium">{message}</p>
                  </div>
                </div>
          </div>
        )}

            {/* Tab Content */}
            {activeTab === 'pagebanners' && (
              <PageBannersTab
                activePageTab={activePageTab}
                setActivePageTab={setActivePageTab}
                bannerImages={bannerImages}
                getBannerImagesForPage={getBannerImagesForPage}
                openAddModal={openAddModal}
                openEditModal={openEditModal}
                handleDelete={handleDelete}
                toggleImageStatus={toggleImageStatus}
              />
            )}

            {activeTab === 'services' && (
              <ServicesTab 
                onEditService={openServiceModal} 
                categories={serviceCategories}
                setCategories={setServiceCategories}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsTab 
                onEditProject={openProjectModal} 
                categories={projectCategories}
                setCategories={setProjectCategories}
              />
            )}

            {activeTab === 'blog' && (
              <BlogTab 
                onEditBlogPost={openBlogModal} 
                categories={blogCategories}
                setCategories={setBlogCategories}
              />
            )}

            {activeTab === 'seo' && (
              <SEOTab />
            )}

            {activeTab === 'internal-links' && (
              <InternalLinksTab />
            )}

            {activeTab === 'users' && (
              <UsersTab />
            )}

            {activeTab === 'content' && (
              <ContentTab />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsTab />
            )}

            {activeTab === 'settings' && (
              <SettingsTab />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <BannerModal
          type={modalType!}
          page={activePageTab}
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          onUpload={handleUpload}
          onSave={saveEdit}
          onCancel={closeModal}
          uploading={uploading}
          editingImageId={editingImage}
          t={t}
        />
      )}

      {showServiceModal && (
        <ServiceModal
          isOpen={showServiceModal}
          onClose={closeServiceModal}
          onSave={handleServiceSave}
          service={editingService}
          categories={serviceCategories}
          loading={uploading}
        />
      )}

      {showProjectModal && (
        <ProjectModal
          isOpen={showProjectModal}
          onClose={closeProjectModal}
          onSave={handleProjectSave}
          project={editingProject}
          categories={projectCategories}
          loading={uploading}
        />
      )}

      {showBlogModal && (
        <BlogModal
          isOpen={showBlogModal}
          onClose={closeBlogModal}
          onSave={handleBlogSave}
          post={editingBlogPost}
          categories={blogCategories}
          loading={uploading}
        />
      )}
    </div>
  );
}

// Page Banners Tab Component
interface PageBannersTabProps {
  activePageTab: string;
  setActivePageTab: (tab: 'home' | 'about' | 'services' | 'work' | 'blog' | 'contact') => void;
  bannerImages: BannerImage[];
  getBannerImagesForPage: (page: string) => BannerImage[];
  openAddModal: () => void;
  openEditModal: (image: BannerImage) => void;
  handleDelete: (id: string) => void;
  toggleImageStatus: (id: string, currentStatus: boolean) => void;
}

function PageBannersTab({
  activePageTab,
  setActivePageTab,
  bannerImages,
  getBannerImagesForPage,
  openAddModal,
  openEditModal,
  handleDelete,
  toggleImageStatus
}: PageBannersTabProps) {
  return (
    <div className="space-y-8">
        {/* Page Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden ring-1 ring-slate-100/50">
        <div className="px-6 py-4 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-white backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Page Selection</h3>
          <p className="text-sm text-slate-600 font-medium">Choose which page to manage banners for</p>
        </div>
        <div className="p-6">
          <nav className="flex space-x-2 overflow-x-auto">
            {[
              { key: 'home', label: 'Home Page', color: 'from-blue-500 to-blue-600' },
              { key: 'about', label: 'About Us', color: 'from-green-500 to-green-600' },
              { key: 'services', label: 'Services', color: 'from-purple-500 to-purple-600' },
              { key: 'work', label: 'Our Work', color: 'from-orange-500 to-orange-600' },
              { key: 'blog', label: 'Blog', color: 'from-pink-500 to-pink-600' },
              { key: 'contact', label: 'Contact Us', color: 'from-teal-500 to-teal-600' }
              ].map((tab) => (
                <button
                  key={tab.key}
                onClick={() => setActivePageTab(tab.key as any)}
                className={`px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-200 ring-1 ${
                  activePageTab === tab.key
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-slate-900/20 transform scale-105 ring-white/20`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 hover:shadow-md hover:scale-102 ring-slate-200/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

      {/* Mobile Add Button */}
      <div className="lg:hidden">
        <button
          onClick={openAddModal}
          className="w-full flex items-center justify-center px-6 py-4 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 border border-transparent rounded-xl hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ring-1 ring-purple-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Banner Image
        </button>
      </div>

        {/* Banner Images Grid */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden ring-1 ring-slate-100/50">
        <div className="px-6 py-4 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-white backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
            Banner Images for {activePageTab.charAt(0).toUpperCase() + activePageTab.slice(1)} Page
            </h2>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                Manage banner images for the {activePageTab} page
              </p>
            </div>
            <button
            onClick={openAddModal}
              className="hidden lg:flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 border border-transparent rounded-xl hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ring-1 ring-purple-500/20"
            >
            <Plus className="w-4 h-4 mr-2" />
              Add Banner Image
            </button>
          </div>
        </div>
        <div className="p-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {getBannerImagesForPage(activePageTab).map((image) => (
              <div key={image._id} className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 hover:transform hover:scale-105 ring-1 ring-slate-100/50 group">
                <div className="aspect-video bg-gradient-to-br from-slate-100/80 to-slate-200/80 flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
                  <img
                    src={`/api/gridfs/images/${image._id}`}
                    alt={image.metadata.title}
                    className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ring-1 ${
                      image.metadata.isActive
                        ? 'bg-green-100/90 text-green-800 border border-green-200/60 ring-green-300/30'
                        : 'bg-red-100/90 text-red-800 border border-red-200/60 ring-red-300/30'
                    }`}>
                      {image.metadata.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-2 text-base line-clamp-2 tracking-tight">
                        {image.metadata.title}
                      </h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2 font-medium">
                        {image.metadata.description}
                      </p>
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <span className="bg-slate-100/80 px-3 py-1 rounded-full font-medium ring-1 ring-slate-200/50">Order: {image.metadata.order}</span>
                      </div>
                <div className="flex flex-wrap gap-2">
                        <button
                    onClick={() => openEditModal(image)}
                      className="flex items-center px-3 py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 rounded-lg transition-all duration-200 hover:shadow-sm hover:scale-105 ring-1 ring-blue-200/30"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => toggleImageStatus(image._id, image.metadata.isActive)}
                      className={`flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 hover:shadow-sm hover:scale-105 ring-1 ${
                            image.metadata.isActive
                          ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50/80 ring-orange-200/30'
                          : 'text-green-600 hover:text-green-700 hover:bg-green-50/80 ring-green-200/30'
                          }`}
                        >
                          {image.metadata.isActive ? (
                            <EyeOff className="w-3 h-3 mr-1" />
                          ) : (
                            <Eye className="w-3 h-3 mr-1" />
                          )}
                          {image.metadata.isActive ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => handleDelete(image._id)}
                      className="flex items-center px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50/80 rounded-lg transition-all duration-200 hover:shadow-sm hover:scale-105 ring-1 ring-red-200/30"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </button>
                      </div>
                </div>
              </div>
            ))}
          </div>

        {getBannerImagesForPage(activePageTab).length === 0 && (
            <div className="text-center py-16">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-slate-100/80 to-slate-200/80 rounded-full flex items-center justify-center mb-6 shadow-lg ring-1 ring-slate-200/50 backdrop-blur-sm">
                <Image className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">No banner images</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto font-medium">
                Get started by uploading a new banner image for the {activePageTab} page.
              </p>
                <button
                onClick={openAddModal}
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 hover:scale-105 transition-all duration-200 ring-1 ring-purple-500/20"
                >
                <Plus className="w-4 h-4 mr-2" />
                  Add Banner Image
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Services Tab Component
interface ServicesTabProps {
  onEditService: (service: Service) => void;
  categories: any[];
  setCategories: (categories: any[]) => void;
}

function ServicesTab({ onEditService, categories, setCategories }: ServicesTabProps) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchServices();
    };
    
    window.addEventListener('refreshServices', handleRefresh);
    return () => window.removeEventListener('refreshServices', handleRefresh);
  }, []);

  const fetchServices = async () => {
    try {
      console.log('[ServicesTab] Fetching services...');
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/services', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('[ServicesTab] Response status:', response.status);
      const result = await response.json();
      console.log('[ServicesTab] Response result:', result);
      if (result.success) {
        console.log(`[ServicesTab] Successfully loaded ${result.data.length} services`);
        setServices(result.data);
      } else {
        console.error('[ServicesTab] Failed to load services:', result.error, result.details);
      }
    } catch (error) {
      console.error('[ServicesTab] Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/service-categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter(service => service.category === activeCategory);

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/services?id=${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        // Remove the service from the local state
        setServices(services.filter(service => service._id !== serviceId));
        // Trigger refresh for other components
        window.dispatchEvent(new Event('refreshServices'));
      } else {
        alert(`Failed to delete service: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-xl font-semibold text-slate-900">Service Categories</h2>
          <p className="text-sm text-slate-600 mt-1">Filter services by category</p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveCategory('all')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeCategory === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-800'
            }`}
          >
            All Services
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => setActiveCategory(category._id)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeCategory === category._id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              {category.name.en}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
            Services ({filteredServices.length})
          </h2>
              <p className="text-sm text-slate-600 mt-1">Manage your service offerings</p>
            </div>
          <button
            onClick={() => onEditService()}
              className="flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </button>
        </div>
        </div>
        <div className="p-6">

        {filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6">
                <Settings className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No services found</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Get started by adding your first service to showcase your offerings.
              </p>
              <button
                onClick={() => onEditService()}
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
                <div key={service._id} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
                  <img
                    src={service.imageUrl}
                    alt={service.title.en}
                      className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        service.isActive
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-2 text-base line-clamp-2">
                    {service.title.en}
                  </h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {service.summary.en}
                  </p>
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                      <span className="bg-slate-100 px-3 py-1 rounded-full">Order: {service.order}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onEditService(service)}
                        className="flex items-center px-3 py-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => {/* TODO: Toggle status */}}
                        className={`flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                        service.isActive
                            ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                            : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {service.isActive ? (
                        <EyeOff className="w-3 h-3 mr-1" />
                      ) : (
                        <Eye className="w-3 h-3 mr-1" />
                      )}
                      {service.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => handleDeleteService(service._id)}
                        className="flex items-center px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

// Projects Tab Component
interface ProjectsTabProps {
  onEditProject: (project: Project) => void;
  categories: any[];
  setCategories: (categories: any[]) => void;
}

function ProjectsTab({ onEditProject, categories, setCategories }: ProjectsTabProps) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchProjects();
    };
    
    window.addEventListener('refreshProjects', handleRefresh);
    return () => window.removeEventListener('refreshProjects', handleRefresh);
  }, []);

  const fetchProjects = async () => {
    try {
      console.log('[ProjectsTab] Fetching projects...');
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('[ProjectsTab] Response status:', response.status);
      const result = await response.json();
      console.log('[ProjectsTab] Response result:', result);
      if (result.success) {
        console.log(`[ProjectsTab] Successfully loaded ${result.data.length} projects`);
        setProjects(result.data);
      } else {
        console.error('[ProjectsTab] Failed to load projects:', result.error, result.details);
      }
    } catch (error) {
      console.error('[ProjectsTab] Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/project-categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/projects?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        fetchProjects();
      } else {
        alert(result.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const filteredProjects = activeCategory === 'all' 
    ? projects 
    : projects.filter((project: any) => project.category === activeCategory);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div>
              <h2 className="text-xl font-semibold text-slate-900">Projects Management</h2>
              <p className="text-sm text-slate-600 mt-1">Manage your project portfolio</p>
          </div>
          <button
            onClick={() => onEditProject()}
              className="flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 border border-transparent rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg hover:shadow-xl transition-all duration-200"
          >
              <Plus className="w-4 h-4 mr-2" />
            Add Project
          </button>
        </div>
      </div>

      {/* Filters */}
        <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Filter by category:</span>
          </div>
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map((category: any) => (
              <option key={category._id} value={category._id}>
                {category.name.en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects List */}
      <div className="p-6">
        {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-slate-400" />
            </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects found</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">Get started by adding your first project to showcase your work.</p>
            <button
              onClick={() => onEditProject()}
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
            >
                <Plus className="w-4 h-4 mr-2" />
              Add Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: any) => (
                <div key={project._id} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.title.en}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Image className="w-8 h-8" />
                    </div>
                  )}
                    <div className="absolute top-3 right-3 flex gap-2">
                    {project.isFeatured && (
                        <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">Featured</span>
                    )}
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      project.isActive 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {project.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-2 text-base line-clamp-2">
                    {project.title.en}
                  </h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {project.summary.en}
                  </p>
                  <div className="flex items-center justify-between">
                      <span className="bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-500">
                      Order: {project.order}
                    </span>
                      <div className="flex gap-2">
                      <button
                        onClick={() => onEditProject(project)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project._id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

// Blog Tab Component
interface BlogTabProps {
  onEditBlogPost: (post: BlogPost) => void;
  categories: BlogCategory[];
  setCategories: (categories: BlogCategory[]) => void;
}

function BlogTab({ onEditBlogPost, categories, setCategories }: BlogTabProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [publishedFilter, setPublishedFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchPosts();
    };
    
    window.addEventListener('refreshBlogPosts', handleRefresh);
    return () => window.removeEventListener('refreshBlogPosts', handleRefresh);
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/blog/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setPosts(result.data.posts);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/blog/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching blog categories:', error);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/blog/posts?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        fetchPosts();
      } else {
        alert(result.error || 'Failed to delete blog post');
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      alert('Failed to delete blog post');
    }
  };

  const filteredPosts = posts.filter(post => {
    if (activeCategory !== 'all' && post.category !== activeCategory) return false;
    if (publishedFilter === 'published' && !post.isPublished) return false;
    if (publishedFilter === 'draft' && post.isPublished) return false;
    return true;
  });

  if (loading) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-xl font-semibold text-slate-900">Blog Posts</h2>
          <p className="text-sm text-slate-600 mt-1">Manage your blog content</p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Filter by category:</span>
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name.en}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Status:</span>
              <select
                value={publishedFilter}
                onChange={(e) => setPublishedFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Posts</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Posts ({filteredPosts.length})
              </h2>
              <p className="text-sm text-slate-600 mt-1">Manage your blog posts</p>
            </div>
            <button
              onClick={() => onEditBlogPost()}
              className="flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-orange-700 border border-transparent rounded-xl hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Blog Post
            </button>
          </div>
        </div>
        <div className="p-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No blog posts found</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">Get started by creating your first blog post.</p>
              <button
                onClick={() => onEditBlogPost()}
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-medium rounded-xl text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Blog Post
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div key={post._id} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title.en}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Image className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      {post.isFeatured && (
                        <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">Featured</span>
                      )}
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        post.isPublished 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-orange-100 text-orange-800 border border-orange-200'
                      }`}>
                        {post.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-2 text-base line-clamp-2">
                      {post.title.en}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {post.excerpt.en}
                    </p>
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                      <span className="bg-slate-100 px-3 py-1 rounded-full">{post.readTime} min read</span>
                      <span className="bg-slate-100 px-3 py-1 rounded-full">{post.viewCount} views</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEditBlogPost(post)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id!)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-1">
                        {post.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Other Tab Components
function UsersTab() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <div className="p-8 text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6">
            <Users className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">User Management</h3>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">User management features will be implemented here.</p>
          <button className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-medium rounded-xl text-white bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}

function ContentTab() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-xl font-semibold text-slate-900">Content Management</h2>
          <p className="text-sm text-slate-600 mt-1">Manage website content and pages</p>
        </div>
        <div className="p-8 text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6">
            <FileText className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Content Management</h3>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">Content management features will be implemented here.</p>
          <button className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-xl font-semibold text-slate-900">Analytics</h2>
          <p className="text-sm text-slate-600 mt-1">View website analytics and reports</p>
        </div>
        <div className="p-8 text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6">
            <BarChart3 className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Analytics Dashboard</h3>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">Analytics dashboard will be implemented here.</p>
          <button className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-medium rounded-xl text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
          <p className="text-sm text-slate-600 mt-1">Configure system settings</p>
        </div>
        <div className="p-8 text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6">
            <Settings className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">System Settings</h3>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">System settings will be implemented here.</p>
          <button className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-medium rounded-xl text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}

// Banner Modal Component
interface BannerModalProps {
  type: 'add' | 'edit';
  page: string;
  editFormData: {
    title: string;
    titleAr?: string;
    description: string;
    descriptionAr?: string;
    order: number;
    isActive: boolean;
    showTitle?: boolean;
    showDescription?: boolean;
  };
  setEditFormData: (data: any) => void;
  onUpload: (formData: FormData) => Promise<void>;
  onSave: (id: string, data?: any) => Promise<void>;
  onCancel: () => void;
  uploading: boolean;
  editingImageId: string | null;
  t: (key: string) => string;
}

function BannerModal({
  type,
  page,
  editFormData,
  setEditFormData,
  onUpload,
  onSave,
  onCancel,
  uploading,
  editingImageId,
  t
}: BannerModalProps) {
  const [formData, setFormData] = useState({
    file: null as File | null,
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    order: 1,
    isActive: true,
    showTitle: true,
    showDescription: true
  });
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (type === 'edit') {
      setFormData({
        file: null,
        title: editFormData.title,
        titleAr: editFormData.titleAr || '',
        description: editFormData.description,
        descriptionAr: editFormData.descriptionAr || '',
        order: editFormData.order,
        isActive: editFormData.isActive,
        showTitle: editFormData.showTitle ?? true,
        showDescription: editFormData.showDescription ?? true
      });
    } else {
      setFormData({
        file: null,
        title: '',
        titleAr: '',
        description: '',
        descriptionAr: '',
        order: 1,
        isActive: true,
        showTitle: true,
        showDescription: true
      });
    }
  }, [type, editFormData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file,
        title: file.name.split('.')[0] // Auto-fill title from filename
      }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({
        ...prev,
        file,
        title: prev.title || file.name.split('.')[0]
      }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enforce distinct Arabic fields
    if (!formData.titleAr?.trim() || !formData.descriptionAr?.trim()) {
      alert('Please provide Arabic title and description.');
      return;
    }

    if (type === 'add') {
    if (!formData.file) return;

    const data = new FormData();
    data.append('file', formData.file);
    data.append('title', formData.title);
    data.append('titleAr', formData.titleAr || '');
    data.append('description', formData.description);
    data.append('descriptionAr', formData.descriptionAr || '');
    data.append('order', formData.order.toString());
    data.append('isActive', formData.isActive.toString());
    data.append('showTitle', (formData.showTitle ?? true).toString());
    data.append('showDescription', (formData.showDescription ?? true).toString());
    data.append('page', page);

    await onUpload(data);
    } else {
      // If a new file is provided in edit mode, update existing image by sending _id
      if (formData.file) {
        const data = new FormData();
        data.append('_id', editingImageId || '');
        data.append('file', formData.file);
        data.append('title', formData.title);
        data.append('titleAr', formData.titleAr || '');
        data.append('description', formData.description);
        data.append('descriptionAr', formData.descriptionAr || '');
        data.append('order', formData.order.toString());
        data.append('isActive', formData.isActive.toString());
        data.append('showTitle', (formData.showTitle ?? true).toString());
        data.append('showDescription', (formData.showDescription ?? true).toString());
        data.append('page', page);
        await onUpload(data);
      } else {
        // Metadata-only update
        setEditFormData(formData);
        if (editingImageId) {
          await onSave(editingImageId, formData);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md transition-opacity" onClick={onCancel}></div>
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.25)] ring-1 ring-slate-200/60 transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full backdrop-blur-sm">
          <form onSubmit={handleSubmit}>
            <div className="bg-white/95 backdrop-blur-sm px-6 pt-6 pb-4 sm:p-8 sm:pb-6">
              <div className="sm:flex sm:items-start sm:gap-6">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl leading-6 font-bold text-slate-900 tracking-tight">
                      {type === 'add' ? 'Add Banner Image' : 'Edit Banner Image'}
                    </h3>
                    {type === 'edit' && (
                      <button
                        type="button"
                        onClick={() => setShowImageEditor(v => !v)}
                        className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-white/80 border border-slate-200/60 hover:bg-slate-50/80 hover:text-slate-900 hover:scale-105 transition-all shadow-sm ring-1 ring-slate-200/30"
                        title="Edit Image"
                      >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                        Edit Image
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    {type === 'add' && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-tight">Image File</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full p-4 border-2 border-slate-200/60 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100/50 focus:border-blue-300/60 transition-all shadow-sm hover:shadow-md ring-1 ring-slate-100/50"
                          required
                        />
                      </div>
                    )}

                    {type === 'edit' && (
                      <div className="space-y-3">
                        <div className="flex items-start gap-4">
                          <div className="w-40 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner">
                            <img
                              src={previewUrl || (editingImageId ? `/api/gridfs/images/${editingImageId}` : '')}
                              alt="Current banner"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {showImageEditor && (
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`mt-2 flex flex-col items-center justify-center border-2 rounded-2xl p-6 transition-all cursor-pointer ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-dashed border-slate-300 hover:border-slate-400 bg-white'}`}
                          >
                            <input
                              id="edit-image-file"
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            <label htmlFor="edit-image-file" className="text-center">
                              <div className="text-slate-900 font-medium">Drag & drop to replace</div>
                              <div className="text-slate-500 text-sm mt-1">or click to browse</div>
                            </label>
                            {previewUrl && (
                              <div className="mt-3 text-xs text-slate-600">Selected: {formData.file?.name}</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-tight">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-4 border-2 border-slate-200/60 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100/50 focus:border-blue-300/60 transition-all shadow-sm hover:shadow-md ring-1 ring-slate-100/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-tight">
              Arabic Title
            </label>
            <input
              type="text"
              value={formData.titleAr}
              onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
            className="w-full p-4 border-2 border-slate-200/60 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100/50 focus:border-blue-300/60 transition-all shadow-sm hover:shadow-md ring-1 ring-slate-100/50"
            required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-tight">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-4 border-2 border-slate-200/60 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100/50 focus:border-blue-300/60 transition-all shadow-sm hover:shadow-md ring-1 ring-slate-100/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-tight">
              Arabic Description
            </label>
            <input
              type="text"
              value={formData.descriptionAr}
              onChange={(e) => setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))}
            className="w-full p-4 border-2 border-slate-200/60 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100/50 focus:border-blue-300/60 transition-all shadow-sm hover:shadow-md ring-1 ring-slate-100/50"
            required
            />
          </div>

          <div className="flex items-center space-x-6">
            <label className="inline-flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.showTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, showTitle: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <span className="text-sm font-semibold text-slate-700">Show Title</span>
            </label>
            <label className="inline-flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.showDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, showDescription: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <span className="text-sm font-semibold text-slate-700">Show Description</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-tight">
              Display Order
            </label>
            <input
              type="number"
              min="1"
              value={formData.order}
              onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
            className="w-full p-4 border-2 border-slate-200/60 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100/50 focus:border-blue-300/60 transition-all shadow-sm hover:shadow-md ring-1 ring-slate-100/50"
              required
            />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
          />
          <label htmlFor="isActive" className="ml-3 block text-sm font-semibold text-slate-900">
            Active (visible on website)
          </label>
                    </div>
                  </div>
                </div>
              </div>
        </div>
        
            <div className="bg-slate-50/80 backdrop-blur-sm px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse border-t border-slate-200/60">
          <button
            type="submit"
                disabled={uploading || (type === 'add' && !formData.file)}
                className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-lg hover:shadow-xl px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-sm font-bold text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all ring-1 ring-blue-500/20"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {type === 'add' ? 'Uploading...' : (formData.file ? 'Replacing...' : 'Saving...')}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                    {type === 'add' ? 'Upload Image' : (formData.file ? 'Replace Image' : 'Save Changes')}
              </>
            )}
          </button>
              <button
                type="button"
                onClick={onCancel}
                className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-300/60 shadow-sm px-6 py-3 bg-white/80 text-sm font-semibold text-slate-700 hover:bg-slate-50/80 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto transition-all ring-1 ring-slate-200/30"
              >
                Cancel
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
}
