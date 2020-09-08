## Version 1.10.1.0 Release Notes

Compatible with Kibana 7.9.1

### Features

* Add sample detectors and indices (#272)
* Adds window size as advanced setting in model configuration. (#287)

### Enhancements

* Add missing feature alert if recent feature data is missing (#248)
* Add progress bar for initialization (#253)
* Improve error handling when retrieving all detectors (#267)
* support field search for detector simple filter (#278)
* Handle index not found error (#273)
* Add action item and message for init failue case due to invalid search query.  (#285)

### Bug Fixes

* upgrade elastic chart; fix zoom in bug (#260)
* fix wrong field name when preview (#277)
* parse types in fielddata (#284)
* Add intermediate callout message during cold start (#283)
* Make elastic/charts imports more generic (#297)
* Fix initialization callouts to properly show when first loading anomaly results page (#300)
* Fix bug where undefined is shown on UI for estimatedMins in case of ingestion data missing (#301)
* Fix 2 issues on Dashboard (#305)

### Infrastructure

* Fix e2e test caused by new EuiComboBox added on CreateDetector page (#252)
* Update lodash dependency (#259)
* Add support for running CI with security (#263)
* Upgrade Cypress and elliptic dependencies (#266)
* Remove elastic charts dependency (#269)
* Add UT for Detector List page (#279)
* Fix UT and remove lower EUI version dependency (#293)
* Fix broken cypress test related to new empty dashboard buttons (#298)

### Documentation

* Automate release notes to unified standard (#255)
* Add a few badges (#262)
* Updating the release notes to have 4th digit (#291)
* Update 1.10.0.0 release notes (#296)

### Maintenance

* Adding support for Kibana 7.9.0 (#286)
* Add release note for PR 301 (#302)
* Updating plugin to use Kibana 7.9.1 (#306)
