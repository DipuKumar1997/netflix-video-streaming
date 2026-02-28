## syntax=docker/dockerfile:1.5
#FROM maven:3.9.6-eclipse-temurin-17 AS build
#WORKDIR /app
#
#COPY pom.xml .
#COPY common-model/pom.xml ./common-model/
#COPY netflix/pom.xml ./netflix/
#COPY search-service/pom.xml ./search-service/
#
##  SAME CACHE ID
#RUN --mount=type=cache,id=maven-repo,target=/root/.m2 \
#    mvn dependency:go-offline -B
#
#COPY . .
#
##  SAME CACHE ID AGAIN
#RUN --mount=type=cache,id=maven-repo,target=/root/.m2 \
#    mvn -pl netflix -am clean package -DskipTests


# syntax=docker/dockerfile:1.5

FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

#  Copy only pom files
COPY pom.xml .
COPY common-model/pom.xml common-model/pom.xml
COPY netflix/pom.xml netflix/pom.xml
COPY search-service/pom.xml search-service/pom.xml

#  Warm Maven cache
RUN --mount=type=cache,id=maven-repo,target=/root/.m2 \
    mvn -B dependency:go-offline dependency:resolve-plugins

# 3️⃣ Copy source code
COPY . .

# 4️⃣ Build backend only
RUN --mount=type=cache,id=maven-repo,target=/root/.m2 \
    mvn -pl netflix -am clean package -DskipTests


# ================= RUNTIME =================
FROM eclipse-temurin:17-jre
# Install ffmpeg
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/netflix/target/*.jar app.jar
EXPOSE 8080
CMD ["java","-jar","app.jar"]
