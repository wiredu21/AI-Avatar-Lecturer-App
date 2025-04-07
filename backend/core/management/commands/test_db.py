from django.core.management.base import BaseCommand
from django.db import connections
from django.conf import settings
import time

class Command(BaseCommand):
    help = 'Tests the database connection configured in settings.py'

    def handle(self, *args, **options):
        start_time = time.time()
        
        # Get database configuration
        db_config = settings.DATABASES['default']
        self.stdout.write(self.style.SUCCESS(f"Database configuration:"))
        self.stdout.write(f"  Engine: {db_config['ENGINE']}")
        self.stdout.write(f"  Name: {db_config['NAME']}")
        self.stdout.write(f"  User: {db_config['USER']}")
        self.stdout.write(f"  Host: {db_config['HOST']}")
        self.stdout.write(f"  Port: {db_config['PORT']}")
        
        # Test connection
        self.stdout.write("\nTesting connection...")
        try:
            connection = connections['default']
            connection.ensure_connection()
            
            with connection.cursor() as cursor:
                # Get database version
                cursor.execute("SELECT VERSION()")
                version = cursor.fetchone()[0]
                self.stdout.write(self.style.SUCCESS(f"Connection successful!"))
                self.stdout.write(f"MySQL server version: {version}")
                
                # List tables
                cursor.execute("SHOW TABLES")
                tables = cursor.fetchall()
                if tables:
                    self.stdout.write(f"\nTables in '{db_config['NAME']}' database:")
                    for table in tables:
                        self.stdout.write(f"  - {table[0]}")
                else:
                    self.stdout.write(f"\nNo tables found in '{db_config['NAME']}' database")
                    
                # Get execution time
                elapsed_time = time.time() - start_time
                self.stdout.write(f"\nTest completed in {elapsed_time:.2f} seconds")
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error connecting to database: {e}")) 