# Develop Argo Lite

## Developing the frontend

Argo Lite's frontend is written using the [Create React App](https://github.com/facebook/create-react-app) tool chain, using [MobX](https://mobx.js.org/README.html) for state management.

Knowledge of React and MobX is necessary to understand the codebase.

Install node.js, head to `cd argo-lite` and run `npm install` to install the dependencies. And run `npm start` to start the development version. The rest of the commands are also standard [Create React App](https://github.com/facebook/create-react-app) commands, documented [here](argo-lite/README.md).

## Developing the backend

Argo Lite has a sharing server for sharing graph snapshots. See [the Deployment Guide](deploy.md).

## Testing Changes to Argo Lite with Surge

After changes are made to the Argo Lite code base, [Surge](https://surge.sh/) can be used to deploy these changes to a URL that can be shared with others for testing new features. 

To do this, you need to do the following steps:
1) Navigate to the Argo Lite react-app in your terminal

2) Open the package.json file and find the `"homepage"` attribute. Completely remove: `"homepage": "https://poloclub.github.io/argo-graph-lite"`

3) Inside the package.json file, find the `"scripts"` attribute. Within this attribute, there is an attribute named `"deploy"`. Remove the value and replace it with `"npm run build && cp build/index.html build/200.html && surge build https://{YOUR DESIRED URL NAME}.surge.sh"`. An example is shown below:

  `
  "scripts": {
  
    "start": "node scripts/start.js",
    "build": "node scripts/build.js",
    "test": "node scripts/test.js",
    "predeploy": "npm run build",
    "deploy": "npm run build && cp build/index.html build/200.html && surge build https://your_desired_url_name.surge.sh"
  },
  `
  
  4) The package.json file is finished. In the terminal, run `npm install -g surge`

  5) In the terminal, run `npm run build`

  6) Switch to the build directory by running `cd build` in the terminal

  7) Inside the build directory, there is a file called `index.html`. Rename this file to `200.html`
 
  8) After renaming `index.html` to `200.html`, run `npx surge`

  9) Running `npx surge` will prompt you to enter an email and a password of your choice, as well as the directory for your project. After doing this, you must specify the domain name of the link. Use the same name as what you used in the package.json file. After hitting enter, you will be given a shareable URL.
  
