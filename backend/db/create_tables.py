import sqlite3
import os
import os.path
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

db_path = 'recommender.db'

# Connect to the database
try:
    conn = sqlite3.connect(db_path)
    logger.info('Connected to the database.')
    
    # Execute migrations
    migrations_dir = 'migrations/'
    for file in sorted(os.listdir(migrations_dir)):
        file_path = os.path.join(migrations_dir, file)
        with open(file_path, 'r') as f:
            sql = f.read()
            try:
                conn.executescript(sql)
                conn.commit()
                logger.info(f"Executed {file}")
            except sqlite3.Error as err:
                logger.info(f"Error: {str(err)}")
    
except sqlite3.Error as err:
    logger.error(f"Database error: {str(err)}")

finally:
    # Close the database connection
    if 'conn' in locals() and conn:
        conn.close()
        logger.info('Close the database connection.')