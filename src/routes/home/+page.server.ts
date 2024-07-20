import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { UserSettings } from "../../types/collection";
import { defaultUserSettings, mergeDefaults } from "$lib/utils";





export const load: PageServerLoad = async ({ url, locals }) => {
	const { safeGetSession } = locals;

	const { session, user } = await safeGetSession();

	if (!session) {
		// Redirect to the authentication page with a return URL
		const redirectTo = `/auth?redirectTo=${encodeURIComponent(url.pathname + url.search)}`;
		throw redirect(303, redirectTo);
	}

	if (!user) {
		return { error: "No active session" };
	}

	const { data: projectUsers, error: projectUsersError } =
		await locals.supabase
			.from("project_users")
			.select("*")
			.eq("user_id", user.id);

	if (projectUsersError) {
		return { error: "Error fetching project users" };
	}


	let updatedSettings: UserSettings;
	// Fetch the upserted user settings
	const { data: userSettings, error: userSettingsError } =
		await locals.supabase
			.from("user_settings")
			.select("*")
			.eq("id", user.id)
			.single();

	if (userSettingsError && userSettingsError.code === "PGRST116") {
		// User settings not found, insert default settings

		updatedSettings = defaultUserSettings;
        const { error } = await locals.supabase
            .from('user_settings')
            .insert({ id: user.id, settings: defaultUserSettings });

		if (error) {
			throw new Error("Error initializing user settings");
		}

	
	} else if (userSettingsError) {
        throw new Error("Error fetching user settings");
    } else {
        // Merge default settings with user settings
        updatedSettings = mergeDefaults(userSettings.settings, defaultUserSettings);

        // Check if the settings need to be updated
        if (JSON.stringify(userSettings.settings) !== JSON.stringify(updatedSettings)) {
            // Update the settings in Supabase if they have been modified
            const { error } = await locals.supabase
                .from('user_settings')
                .upsert({ id: user.id, settings: updatedSettings }, { onConflict: 'id' });

            if (error) {
                console.error("Error updating settings:", error);
                throw error;
            }
        }
    }

	return {
		projectIds: projectUsers,
		settings: updatedSettings,
	};
};
