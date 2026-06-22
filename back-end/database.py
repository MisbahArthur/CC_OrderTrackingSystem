from sqlalchemy import create_engine
from urllib.parse import quote_plus
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

raw_password = os.getenv("POSTGRES_PASSWORD", "Arthur@09")
encoded_password = quote_plus(raw_password)

host = os.getenv("POSTGRES_HOST", "localhost")
port = os.getenv("POSTGRES_PORT", "5432")
db = os.getenv("POSTGRES_DB", "CC_Ordertracking")
user = os.getenv("POSTGRES_USER", "postgres")

SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg2://{user}:{encoded_password}@{host}:{port}/{db}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_database():
    database = SessionLocal()
    try:
        yield database
    finally:
        database.close()

def create_table():
    Base.metadata.create_all(bind=engine)
