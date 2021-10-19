# Biomass Earthdata Dashboard

The Biomass Earthdata Dashboard is a stripped-down version of the dashboard developed to support deriving insights on the impact of COVID-19 on different environmental factors. 

## License
This project is licensed under **Apache 2**, see the [LICENSE](LICENSE) file for more details.

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

## Deployment 

### Deployment via GitHub Actions

This project is configured to automatically deploy any changes made to the `main`, `staging`, or
`production` branches.

These GitHub Secrets should be configured for the repository:

- AWS_ACCOUNT_ID
- AWS_REGION
- PRODUCTION_API_URL
- STAGING_API_URL
- DIT_API_URL

The 3 API secrets should include `/v1` on the end, e.g., `https://jsxxxxxxh.execute-api.us-west-2.amazonaws.com/v1`.

### Deployment Manual
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

## Configuring CloudFront

The dashboard is a single page app (SPA) and is deployed as an S3 website. In order to allow relative links with parameters in the SPA to redirect to the right content in the SPA, the server must return the index page (index.html) whenever SPA with path and parameters is requested. To do this, we create a CloudFront distribution in front of the S3 website. 

To create this distribution:

- In the AWS Console CloudFront page, click "Create distribution"
- If you know what the custom domain name for your dashboard will be, set the "Alternate domain names" to the custom domain name you will configure in DNS, e.g., biomass.dit.maap-project.org. This setting is only for informational purposes in the AWS Console, so this can be left blank. Choose the "Custom SSL Certificate" that matches the custom domain.
- Set the "Default root object" to `index.html`
- Change the Behavior for the Path pattern `Default (*)` to `Managed-CachingDisabled` (otherwise, changes to the S3 bucket will only be reflected in the website once per day)
- Add Error Pages for both 403 and 404 that direct to `/index.html` (this enables the deep linking capability)

After the Cloudfront distribution has been created, you can either use the distribution directly from it's default URL (e.g., x1qwy4ijnynb5b.cloudfront.net) or create a DNS alias in Route53 for it. 

To create a DNS alias to the CloudFront distribution (optional):

- In the AWS Console Route53 Dashboard, choose the Hosted Zone you wish to create the record for and click "Create record"
- The record name should be the same as used for the "Alternate domain names" in Route53
- Select "A" record, of type alias
- The value should be the CloudFront name, e.g., xzwr27jkat7fy.cloudfront.net.

## Troubleshooting

* Syntax error when running `cdk` commands - Check that `cdk` command is being run with nodejs and not another language version (such as python).
