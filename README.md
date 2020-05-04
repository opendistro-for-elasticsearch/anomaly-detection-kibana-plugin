## Open Distro for Elasticsearch Anomaly Detection

The Open Distro for Elasticsearch Anomaly Detection plugin enables you to leverage Machine Learning based algorithms to automatically detect anomalies as your log data is ingested. Combined with Alerting, you can monitor your data in near real time and automatically send alert notifications . With an intuitive Kibana interface and a powerful API, it is easy to set up, tune, and monitor your anomaly detectors.

## Highlights

Anomaly detection is using Random Cut Forest (RCF) algorithm for detecting anomalous data points.

You should use anomaly detection kibana plugin with the same version of [Open Distro Alerting kibana plugin](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin). You can also create monitor based on anomaly detector. A scheduled monitor run checks the anomaly detection results regularly and collects anomalies to trigger alerts based on custom trigger conditions.

## Current Limitations

- We will continuously add new unit test cases, but we don't have 100% unit test coverage for now. This is a great area for developers from the community to contribute and help improve test coverage.
- Please see documentation links and GitHub issues for other details.

## Documentation

Please see our [documentation](https://opendistro.github.io/for-elasticsearch-docs/docs/ad/).

## Setup

1. Download Elasticsearch for the version that matches the [Kibana version specified in package.json](./package.json#L7).
1. Download and install the appropriate [Open Distro for Elasticsearch Anomaly Detection Kibana plugin](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin).
1. Download the Kibana source code for the [version specified in package.json](./package.json#L7) you want to set up.

   See the [Kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md#setting-up-your-development-environment) for more instructions on setting up your development environment.

1. Change your node version to the version specified in `.node-version` inside the Kibana root directory.
1. Create a `plugins` directory inside the Kibana source code directory, if `plugins` directory doesn't exist.
1. Check out this package from version control into the `plugins` directory.
1. Run `yarn kbn bootstrap` inside `kibana/plugins/anomaly-detection-kibana-plugin`.

Ultimately, your directory structure should look like this:

<!-- prettier-ignore -->
```md
.
├── kibana
│   └──plugins
│      └── anomaly-detection-kibana-plugin
```

## Build

To build the plugin's distributable zip simply run `yarn build`.

Example output: `./build/opendistro-anomaly-detection-kibana-1.7.0.0.zip`

## Run

- `yarn start`

  Starts Kibana and includes this plugin. Kibana will be available on `localhost:5601`.

- `NODE_PATH=../../node_modules yarn test:jest`

  Runs the plugin tests.

## Contributing to Open Distro for Elasticsearch Anomaly detection Kibana

We welcome you to get involved in development, documentation, testing the anomaly detection plugin. See our [CONTRIBUTING.md](./CONTRIBUTING.md) and join in.

Since this is a Kibana plugin, it can be useful to review the [Kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md) alongside the documentation around [Kibana plugins](https://www.elastic.co/guide/en/kibana/master/kibana-plugins.html) and [plugin development](https://www.elastic.co/guide/en/kibana/master/plugin-development.html).

## Code of Conduct

This project has adopted an [Open Source Code of Conduct](https://opendistro.github.io/for-elasticsearch/codeofconduct.html).

## Security issue notifications

If you discover a potential security issue in this project we ask that you notify AWS/Amazon Security via our [vulnerability reporting page](http://aws.amazon.com/security/vulnerability-reporting/). Please do **not** create a public GitHub issue.

## License

See the [LICENSE](./LICENSE.txt) file for our project's licensing. We will ask you to confirm the licensing of your contribution.

## Copyright

Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
