#!/usr/bin/env python3
import sys, json
from datetime import datetime

input_data = json.load(sys.stdin)
prompt = input_data.get("prompt", "")
with open("input_data2.log", "a") as f:
    f.write(f"[{datetime.now()}] {prompt}\n")

# command = input_data.get("tool_input", {}).get("command", "")

# dangerous_patterns = ["rm -rf /", "DROP TABLE", "format C:"]
# for pattern in dangerous_patterns:
#     if pattern in command:
#         result = {
#             "hookSpecificOutput": {
#                 "hookEventName": "PreToolUse",
#                 "permissionDecision": "deny",
#                 "permissionDecisionReason": f"high risk command detected: {pattern}"
#             }
#         }
#         json.dump(result, sys.stdout)
#         sys.exit(0)

# 允许执行
sys.exit(0)