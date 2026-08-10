export const getApiBaseUrl = () => {
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ) {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && !envUrl.includes("onrender.com")) {
      return envUrl;
    }
    return "http://localhost:5000";
  }
  return import.meta.env.VITE_API_URL || "https://jugarr-in-zytm.onrender.com";
};
