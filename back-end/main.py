from fastapi import FastAPI
from database import db_manager
from routes import router

app = FastAPI()

@app.on_event("startup")
def startup():
    db_manager.connect(["localhost"], "order_keyspace")

@app.on_event("shutdown")
def shutdown():
    db_manager.close()


app.include_router(router)