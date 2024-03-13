# stage build
FROM node:20-alpine as build

WORKDIR /app

# copy everything to the container
COPY . .

# clean install all dependencies
RUN npm install

# remove potential security issues
RUN npm audit fix
    
# build SvelteKit app
RUN npm run build


# stage run
FROM node:20-alpine

WORKDIR /app

# copy dependency list
COPY --from=build /app/package*.json ./

# clean install dependencies, no devDependencies, no prepare script
RUN npm ci --production --ignore-scripts

# remove potential security issues
RUN npm audit fix

# copy built SvelteKit app to /app
COPY --from=build /app/build ./

EXPOSE 3000

CMD ["node", "./index.js"]
