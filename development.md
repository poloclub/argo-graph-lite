# Develop Argo Lite

## Developing the frontend

Argo Lite's frontend is written using the [Create React App](https://github.com/facebook/create-react-app) tool chain, using [MobX](https://mobx.js.org/README.html) for state management.

Knowledge of React and MobX is necessary to understand the codebase.

Install node.js, head to `cd argo-lite` and run `npm install` to install the dependencies. And run `npm start` to start the development version. The rest of the commands are also standard [Create React App](https://github.com/facebook/create-react-app) commands, documented [here](argo-lite/README.md).

## Developing the backend

Argo Lite has a sharing server for sharing graph snapshots. See [the Deployment Guide](deploy.md).