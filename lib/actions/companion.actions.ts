'use server';

import {auth} from "@clerk/nextjs/server";
import {createSupabaseClient} from "@/lib/supabase";
import {revalidatePath} from "next/cache";

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

/**
 * Session History Actions
 * Manages user session tracking for companion conversations
 */

/**
 * Add a completed session to user's history
 * Records when a user finishes a conversation with a companion
 */
export const addToSessionHistory = async (companionId: string) => {
  // Get authenticated user ID
  const {userId} = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Insert session record
  const supabase = await createSupabaseClient();
  const {data, error} = await supabase
    .from('session_history')
    .insert({
      companion_id: companionId,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

/**
 * Get recent sessions across all users
 * Returns the most recently completed companion sessions
 */
export const getRecentSessions = async (limit = 10) => {
  const supabase = await createSupabaseClient();

  // Fetch sessions with companion details
  const {data, error} = await supabase
    .from('session_history')
    .select('companions:companion_id (*)')
    .order('created_at', {ascending: false})
    .limit(limit);

  if (error) throw new Error(error.message);

  // Extract companion objects from a nested structure
  return data.map(({companions}) => companions);
};

/**
 * Get session history for a specific user
 * Returns a user's recently completed companion sessions
 */
export const getUserSessions = async (userId: string, limit = 10) => {
  const supabase = await createSupabaseClient();

  // Fetch user's sessions with companion details
  const {data, error} = await supabase
    .from('session_history')
    .select('companions:companion_id (*)')
    .eq('user_id', userId)
    .order('created_at', {ascending: false})
    .limit(limit);

  if (error) throw new Error(error.message);

  // Extract companion objects from a nested structure
  return data.map(({companions}) => companions);
};

/**
 * Get all companions created by a specific user
 * Returns companions where the user is the author
 */
export const getUserCompanions = async (userId: string) => {
  const supabase = await createSupabaseClient();

  // Fetch companions created by this user
  const {data, error} = await supabase
    .from('companions')
    .select()
    .eq('author', userId)
    .order('created_at', {ascending: false});

  if (error) throw new Error(error.message);

  return data;
};

/**
 * Check if a user can create a new companion
 * Based on their subscription plan and current companion count
 */
export const newCompanionPermissions = async () => {
  const {userId, has} = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Pro users have unlimited companions
  if (has({plan: 'pro'})) {
    return true;
  }

  // Determine user's companion limit based on plan
  let limit = 0;
  if (has({feature: "10_active_companions"})) {
    limit = 10;
  } else if (has({feature: "3_active_companions"})) {
    limit = 3;
  }

  // Count user's existing companions
  const supabase = await createSupabaseClient();
  const {count, error} = await supabase
    .from('companions')
    .select('*', {
      count: 'exact',
      head: true
    }) // Used count directly - `{ count: 'exact', head: true }` is more efficient and faster! (doesn't fetch data)
    .eq('author', userId);

  // console.log("User's existing companions:", count);
  // console.log("User's companion limit:", limit);

  if (error) throw new Error(error.message);

  // Check if a user is under their limit
  return (count || 0) < limit;
};

/**
 * Bookmark Actions
 * Manages user bookmarks for companions
 */

/**
 * Add a companion to user's bookmarks
 * Revalidates the page to show the updated bookmark state
 */
export const addBookmark = async (companionId: string, path: string) => {
  // Verify authentication
  const {userId} = await auth();
  if (!userId) throw new Error("Unauthorized");

  console.log("addBookmark args:", {companionId, userId});

  // Insert bookmark record
  const supabase = await createSupabaseClient();
  const {error} = await supabase
    .from("bookmarks")
    .insert({
      companion_id: companionId,
      user_id: userId,
    });

  if (error) throw new Error(error.message);

  // Refresh page to show bookmark icon change
  revalidatePath(path);
};

/**
 * Remove companion from user's bookmarks
 * Revalidates the page to show an updated bookmark state
 */
export const removeBookmark = async (companionId: string, path: string) => {
  // Verify authentication
  const {userId} = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Delete bookmark record
  const supabase = await createSupabaseClient();
  const {error} = await supabase
    .from("bookmarks")
    .delete()
    .eq("companion_id", companionId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  // Refresh page to show bookmark icon change
  revalidatePath(path);
};

/**
 * Get all bookmarked companions for a user
 * Returns full companion details via JOIN
 */
export const getBookmarkedCompanions = async (userId: string) => {
  const supabase = await createSupabaseClient();

  // Fetch bookmarks with companion details
  const {data, error} = await supabase
    .from("bookmarks")
    .select("companions:companion_id (*)")
    .eq("user_id", userId)
    .order("created_at", {ascending: false});

  if (error) throw new Error(error.message);

  // Extract companion objects from a nested structure
  return data.map(({companions}) => companions);
};
