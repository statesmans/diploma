# Use Node.js as the base image
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-buster

# Set the PATH environment variable
ENV PATH /app/node_modules/.bin:$PATH

# Create the /app directory and change ownership
RUN mkdir /app

# Create a new user and group
RUN groupadd -r myusergroup && useradd -r -g myusergroup myuser

# Change the ownership of the /app directory
RUN chown -R myuser:myusergroup /app


# # Install dependencies for building Python from source
# RUN apt-get update && \
#     apt-get install -y \
#     wget \
#     build-essential \
#     zlib1g-dev \
#     libncurses5-dev \
#     libgdbm-dev \
#     libnss3-dev \
#     libssl-dev \
#     libreadline-dev \
#     libffi-dev \
#     libsqlite3-dev \
#     libbz2-dev

# # Download and install Python 3.9 from source
# RUN wget https://www.python.org/ftp/python/3.9.12/Python-3.9.12.tgz && \
#     tar -xf Python-3.9.12.tgz && \
#     cd Python-3.9.12 && \
#     ./configure --enable-optimizations && \
#     make -j 4 && \
#     make altinstall && \
#     cd .. && \
#     rm -rf Python-3.9.12 Python-3.9.12.tgz

# # Ensure pip is installed
# RUN wget https://bootstrap.pypa.io/get-pip.py && /usr/local/bin/python3.9 get-pip.py && rm get-pip.py

# # Copy the requirements file into the container at /app
# COPY requirements.txt /app/

# # Install Python dependencies using the specific Python version
# RUN /usr/local/bin/python3.9 -m pip install -r /app/requirements.txt

# # List installed pip packages
# RUN /usr/local/bin/python3.9 -m pip list

# Install Node.js dependencies
ARG NPM_VERSION
ARG NG_VERSION
ARG NESTJS_VERSION
# RUN npm install -g "npm@^${NPM_VERSION}" \
#     && npm install -g "@angular/cli@^${NG_VERSION}" "@nestjs/cli@^${NESTJS_VERSION
