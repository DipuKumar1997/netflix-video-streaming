# Netflix Video Streaming Platform (Microservices Architecture)

A production-grade, event-driven video streaming platform built with **Spring Boot**, **React (Vite)**, **AWS S3/CloudFront**, **Apache Kafka**, **Elasticsearch**, **Kubernetes**, and **Terraform**. Designed for adaptive bitrate HLS video playback, premium subscription gating, and scalable cloud infrastructure.

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/DipuKumar1997/netflix-video-streaming)

---

## Application Architecture

This architecture focuses on the search flow and event-driven communication:

1. Client sends `/search?q=` request to Backend.
2. Backend communicates with Search Service.
3. Search Service retrieves data from Elasticsearch.
4. Admin uploads trigger Kafka events.
5. Search Service consumes Kafka events and updates Elasticsearch.

> *Login and Signup functionality operates normally but is not included in this diagram.*

```
[ Client ] ──(/search?q=)──> [ Backend API Gateway ] ───> [ Search Service ] ───> [ Elasticsearch ]
                                                                   ▲
                                                                   │ (Consumes Kafka Event)
[ Admin Upload ] ──────────────────────────────────────────> [ Apache Kafka ]
```

---

## End-to-End Media Delivery Architecture

```
[ React / Vite Frontend ]
        │
        ├── Authorization: Bearer <JWT> / Cookie
        ▼
[ Spring Boot API Gateway / Backend ] ─── (Auth Check: JWT Claims & MongoDB)
        │                                         │
        ├── Razorpay Payment Webhooks             ├── Produces Events
        ▼                                         ▼
[ Subscription Status: ACTIVE ]           [ Apache Kafka ]
        │                                         │
        ├── Redirects to Signed HLS               ├── Dynamic Search Indexing
        ▼                                         ▼
[ AWS CloudFront CDN (OAC) ] <─────────── [ Elasticsearch Engine ]
        │
        ▼
[ AWS S3 Media Bucket ] (.m3u8 / .ts segments)
```

---

## Tech Stack

* **Backend:** Java 17, Spring Boot, Spring Security, Spring Cloud, RESTful APIs, JPA/Hibernate, JWT authentication, FFmpeg HLS transcoding
* **Frontend:** React, Vite, TypeScript, Video.js (VHS), Tailwind CSS v4, Lucide Icons
* **Databases & Search:** MongoDB Atlas, PostgreSQL, Elasticsearch, Redis
* **Messaging & Event-Driven:** Apache Kafka, AKHQ
* **Cloud & DevOps:** AWS (S3, CloudFront OAC, IAM), Terraform, Docker, Kubernetes (K8s), Helm
* **Monitoring & Tooling:** Kibana, Glances, Dozzle

---

## Key Features

### 1. Adaptive Bitrate (ABR) HLS Streaming
* Transcodes raw video uploads into **HLS (HTTP Live Streaming)** master playlists (`master.m3u8`) and multi-resolution variants (`1080p`, `720p`, `480p`, `360p`).
* Serves video segments directly via **AWS CloudFront CDN** backed by Origin Access Control (OAC) and customized CORS preflight policies.

### 2. Tiered Access Control & Token Security
* Custom `JwtAuthenticationFilter` cross-verifies stateless JWT payload claims (`isPremium`) and live database status (`subscriptionStatus: ACTIVE`).
* Custom Video.js `beforeRequest` interceptor automatically attaches Bearer tokens to streaming requests while supporting fallback cookie authorization.

### 3. Integrated Payments & Instant Upgrades
* Integrated **Razorpay Checkout API** for automated subscription handling.
* Payment verification webhooks immediately update user entitlements and grant `ROLE_PREMIUM` access across active sessions.

### 4. High-Performance Search Engine
* Asynchronous data sync pipeline offloads catalog data into **Elasticsearch** via Kafka event streams.
* Achieves sub-20ms query latency across multi-attribute full-text search datasets.

---

## Infrastructure & Cloud Provisioning

Infrastructure is defined as code using **Terraform** under `terraform/`:

* **AWS S3:** Private bucket storage for master playlists (`.m3u8`) and `.ts` media chunks.
* **AWS CloudFront:** CDN distribution configured with:
  * Origin Access Control (OAC) allowing read access exclusively to CloudFront distribution ARNs.
  * `Managed-CORS-With-Preflight` Response Headers Policy to allow secure cross-origin streaming.
  * `Managed-CachingOptimized` Cache Policy for edge segment delivery.

---

## Local Development & Setup

### Prerequisites
* Java 17+ & Maven 3.8+
* Node.js 18+ & npm
* Docker Desktop & Kubernetes (`kubectl`, `helm`)
* Terraform CLI (1.3+)

### 1. Clone the Repository
```bash
git clone https://github.com/DipuKumar1997/netflix-video-streaming.git
cd netflix-video-streaming
```

### 2. Cloud Infrastructure Provisioning
```bash
cd terraform
terraform init
terraform apply -auto-approve
```

### 3. Backend Setup
```bash
cd ../backend-service
# Update src/main/resources/application.properties with AWS credentials and MongoDB URI
mvn clean package -DskipTests
docker build -t netflix-backend:latest .
```

### 4. Kubernetes / Helm Deployment
```bash
cd ../helm
helm upgrade --install netflix-platform ./netflix-chart
```

### 5. Frontend Setup
```bash
cd ../frontend-service
npm install
npm run dev
```
The client app will be accessible at `http://localhost:5173`.

---

## Environment Configuration

### Backend (`application-prod.properties`)
```properties
spring.data.mongodb.uri=mongodb+srv://<user>:<password>@cluster.mongodb.net/netflix
aws.region=us-east-1
aws.s3.bucket=netflix-media-platform-xxxx
aws.cloudfront.domain=https://d2wp92cwk7mzt0.cloudfront.net
jwt.secret=YOUR_64_CHARACTER_BASE64_SECRET_KEY
razorpay.key.id=YOUR_RAZORPAY_KEY_ID
razorpay.key.secret=YOUR_RAZORPAY_KEY_SECRET
```

---

## Core API Endpoints

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates user & returns JWT token |
| `GET` | `/stream/{videoId}/master.m3u8` | `ROLE_PREMIUM` | Fetches master HLS playlist for streaming |
| `POST` | `/api/payment/create-order` | `ROLE_USER` | Generates a Razorpay payment order |
| `POST` | `/api/payment/verify-payment` | `ROLE_USER` | Verifies signature & upgrades user to `ROLE_PREMIUM` |
| `GET` | `/api/videos/search?q={query}` | Public | Executes full-text search against Elasticsearch |

---

## Author

**Dipu Kumar**  
*Computer Science & Engineering, NIT Mizoram*  
* **GitHub:** [github.com/DipuKumar1997](https://github.com/DipuKumar1997)  
* **LinkedIn:** [linkedin.com/in/dipu-kumar-450026334](https://linkedin.com/in/dipu-kumar-450026334)
