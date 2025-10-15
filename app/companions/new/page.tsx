import CompanionForm from "@/components/CompanionForm";
import {auth} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";

const NewCompanion = async () => {
  // Protect route - require authentication
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <main className="flex items-center justify-center py-8">
      <article className="w-full max-w-lg flex flex-col gap-4 md:max-w-2xl lg:max-w-xl">
        <h1 className="text-3xl font-bold">Companion Builder</h1>
        <CompanionForm />
      </article>
    </main>
  );
};

export default NewCompanion;