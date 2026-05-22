const envUrl = import.meta.env.VITE_API_URL;

function buildFallback() {
	// If running locally, use localhost backend.
	if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
		return 'http://localhost:5000/api';
	}

	// In production without VITE_API_URL, log an actionable error so deployers know what to set.
	console.error('VITE_API_URL is not set. Set VITE_API_URL in your Vercel/hosting environment to your backend URL (example: https://your-backend.onrender.com/api)');

	// Best-effort fallback: attempt relative `/api` (may fail if backend is on another host).
	return '/api';
}

const API_BASE_URL = envUrl || buildFallback();

export default API_BASE_URL;
