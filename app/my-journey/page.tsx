import {currentUser} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CompanionsList from "@/components/CompanionsList";
import {
  getUserCompanions,
  getUserSessions,
} from "@/lib/actions/companion.actions";

const Profile = async () => {
  // Verify user authentication
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Fetch user data
  const companions = await getUserCompanions(user.id);
  const sessionHistory = await getUserSessions(user.id);

  return (
    <main className="max-w-5xl">
      {/* Profile header with stats */}
      <section className="flex justify-between gap-4 max-sm:flex-col items-center">
        {/* User info */}
        <div className="flex gap-4 items-center">
          <Image
            src={user.imageUrl}
            alt={user.firstName || "User"}
            width={110}
            height={110}
            className="rounded-full"
          />
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-2xl">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {user.emailAddresses[0].emailAddress}
            </p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="flex gap-4 max-sm:w-full">
          {/* Lessons completed */}
          <div className="border border-black rounded-lg p-3 gap-2 flex flex-col h-fit">
            <div className="flex gap-2 items-center">
              <Image
                src="/icons/check.svg"
                alt=""
                width={22}
                height={22}
              />
              <p className="text-2xl font-bold">{sessionHistory.length}</p>
            </div>
            <p className="text-sm">Lessons completed</p>
          </div>

          {/* Companions created */}
          <div className="border border-black rounded-lg p-3 gap-2 flex flex-col h-fit">
            <div className="flex gap-2 items-center">
              <Image src="/icons/cap.svg" alt="" width={22} height={22}/>
              <p className="text-2xl font-bold">{companions.length}</p>
            </div>
            <p className="text-sm">Companions created</p>
          </div>
        </div>
      </section>

      {/* Expandable sections */}
      <Accordion type="multiple" className="w-full">
        {/* Recent sessions */}
        <AccordionItem value="recent">
          <AccordionTrigger className="text-2xl font-bold">
            Recent Sessions
          </AccordionTrigger>
          <AccordionContent>
            {sessionHistory.length > 0 ? (
              <CompanionsList
                title="Recent Sessions"
                companions={sessionHistory}
              />
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No sessions yet. Start a conversation to see your history!
              </p>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* My companions */}
        <AccordionItem value="companions">
          <AccordionTrigger className="text-2xl font-bold">
            My Companions ({companions.length})
          </AccordionTrigger>
          <AccordionContent>
            {companions.length > 0 ? (
              <CompanionsList title="My Companions" companions={companions}/>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No companions created yet. Build your first companion!
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </main>
  );
};

export default Profile;