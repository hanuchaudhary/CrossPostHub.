"use client";

import React from "react";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

interface InstagramPreviewProps {
  content: string;
  images: File[];
  user: any;
}

export function InstagramPreview({
  content,
  images,
  user,
}: InstagramPreviewProps) {
  const [expanded, setExpanded] = React.useState(false);
  const contentIsLong = content.length > 280;
  return (
    <div className="max-w-[468px] bg-black text-white font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border-2 border-pink-500 rounded-full">
            <AvatarImage src={user?.image || ""} className="object-cover" />
            <AvatarFallback className="uppercase">
              {user?.name ? user.name[0] : "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold">
            {user?.name || "CrossPostHub"}
          </span>
          <span className="text-neutral-500 text-sm">• 7 h</span>
        </div>
        <button className="hover:opacity-60">
          <MoreHorizontal className="h-6 w-6" />
        </button>
      </div>

      <div className="relative w-full">
        {images.length > 0 && (
          <Carousel className="w-full mx-auto">
            <CarouselContent>
              {images.map((file, index) => (
                <CarouselItem key={index}>
                  {file.type.startsWith("image/") ? (
                    <Image
                      height={100}
                      width={100}
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-contain rounded"
                    />
                  ) : file.type.startsWith("video/") ? (
                    <video
                      controls
                      className="w-full h-full object-contain rounded"
                    >
                      <source
                        src={URL.createObjectURL(file)}
                        type={file.type}
                      />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/50 rounded">
                      <p className="text-sm text-muted-foreground">
                        Unsupported file type
                      </p>
                    </div>
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              className={`${images.length > 1 ? "flex" : "hidden"}`}
            />
            <CarouselNext
              className={`${images.length > 1 ? "flex" : "hidden"}`}
            />
          </Carousel>
        )}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button className="hover:opacity-60">
              <Heart className="w-6 h-6" />
            </button>
            <button className="hover:opacity-60">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="hover:opacity-60">
              <Send className="w-6 h-6" />
            </button>
          </div>
          <button className="hover:opacity-60">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        <div className="text-sm font-semibold mb-2">19 likes</div>

        <div className="text-sm">
          <span className="font-semibold mr-2">
            {user?.name || "mr_hariom_varshney_2021"}
          </span>
          <div
            className={`whitespace-pre-wrap text-sm overflow-hidden ${
              !expanded && contentIsLong ? "line-clamp-4" : ""
            }`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
          {contentIsLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs flex items-center mt-1"
            >
              {expanded ? <>...less</> : <>...more</>}
            </button>
          )}
        </div>

        <button className="text-neutral-500 text-sm mt-1 hover:text-neutral-400">
          See Translation
        </button>
        <button className="block text-neutral-500 text-sm mt-1 hover:text-neutral-400">
          View 1 comment
        </button>

        <div className="mt-3 border-t border-neutral-800 pt-3">
          <input
            type="text"
            placeholder="Add a comment..."
            className="w-full bg-transparent text-sm text-neutral-400 placeholder-neutral-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
