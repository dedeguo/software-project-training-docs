import sys, json
from datetime import datetime

input_data = json.load(sys.stdin)
prompt = input_data.get("prompt", "")
with open("input_data2.log", "a") as f:
    f.write(f"[{datetime.now()}] {input_data}\n")