FROM node:lts-alpine

# update system
RUN apk --no-cache -U upgrade

# install pm2
RUN npm i -g pm2

# create destination directory change ownership
RUN mkdir -p /home/node/app

# use /home/node/app as working directory
WORKDIR /home/node/app

# copy package, package-lock and process.yml
COPY package*.json process.yml ./

# install production dependencies
RUN npm i --only=production

# copy files
# COPY --chown=node:node --from=builder /app/dist ./dist
COPY . .

# change ownership
RUN chown -R node:node /home/node/app

# switch user
USER node

# open port
EXPOSE 8080

# use pm2 to run the application as stated in config file
ENTRYPOINT ["pm2-runtime", "./process.yml"]
