## Version 1.10.1.0 Release Notes

Compatible with Kibana 7.9.1

### Features

* Add sample detectors and indices ([#272](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308272))
* Adds window size as advanced setting in model configuration. ([#287](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308287))

### Enhancements

* Add missing feature alert if recent feature data is missing ([#248](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308248))
* Add progress bar for initialization ([#253](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308253))
* Improve error handling when retrieving all detectors ([#267](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308267))
* support field search for detector simple filter ([#278](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308278))
* Handle index not found error ([#273](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308273))
* Add action item and message for init failue case due to invalid search query.  ([#285](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308285))

### Bug Fixes

* upgrade elastic chart; fix zoom in bug ([#260](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308260))
* fix wrong field name when preview ([#277](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308277))
* parse types in fielddata ([#284](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308284))
* Add intermediate callout message during cold start ([#283](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308283))
* Make elastic/charts imports more generic ([#297](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308297))
* Fix initialization callouts to properly show when first loading anomaly results page ([#300](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308300))
* Fix bug where undefined is shown on UI for estimatedMins in case of ingestion data missing ([#301](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308301))
* Fix 2 issues on Dashboard ([#305](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308305))

### Infrastructure

* Fix e2e test caused by new EuiComboBox added on CreateDetector page ([#252](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308252))
* Update lodash dependency ([#259](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308259))
* Add support for running CI with security ([#263](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308263))
* Upgrade Cypress and elliptic dependencies ([#266](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308266))
* Remove elastic charts dependency ([#269](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308269))
* Add UT for Detector List page ([#279](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308279))
* Fix UT and remove lower EUI version dependency ([#293](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308293))
* Fix broken cypress test related to new empty dashboard buttons ([#298](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308298))

### Documentation

* Automate release notes to unified standard ([#255](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308255))
* Add a few badges ([#262](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308262))
* Updating the release notes to have 4th digit ([#291](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308291))
* Update 1.10.0.0 release notes ([#296](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308296))
* Add release note for PR 301 ([#302](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308302))

### Maintenance

* Adding support for Kibana 7.9.0 ([#286](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308286))
* Updating plugin to use Kibana 7.9.1 ([#306](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/308306))
