# Deploy Argo Lite

Deploying your own custom version of Argo Lite is easy (for sharing private/proprietary data or with custom algorithms).

## Frontend

As mentioned in [the development guide](development.md), Argo Lite's frontend uses the [Create React App](https://github.com/facebook/create-react-app) toolchain. It comes with the `gh-pages` tool for deploying to Github Pages, as well as a Travis CI config. You can refer the documentation of either of them (`gh-pages` for manual deployment and Travis CI for automatic deployment). Other tools such as `now.sh` will also work.

There are many useful frontend configuration options in `argo-lite/src/constants/index.js`. You can change the backend and sample graphs linked there.

## Backend Sharing Service

Argo Lite uses [Strapi](https://strapi.io/) for the backend service.

To securely set up Strapi, we recommend following their official documentation.

There are many options for setting up Strapi, here is an easy workflow that we recommend:

- Step 1: Install [Strapi](https://strapi.io/) using their quick start guide
- Step 2: Copy `/api` from [this repository](https://github.com/poloclub/argo-graph-share) as a reference of the `snapshot` content type that we have set up.
- Step 3: Follow the [Deployment guide of Strapi](https://strapi.io/documentation/v3.x/getting-started/deployment.html). Among the list of supported hosting providers, Heroku is an easy start (and they have a free tier).

You can use the [Roles and Permissions](https://strapi.io/documentation/v3.x/plugins/users-permissions.html) feature (available in the admin dashboard by default) to set up your own access control. This allows you to set up access control without writing any code.