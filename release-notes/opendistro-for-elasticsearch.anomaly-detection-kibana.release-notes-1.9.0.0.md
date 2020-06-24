## Version 1.9.0.0 Release Notes

Compatible with Kibana 7.8.0 and Open Distro for Elasticsearch 1.9.0

## Major changes

- Add start/stop batch actions on detector list page (PR [#195](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/195))
- Feature: AD: Add delete batch action (PR [#204](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/204))

## Enhancements

- Tune error message when creating detector (PR [#188](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/188))
- Use endTime of detectionInterval as plotTime on Dashboard live chart (PR [#190](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/190))
- Add scrolling and enhance list of affected detectors (PR [#201](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/201))
- Improve batch action modal loading state (PR [#216](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/216))
- Move textfield in delete batch action modal to bottom (PR [#217](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/217))
- Make all callouts optional on batch action modals (PR [#230](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/230))
- Remove static page of initialization and failure case, add auto-check of detector state when initializing (PR [#232](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/232))
- Rename 'last updated time' to 'last enabled time' on Detector list (PR [#233](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/233))
- Move plugin into Kibana app category (PR [#241](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/241))

## Bug Fixes

- Fix issue where live chart height is only partial of window in fullscreen mode. Issue: #186 (PR [#189](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/189))
- Fix UT workflow to only run bootstrap once (PR [#210](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/210))
- Fix paths to DetectorsList module (PR [#211](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/211))
- Prevent unnecessary update when doing batch delete (PR [#219](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/219))

## Infra Changes

- Bump dependencies with security vulnerabilities (PR [#197](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/197))
- Initial test case using Cypress (PR [#196](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/196))
- Mitigate vulnerability for minimist and kind-of (PR [#202](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/202))
- Automate release notes generation on pushes to master (PR [#226](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/226))
- Add more e2e test cases for Dashboard/Detector list (PR [#221](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/221))
- Add Cypress tests for dashboard and detector list (PR [#234](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/234))
- Add CI for e2e (PR [#208](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/208))
- Add delete actions UT and fix snapshots (PR [#235](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/235))

## Version Upgrades

- Bump Kibana compatibility to 7.8.0 (PR [#239](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/239))
