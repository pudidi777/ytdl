const audio = ["92", "128", "256", "320"];
const video = ["144", "360", "480", "720", "1080"];

async function savetube(link, quality, value) {
    try {
        const headers = {
            'Accept': '*/*',
            'Referer': 'https://ytshorts.savetube.me/',
            'Origin': 'https://ytshorts.savetube.me/',
            'User-Agent': 'Postify/1.0.0',
            'Content-Type': 'application/json'
        };

        const cdnNumber = 54;
        const cdnUrl = `cdn${cdnNumber}.savetube.su`;

        // Mengambil informasi video
        const videoInfoResponse = await fetch(`https://${cdnUrl}/info`, {
            method: 'POST',
            headers: {
                ...headers,
                'Authority': `cdn${cdnNumber}.savetube.su`
            },
            body: JSON.stringify({ url: link })
        });

        const videoInfo = await videoInfoResponse.json();
        const type = value === 1 ? 'audio' : 'video';

        // Membuat body untuk request download
        const body = {
            downloadType: type,
            quality,
            key: videoInfo.data.key
        };

        // Mengambil URL download
        const downloadResponse = await fetch(`https://${cdnUrl}/download`, {
            method: 'POST',
            headers: {
                ...headers,
                'Authority': `cdn${cdnNumber}.savetube.su`
            },
            body: JSON.stringify(body)
        });

        const downloadData = await downloadResponse.json();

        return {
            status: true,
            quality: value === 1 ? `${quality}kbps` : `${quality}p`,
            availableQuality: value === 1 ? audio : video,
            download: downloadData.data.downloadUrl,
            metadata: {
                title: videoInfo.data.title,
                filename: `${videoInfo.data.title} ${value === 1 ? `(${quality}kbps).mp3` : `(${quality}p).mp4`}`,
            }
        };
    } catch (error) {
        return {
            status: false,
            result: error.message
        };
    }
}

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
        result = await savetube(url, quality, 1);  // Menggunakan value 1 untuk audio
      } else {
        result = await savetube(url, quality, 0);  // Menggunakan value 0 untuk video
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