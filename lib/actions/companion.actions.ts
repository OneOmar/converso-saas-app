'use server';

import {auth} from "@clerk/nextjs/server";
import {createSupabaseClient} from "@/lib/supabase";

// Create a new companion in the database
export const createCompanion = async (formData: CreateCompanion) => {
  // Get authenticated user ID
  const {userId} = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Insert companion into database
  const supabase = await createSupabaseClient();
  const {data, error} = await supabase
    .from('companions')
    .insert({...formData, author: userId})
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

// Get all companions with pagination and filters
export const getAllCompanions = async ({
                                         limit = 10,
                                         page = 1,
                                         subject,
                                         topic
                                       }: GetAllCompanions) => {

  const supabase = await createSupabaseClient();

  // Build base query
  let query = supabase.from('companions').select();

  // Apply filters
  if (subject) {
    query = query.ilike('subject', `%${subject}%`);
  }

  if (topic) {
    query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
  }

  // Apply pagination
  const start = (page - 1) * limit;
  const end = start + limit - 1;
  query = query.range(start, end);

  // Execute query
  const {data, error} = await query;
  if (error) throw new Error(error.message);

  return data;
};

// Get companion by ID
export const getCompanion = async (id: string) => {
  const supabase = await createSupabaseClient();

  const {data, error} = await supabase
    .from('companions')
    .select()
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);

  return data;
};
