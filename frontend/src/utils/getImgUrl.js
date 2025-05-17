function getImgUrl(url) {
  // Check if the URL is already a full URL (starts with http or https)
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url;
  }
  
  // If it's a default image name without URL, load from assets
  try {
    return new URL(`../assets/${url || 'default-book-cover.jpg'}`, import.meta.url);
  } catch (error) {
    console.error("Error loading image:", error);
    return new URL('../assets/default-book-cover.jpg', import.meta.url);
  }
}

export default getImgUrl;
