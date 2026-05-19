export default {
  async scheduled(event, env, ctx) {
    // PAGES_URL must be configured as an environment variable in the worker dashboard (e.g. 'https://your-dashboard.pages.dev')
    const pagesUrl = env.PAGES_URL || "http://localhost:8788";
    
    console.log(`Starting scheduled crawl trigger to: ${pagesUrl}/api/crawl`);
    
    try {
      const response = await fetch(`${pagesUrl}/api/crawl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      const result = await response.text();
      console.log(`Crawl response status: ${response.status}. Body: ${result}`);
    } catch (err) {
      console.error("Scheduled crawl trigger failed:", err);
    }
  }
};
