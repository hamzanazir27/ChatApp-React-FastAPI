import uvicorn
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Socket.IO server (sirf socket.io use ho raha hai, websockets nahi likh rahe manually)
sio = socketio.AsyncServer(cors_allowed_origins=["http://localhost:5173"], async_mode="asgi")

# FastAPI app
app = FastAPI()

# Attach socket.io with FastAPI
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Socket.IO server running!"}

# --- Socket.IO Events ---
@sio.event
async def connect(sid, environ):
    print("🔌 Client connected:", sid)

@sio.event
async def disconnect(sid):
    print("❌ Client disconnected:", sid)

@sio.event
async def chat_message(sid, data):
    # data: {"name": "Hamza", "message": "Hello!"}
    print("Message:", data)
    await sio.emit("chat_message", {"sid": sid, "name": data["name"], "message": data["message"]})

if __name__ == "__main__":
    uvicorn.run(socket_app, host="127.0.0.1", port=8000, reload=True)
