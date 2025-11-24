/**
 * Vercel Serverless Function (Hybrid: Frontend + Backend)
 * * Deployment on Vercel:
 * - Place this file in "api/index.js"
 * - (Optional) Add vercel.json to rewrite root path to /api
 */

export default async function handler(req, res) {
  // ตั้งค่า CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ---------------------------------------------------------
  // 1. FRONTEND
  // ---------------------------------------------------------
  if (req.method === 'GET') {
    const html = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Google Maps Extractor</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;600&display=swap" rel="stylesheet">
        <style> body { font-family: 'Prompt', sans-serif; } </style>
        <script>
          async function extractCoords() {
            const btn = document.getElementById('submitBtn');
            const resultDiv = document.getElementById('result');
            const debugDiv = document.getElementById('debugInfo');
            const inputUrl = document.getElementById('urlInput').value.trim();
            const errorDiv = document.getElementById('error');
            const errorText = document.getElementById('errorText');
            
            if(!inputUrl) return;
            btn.disabled = true;
            btn.innerText = 'กำลังเจาะระบบ...';
            resultDiv.classList.add('hidden');
            errorDiv.classList.add('hidden');
            debugDiv.classList.add('hidden');

            try {
              const response = await fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ map_link: inputUrl })
              });

              const data = await response.json();

              if (!response.ok) {
                if (data.resolved_url) {
                    document.getElementById('debugUrl').innerText = data.resolved_url;
                    debugDiv.classList.remove('hidden');
                }
                throw new Error(data.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
              }

              document.getElementById('resLat').innerText = data.lat;
              document.getElementById('resLon').innerText = data.lon;
              document.getElementById('resLoc').innerText = data.loc;
              document.getElementById('jsonOutput').innerText = JSON.stringify(data, null, 2);
              
              resultDiv.classList.remove('hidden');

            } catch (err) {
              errorText.innerText = err.message;
              errorDiv.classList.remove('hidden');
            } finally {
              btn.disabled = false;
              btn.innerText = 'ดึงพิกัดใหม่';
            }
          }
        </script>
      </head>
      <body class="bg-slate-100 min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg border border-slate-200">
          <div class="flex items-center gap-3 mb-6 border-b pb-4 border-slate-100">
            <div class="bg-indigo-600 text-white p-2 rounded-lg">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-slate-800">Advanced Map Extractor</h1>
              <p class="text-xs text-slate-500">รองรับ JS Redirect & Deep Link</p>
            </div>
          </div>

          <div class="space-y-4">
            <input type="text" id="urlInput" placeholder="วางลิงก์ Google Maps ที่นี่..." 
              class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition bg-slate-50"
            >

            <button id="submitBtn" onclick="extractCoords()" 
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-lg shadow-indigo-200">
              ค้นหาพิกัด
            </button>

            <!-- Error Area -->
            <div id="error" class="hidden p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
                <div class="font-bold flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Error
                </div>
                <div id="errorText" class="mt-1"></div>
            </div>

            <!-- Debug Info -->
            <div id="debugInfo" class="hidden p-4 bg-yellow-50 text-yellow-800 text-xs rounded-xl border border-yellow-100 break-all">
                <div class="font-bold mb-1">Last Resolved URL:</div>
                <div id="debugUrl" class="font-mono text-slate-600 mb-2"></div>
                <p class="text-yellow-600">ระบบพยายามอ่าน HTML Body แล้วแต่ยังไม่พบพิกัด</p>
            </div>

            <!-- Result Area -->
            <div id="result" class="hidden space-y-4 mt-6 animate-fade-in">
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span class="text-xs font-semibold text-slate-400 uppercase">Latitude</span>
                  <span id="resLat" class="font-mono text-lg font-bold text-slate-800 block"></span>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span class="text-xs font-semibold text-slate-400 uppercase">Longitude</span>
                  <span id="resLon" class="font-mono text-lg font-bold text-slate-800 block"></span>
                </div>
              </div>
              
              <div class="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <span class="text-xs font-semibold text-emerald-500 uppercase">Combined</span>
                <div class="flex justify-between items-center">
                    <span id="resLoc" class="font-mono text-sm font-medium text-emerald-900 break-all"></span>
                    <button onclick="navigator.clipboard.writeText(document.getElementById('resLoc').innerText)" class="text-emerald-600 hover:text-emerald-800 text-xs font-bold">COPY</button>
                </div>
              </div>

              <div class="relative group">
                <pre id="jsonOutput" class="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto font-mono custom-scrollbar"></pre>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  // ---------------------------------------------------------
  // 2. BACKEND
  // ---------------------------------------------------------
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { return res.status(400).json({ error: 'Invalid JSON' }); }
  }

  const { map_link } = body || {};

  if (!map_link) {
    return res.status(400).json({ error: 'Missing map_link' });
  }

  try {
    const response = await fetch(map_link, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    let finalUrl = response.url;
    let htmlContent = "";

    // ถ้า URL ยังเป็น goo.gl หรือสั้นอยู่ (แสดงว่าติดหน้า JS Redirect)
    // หรือเพื่อความชัวร์ ให้โหลด HTML มาดูด้วยเลย
    if (finalUrl.includes('goo.gl') || finalUrl.includes('app.goo.gl') || response.status === 200) {
        htmlContent = await response.text();
        
        // **เทคนิคใหม่**: ค้นหา URL จริงที่ซ่อนอยู่ใน HTML Body
        // Google มักเก็บ Real URL ไว้ใน window.location.href หรือใน tag meta
        // หรือในตัวแปร js เช่น ["https://www.google.com/maps/..."]
        
        // Regex หาลิงก์ google.com/maps ที่ซ่อนใน text
        const deepLinkMatch = htmlContent.match(/https?:\/\/(?:www\.)?google\.com\/maps\/[^"]+/);
        if (deepLinkMatch) {
            finalUrl = deepLinkMatch[0]; // อัปเดต finalUrl เป็นตัวที่เจอในไส้ใน
        }
    }

    const decodedUrl = decodeURIComponent(finalUrl); 

    console.log("Original:", map_link);
    console.log("Resolved/Extracted:", finalUrl);

    // Regex Set Updated
    const patterns = [
      // 1. /search/lat,lon
      /search\/(-?\d+\.\d+)(?:,|%2C)\s*\+?(-?\d+\.\d+)/,
      
      // 2. /@lat,lon (ตัวที่แก้ปัญหาให้เคสนี้)
      /@(-?\d+\.\d+)(?:,|%2C)\s*(-?\d+\.\d+)/,
      
      // 3. ?q=lat,lon
      /[?&]q=(-?\d+\.\d+)(?:,|%2C)\s*\+?(-?\d+\.\d+)/,
      
      // 4. !3dlat!4dlon
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
      
      // 5. /place/.../@lat,lon (จับหลัง @ เผื่อมี text ยาวๆ ข้างหน้า)
      /place\/.*\/@(-?\d+\.\d+)(?:,|%2C)\s*(-?\d+\.\d+)/
    ];

    let lat = null;
    let lon = null;

    // ตรวจสอบทั้ง URL และ HTML Content (เผื่อพิกัดไม่ได้อยู่ใน URL แต่อยู่ใน Meta tag)
    const sourcesToCheck = [decodedUrl, finalUrl];
    // ถ้าหาใน URL ไม่เจอ อาจจะลองหาพิกัดดิบๆ ใน HTML ก็ได้ (Optional fallback)

    // Step 1: หาจาก URL ก่อน
    for (const source of sourcesToCheck) {
      if (lat && lon) break;
      for (const regex of patterns) {
        const match = source.match(regex);
        if (match && match.length >= 3) {
          lat = match[1];
          lon = match[2];
          break;
        }
      }
    }

    // Step 2: (Fallback) ถ้า URL ไม่มีพิกัด ให้หา pattern พิกัดใน HTML Content ตรงๆ
    // บางที redirect ไปหน้า login แต่ใน HTML มี meta tag coordinates
    if (!lat && htmlContent) {
         // หา pattern ทั่วไปใน text: @9.02056,99.159809
         const contentMatch = htmlContent.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
         if (contentMatch) {
             lat = contentMatch[1];
             lon = contentMatch[2];
         }
    }

    if (lat && lon) {
      return res.status(200).json({
        lat: lat,
        lon: lon,
        loc: `${lat},${lon}`
      });
    } else {
      return res.status(422).json({ 
        error: 'Could not extract coordinates from the resolved URL',
        resolved_url: finalUrl
      });
    }

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
