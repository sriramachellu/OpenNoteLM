from http.server import BaseHTTPRequestHandler
import pymupdf4llm
import json
import io

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            pdf_bytes = self.rfile.read(content_length)
            
            # Extract markdown using pymupdf4llm
            md_text = pymupdf4llm.to_markdown(io.BytesIO(pdf_bytes))
            
            result = json.dumps({'markdown': md_text, 'ok': True})
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(result.encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_result = json.dumps({'error': str(e), 'ok': False})
            self.wfile.write(error_result.encode('utf-8'))
