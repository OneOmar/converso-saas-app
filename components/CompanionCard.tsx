import Image from "next/image";
import Link from "next/link";
import BookmarkButton from "@/components/BookmarkButton";

interface CompanionCardProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
  isBookmarked?: boolean;
}

const CompanionCard = ({
                         id,
                         name,
                         topic,
                         subject,
                         duration,
                         color,
                         isBookmarked = false
                       }: CompanionCardProps) => {
  return (
    <article className="companion-card" style={{backgroundColor: color}}>
      <div className="flex justify-between items-center">
        <div className="subject-badge">{subject}</div>
        <BookmarkButton companionId={id} isBookmarked={isBookmarked}/>
      </div>

      <h2 className="text-2xl font-bold">{name}</h2>
      <p className="text-sm">{topic}</p>

      <div className="flex items-center gap-2">
        <Image src="/icons/clock.svg" alt="" width={13.5} height={13.5}/>
        <span className="text-sm">{duration} mins</span>
      </div>

      <Link href={`/companions/${id}`} className="w-full">
        <button className="btn-primary w-full justify-center">Start Lesson</button>
      </Link>
    </article>
  );
};

export default CompanionCard;