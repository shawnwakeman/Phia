import type { RequestHandler } from "./$types";
import { redirect } from '@sveltejs/kit';
export const GET: RequestHandler = async (event) => {
	const {
		url,
		locals: { supabase }
	} = event;
	const code = url.searchParams.get('code') as string;
	const next = url.searchParams.get('next') ?? '/';
	console.error(code, next, 'Ads');
	
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      redirect(303, `/${next.slice(1)}`);
    }
  }

  // return the user to an error page with instructions
  redirect(303, '/auth/error');
};