import { redirect } from '@sveltejs/kit'

export const GET = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code') as string
	const next = url.searchParams.get('next') ?? '/'
  console.error(code, next, url);
  
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      redirect(303, `${url.origin}/${next.slice(1)}`)
    }
  }

  // if (!error && session) {
  //   const { data: userProfile, error: profileError } = await supabase
  //     .from('profiles')
  //     .select('is_first_sign_in')
  //     .eq('id', session.user.id)
  //     .single()
    
  //   if (!profileError && userProfile?.is_first_sign_in) {
  //     await supabase
  //       .from('profiles')
  //       .update({ is_first_sign_in: false })
  //       .eq('id', session.user.id)

  //     redirect(303, '/welcome')

  /* Return the user to an error page with instructions */
  redirect(303, '/')
}
