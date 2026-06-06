import sqlite3

def initialize_database():
    conn = sqlite3.connect("bdtracker.db")
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")

    ## --- LOG ENTRY TABLE --- ## 
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME UNIQUE NOT NULL,
        mood INTEGER CHECK(mood BETWEEN 1 AND 10),
        energy INTEGER CHECK(energy BETWEEN 1 AND 10),
        journal_text TEXT,
        trigger_tags TEXT,
        is_mixed_state BOOLEAN GENERATED ALWAYS AS (
            CASE WHEN mood <= 4 AND energy >= 7 THEN 1 ELSE 0 END
        ) STORED
    );
    """)

    ## --- SLEEP METRICS TABLE --- ##
    # This is not currently being used, as I do not have any kind of unbiased sleep tracking
    # soon, I plan to get something like an Apple Watch to be able to track and export my sleep
    # patterns into BDTracker.
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sleep_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
        time_in_bed REAL,
        actual_sleep REAL,
        sleep_efficiency REAL GENERATED ALWAYS AS (
            CASE WHEN time_in_bed > 0 THEN (actual_sleep / time_in_bed) * 100 ELSE NULL END
        ) STORED
    );
    """)

    ## --- SESSION TOKEN GENERATION --- ##
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS share_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token_hash TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        is_revoked BOOLEAN DEFAULT 0
    );
    """)

    conn.commit()
    conn.close()
    print("SUCCESS: bdtracker.db initialized.")

if __name__ == "__main__":
    initialize_database()
