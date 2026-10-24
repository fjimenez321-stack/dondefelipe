#!/usr/bin/env python3
import json, os, socket, struct, subprocess, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST, PORT = "127.0.0.1", 8090
RCON_HOST, RCON_PORT = "127.0.0.1", 25575
UNIT = "mc-test1.service"
KEY_FILE = os.path.expanduser("~/.config/mc-test1-api.key")
LOG = os.path.expanduser("~/minecraft-test1/console.log")
ALLOWED = {"list", "save-all", "time query gametime", "difficulty", "weather clear", "weather rain", "weather thunder"}


def rcon_key():
    try:
        with open(os.path.expanduser("~/.config/mc-test1-rcon.key")) as f:
            return f.read().strip()
    except OSError:
        return ""


def rcon(cmd, timeout=5):
    with socket.create_connection((RCON_HOST, RCON_PORT), timeout) as s:
        s.settimeout(timeout)

        def send(rid, typ, body):
            data = struct.pack("<ii", rid, typ) + body.encode() + b"\x00\x00"
            s.sendall(struct.pack("<i", len(data)) + data)

        def recv():
            raw = s.recv(4)
            if len(raw) < 4:
                return None, None, ""
            size = struct.unpack("<i", raw)[0]
            buf = b""
            while len(buf) < size:
                chunk = s.recv(size - len(buf))
                if not chunk:
                    break
                buf += chunk
            rid, typ = struct.unpack("<ii", buf[:8])
            return rid, typ, buf[8:-2].decode("utf-8", "replace")

        send(1, 3, rcon_key())
        rid, typ, _ = recv()
        if rid == -1:
            return {"ok": False, "error": "rcon auth"}
        send(2, 2, cmd)
        _, _, body = recv()
        return {"ok": True, "output": body}


def unit_active():
    try:
        out = subprocess.run(["systemctl", "--user", "is-active", UNIT],
                             capture_output=True, text=True, timeout=10)
        return out.stdout.strip()
    except Exception:
        return "unknown"


def state():
    active = unit_active()
    online = active == "active"
    players, output = [], ""
    if online:
        r = rcon("list")
        output = r.get("output", "")
        if ":" in output:
            part = output.split(":", 1)[1].split(":", 1)[-1] if output.count(":") > 1 else output.split(":", 1)[1]
            players = [p.strip() for p in part.split(",") if p.strip() and p.strip() != "no players online"]
    uptime = 0
    try:
        with open(LOG, encoding="utf-8", errors="replace") as f:
            tail = f.readlines()[-400:]
        for line in reversed(tail):
            if "Done (" in line:
                ts = line[1:9].split(":")
                now = time.localtime()
                then = now.tm_hour * 3600 + now.tm_min * 60 + now.tm_sec
                up = int(ts[0]) * 3600 + int(ts[1]) * 60 + int(ts[2])
                uptime = (then - up) % 86400
                break
    except Exception:
        pass
    return {
        "service": active,
        "online": online,
        "players": players,
        "count": len(players),
        "uptime_seconds": uptime if online else 0,
        "raw": output,
        "ts": int(time.time()),
    }


def wait_down(timeout=90):
    for _ in range(timeout):
        if unit_active() != "active":
            return True
        time.sleep(1)
    return False


def stop_server():
    if unit_active() == "active":
        rcon("stop", timeout=3)
        if not wait_down():
            subprocess.run(["systemctl", "--user", "stop", UNIT], timeout=120)
    return unit_active()


class Handler(BaseHTTPRequestHandler):
    server_version = "mc-test1-bridge"

    def cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "content-type, x-mc-key")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Cache-Control", "no-store")

    def reply(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.cors()
        self.end_headers()
        self.wfile.write(body)

    def authorized(self):
        try:
            with open(KEY_FILE) as f:
                key = f.read().strip()
        except OSError:
            return False
        return bool(key) and self.headers.get("X-MC-Key", "") == key

    def do_OPTIONS(self):
        self.send_response(204)
        self.cors()
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/state"):
            return self.reply(200, state())
        if self.path.startswith("/health"):
            return self.reply(200, {"ok": True})
        self.reply(404, {"error": "ruta"})

    def do_POST(self):
        if not self.path.startswith("/action"):
            return self.reply(404, {"error": "ruta"})
        if not self.authorized():
            return self.reply(401, {"error": "clave"})
        try:
            length = int(self.headers.get("content-length", 0))
            data = json.loads(self.rfile.read(length) or b"{}")
        except Exception:
            return self.reply(400, {"error": "json"})
        action = str(data.get("action", ""))
        value = str(data.get("value", ""))[:240]

        if action == "stop":
            return self.reply(200, {"ok": True, "service": stop_server()})
        if action == "restart":
            stop_server()
            subprocess.run(["systemctl", "--user", "start", UNIT], timeout=120)
            return self.reply(200, {"ok": True, "service": unit_active()})
        if action == "start":
            subprocess.run(["systemctl", "--user", "start", UNIT], timeout=120)
            return self.reply(200, {"ok": True, "service": unit_active()})
        if action == "say":
            if not value:
                return self.reply(400, {"error": "texto"})
            return self.reply(200, rcon("say " + value))
        if action == "command":
            if value not in ALLOWED:
                return self.reply(403, {"error": "comando no permitido", "allowed": sorted(ALLOWED)})
            return self.reply(200, rcon(value))
        self.reply(400, {"error": "accion"})


if __name__ == "__main__":
    print(f"bridge en http://{HOST}:{PORT}")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
