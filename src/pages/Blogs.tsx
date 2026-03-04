import { useState, useEffect } from "react";
import DotGridBackground from "@/components/DotGridBackground";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ResponsiveImage from "@/components/ResponsiveImage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMouseGlow } from "@/hooks/useMouseGlow";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

const Blogs = () => {
  useMouseGlow();
  const { posts, isLoading } = useBlogPosts();

  return (
    <>
      <DotGridBackground />
      <Navbar />
      <main className="flex flex-col gap-6 px-4 max-w-4xl mx-auto min-h-screen pb-[20px] pt-[70px]">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-foreground mb-2">Blog</h1>
          <p className="text-muted-foreground">Thoughts on web development, design, and technology</p>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-96 w-full rounded-xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card className="glass rounded-xl border-0 p-8 text-center">
            <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <Card key={post.slug} className="glass rounded-xl border-0 overflow-hidden hover:border-primary/50 transition-all duration-300 flex flex-col group">
                {/* Featured Image */}
                {post.featuredImage && (
                  <div className="aspect-video overflow-hidden bg-muted">
                    <ResponsiveImage src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  {/* Title & Date */}
                  <div className="mb-2">
                    <h2 className="text-xl font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h2>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(post.date), "MMM d, yyyy")}</p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{post.description}</p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 2 && <span className="text-xs text-muted-foreground">+{post.tags.length - 2} more</span>}
                    </div>
                  )}

                  {/* Read More Button */}
                  <Button variant="ghost" asChild className="glass-inner glow-container w-fit px-4 py-2 mt-auto text-primary hover:text-primary/80 group/btn rounded-full">
                    <a href={`/blogs/${post.slug}`}>
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <FooterSection />
      </main>
    </>
  );
};

export default Blogs;
