'use server';

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";

export const createCompanion = async (formData: CreateCompanion) => {
  // Get authenticated user ID
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Insert companion into database
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('companions')
    .insert({ ...formData, author: userId })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};