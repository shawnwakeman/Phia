import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { UserSettings } from "../../types/collection";
import { defaultUserSettings, mergeDefaults } from "$lib/utils";



let stuff = {
  "home": {
    "grid": {
      "gridLayout": [
        {
          "id": "9d451950-0fe8-4695-bc0f-cd0f8270ac32",
          "x": 0,
          "y": 0,
          "w": 3,
          "h": 6,
          "min": {
            "w": 1,
            "h": 1
          },
          "max": {
            "w": 10,
            "h": 10
          },
          "type": {
            "type": "barchartbase",
            "options": {
              "axis": "time",
              "value": 100,
              "description": "Time spent on tasks"
            }
          }
        },
        {
          "id": "c99a70a4-0dfb-48ed-a5e4-55d269202300",
          "x": 3,
          "y": 0,
          "w": 7,
          "h": 6,
          "min": {
            "w": 1,
            "h": 1
          },
          "max": {
            "w": 10,
            "h": 10
          },
          "type": {
            "type": "heatmapbase",
            "options": {
              "axis": "time",
              "value": 100,
              "description": "Time spent on tasks"
            }
          }
        }
      ],
      "focusLayout": [],
      "usingSimple": false
    }
  }
}

export const load: PageServerLoad = async ({ url, locals }) => {
	const { safeGetSession } = locals;

	const { session, user } = await safeGetSession();

	
	if (!user) {
		return { projectIds: [],
				settings: stuff, };
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
