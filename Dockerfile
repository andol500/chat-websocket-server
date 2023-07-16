# Use a lighter version of Node as a parent image
FROM node:16.9
# Set the working directory to /server
WORKDIR /server
# copy package.json into the container at /server
COPY package*.json /server/
COPY prisma /server/prisma/
# install dependencies
RUN npm install
RUN npx prisma generate
# Copy the current directory contents into the container at /server
COPY . /server/
# Make port 80 available to the world outside this container
EXPOSE 8000
# Run the app when the container launches
CMD ["npm", "start"]