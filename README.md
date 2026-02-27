# Netflix Video Streaming – Microservices Architecture

## Service Access (VPS Public IP or Localhost)

If running locally: http://localhost:PORT
If deployed on a VPS: http://YOUR_VPS_PUBLIC_IP:PORT

--------------------------------------------------

## Dashboards & Monitoring

| Service | URL (Local Example) | Description |
|----------|--------------------|-------------|
| Homer Dashboard | http://localhost:8001 | Central dashboard for all services |
| Glances | http://localhost:61208 | Real-time system and Docker monitoring |
| Dozzle | http://localhost:8888 | Live Docker container logs |
| AKHQ | http://localhost:8081 | Kafka topic and consumer management |
| Kibana | http://localhost:5601 | Elasticsearch data visualization |

--------------------------------------------------

## Core Application Services

| Service | URL (Local Example) | Description |
|----------|--------------------|-------------|
| Frontend | http://localhost:5173 | React/Vite user interface |
| Backend API | http://localhost:8080 | Main REST API |
| Search Service | http://localhost:8086 | Handles search and indexing |
| Kafka | http://localhost:9092 | Event streaming broker |
| Zookeeper | http://localhost:2181 | Kafka coordination service |
| Elasticsearch | http://localhost:9200 | Search and indexing database |

--------------------------------------------------

# MongoDB Requirement

MongoDB must be installed and running on your machine before starting the application.

Default connection:
mongodb://localhost:27017

If MongoDB is not installed, install it locally and ensure the MongoDB service is running before building and starting Docker containers.

--------------------------------------------------

# Build and Run the Application

From the project root directory:
Build all Docker images: docker compose build
Run the application (foreground mode): docker compose up

--------------------------------------------------

# Application Architecture

<p align="center">
  <img src="docs/search-microservices.drawio.svg" width="900"/>
</p>

This architecture focuses on the search flow and event-driven communication:

1. Client sends `/search?q=` request to Backend.
2. Backend communicates with Search Service.
3. Search Service retrieves data from Elasticsearch.
4. Admin uploads trigger Kafka events.
5. Search Service consumes Kafka events and updates Elasticsearch.

Login and Signup functionality operates normally but is not included in this diagram.
