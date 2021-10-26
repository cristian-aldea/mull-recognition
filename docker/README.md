# Docker

- [Docker](#docker)
  - [Building Images](#building-images)

## Building Images

To build the images for the projects in this repository, run the following commands:

```bash
docker build -f docker/Dockerfile -t cristianaldea/mull-recognition:latest .

# Build using local dist/ to avoid downloading all packages
npm i
npm run build
docker build -f docker/local.Dockerfile -t cristianaldea/mull-recognition:latest .
```

## Pushing Images

```bash
docker push cristianaldea/mull-recognition:latest
```
