from cassandra.cluster import Cluster

class CassandraManager:
    def __init__(self):
        self.session = None
        self.cluster = None

    def connect(self, nodes, keyspace):
        self.cluster = Cluster(nodes)
        self.session = self.cluster.connect()
        self.session.execute(f"""
            CREATE KEYSPACE IF NOT EXISTS {keyspace}
            WITH replication = {{'class': 'SimpleStrategy', 'replication_factor': 1}}
        """)
        self.session.set_keyspace(keyspace)
        print(f"Connected to Cassandra cluster and using keyspace '{keyspace}'")

    def close(self):
        if self.cluster:
            self.cluster.shutdown()

db_manager = CassandraManager()

# Dependency to inject the session into routes
def get_cassandra_session():
    return db_manager.session