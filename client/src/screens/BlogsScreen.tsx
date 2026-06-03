import React, { useRef, useState, useEffect } from 'react';
import {
  Animated,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  ImageStyle,
  ActivityIndicator,
} from 'react-native';
import {
  Search,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Tag,
  RefreshCw,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import Footer from '../components/RealEstate/Footer';
import { blogService } from '../services/api';

const FALLBACK_BLOG_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

const categories = [
  'All',
  'Real Estate',
  'Investment',
  'Market Analysis',
  'Legal',
  'Home Buying',
  'Home Selling',
  'Property News',
  'Construction',
  'Finance',
];

interface Blog {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  date?: string;
  created_at?: string;
  read_time: string;
  category: string;
  tags: string[];
  image_url: string;
  featured: boolean;
}

const resolveBlogImage = (blog: any) => {
  const image = String(
    blog?.image_url || blog?.imageUrl || blog?.image || '',
  ).trim();
  return image || FALLBACK_BLOG_IMAGE;
};

const normalizeBlog = (blog: any): Blog => ({
  id: Number(blog.id),
  title: blog.title || 'Untitled Blog',
  excerpt: blog.excerpt || blog.content || '',
  content: blog.content,
  author: blog.author || 'Admin',
  date: blog.date,
  created_at: blog.created_at,
  read_time: blog.read_time || blog.readTime || '5 min read',
  category: blog.category || 'Real Estate',
  tags: Array.isArray(blog.tags) ? blog.tags : [],
  image_url: resolveBlogImage(blog),
  featured: Boolean(blog.featured),
});

const BlogsScreen = ({
  onScroll,
  onReadBlog,
  onTabChange,
}: {
  onScroll?: (event: any) => void;
  onReadBlog?: (blog: Blog, blogs: Blog[]) => void;
  onTabChange?: (tab: string) => void;
}) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const refreshSpin = useRef(new Animated.Value(0)).current;

  const spinRefreshIcon = () => {
    refreshSpin.setValue(0);
    Animated.timing(refreshSpin, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    }).start();
  };

  const refreshRotate = refreshSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // ─── Fetch blogs from API ───────────────────────────────────────────
  const fetchBlogs = async () => {
    spinRefreshIcon();
    setLoading(true);
    setError(null);
    const trimmedSearch = searchQuery.trim();
    const isFilteredSearch = Boolean(trimmedSearch) || activeCategory !== 'All';
    try {
      const response = await blogService.getAll({
        category: activeCategory !== 'All' ? activeCategory : undefined,
        search: trimmedSearch || undefined,
      });
      const json = response.data;

      if (json.success) {
        const fetchedBlogs = Array.isArray(json.data)
          ? json.data.map(normalizeBlog)
          : [];
        setBlogs(fetchedBlogs);
      } else {
        setBlogs([]);
        setError(
          isFilteredSearch ? null : json.message || 'Failed to load blogs',
        );
      }
    } catch {
      setBlogs([]);
      setError(isFilteredSearch ? null : 'Unable to load blogs right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  // Debounced search — fires 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBlogs();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const featuredBlog = blogs.find(b => b.featured) ?? blogs[0];

  const handleBlogImageError = (id: number) => {
    setBlogs(current =>
      current.map(blog =>
        blog.id === id ? { ...blog, image_url: FALLBACK_BLOG_IMAGE } : blog,
      ),
    );
  };

  // ─── Helper: format date ────────────────────────────────────────────
  const formatDate = (blog: Blog) => {
    if (blog.date) return blog.date;
    if (blog.created_at) {
      const d = new Date(blog.created_at);
      return `${String(d.getDate()).padStart(2, '0')}/${String(
        d.getMonth() + 1,
      ).padStart(2, '0')}/${d.getFullYear()}`;
    }
    return '';
  };

  return (
    <ScrollView
      style={styles.container}
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO SECTION */}
      <LinearGradient
        colors={['#0B3856', '#0C3854', '#1A4D6D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Real Estate Insights & News</Text>
          <Text style={styles.heroDescription}>
            Stay informed with the latest market trends, expert tips, and
            property updates. From buying and selling guidance to investment
            insights — everything you need in one place.
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* FEATURED BLOG */}
        {!loading && featuredBlog && (
          <TouchableOpacity
            style={styles.featuredCard}
            activeOpacity={0.9}
            onPress={() => onReadBlog?.(featuredBlog, blogs)}
          >
            <Image
              source={{ uri: featuredBlog.image_url }}
              style={styles.featuredImage as ImageStyle}
              onError={() => handleBlogImageError(featuredBlog.id)}
            />
            <View style={styles.featuredOverlay} />
            <View style={styles.featuredContent}>
              <View style={styles.tagRow}>
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>Featured</Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {featuredBlog.category}
                  </Text>
                </View>
              </View>
              <Text style={styles.featuredTitle}>{featuredBlog.title}</Text>
              <Text style={styles.featuredExcerpt} numberOfLines={2}>
                {featuredBlog.excerpt}
              </Text>
              <View style={styles.featuredMeta}>
                <View style={styles.metaItem}>
                  <User size={14} color="#DBEAFE" />
                  <Text style={styles.metaText}>{featuredBlog.author}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Calendar size={14} color="#DBEAFE" />
                  <Text style={styles.metaText}>
                    {formatDate(featuredBlog)}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* SEARCH & FILTER */}
        <View style={styles.filterSection}>
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                placeholder="Search articles..."
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchBlogs}>
              <Animated.View style={{ transform: [{ rotate: refreshRotate }] }}>
                <RefreshCw size={18} color="#4B5563" />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContent}
          >
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryTab,
                  activeCategory === cat && styles.activeCategoryTab,
                ]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    activeCategory === cat && styles.activeCategoryTabText,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* LOADING / ERROR / BLOG LIST */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#E6761D" />
            <Text style={styles.loadingText}>Loading blogs...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchBlogs}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : blogs.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>No blogs found</Text>
            <Text style={styles.emptyText}>
              {searchQuery.trim()
                ? `No blog is available for "${searchQuery.trim()}".`
                : activeCategory !== 'All'
                ? `No blog is available in ${activeCategory}.`
                : 'No blogs are available right now.'}
            </Text>
          </View>
        ) : (
          <View style={styles.blogGrid}>
            {blogs.map(blog => (
              <TouchableOpacity
                key={blog.id}
                style={styles.blogCard}
                activeOpacity={0.9}
                onPress={() => onReadBlog?.(blog, blogs)}
              >
                <View style={styles.cardImageContainer}>
                  <Image
                    source={{ uri: blog.image_url }}
                    style={styles.cardImage as ImageStyle}
                    onError={() => handleBlogImageError(blog.id)}
                  />
                  <View style={styles.cardCategoryBadge}>
                    <Text style={styles.cardCategoryText}>{blog.category}</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.cardMeta}>
                    <View style={styles.metaItem}>
                      <Clock size={14} color="#6B7280" />
                      <Text style={styles.cardMetaText}>{blog.read_time}</Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {blog.title}
                  </Text>
                  <Text style={styles.cardExcerpt} numberOfLines={3}>
                    {blog.excerpt}
                  </Text>

                  <View style={styles.cardTags}>
                    {(blog.tags ?? []).slice(0, 2).map((tag, i) => (
                      <View key={i} style={styles.tagBadge}>
                        <Tag size={10} color="#6B7280" />
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.authorSection}>
                      <View style={styles.authorAvatar}>
                        <Text style={styles.avatarText}>
                          {blog.author
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.authorName}>{blog.author}</Text>
                        <Text style={styles.authorDate}>
                          {formatDate(blog)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.readButton}
                      onPress={() => onReadBlog?.(blog, blogs)}
                    >
                      <Text style={styles.readButtonText}>Read</Text>
                      <ArrowRight size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <Footer onTabChange={onTabChange} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  hero: { paddingTop: 100, paddingBottom: 60, paddingHorizontal: 20 },
  heroContent: { alignItems: 'center', maxWidth: 600, alignSelf: 'center' },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 14,
    color: '#DBEAFE',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: { paddingHorizontal: 16, marginTop: -30 },
  featuredCard: {
    width: '100%',
    height: 350,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    marginBottom: 30,
  },
  featuredImage: { ...StyleSheet.absoluteFill, opacity: 0.8 },
  featuredOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  featuredContent: { flex: 1, justifyContent: 'flex-end', padding: 24 },
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  featuredBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  featuredBadgeText: { color: 'white', fontSize: 12, fontWeight: '700' },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryBadgeText: { color: 'white', fontSize: 12, fontWeight: '600' },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    lineHeight: 28,
  },
  featuredExcerpt: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 16,
    lineHeight: 20,
  },
  featuredMeta: { flexDirection: 'row', gap: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#DBEAFE', fontSize: 12, fontWeight: '500' },
  filterSection: { marginBottom: 24 },
  searchRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: '#FB923C',
    shadowColor: '#E6761D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1F2937' },
  refreshButton: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FB923C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E6761D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryScroll: { marginHorizontal: -16 },
  categoryContent: { paddingHorizontal: 16, gap: 8 },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FB923C',
  },
  activeCategoryTab: { backgroundColor: '#E6761D', borderColor: '#E6761D' },
  categoryTabText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  activeCategoryTabText: { color: 'white' },
  centered: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { color: '#6B7280', marginTop: 12, fontSize: 14 },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#E6761D',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: 'white', fontWeight: '700', fontSize: 14 },
  blogGrid: { gap: 20, marginBottom: 40 },
  blogCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FB923C',
    elevation: 4,
    shadowColor: '#E6761D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
  },
  cardImageContainer: { height: 200, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  cardCategoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  cardCategoryText: { color: 'white', fontSize: 10, fontWeight: '700' },
  cardBody: { padding: 16 },
  cardMeta: { marginBottom: 8 },
  cardMetaText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  cardExcerpt: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardTags: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: { fontSize: 10, color: '#4B5563', fontWeight: '500' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 10, fontWeight: '800', color: '#000' },
  authorName: { fontSize: 13, fontWeight: '600', color: '#111827' },
  authorDate: { fontSize: 11, color: '#6B7280' },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6761D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  readButtonText: { color: 'white', fontSize: 12, fontWeight: '700' },
});

export default BlogsScreen;
