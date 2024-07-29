import { redirect } from '@sveltejs/kit'

import type { Actions } from './$types'

export const actions: Actions = {
	'auth/github': async ({ locals: { supabase } }) => {
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: 'github',
			options: {
			  redirectTo: 'http://localhost:5173/auth/callback',
			},
		  })
		
		
		// Supabase handles the redirect after successful authentication
	  },
}