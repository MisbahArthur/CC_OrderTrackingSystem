from fastapi import FastAPI
from database import db_manager
from routes import router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
   )
@app.on_event("startup")
def startup():
    db_manager.connect(["localhost"], "order_keyspace")

@app.on_event("shutdown")
def shutdown():
    db_manager.close()


app.include_router(router)