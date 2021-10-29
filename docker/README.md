# Docker

- [Docker](#docker)
  - [Building the image](#building-the-image)
  - [Running the image](#running-the-image)
  - [Pushing the images](#pushing-the-images)

## Building the image

To build the image for the project in this repository, run the following:

```bash
docker build -f docker/Dockerfile -t cristianaldea/mull-recognition:latest .

# Build using local dist/ to use local node_modules
npm i
npm run build-prod
docker build -f docker/local.Dockerfile -t cristianaldea/mull-recognition:latest .
```

## Running the image

```bash
docker run -p 8080:80 cristianaldea/mull-recognition:latest
```

## Pushing the images

```bash
docker push cristianaldea/mull-recognition:latest
```
