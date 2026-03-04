import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DotGridBackground from "@/components/DotGridBackground";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import GlassContainer from "@/components/GlassContainer";
import ResponsiveImage from "@/components/ResponsiveImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMouseGlow } from "@/hooks/useMouseGlow";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import type { BlogPost } from "@/hooks/useBlogPosts";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

const BlogPost = () => {
  useMouseGlow();
  const { slug } = useParams<{ slug: string }>();
  const { posts, isLoading: postsLoading } = useBlogPosts();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!postsLoading && posts.length > 0) {
      const foundPost = posts.find((p) => p.slug === slug);

      if (!foundPost) {
        setNotFound(true);
      } else {
        setPost(foundPost);
      }
    }
  }, [slug, posts, postsLoading]);

  const isLoading = postsLoading || (!post && !notFound);

  return (
    <>
      <DotGridBackground />
      <Navbar />
      <main className="flex flex-col gap-6 px-4 max-w-4xl mx-auto min-h-screen pb-[20px] pt-[70px]">
        {isLoading ? (
          <GlassContainer>
            <div className="space-y-4">
              <Skeleton className="h-96 w-full rounded-lg" />
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          </GlassContainer>
        ) : notFound ? (
          <GlassContainer className="text-center py-16 px-8">
            <h1 className="text-2xl font-bold text-foreground mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
            <Button variant="ghost" asChild className="glass-inner glow-container rounded-full px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground">
              <a href="/blogs">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Blogs
              </a>
            </Button>
          </GlassContainer>
        ) : post ? (
          <>
            {/* Featured Image */}
            {post.featuredImage && (
              <GlassContainer className="overflow-hidden p-0 rounded-xl">
                <div className="aspect-video">
                  <ResponsiveImage src={post.featuredImage} alt={post.title} priority={true} className="w-full h-full object-cover rounded-xl" />
                </div>
              </GlassContainer>
            )}

            {/* Post Header */}
            <GlassContainer className="p-6 md:p-8">
              <div className="mb-4">
                <Button variant="ghost" asChild className="glass-inner glow-container rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                  <a href="/blogs">
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Blogs
                  </a>
                </Button>
              </div>

              <h1 className="text-4xl font-bold text-foreground mb-4">{post.title}</h1>

              {/* Meta Information */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6 pb-6 border-b border-border/30">
                <time className="text-sm text-muted-foreground">{format(new Date(post.date), "MMMM d, yyyy")}</time>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Content */}
              <article className="prose max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary prose-strong:text-foreground prose-ul:text-foreground/90 prose-li:text-foreground/90 prose-blockquote:text-muted-foreground prose-blockquote:border-l-primary prose-code:text-foreground prose-pre:bg-card prose-pre:border prose-pre:border-border prose-hr:border-border">
                <post.component components={{ img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <ResponsiveImage src={props.src!} alt={props.alt || ''} className="rounded-xl shadow-sm my-8" {...props} /> }} />
              </article>
            </GlassContainer>

            {/* Navigation */}
            <GlassContainer className="text-center py-8">
              <Button variant="ghost" asChild className="glass-inner glow-container rounded-full px-6 py-2.5 text-sm text-muted-foreground hover:text-foreground">
                <a href="/blogs">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Posts
                </a>
              </Button>
            </GlassContainer>
          </>
        ) : null}

        <FooterSection />
      </main>
    </>
  );
};

export default BlogPost;
