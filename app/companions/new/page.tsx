import {auth} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CompanionForm from "@/components/CompanionForm";
import {newCompanionPermissions} from "@/lib/actions/companion.actions";

const NewCompanion = async () => {
  // Verify authentication
  const {userId} = await auth();
  if (!userId) redirect("/sign-in");

  // Check if the user can create a new companion
  const canCreateCompanion = await newCompanionPermissions();
  // console.log(canCreateCompanion);

  return (
    <main className="flex items-center justify-center py-8">
      <article className="w-full max-w-lg flex flex-col gap-4 md:max-w-2xl lg:max-w-xl mb-8">
        {canCreateCompanion ? (
          // Companion builder form
          <>
            <h1 className="text-3xl font-bold">Companion Builder</h1>
            <CompanionForm/>
          </>
        ) : (
          // Limit reached - upgrade prompt
          <div className="companion-limit">
            <Image
              src="/images/limit.svg"
              alt="Companion limit reached"
              width={360}
              height={230}
            />
            <div className="cta-badge">Upgrade your plan</div>
            <h1 className="text-3xl font-bold">You&#39;ve Reached Your Limit</h1>
            <p className="text-center">
              You&#39;ve reached your companion limit. Upgrade to create more
              companions and unlock premium features.
            </p>
            <Link href="/subscription" className="btn-primary w-full justify-center">
              Upgrade My Plan
            </Link>
          </div>
        )}
      </article>
    </main>
  );
};

export default NewCompanion;