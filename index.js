import { ytmp3, ytmp4 } from "@vreden/youtube_scraper";

export default {
  async fetch(request) {
    const urlObj = new URL(request.url);
    const params = urlObj.searchParams;
    const url = params.get("url");
    const format = params.get("format") || "mp4";
    const quality = params.get("quality");

    if (!url) {
      return new Response(JSON.stringify({ success: false, message: "URL YouTube diperlukan!" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    try {
      let result;
      if (format === "mp3") {
        result = await ytmp3(url, quality);
      } else {
        result = await ytmp4(url, quality);
      }

      if (result.status) {
        return new Response(JSON.stringify({
          success: true,
          download_link: result.download,
          metadata: result.metadata
        }), {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response(JSON.stringify({ success: false, message: result.result }), {
          headers: { "Content-Type": "application/json" },
          status: 500,
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ success: false, message: "Terjadi kesalahan.", error: error.message }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }
  }
};