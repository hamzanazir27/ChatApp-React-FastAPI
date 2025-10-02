import uvicorn
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Frontend origin allowed (for dev mode only)
FRONTEND_ORIGINS = ["http://localhost:5173"]

sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")
app = FastAPI()
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

# CORS (only needed for local dev, not when deployed together)
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve React build files (after running npm run build in frontend/)
from fastapi.staticfiles import StaticFiles

app.mount("/", StaticFiles(directory="../client/dist", html=True), name="static")


@app.get("/")
async def serve_react_index():
    index_path = os.path.join("../frontend/dist", "index.html")
    return FileResponse(index_path)

# Socket.IO events
@sio.event
async def connect(sid, environ):
    print("✅ Client connected:", sid)

@sio.event
async def disconnect(sid):
    print("❌ Client disconnected:", sid)

@sio.event
async def chat_message(sid, data):
    print(f"💬 {sid} says: {data}")
    await sio.emit("chat_message", {"sid": sid, "message": data})

if __name__ == "__main__":
    uvicorn.run("main:socket_app", host="0.0.0.0", port=8000, reload=True)
