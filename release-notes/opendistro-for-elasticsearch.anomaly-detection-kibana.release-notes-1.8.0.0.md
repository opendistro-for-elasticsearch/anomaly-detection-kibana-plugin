## Open Distro for Elasticsearch 1.8.0 Release Notes
Compatible with Kibana 7.7.0 and Open Distro for Elasticsearch 1.8.0.

## Enhancements
- Make callout message more readable when error creating new detector [PR #130](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/130)
- Add loading state for live chart on detector details page [PR #131](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/131)
- Add intermediate loading state when changing filters on detector list page [PR #134](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/134)
- Tune code style for AD result utils [PR #152](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/152)
- Test find max anomaly method's performance [PR #158](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/158)
- Handle unexpected failure and unknown detector state edge cases [PR #165](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/165)

## Bug Fixes
- Fix blank page if opening configuration page directly with URL [PR #154](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/154)
- Fix detector detail loading state [PR #155](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/155)

## Infra Changes
- Fix and clean up unit tests [PR #147](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/147)
- Fix single unit test so workflow passes [PR #163](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/163)

## Version Upgrades
- Upgrade Kibana to 7.7.0 [PR #164](https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/pull/164)
