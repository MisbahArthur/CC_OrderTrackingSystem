from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import Base, engine
from routes import router


Base.metadata.create_all(bind=engine)

app = FastAPI()
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:8001", "http://localhost:8002", "http://localhost:3000", "http://localhost:3001"],
    allow_origins=["*"],  # Allow all origins for development purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

# ... (Middleware and router code remains exactly the same)