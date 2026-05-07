from cassandra.cluster import Cluster
from cassandra.io.asyncioreactor import AsyncioConnection
class CassandraManager:
    def __init__(self):
        self.session = None
        self.cluster = None

    def connect(self, nodes=["localhost"], keyspace="order_keyspace"):
        self.nodes = nodes
        self.keyspace = keyspace

        self.cluster = Cluster(self.nodes, port=9042)
        self.session = self.cluster.connect()
        self.session.execute(f"""
            CREATE KEYSPACE IF NOT EXISTS {self.keyspace}
            WITH replication = {{'class': 'SimpleStrategy', 'replication_factor': 1}}
        """)
        self.session.set_keyspace(self.keyspace)
        print(f"Connected to Cassandra cluster and using keyspace '{self.keyspace}'")

    def close(self):
        if self.cluster:
            self.cluster.shutdown()

db_manager = CassandraManager()

# Dependency to inject the session into routes
def get_cassandra_session():
    return db_manager.session
