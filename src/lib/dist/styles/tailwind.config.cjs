/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				title: ['var(--font-title)', 'system-ui', 'sans-serif'],
				default: ['var(--font-default)', 'system-ui', 'sans-serif']
			},
			
		}
	},
	plugins: [
		// Tailwind plugins
		require('@tailwindcss/typography'),
		require('tailwindcss-animate')
	]
};

module.exports = config;
