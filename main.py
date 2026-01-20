from fastapi import FastAPI
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="مكتبتي المدرسية")

# Mount the manuel directory to serve PDF files
if os.path.exists("manuel"):
    app.mount("/manuel", StaticFiles(directory="manuel"), name="manuel")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main HTML page"""
    html_content = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مكتبتي المدرسية</title>
    <link rel="manifest" href="/manifest.json">
    <style>
        :root {
            --primary-color: #2c3e50;
            --accent-color: #3498db;
            --bg-color: #ecf0f1;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: var(--bg-color);
            display: flex;
            flex-direction: column;
            height: 100vh;
        }

        header {
            background-color: var(--primary-color);
            color: white;
            padding: 15px;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .container {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        nav {
            width: 200px;
            background: white;
            border-left: 1px solid #ddd;
            overflow-y: auto;
            padding: 10px;
        }

        nav button {
            width: 100%;
            padding: 12px;
            margin-bottom: 8px;
            border: none;
            background-color: var(--accent-color);
            color: white;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        }

        nav button:hover {
            background-color: #2980b9;
        }

        main {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: #95a5a6;
        }

        #pdf-viewer {
            width: 100%;
            height: 100%;
            border: none;
        }

        .welcome-msg {
            text-align: center;
            margin-top: 20%;
            color: white;
        }

        @media (max-width: 600px) {
            .container { flex-direction: column; }
            nav { width: 100%; height: auto; display: flex; overflow-x: auto; white-space: nowrap; }
            nav button { width: auto; margin: 0 5px; }
        }
    </style>
</head>
<body>

<header>
    <h1>تطبيق الكتاب المدرسي</h1>
</header>

<div class="container">
    <nav>
        <button onclick="openBook('trim.pdf')">3ManuelScolaire</button>
        <button onclick="openBook('tric.pdf')">3CahierActivités</button>
        <button onclick="openBook('qatm.pdf')">4ManuelScolaire</button>
        <button onclick="openBook('qatc.pdf')">4CahierActivités</button>
        <button onclick="openBook('cinqm.pdf')">5ManuelScolaire</button>
        <button onclick="openBook('cinqc.pdf')">5CahierActivités</button>
    </nav>

    <main id="content-area">
        <div id="welcome" class="welcome-msg">
            <h2>اختر كتاباً لبدء القراءة</h2>
        </div>
        <iframe id="pdf-viewer" style="display: none;"></iframe>
    </main>
</div>

<script> 
   function openBook(fileName) {
        const viewer = document.getElementById('pdf-viewer');
        const welcome = document.getElementById('welcome');
        
        const filePath = `/manuel/${fileName}`;
        
        viewer.src = filePath;
        viewer.style.display = 'block';
        welcome.style.display = 'none';
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('Service Worker Registered'))
                .catch(err => console.log('Service Worker Failed', err));
        });
    }
</script> 
</body>
</html>"""
    return HTMLResponse(content=html_content)

@app.get("/manifest.json")
async def get_manifest():
    """Serve the PWA manifest file"""
    return {
        "name": "مكتبتي المدرسية",
        "short_name": "مكتبتي",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#ecf0f1",
        "theme_color": "#2c3e50",
        "orientation": "any",
        "icons": [
            {
                "src": "/icon-192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "/icon-512.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ]
    }

@app.get("/sw.js")
async def get_service_worker():
    """Serve the service worker for offline functionality"""
    sw_content = """
const CACHE_NAME = 'school-library-v1';
const urlsToCache = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
"""
    return HTMLResponse(content=sw_content, media_type="application/javascript")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)