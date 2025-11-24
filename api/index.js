/**
 * Vercel Serverless Function (Hybrid: Frontend + Backend)
 * * Deployment on Vercel:
 * - Place this file in "api/index.js"
 * - (Optional) Add vercel.json to rewrite root path to /api
 */

export default async function handler(req, res) {
  // ตั้งค่า CORS ให้ครบถ้วน เผื่อเรียกจาก Domain อื่น
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle Preflight Request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ---------------------------------------------------------
  // ส่วนที่ 1: FRONTEND (ทำงานเมื่อเรียกผ่าน Browser method GET)
  // ---------------------------------------------------------
  if (req.method === 'GET') {
    const html = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Google Maps Latitude/Longitude Extractor</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;600&display=swap" rel="stylesheet">
        <style> body { font-family: 'Prompt', sans-serif; } </style>
        <script>
          async function extractCoords() {
            const btn = document.getElementById('submitBtn');
            const resultDiv = document.getElementById('result');
            const inputUrl = document.getElementById('urlInput').value.trim();
            const errorDiv = document.getElementById('error');
            
            // Reset state
            if(!inputUrl) return;
            btn.disabled = true;
            btn.innerText = 'กำลังแกะรอยลิงก์...';
            resultDiv.classList.add('hidden');
            errorDiv.classList.add('hidden');

            try {
              // เรียก API กลับมาที่ตัวมันเอง (Self-request)
              const response = await fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ map_link: inputUrl })
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
              }

              // แสดงผลลัพธ์
              document.getElementById('resLat').innerText = data.lat;
              document.getElementById('resLon').innerText = data.lon;
              document.getElementById('resLoc').innerText = data.loc;
              document.getElementById('jsonOutput').innerText = JSON.stringify(data, null, 2);
              
              resultDiv.classList.remove('hidden');

            } catch (err) {
              errorDiv.innerText = err.message;
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
            <div class="bg-red-500 text-white p-2 rounded-lg">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-slate-800">Map Coordinate Extractor</h1>
              <p class="text-xs text-slate-500">แปลง Short Link เป็น Lat/Lon</p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Google Maps Short Link</label>
              <input type="text" id="urlInput" placeholder="https://maps.app.goo.gl/..." 
                class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition bg-slate-50"
              >
            </div>

            <button id="submitBtn" onclick="extractCoords()" 
              class="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 disabled:bg-gray-400 disabled:scale-100 shadow-lg shadow-red-200">
              ค้นหาพิกัด
            </button>

            <!-- Error Message -->
            <div id="error" class="hidden p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-2">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span class="mt-0.5">ไม่พบพิกัด หรือลิงก์ไม่ถูกต้อง</span>
            </div>

            <!-- Result Area -->
            <div id="result" class="hidden space-y-4 mt-6 animate-fade-in">
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Latitude</span>
                  <span id="resLat" class="font-mono text-lg font-bold text-slate-800"></span>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Longitude</span>
                  <span id="resLon" class="font-mono text-lg font-bold text-slate-800"></span>
                </div>
              </div>
              
              <div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <span class="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-1">Combined (loc)</span>
                <div class="flex justify-between items-center">
                    <span id="resLoc" class="font-mono text-sm font-medium text-blue-900 break-all"></span>
                    <button onclick="navigator.clipboard.writeText(document.getElementById('resLoc').innerText)" class="text-blue-500 hover:text-blue-700 text-xs font-bold">COPY</button>
                </div>
              </div>

              <div class="relative group">
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">JSON Response</span>
                <pre id="jsonOutput" class="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto font-mono custom-scrollbar"></pre>
              </div>
            </div>
          </div>
          
          <div class="mt-8 text-center text-xs text-slate-400">
            Deployed on Vercel Node.js Runtime
          </div>
        </div>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate'); // Cache strategy
    return res.status(200).send(html);
  }

  // ---------------------------------------------------------
  // ส่วนที่ 2: BACKEND (ทำงานเมื่อเรียกผ่าน API method POST)
  // ---------------------------------------------------------
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Parse Body อย่างปลอดภัย (บางที Vercel ส่งมาเป็น string)
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const { map_link } = body || {};

  if (!map_link) {
    return res.status(400).json({ error: 'Missing "map_link" parameter' });
  }

  try {
    // ใช้ Native Fetch ของ Node.js 18+
    const response = await fetch(map_link, {
      method: 'GET',
      redirect: 'follow', // สำคัญมาก: ต้องตาม Redirect ไปจนสุด
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const finalUrl = response.url;
    console.log("Input:", map_link, "-> Resolved:", finalUrl);

    // Regex Patterns (เรียงตามลำดับความน่าจะเป็น)
    // 1. แบบ Search: /search/9.018,-99.123
    const searchRegex = /search\/(-?\d+\.\d+)(?:,|%2C)\+?(-?\d+\.\d+)/;
    // 2. แบบ @: @9.018,99.123
    const atRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    // 3. แบบ Query Param: ?q=9.018,99.123
    const qRegex = /[?&]q=(-?\d+\.\d+)(?:,|%2C)\+?(-?\d+\.\d+)/;
    // 4. แบบ 3D data: !3d9.018!4d99.123
    const d3Regex = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;

    let match = finalUrl.match(searchRegex);
    if (!match) match = finalUrl.match(atRegex);
    if (!match) match = finalUrl.match(qRegex);
    if (!match) match = finalUrl.match(d3Regex);

    if (match && match.length >= 3) {
      const lat = match[1];
      const lon = match[2];
      
      return res.status(200).json({
        lat: lat,
        lon: lon,
        loc: `${lat},${lon}`
      });
    } else {
      // ถ้าหาไม่เจอ ให้คืน error พร้อม URL ที่ redirect ไปถึงแล้ว (เผื่อไว้ debug)
      return res.status(422).json({ 
        error: 'Could not extract coordinates from the resolved URL',
        resolved_url: finalUrl 
      });
    }

  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ error: 'Failed to process URL', details: error.message });
  }
}
