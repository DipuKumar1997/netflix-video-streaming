##  Application Architecture

<p align="center">
  <img src="docs/search-microservices.drawio.svg" width="900"/>
</p>

This diagram focuses on the **Search flow and event-driven communication** between:

- Backend Service  
- Search Service  
- Kafka  
- Elasticsearch  

###  Search Flow
1. Client sends `/search?q=` request to **Backend**
2. Backend communicates with **Search Service**
3. Search Service fetches data from **Elasticsearch**
4. Results are returned to the client

###  Event Flow (Movie Upload)
1. Admin uploads movie via **Backend**
2. Backend publishes event to **Kafka**
3. Search Service listens to Kafka events
4. Search Service updates **Elasticsearch index**

>  Note: Login and Signup functionality works normally and is not included in this architecture diagram. The diagram focuses only on search and Kafka-based communication.

---

##  Branch Information

This repository follows a simple structured branching strategy:

- **master** → Production-ready stable code  
- **feature/es-connection** → Active development branch  
- **init-project** → Initial project setup (reference only)  

All new features are developed in `feature/es-connection` and merged into `master` once stable.
