import pymupdf4llm
import json
import io
import sys

import sys
import os

# Diagnostics (outside JSON block)
print(f"DEBUG: Python Executable: {sys.executable}")
print(f"DEBUG: Python Version: {sys.version}")
print(f"DEBUG: Current Directory: {os.getcwd()}")

def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No input file provided', 'ok': False}))
        return

    file_path = sys.argv[1]
    try:
        # Extract markdown using pymupdf4llm
        md_text = pymupdf4llm.to_markdown(file_path)
        
        result = json.dumps({'markdown': md_text, 'ok': True})
        print(f"---JSON_START---{result}---JSON_END---")
    except Exception as e:
        error_result = json.dumps({'error': str(e), 'ok': False})
        print(f"---JSON_START---{error_result}---JSON_END---")

if __name__ == "__main__":
    main()
