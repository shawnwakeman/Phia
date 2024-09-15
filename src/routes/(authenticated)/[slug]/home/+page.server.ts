import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { UserSettings } from "../../../../types/collection";
import { defaultUserSettings, mergeDefaults } from "$lib/utils";





export const load = async ({ depends, locals: { supabase, getSession } }) => {
	console.log("Fetching data...");

	const session = await getSession();

	if (!session) {     
		console.error("User is not logged in");
		return { error: 'You must be logged in to access this page.' };
	}

	depends('supabase:db:project_users');
	depends('supabase:db:user_settings');



	const { data: projectUsers, error: projectUsersError } =
        await supabase
			.from("project_users")
			.select("*")
			.eq("user_id", session.user.id);

	if (projectUsersError) {
		console.error("Error fetching project users:", projectUsersError);
		return { error: "Error fetching project users" };
	}


	let updatedSettings: UserSettings;
	// Fetch the upserted user settings
	const { data: userSettings, error: userSettingsError } =
        await supabase
			.from("user_settings")
			.select("*")
			.eq("id", session.user.id)
			.single();

	if (userSettingsError && userSettingsError.code === "PGRST116") {
		// User settings not found, insert default settings
		console.log("User settings not found, inserting default settings");

		updatedSettings = defaultUserSettings;
        const { error } = await supabase
            .from('user_settings')
            .insert({ id: session.user.id, settings: defaultUserSettings });

		if (error) {
			console.error("Error initializing user settings:", error);
			throw new Error("Error initializing user settings");
		}

	
	} else if (userSettingsError) {
        console.error("Error fetching user settings:", userSettingsError);
        throw new Error("Error fetching user settings");
    } else {
        // Merge default settings with user settings
        updatedSettings = mergeDefaults(userSettings.settings, defaultUserSettings);

        // Check if the settings need to be updated
        if (JSON.stringify(userSettings.settings) !== JSON.stringify(updatedSettings)) {
            // Update the settings in Supabase if they have been modified
            const { error } =  await supabase
                .from('user_settings')
                .upsert({ id: session.user.id, settings: updatedSettings }, { onConflict: 'id' });

            if (error) {
                console.error("Error updating settings:", error);
                throw error;
            }
        }
    }

	console.log("Data fetched:", { projectIds: projectUsers, settings: updatedSettings });
	return {
		projectIds: projectUsers,
		settings: updatedSettings,
	};
};

