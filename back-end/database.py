from sqlalchemy import create_engine
from urllib.parse import quote_plus
from sqlalchemy.orm import declarative_base, sessionmaker


# Your raw password
raw_password = "Arthur@09"

# Encode the password safely
encoded_password = quote_plus(raw_password)

# Construct the URI with the encoded password
SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg2://postgres:{encoded_password}@localhost/CC_Ordertracking"

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
