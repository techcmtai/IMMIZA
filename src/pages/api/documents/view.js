export default async function handler(req, res) {
  const { url, type } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Check if the URL is a Cloudinary URL (starts with https)
    if (url.startsWith('http')) {
      // For Cloudinary URLs, redirect to the actual image URL
      return res.redirect(url);
    }

    // If not a Cloudinary URL, serve a document viewer page
    res.setHeader('Content-Type', 'text/html');
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Document Viewer - ${type || 'Document'}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background-color: #f5f5f5;
              color: #333;
            }
            .container {
              max-width: 800px;
              width: 100%;
              padding: 20px;
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            .document-container {
              margin: 20px 0;
              max-width: 100%;
              overflow: hidden;
            }
            .document-image {
              max-width: 100%;
              height: auto;
              border-radius: 4px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .icon {
              font-size: 64px;
              margin-bottom: 20px;
              color: #4f46e5;
            }
            h1 {
              margin-bottom: 10px;
              color: #1f2937;
            }
            p {
              margin-bottom: 20px;
              color: #6b7280;
            }
            .btn {
              display: inline-block;
              padding: 10px 20px;
              background-color: #4f46e5;
              color: white;
              border-radius: 4px;
              text-decoration: none;
              font-weight: 500;
              transition: background-color 0.2s;
            }
            .btn:hover {
              background-color: #4338ca;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${type || 'Document'}</h1>
            <div class="document-container">
              <img src="${url}" alt="${type || 'Document'}" class="document-image" />
            </div>
            <a href="/admin/applications" class="btn">Back to Applications</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error serving document:', error);
    return res.status(500).json({ error: 'Error serving document' });
  }
}
