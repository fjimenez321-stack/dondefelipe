#!/usr/bin/env python3
import json, os, re, socket, struct, sys, time
from datetime import datetime, timezone

BASE = os.path.dirname(os.path.abspath(__file__))
LOG = os.environ.get("MC_LOG", os.path.expanduser("~/minecraft-test1/console.log"))
STATE = os.path.join(BASE, "..", ".checker-state.json")
OUT = os.path.join(BASE, "..", "stats.json")
HOST = os.environ.get("MC_HOST", "127.0.0.1")
PORT = int(os.environ.get("MC_PORT", "25565"))
PUBLIC = os.environ.get("MC_PUBLIC", "test1.playit.gg")

RE_JOIN = re.compile(r"\]: (\w{3,16}) joined the game")
RE_LEAVE = re.compile(r"\]: (\w{3,16}) left the game")
RE_DONE = re.compile(r"\]: Done \(([\d.]+)s\)!")
RE_VERSION = re.compile(r"Starting minecraft server version (\S+)")
RE_COLOR = re.compile(r"\u00a7.")


def varint(n):
    out = b""
    while True:
        b = n & 0x7F
        n >>= 7
        out += bytes([b | (0x80 if n else 0)])
        if not n:
            return out


def ping(timeout=4.0):
    t0 = time.time()
    try:
        s = socket.create_connection((HOST, PORT), timeout)
        s.settimeout(timeout)
        h = HOST.encode()
        pkt = b"\x00" + varint(774) + varint(len(h)) + h + struct.pack(">H", PORT) + b"\x01"
        s.sendall(varint(len(pkt)) + pkt + b"\x01\x00")
        buf = b""
        while True:
            chunk = s.recv(4096)
            if not chunk:
                break
            buf += chunk
            try:
                i = 0
                while buf[i] & 0x80:
                    i += 1
                i += 1
                if buf[i] != 0:
                    continue
                i += 1
                ln = sh = 0
                while True:
                    v = buf[i]
                    i += 1
                    ln |= (v & 0x7F) << sh
                    sh += 7
                    if not v & 0x80:
                        break
                if len(buf) >= i + ln:
                    data = json.loads(buf[i:i + ln].decode("utf-8", "replace"))
                    return {"ok": True, "ms": int((time.time() - t0) * 1000), "data": data}
            except Exception:
                continue
        return {"ok": False}
    except Exception:
        return {"ok": False}


def state_load():
    try:
        with open(STATE, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"players": {}, "sessions": 0, "joins": 0, "online": [], "events": [], "history": []}


def props():
    out = {}
    try:
        with open(os.path.expanduser("~/minecraft-test1/server.properties"), encoding="utf-8") as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    out[k.strip()] = v.strip()
    except OSError:
        pass
    return out


def player(st, name):
    return st["players"].setdefault(name, {"seconds": 0, "sessions": 0, "last_seen": None})


def close_session(st, name, now):
    p = st["players"].get(name)
    if p and p.get("since"):
        secs = max(0, now - p["since"])
        p["seconds"] += secs
        st["total_seconds"] = st.get("total_seconds", 0) + secs
        p["since"] = None
    if name in st["online"]:
        st["online"].remove(name)


def parse_log(st, now):
    try:
        size = os.path.getsize(LOG)
    except OSError:
        return
    off = st.get("log_offset", 0)
    if size < off:
        off = 0
    with open(LOG, "rb") as f:
        f.seek(off)
        text = f.read().decode("utf-8", "replace")
        st["log_offset"] = f.tell()
    for line in text.splitlines():
        m = RE_VERSION.search(line)
        if m:
            st["version"] = m.group(1)
        if RE_DONE.search(line):
            st["boot_ts"] = now
        m = RE_JOIN.search(line)
        if m:
            name = m.group(1)
            p = player(st, name)
            p["sessions"] += 1
            p["since"] = now
            p["last_seen"] = now
            st["sessions"] = st.get("sessions", 0) + 1
            st["joins"] = st.get("joins", 0) + 1
            if name not in st["online"]:
                st["online"].append(name)
            st.setdefault("events", []).append({"t": now, "name": name, "kind": "join"})
            continue
        m = RE_LEAVE.search(line)
        if m:
            name = m.group(1)
            player(st, name)["last_seen"] = now
            close_session(st, name, now)
            st.setdefault("events", []).append({"t": now, "name": name, "kind": "leave"})
    st["events"] = st.get("events", [])[-24:]


def main():
    now = int(time.time())
    st = state_load()
    st.setdefault("total_seconds", 0)
    parse_log(st, now)
    p = ping()
    online = p["ok"]
    pr = props()
    ping_data = p.get("data", {}) if online else {}
    live = sorted(set(st.get("online", [])) | {
        x.get("name") for x in (ping_data.get("players", {}).get("sample") or [])
    })

    if not online:
        for name in list(st.get("online", [])):
            close_session(st, name, now)
        live = []

    players = []
    for name, d in st["players"].items():
        secs = d.get("seconds", 0) + (max(0, now - d["since"]) if d.get("since") and online else 0)
        players.append({
            "name": name,
            "hours": round(secs / 3600, 2),
            "sessions": d.get("sessions", 0),
            "last_seen": d.get("last_seen"),
            "online": name in live,
        })
    players.sort(key=lambda x: (-x["hours"], x["name"]))

    hist = st.get("history", []) + [{"t": now, "on": int(online), "n": len(live), "ms": p.get("ms", 0)}]
    hist = hist[-2880:]
    st["history"] = hist

    total = st["total_seconds"] + sum(
        max(0, now - d["since"]) for d in st["players"].values() if d.get("since") and online
    )
    uptime = now - st["boot_ts"] if online and st.get("boot_ts") else st.get("last_uptime", 0)
    motd = ping_data.get("description") if isinstance(ping_data.get("description"), str) else pr.get("motd", "")
    motd = RE_COLOR.sub("", motd or "").replace("\\u00a7", "")

    stats = {
        "updated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "updated_ts": now,
        "public_address": PUBLIC,
        "server": {
            "online": online,
            "latency_ms": p.get("ms"),
            "version": ping_data.get("version", {}).get("name") or st.get("version") or "1.21.11",
            "motd": motd,
            "players": len(live),
            "max_players": int(pr.get("max-players", 8)),
            "uptime_seconds": uptime,
        },
        "totals": {
            "hours": round(total / 3600, 2),
            "sessions": st.get("sessions", 0),
            "unique_players": len(st["players"]),
            "joins": st.get("joins", 0),
            "uptime_24h": round(100 * sum(h["on"] for h in hist) / len(hist), 1),
        },
        "players": players,
        "online_now": live,
        "events": list(reversed(st.get("events", [])))[:12],
        "history": hist,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    st["last_uptime"] = uptime
    with open(STATE, "w", encoding="utf-8") as f:
        json.dump(st, f, ensure_ascii=False)
    print(f"{'ABIERTO' if online else 'CERRADO'} | {len(live)}/{stats['server']['max_players']} | "
          f"{stats['totals']['hours']}h | {stats['totals']['sessions']} sesiones")


if __name__ == "__main__":
    main()
