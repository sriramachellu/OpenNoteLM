from flask import Flask, request, jsonify
import pymupdf4llm
import tempfile
import os

app = Flask(__name__)

# Catch-all route to handle Vercel routing paths (e.g., POST /api/extract)
@app.route('/', defaults={'path': ''}, methods=['POST', 'GET', 'OPTIONS'])
@app.route('/<path:path>', methods=['POST', 'GET', 'OPTIONS'])
def extract_pdf(path):
    if request.method == 'OPTIONS':
        return '', 200

    if request.method != 'POST':
        return jsonify({"error": "Method not allowed", "ok": False}), 405
        
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded", "ok": False}), 400
        
    file = request.files['file']
    content = file.read()
    
    if len(content) > 4 * 1024 * 1024:
        return jsonify({"error": "File exceeds 4MB Vercel serverless size limit.", "ok": False}), 413
        
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Please upload a PDF file.", "ok": False}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        md_text = pymupdf4llm.to_markdown(tmp_path)
        return jsonify({"markdown": md_text, "ok": True})
    except Exception as e:
        return jsonify({"error": str(e), "ok": False}), 500
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
