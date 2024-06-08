ARG NODE_VERSION=18

FROM  node:${NODE_VERSION}-buster

ENV PATH /app/node_modules/.bin:$PATH

RUN mkdir /app 
#   && chown -R node:node /app

# Create a new user and group
RUN groupadd -r myusergroup && useradd -r -g myusergroup myuser

# Change the ownership of the /app directory
RUN chown -R myuser:myusergroup /app

# RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#     && apt-get update \
#     && apt-get install -yq chromium \
#     && apt-get install -yq jq nano bash-completion \
#     && npm completion > /etc/bash_completion.d/npm

# RUN wget https://github.com/lework/skopeo-binary/releases/download/v1.13.2/skopeo-linux-amd64 -O /usr/local/bin/skopeo
# RUN chmod +x /usr/local/bin/skopeo \
#   && chown -R node:node /usr/local/bin/skopeo
# COPY ./skopeo/policy.json /etc/containers/policy.json



# Copy the requirements file into the container at /app
COPY requirements.txt /app/
run apt-get install python-pip
# # Ensure pip is installed and upgrade it
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     python3-pip \
#     # && pip3 install --upgrade pip \
#     && apt-get clean \
#     && rm -rf /var/lib/apt/lists/*

# Upgrade pip to the latest version
# RUN pip3 install --upgrade pip

# Install any needed packages specified in requirements.txt
# RUN pip install --no-cache-dir -r /app/requirements.txt
# Install Python packages from requirements.txt
# RUN python3.10 -m pip install --no-cache-dir -r /app/requirements.txt




ARG NPM_VERSION
ARG NG_VERSION
ARG NESTJS_VERSION
# RUN npm install -g "npm@^${NPM_VERSION}" \
#     && npm install -g "@angular/cli@^${NG_VERSION}" "@nestjs/cli@^${NESTJS_VERSION}"

WORKDIR /app
