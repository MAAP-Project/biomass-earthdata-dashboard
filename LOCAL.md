# Running local instance of the dashboard

The repository is a part of the MAAP Biomass Dashboard environment that includes three repositories:

1. [MAAP-Project/biomass-dashboard-datasets](https://github.com/MAAP-Project/biomass-dashboard-datasets)
2. [MAAP-Project/biomass-dashboard-api](https://github.com/MAAP-Project/biomass-dashboard-api)
3. [MAAP-Project/biomass-earthdata-dashboard](https://github.com/MAAP-Project/biomass-earthdata-dashboard)

To get a local instance of the dashboard running, you'll need all these repositories cloned and running on your machine.

## Steps

Follow the following steps to set up the dashboard locally and possibly test a new dataset:

### I: Generate the datasets

Update/add the dataset in the [biomass-dashboard-datasets](https://github.com/MAAP-Project/biomass-dashboard-datasets) repository, locally run the metadata generator lambdas by using the following command and copy the outputs from each.

``` bash
export STAGE=local
python dataset_metadata_generator/src/main.py
python products_metadata_generator/src/main.py
python country_pilots_metadata_generator/src/main.py
```

### II: Run the API backend

In the [biomass-dashboard-api](https://github.com/MAAP-Project/biomass-dashboard-api) repo, update the `example-dataset-metadata.json`, `example-products-metadata.json` and `example-country-pilots-metadata.json` using the contents copied from step I.

Then run the following command to get the docker up and running.

```bash
docker-compose up --build api -e ENV=LOCAL
```

The API is now running at [localhost:8000](http://localhost:8000). Check your datasets at [localhost:8000/v1/datasets](http://localhost:8000/v1/datasets)

### III: Run the dashboard

In the [biomass-earthdata-dashboard](https://github.com/MAAP-Project/biomass-earthdata-dashboard) repo, run the following commands:

```bash
yarn install
yarn serve
```

This serves the dashboard at [localhost:9000](http://localhost:9000)
