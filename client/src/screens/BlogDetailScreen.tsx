import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Share as NativeShare,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Calendar,
  Heart,
  MessageSquare,
  Share as ShareIcon,
  Tag,
  User,
} from 'lucide-react-native';
import Footer from '../components/RealEstate/Footer';
import { blogService, contactService } from '../services/api';

const FALLBACK_BLOG_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

const likedBlogIds = new Set<string>();
const savedBlogIds = new Set<string>();
const followedAuthors = new Set<string>();
const blogLikeCounts = new Map<string, number>();

const stripHtml = (value = '') =>
  value
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const formatDate = (value?: string) => {
  if (!value) return '11 Mar 2026';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const initials = (name = 'Admin') =>
  name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const BlogDetailScreen = ({ blog, recent = [], onBack, onOpenBlog }: any) => {
  const scrollRef = useRef<ScrollView>(null);
  const blogKey = String(blog?.id || blog?.title || 'current-blog');
  const authorName = blog?.author || 'Kamlesh Shah';
  const content = stripHtml(blog?.content || blog?.excerpt || '');
  const paragraphs = content
    ? content.match(/[^.!?]+[.!?]+/g)?.slice(0, 10) || [content]
    : [
        'Buying and selling resale property requires clear information, accurate paperwork, and market awareness.',
        'This article explains the most important points in a practical format so buyers can make a confident decision.',
      ];
  const tags = Array.isArray(blog?.tags)
    ? blog.tags
    : ['real estate', 'finance', 'property'];
  const image =
    blog?.image_url ||
    blog?.imageUrl ||
    blog?.image ||
    FALLBACK_BLOG_IMAGE;
  const initialLikes = useMemo(
    () => Number(blog?.likes || blog?.likes_count || 0),
    [blog?.likes, blog?.likes_count],
  );
  const [liked, setLiked] = useState(likedBlogIds.has(blogKey));
  const [saved, setSaved] = useState(savedBlogIds.has(blogKey));
  const [followed, setFollowed] = useState(followedAuthors.has(authorName));
  const [likeCount, setLikeCount] = useState(
    blogLikeCounts.get(blogKey) ?? initialLikes,
  );
  const [heroImage, setHeroImage] = useState(image);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentStatus, setCommentStatus] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const visibleComments = comments
    .filter(item => String(item?.comment || '').trim())
    .slice(0, 5);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setLiked(likedBlogIds.has(blogKey));
    setSaved(savedBlogIds.has(blogKey));
    setFollowed(followedAuthors.has(authorName));
    setLikeCount(blogLikeCounts.get(blogKey) ?? initialLikes);
    setHeroImage(image);
    setNewsletterStatus('');
    setCommentStatus('');
  }, [authorName, blogKey, image, initialLikes]);

  useEffect(() => {
    let mounted = true;
    const loadComments = async () => {
      if (!blog?.id) {
        setComments([]);
        return;
      }
      try {
        const response = await blogService.getComments(blog.id);
        const list = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        if (mounted) setComments(list);
      } catch {
        if (mounted) setComments([]);
      }
    };
    loadComments();
    return () => {
      mounted = false;
    };
  }, [blog?.id]);

  const handleLike = () => {
    setLiked(current => {
      const next = !current;
      if (next) {
        likedBlogIds.add(blogKey);
      } else {
        likedBlogIds.delete(blogKey);
      }
      setLikeCount(count => {
        const nextCount = Math.max(0, count + (next ? 1 : -1));
        blogLikeCounts.set(blogKey, nextCount);
        return nextCount;
      });
      return next;
    });
  };

  const handleSave = () => {
    setSaved(current => {
      const next = !current;
      if (next) {
        savedBlogIds.add(blogKey);
      } else {
        savedBlogIds.delete(blogKey);
      }
      return next;
    });
  };

  const handleFollow = () => {
    setFollowed(current => {
      const next = !current;
      if (next) {
        followedAuthors.add(authorName);
      } else {
        followedAuthors.delete(authorName);
      }
      return next;
    });
  };

  const handleShare = async () => {
    try {
      await NativeShare.share({
        title: blog?.title || 'Real Estate Insights',
        message: `${blog?.title || 'Real Estate Insights'}\n\n${stripHtml(
          blog?.excerpt || paragraphs[0] || '',
        )}`,
      });
    } catch (error: any) {
      Alert.alert(
        'Share failed',
        error?.message || 'Could not open share sheet.',
      );
    }
  };

  const handleOpenRecent = (item: any) => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    onOpenBlog?.(item);
  };

  const handleSubscribe = async () => {
    const email = newsletterEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterStatus('Please enter a valid email.');
      return;
    }
    setSubscribing(true);
    setNewsletterStatus('');
    try {
      await contactService.create({
        name: 'Newsletter Subscriber',
        email,
        property_type: 'Newsletter',
        subject: 'Blog newsletter subscription',
        message: `Subscribed from blog page: ${
          blog?.title || 'Real Estate Insights'
        }`,
      });
      setNewsletterEmail('');
      setNewsletterStatus('Subscribed successfully.');
    } catch (error: any) {
      setNewsletterStatus(
        error?.response?.data?.message ||
          'Subscription failed. Please try again.',
      );
    } finally {
      setSubscribing(false);
    }
  };

  const handlePostComment = async () => {
    const name = commentName.trim();
    const email = commentEmail.trim().toLowerCase();
    const comment = commentText.trim();

    if (!name || !comment) {
      setCommentStatus('Name and comment are required.');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setCommentStatus('Please enter a valid email.');
      return;
    }

    if (!blog?.id) {
      setCommentStatus('Blog is not ready for comments.');
      return;
    }

    setPostingComment(true);
    setCommentStatus('');
    try {
      const response = await blogService.createComment(blog.id, {
        name,
        email,
        comment,
      });
      if (response.data?.success !== false) {
        const createdComment = response.data?.data || {
          id: `local-${Date.now()}`,
          name,
          email,
          comment,
          created_at: new Date().toISOString(),
        };
        setComments(current => [createdComment, ...current]);
        setCommentName('');
        setCommentEmail('');
        setCommentText('');
        setCommentStatus('Comment posted successfully.');
      } else {
        setCommentStatus(response.data?.message || 'Could not post comment.');
      }
    } catch (error: any) {
      setCommentStatus(
        error?.response?.data?.message || 'Could not post comment.',
      );
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#0B3856', '#0C3854']}
          className="pt-[150px] px-5 pb-3"
        >
          <TouchableOpacity
            onPress={onBack}
            className="bg-white/10 px-3 py-2 rounded-lg border border-white/20 self-start flex-row items-center"
          >
            <ArrowLeft size={20} color="white" />
            <Text className="text-white font-bold ml-2">Back to Articles</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View className="px-4 pt-4">
          <View className="bg-white rounded-2xl overflow-hidden shadow-xl border-2 border-orange-300 transition-all hover:border-orange-500 hover:shadow-2xl">
            <View className="h-72 bg-gray-900">
              <Image
                source={{ uri: heroImage }}
                className="w-full h-full"
                resizeMode="cover"
                onError={() => setHeroImage(FALLBACK_BLOG_IMAGE)}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.65)']}
                className="absolute inset-0"
              />
              <View className="absolute top-4 right-4 gap-2">
                <IconButton
                  icon={Heart}
                  onPress={handleLike}
                  active={liked}
                  activeColor="#ef4444"
                />
                <IconButton icon={ShareIcon} onPress={handleShare} />
              </View>
            </View>

            <View className="p-5">
              <Text className="text-2xl font-black text-gray-950 leading-8">
                {blog?.title || 'Real Estate Insights'}
              </Text>
              <View className="flex-row flex-wrap gap-3 mt-4 mb-4">
                <Meta icon={User} text={authorName} />
                <Meta
                  icon={MessageSquare}
                  text={`${comments.length} comments`}
                />
                <Meta icon={Heart} text={`${likeCount} likes`} />
                <Meta
                  icon={Calendar}
                  text={formatDate(blog?.created_at || blog?.date)}
                />
              </View>
              <Text className="text-gray-600 leading-6 mb-5">
                {blog?.excerpt || paragraphs[0]}
              </Text>

              <View className="bg-orange-50/30 rounded-xl p-4 mb-5 border border-orange-200 transition-all hover:border-orange-500 hover:shadow-md">
                <Text className="font-black text-gray-900 mb-2">
                  Table of Contents
                </Text>
                {[
                  'Introduction',
                  'Market Analysis',
                  'Practical Tips',
                  'FAQs',
                  'Conclusion',
                ].map(item => (
                  <Text key={item} className="text-[#0b3856] py-1">
                    • {item}
                  </Text>
                ))}
              </View>

              <ArticleHeading>Introduction</ArticleHeading>
              {paragraphs
                .slice(0, 2)
                .map((paragraph: string, index: number) => (
                  <Text key={index} className="text-gray-800 leading-7 mb-4">
                    {paragraph.trim()}
                  </Text>
                ))}

              <ArticleHeading>Market / Process Analysis</ArticleHeading>
              {paragraphs
                .slice(2, 5)
                .map((paragraph: string, index: number) => (
                  <Text key={index} className="text-gray-800 leading-7 mb-4">
                    {paragraph.trim()}
                  </Text>
                ))}

              <ArticleHeading>Tips That Work</ArticleHeading>
              {[
                'Verify documents before payment',
                'Compare rates in the locality',
                'Keep registration and tax charges ready',
                'Use expert legal support',
              ].map((tip, index) => (
                <View
                  key={tip}
                  className="flex-row mb-3 rounded-xl border border-orange-100 px-2 py-2 transition-all hover:border-orange-400 hover:bg-orange-50/30"
                >
                  <View className="w-7 h-7 rounded-full bg-orange-50 items-center justify-center mr-3">
                    <Text className="text-[#E6761D] font-black">
                      {index + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 text-gray-800 leading-6">{tip}</Text>
                </View>
              ))}

              <ArticleHeading>Conclusion</ArticleHeading>
              <Text className="text-gray-800 leading-7 mb-5">
                With the right preparation and transparent guidance, resale
                property decisions become simpler, faster, and more financially
                secure.
              </Text>

              <View className="flex-row flex-wrap gap-2 mt-2">
                {tags.map((tag: string) => (
                  <View
                    key={tag}
                    className="flex-row items-center gap-1 bg-orange-50 rounded-full px-3 py-1.5 border border-orange-200 transition-all hover:border-orange-500 hover:bg-orange-100"
                  >
                    <Tag size={12} color="#6b7280" />
                    <Text className="text-xs text-gray-600">{tag}</Text>
                  </View>
                ))}
              </View>

              <View className="mt-8 border-2 border-orange-300 rounded-2xl p-4 bg-white shadow-sm transition-all hover:border-orange-500 hover:shadow-lg">
                <Text className="text-xl font-black text-gray-950 mb-3">
                  Comments ({comments.length})
                </Text>
                {visibleComments.length > 0 ? (
                  <View className="mb-4">
                    {visibleComments.map((item: any, index: number) => (
                      <View
                        key={item.id || `${item.name || 'comment'}-${index}`}
                        className="bg-slate-50 border border-orange-200 rounded-xl p-3 mb-2 transition-all hover:border-orange-500 hover:shadow-md hover:bg-white"
                      >
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="font-black text-gray-900">
                            {String(item.name || '').trim() || 'Reader'}
                          </Text>
                          <Text className="text-[10px] text-gray-400">
                            {formatDate(item.created_at)}
                          </Text>
                        </View>
                        <Text className="text-gray-700 leading-5">
                          {String(item.comment || '').trim()}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="mb-4 rounded-xl bg-slate-50 px-4 py-4">
                    <Text className="text-sm font-semibold text-gray-500">
                      No comments yet. Be the first to share your thoughts.
                    </Text>
                  </View>
                )}
                <TextInput
                  placeholder="Share your thoughts..."
                  placeholderTextColor="#64748B"
                  multiline
                  value={commentText}
                  onChangeText={setCommentText}
                  className="bg-slate-50 border border-orange-300 rounded-xl px-3 py-3 min-h-[90px] text-gray-900 transition-all hover:border-orange-500 hover:bg-white"
                />
                <View className="flex-row gap-3 mt-3">
                  <TextInput
                    placeholder="Name"
                    placeholderTextColor="#64748B"
                    value={commentName}
                    onChangeText={setCommentName}
                    className="flex-1 bg-slate-50 border border-orange-300 rounded-xl px-3 py-2 text-gray-900 transition-all hover:border-orange-500 hover:bg-white"
                  />
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="#64748B"
                    value={commentEmail}
                    onChangeText={setCommentEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="flex-1 bg-slate-50 border border-orange-300 rounded-xl px-3 py-2 text-gray-900 transition-all hover:border-orange-500 hover:bg-white"
                  />
                </View>
                {!!commentStatus && (
                  <Text className="text-xs font-semibold text-gray-600 mt-2">
                    {commentStatus}
                  </Text>
                )}
                <TouchableOpacity
                  disabled={postingComment}
                  onPress={handlePostComment}
                  className="self-end mt-3 bg-[#E6761D] rounded-xl px-4 py-2 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Text className="text-white font-bold">
                    {postingComment ? 'Posting...' : 'Post Comment'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <AuthorCard
            name={authorName}
            followed={followed}
            saved={saved}
            onFollow={handleFollow}
            onSave={handleSave}
          />

          <View className="bg-white rounded-2xl p-4 mt-4 border-2 border-orange-300 shadow-sm transition-all hover:border-orange-500 hover:shadow-lg">
            <Text className="text-lg font-black text-gray-950 mb-3">
              Related Articles
            </Text>
            {recent.slice(0, 5).map((item: any) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleOpenRecent(item)}
                className="flex-row gap-3 py-3 border-b border-orange-100 transition-all hover:bg-orange-50/30 hover:px-2 hover:rounded-xl"
              >
                <Image
                  source={{
                    uri:
                      item.image_url ||
                      item.imageUrl ||
                      item.image ||
                      FALLBACK_BLOG_IMAGE,
                  }}
                  className="w-16 h-14 rounded-lg"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <Text
                    className="font-semibold text-gray-900"
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {formatDate(item.created_at)}
                  </Text>
                </View>
                <ArrowRight size={16} color="#E6761D" />
              </TouchableOpacity>
            ))}
          </View>

          <View className="rounded-2xl p-5 mt-4 bg-[#0b3856] border-2 border-orange-300 shadow-md transition-all hover:border-orange-500 hover:shadow-xl">
            <Text className="text-white text-lg font-black mb-2">
              Join our newsletter
            </Text>
            <Text className="text-white/80 text-sm mb-3">
              Weekly insights, market updates and featured listings.
            </Text>
            <View className="flex-row gap-2">
              <TextInput
                placeholder="Your email"
                placeholderTextColor="#9ca3af"
                value={newsletterEmail}
                onChangeText={setNewsletterEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 bg-white rounded-xl px-3 py-2 border border-orange-200 transition-all hover:border-orange-500"
              />
              <TouchableOpacity
                disabled={subscribing}
                onPress={handleSubscribe}
                className="bg-[#E6761D] rounded-xl px-4 justify-center"
              >
                <Text className="text-white font-bold">
                  {subscribing ? 'Saving...' : 'Subscribe'}
                </Text>
              </TouchableOpacity>
            </View>
            {!!newsletterStatus && (
              <Text className="text-white/90 text-xs font-semibold mt-2">
                {newsletterStatus}
              </Text>
            )}
          </View>
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
};

const IconButton = ({
  icon: Icon,
  onPress,
  active,
  activeColor = '#0b3856',
}: any) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    className="w-10 h-10 rounded-full bg-white/95 items-center justify-center"
  >
    <Icon
      size={18}
      color={active ? activeColor : '#374151'}
      fill={active ? activeColor : 'transparent'}
    />
  </TouchableOpacity>
);

const Meta = ({ icon: Icon, text }: any) => (
  <View className="flex-row items-center">
    <Icon size={14} color="#6b7280" />
    <Text className="text-xs text-gray-500 ml-1">{text}</Text>
  </View>
);

const ArticleHeading = ({ children }: any) => (
  <Text className="text-xl font-black text-gray-950 mt-3 mb-3">{children}</Text>
);

const AuthorCard = ({ name, followed, saved, onFollow, onSave }: any) => (
  <View className="bg-white rounded-2xl p-4 mt-4 border-2 border-orange-300 shadow-sm transition-all hover:border-orange-500 hover:shadow-lg">
    <View className="flex-row items-center gap-3">
      <View className="w-12 h-12 rounded-full bg-orange-50 border border-orange-200 items-center justify-center transition-all hover:border-orange-500">
        <Text className="font-black text-gray-900">{initials(name)}</Text>
      </View>
      <View className="flex-1">
        <Text className="font-black text-gray-950">{name}</Text>
        <Text className="text-xs text-gray-500">Contributor</Text>
      </View>
      <TouchableOpacity
        onPress={onFollow}
        className={`${
          followed ? 'bg-[#0b3856]' : 'bg-[#E6761D]'
        } rounded-xl px-4 py-2 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
      >
        <Text className="text-white font-bold">
          {followed ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onSave}
        className={`${
          saved ? 'bg-orange-50 border-orange-500' : 'border-orange-300'
        } border rounded-xl p-2 transition-all hover:border-orange-500 hover:bg-orange-50`}
      >
        <Bookmark
          size={16}
          color={saved ? '#E6761D' : '#0b3856'}
          fill={saved ? '#E6761D' : 'transparent'}
        />
      </TouchableOpacity>
    </View>
  </View>
);

export default BlogDetailScreen;
