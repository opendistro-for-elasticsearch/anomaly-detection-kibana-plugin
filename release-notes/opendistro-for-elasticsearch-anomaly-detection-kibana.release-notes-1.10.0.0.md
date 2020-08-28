## Version 1.10.0.0 Release Notes

Compatible with Kibana 7.9.0
### Enhancements

* Add missing feature alert if recent feature data is missing ([#248](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/286248))
* Add progress bar for initialization ([#253](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/286253))
* Improve error handling when retrieving all detectors ([#267](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/286267))
* support field search for detector simple filter ([#278](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/286278))
* Handle index not found error ([#273](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/286273))
* Add action item and message for init failue case due to invalid search query.  ([#285](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/286285))

### Bug Fixes

* upgrade elastic chart; fix zoom in bug ([#260](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/286260))
* fix wrong field name when preview ([#277](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/286277))
* parse types in fielddata ([#284](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/286284))
* Add intermediate callout message during cold start ([#283](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/286283))

### Infrastructure

* Fix e2e test caused by new EuiComboBox added on CreateDetector page ([#252](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/286252))
* Update lodash dependency ([#259](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/286259))
* Add support for running CI with security ([#263](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/286263))
* Upgrade Cypress and elliptic dependencies ([#266](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/286266))
* Remove elastic charts dependency ([#269](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/286269))
* Add UT for Detector List page ([#279](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/286279))

### Documentation

* Automate release notes to unified standard ([#255](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/286255))
* Add a few badges ([#262](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/286262))
