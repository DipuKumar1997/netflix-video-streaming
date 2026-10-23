#!/bin/bash

# 1. Create required directory structure
mkdir -p src/test/java

# 2. Move test files out of src/main/ and into src/test/java
if [ -d "src/main/test" ]; then
    mv src/main/test/* src/test/java/ 2>/dev/null || true
    rm -rf src/main/test
fi

# 3. Ensure src/main/resources exists
mkdir -p src/main/resources

