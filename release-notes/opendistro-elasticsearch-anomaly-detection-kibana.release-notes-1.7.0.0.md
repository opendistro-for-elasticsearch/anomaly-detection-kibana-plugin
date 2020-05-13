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

## Major Changes
- Add functionality to start & stop detector [PR #12](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/12)
- Add side navigation bar [PR #19](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/12)
- Add detector detail page [PR #20](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/20)
- Add functionality to get detector state [PR #16](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/16)
- Add dashboard page [PR #17](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/17)
- Add edit feature page [PR #52](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/52)
- Add detector configuration page [PR #22](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/22)
- Add anomaly results page [PR #62](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/62)
- Add detector state page [PR #65](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/65)
- Add anomaly charts [PR #50](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/50)

## Enhancements
- Add window delay [PR #4](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/4)
- Add empty dashboard page [PR #9](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/9)
- Update create/edit detector page [PR #13](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/13)
- Add search monitor API [PR #18](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/18)
- Add detector state support on dashboard [PR #28](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/28)
- Fix dark mode readability on detector list page [PR #39](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/39)
- Fix live anomaly chart time range [PR #45](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/45)
- Make breadcrumbs consistent on home pages [PR #41](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/41)
- Modify detector list tooltips [PR #47](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/47)
- Change chart style [PR #45](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/45)
- Add feature required detector state [PR #48](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/48)
- Remove old preview detector code [PR #51](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/51)
- Change live anomaly chart height [PR #45](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/45)
- Add live anomaly reducer [PR #55](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/55)
- Modify logic to delete detector [PR #54](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/54)
- Add chart and ad result .css file [PR #64](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/64)
- Make titles with counts consistent [PR #74](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/74)
- Avoid label cutoff on sunburst chart [PR #83](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/83)
- Remove tooltip icon on detector list page [PR #93](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/93)
- Modify some wording [PR #95](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/95)
- Change create detector link on dashboard [PR #100](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/100)
- Tune AD result charts [PR #102](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/102)
- Use annotation for live chart [PR #119](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/119)
- Set fixed height for anomalies live chart [PR #123](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/123)
- Use scientific notation when number less than 0.01 on live chart [PR #124](https://github.com/opendistro-for-elasticsearchanomaly-detection-kibana-plugin/pull/124)
- Use bucket aggregation for anomaly distribution [PR #126](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/126)

## Bug Fixes
- Fix dashboard width [PR #29](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/29)
- Fix dashboard bugs [PR #35](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/35)
- Fix detector list bugs [PR #43](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/43)
- Fix more dashboard bugs [PR #45](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/45)
- Minor fix [PR #45](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/45)
- Return correct AD result [PR #57](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/57)
- Set max monitor size [PR #59](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/59)
- Fix more dashboard bugs [PR #61](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/61)
- Fix bugs on detector configuration page [PR #66](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/66)
- Fix bugs on create/edit detector page [PR #67](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/67)
- Fix blank anomaly results bug [PR #69](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/69)
- Fix link to detector configuration page [PR #71](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/71)
- Fix thin bar on anomaly results live chart [PR #70](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/70)
- Fix sunburst chart undefined issue [PR #73](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/73)
- Fix chart colors [PR #76](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/76)
- Don't display legend value on chartt [PR #79](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/79)
- Fix legend value bug on dashboard live chart [PR #80](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/80)
- Fix typo and change save feature button title [PR #81](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/81)
- Fix feature breakdown tabs [PR #84](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/84)
- Fix stats on dashboard live chart to not be wrapped [PR #82](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/82)
- Fix column truncation on detector list [PR #86](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/86)
- Fix issue that 0 cannot be set in detector filter [PR #68](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/68)
- Add -kibana suffix in links to prevent broken links [PR #92](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/92)
- Fix bug where latest anomalous detector can get lost [PR #98](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/98)
- Fix detector initializing message [PR #106](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/106)
- Fix preview detector error message [PR #108](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/108)
- Cover more detector state edge cases [PR #110](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/110)
- Fix 2 issues related to detector state [PR #111](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/111)
- Fix blank detector detail page [PR #112](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/112)
- Fix issue of not resetting to first page after applying filters [PR #115](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/115)
- Fix issue when live chart pulls anomaly results [PR #113](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/113)
- Fix live chart bar width problem [PR #116](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/116)
- Fix unnecessary filter when getting single anomaly result [PR #118](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/118)
- Fix live chart bar height [PR #121](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/121)
- Fix live chart time range [PR #122](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/122)
- Fix more live chart bugs [PR #125](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/125)
- Fix loading bug on live chart [PR #129](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/129)

## Build & Workflow Changes
- Initial commit [here](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/commit/0e5ace28588d311ee9a632c4783ca3e06ad6b187)
- Fix unit test issue [PR #14](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/14)
- Update test snapshots [PR #44](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/44)
- Add unit test workflow [PR #42](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/42)
- Change workflow to run on pushes to master [PR #72](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/72)
- Change default build artifact name [PR #89](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/89)
- Fix test workflow [PR #104](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/104)

## Documentation Changes
- Create CONTRIBUTORS [here](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/commit/603b9e7a8bff522bbfc7f841d8e61143aaff7a6d)
- Update README [here](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/commit/c1da0e52eb0bcb3beee23f642686661da634f7f4)
- Update README [here](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/commit/a9271e7c254ed6541135b7ef9823aac1357343e2)
- Update README [here](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/commit/cf231c238ec505223fe06d66ec02787a3d8cec59)
- Update CONTRIBUTORS [here](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/commit/9de0d8420b1408e5891f0ff50fe41636649b00ce)
- Update README [PR #88](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/88)
- Add release notes for ODFE 1.7.0 [PR #109](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/109)
- Modify ODFE 1.7.0 release notes [PR #132](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/132)

## Version Upgrades
- Upgrade Kibana to 7.4.2 [PR #6](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/6)
- Upgrade Kibana to 7.6.1 [PR #60](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/60)
- Bump plugin version to 1.7.0.0 [PR #97](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/97)