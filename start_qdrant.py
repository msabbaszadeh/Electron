#!/usr/bin/env python3
"""
Simple script to start a local Qdrant server for testing purposes.
This creates a persistent Qdrant instance with local storage.
"""

import os
import subprocess
import sys
import time
from pathlib import Path

def start_qdrant():
    """Start a local Qdrant server."""
    
    # Create data directory for Qdrant
    data_dir = Path("qdrant_data")
    data_dir.mkdir(exist_ok=True)
    
    print("Starting local Qdrant server...")
    print(f"Data directory: {data_dir.absolute()}")
    
    try:
        # Install qdrant if not already installed
        try:
            import qdrant_client
            print("✓ Qdrant client is already installed")
        except ImportError:
            print("Installing Qdrant client...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "qdrant-client"])
            print("✓ Qdrant client installed successfully")
        
        # Start Qdrant server using Docker (if available) or local instance
        try:
            # Try to use Docker first
            print("Checking for Docker...")
            result = subprocess.run(["docker", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                print("✓ Docker found, starting Qdrant container...")
                
                # Stop any existing Qdrant container
                subprocess.run(["docker", "stop", "qdrant_test"], capture_output=True)
                subprocess.run(["docker", "rm", "qdrant_test"], capture_output=True)
                
                # Start new Qdrant container
                cmd = [
                    "docker", "run", "-d",
                    "--name", "qdrant_test",
                    "-p", "6333:6333",
                    "-v", f"{data_dir.absolute()}:/qdrant/storage",
                    "qdrant/qdrant:latest"
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True)
                if result.returncode == 0:
                    print("✓ Qdrant Docker container started successfully!")
                    print("Waiting for Qdrant to be ready...")
                    time.sleep(5)
                    return True
                else:
                    print(f"Failed to start Docker container: {result.stderr}")
                    
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("Docker not available, trying local Qdrant...")
        
        # If Docker is not available, try to use local Qdrant
        print("Attempting to start local Qdrant server...")
        
        # This is a simplified approach - in a real scenario, you'd download and run Qdrant binary
        print("Note: For full functionality, you may need to:")
        print("1. Install Docker and run: docker run -p 6333:6333 qdrant/qdrant")
        print("2. Or download Qdrant binary from: https://github.com/qdrant/qdrant/releases")
        
        return False
        
    except Exception as e:
        print(f"Error starting Qdrant: {e}")
        return False

def test_qdrant_connection():
    """Test connection to Qdrant server."""
    try:
        from qdrant_client import QdrantClient
        
        client = QdrantClient("localhost", port=6333)
        
        # Test connection
        collections = client.get_collections()
        print(f"✓ Successfully connected to Qdrant")
        print(f"Available collections: {len(collections.collections)}")
        
        return True
        
    except Exception as e:
        print(f"✗ Failed to connect to Qdrant: {e}")
        return False

if __name__ == "__main__":
    print("=== Qdrant Server Manager ===")
    
    # Try to start Qdrant
    if start_qdrant():
        print("\n✓ Qdrant server started successfully!")
    else:
        print("\n⚠ Could not start Qdrant automatically.")
    
    # Test connection
    print("\nTesting connection to Qdrant...")
    if test_qdrant_connection():
        print("✓ Qdrant is ready to use!")
    else:
        print("✗ Qdrant is not available.")
        print("\nTo use Qdrant, please:")
        print("1. Install Docker from: https://www.docker.com/products/docker-desktop")
        print("2. Run: docker run -p 6333:6333 qdrant/qdrant")
        print("3. Or use Qdrant Cloud from: https://cloud.qdrant.io/")