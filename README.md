# Mull Recognition

This repository contains the source code and development tools for Mull Recognition, which is a standalone application implementing the waste detection tool from [RGPosadas/Mull](https://github.com/RGPosadas/Mull).

Mull Recognition implements real-time object detection in the browser, and is capable of classifying the appropriate action to take for the given waste (trash, recycle, etc.). It is implemented using Tensorflow, and leverages a TensorflowJS model trained on custom data.

See [cristian-aldea/mull-model](https://github.com/cristian-aldea/mull-model) for the model files used by this application.

- [Mull Recognition](#mull-recognition)
  - [Requirements](#requirements)
  - [Development](#development)
  - [Building](#building)

## Requirements

To develop and contribute to this repository you will need the following:

- [the latest LTS nodejs version](https://nodejs.org/en/)

To install the project's dependencies:

```bash
npm i
```

## Development

To serve the application locally:

```bash
npm start
```

To lint the typescript code using eslint:

```bash
npm run lint
```

To upgrade all packages to their latest version:

```bash
npm run update
```

## Building

See the [the docker README](docker/README.md) for details on how to build and run application for production.
