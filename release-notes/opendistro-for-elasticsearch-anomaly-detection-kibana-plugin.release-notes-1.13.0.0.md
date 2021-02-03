## Version 1.13.0.0 Release Notes

Compatible with Kibana 7.10.2

### Features

- Add historical detectors ([#359](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/359))

### Enhancements

- Refactor AnomalyHistory Chart to improve performance for HC detector ([#350](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/350))
- Change default shingle size for HC detector to 4 ([#356](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/356))
- Add 'No data' state for historical detectors ([#364](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/364))
- Simplify historical detector failure states ([#368](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/368))

### Bug Fixes

- Fix failure of adding feature to 1st detector in cluster ([#353](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/353))
- Fix live chart bar width ([#362](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/362))
- Remove stopped annotations for historical detector chart ([#371](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/371))
- Fix dashboard loading state and empty state logic ([#373](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/373))
- Fix typo in sample eCommerce description ([#374](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/374))

### Infrastructure

- Updating start-server-and-test version ([#355](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/355))
- Bump ini from 1.3.5 to 1.3.8 ([#345](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/345))
- Fix broken unit and integration tests ([#360](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/360))
- Add sleep time before running Cypress tests ([#363](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/363))
- Change CD workflow to use new staging bucket for artifacts ([#311](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/311))

### Documentation

- add tiny icon fix to release note ([#346](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/346))
- Update draft release notes config to use URL ([#358](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/358))
- Remove copyright year for newly added files ([#367](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/367))
- Add release notes for version 1.13.0.0 ([#375](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/375))

### Maintenance

- Upgrade to Kibana 7.10.2 ([#369](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/369))
