## Open Distro for Elasticsearch 1.7.0 Release Notes
Compatible with Kibana 7.6.1 and Open Distro for Elasticsearch 1.7.0.

## Initial Release
The Anomaly Detection Kibana plugin provides a Kibana view for the [Anomaly Detection Elasticsearch plugin](https://github.com/opendistro-for-elasticsearch/anomaly-detection).

Anomaly detection uses the Random Cut Forest (RCF) algorithm for detecting anomalous data points in streaming time series. 

You can use the plugin with the same version of the [Open Distro Alerting Kibana plugin](https://github.com/opendistro-for-elasticsearch/alerting-kibana-plugin) to get alert notifications. You can create a monitor based on an anomaly detector directly on the Alerting Kibana plugin. Monitors run checks on the anomaly detection results regularly and trigger alerts based on custom trigger conditions.

## Features

1. Create an anomaly detector on an index and configure features for the detector
2. Start and stop detectors at any time
3. View live anomaly results and summarized results on the dashboard
4. Preview sample anomaly results for historical data
5. Monitor live anomalies
6. Review anomaly history together with alerts

## Current Limitations

- Page may load slowly if you load/review data in a long time range.
- Not all API calls have complete error handling.
- We will continuously add new unit test cases, but we don't have 100% unit test coverage for now. This is a great area for developers from the community to contribute and help improve test coverage.
- Please see documentation links and GitHub issues for other details.