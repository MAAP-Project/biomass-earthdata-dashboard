# Biomass Earthdata Dashboard

The Biomass Earthdata Dashboard is a stripped-down version of the dashboard developed to support deriving insights on the impact of COVID-19 on different environmental factors. 

## Current Features

* Raster Visualization

## Installation and Usage

The steps below will walk you through setting up your own instance of the project.

### Install Project Dependencies

To set up the development environment for this website, you'll need to install the following on your system:

- [Node](http://nodejs.org/) 12.x (To manage multiple node versions we recommend [nvm](https://github.com/creationix/nvm))
- [Yarn](https://yarnpkg.com/) package manager

### Install Application Dependencies

If you use [`nvm`](https://github.com/creationix/nvm), activate the desired Node version:

```
nvm install
```

or

```
nvm use 12
```

Install Node modules:

```
yarn install
```

### Usage

#### Config files

All the config files can be found in `app/assets/scripts/config`.
After installing the projects there will be 3 main files:
  - `local.js` - Used only for local development. On production this file should not exist or be empty.
  - `staging.js`
  - `production.js`

The `production.js` file serves as base and the other 2 will override it as needed:
  - `staging.js` will be loaded whenever the env variable `DS_ENV` is set to staging.
  - `local.js` will be loaded if it exists.

The following options must be set: (The used file will depend on the context):
  - `value` - Description

Example:
```
module.exports = {
  value: 'some-value'
};
```

#### Starting the app

```
yarn serve
```
Compiles the sass files, javascript, and launches the server making the site available at `http://localhost:9000/`
The system will watch files and execute tasks whenever one of them changes.
The site will automatically refresh since it is bundled with livereload.

# Deployment
Set the AWS environment variables:
```
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity | jq .Account -r)
export AWS_REGION=$(aws configure get region)
```
To prepare the app for deployment run:

```
yarn build
```
or
```
yarn stage
```

This will package the app and place all the contents in the `dist` directory.
The app can then be run by any web server.

**When building the site for deployment provide the base url trough the `BASEURL` environment variable. Omit the leading slash. (E.g. https://example.com)**

Run on AWS:

```bash
export API_URL=CHANGEME
nvm use
yarn deploy
```

# License
This project is licensed under **Apache 2**, see the [LICENSE](LICENSE) file for more details.

# Troubleshooting

* Syntax error when running `cdk` commands - Check that `cdk` command is being run with nodejs and not another language version (such as python).
