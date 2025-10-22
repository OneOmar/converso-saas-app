'use client';

import {useState, useTransition} from "react";
import {usePathname} from "next/navigation";
import Image from "next/image";
import {addBookmark, removeBookmark} from "@/lib/actions/companion.actions";

interface BookmarkButtonProps {
  companionId: string;
  isBookmarked: boolean;
}

const BookmarkButton = ({companionId, isBookmarked}: BookmarkButtonProps) => {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const handleBookmark = () => {
    // Optimistic UI update
    setBookmarked(!bookmarked);

    // Perform server action
    startTransition(async () => {
      try {
        if (bookmarked) {
          await removeBookmark(companionId, pathname);
        } else {
          await addBookmark(companionId, pathname);
        }
      } catch (error) {
        // Revert on error
        setBookmarked(bookmarked);
        console.error("Bookmark action failed:", error);
      }
    });
  };

  return (
    <button
      className="companion-bookmark"
      onClick={handleBookmark}
      disabled={isPending}
      aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Image
        src={bookmarked ? "/icons/bookmark-filled.svg" : "/icons/bookmark.svg"}
        alt="bookmark"
        width={12.5}
        height={15}
      />
    </button>
  );
};

export default BookmarkButton;