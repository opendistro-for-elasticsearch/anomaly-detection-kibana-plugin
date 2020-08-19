#!/usr/bin/env pwsh

###### Information ############################################################################
# Name:          setup_runners_windows.ps1
# Language:      PowerShell
#
# About:         Setup ES/KIBANA for integTests on Windows based ODFE distros w/wo Security
#
# Usage:         ./setup_runners_windows.ps1 $SETUP_ACTION
#                $SETUP_ACTION: --es | --es-nosec | --kibana | --kibana-nosec (required)
#
# Requirements:  This script assumes java 14 is already installed on the servers, and latest AD Kibana artifact is already built
###############################################################################################

# Keep the pwsh script running even with errors
# Put this line before the .\gradlew.bat run
#$ErrorActionPreference = 'SilentlyContinue'

# setup user parameters
$SETUP_ACTION=$args[0]
if (!$SETUP_ACTION) {
  echo "Please enter 1 parameter: --es | --es-nosec | --kibana | --kibana-nosec"
  exit 1
}

echo "############################################################"
echo "Setup ES/KIBANA to start with YES/NO security configurations"
echo "User enters $SETUP_ACTION"
echo "############################################################"

echo "setup es"
java -version
dir
python -m pip install --upgrade pip
echo pip3 -version
pip3 install awscli
$PACKAGE="opendistroforelasticsearch"
$OD_VERSION="1.9.0"
$S3_PACKAGE="odfe-"+$OD_VERSION+".zip"
dir

###############################################################

# everyone needs es
echo "moving zip file outside of current directory"
pwd
dir
echo "downloading zip from S3"
aws s3 cp s3://artifacts.opendistroforelasticsearch.amazon.com/downloads/odfe-windows/staging/odfe-window-zip/$S3_PACKAGE . --quiet; echo $?\
echo "unzipping $S3_PACKAGE"
unzip -qq .\$S3_PACKAGE

if ($SETUP_ACTION -eq "--es"){
  echo "removing useless config" #deprecated since 7.8.0 and will crash --es-nosec now
  findstr /V "node.max_local_storage_nodes" .\$PACKAGE-$OD_VERSION\config\elasticsearch.yml > .\$PACKAGE-$OD_VERSION\config\elasticsearch.yml.new
  del .\$PACKAGE-$OD_VERSION\config\elasticsearch.yml
  move .\$PACKAGE-$OD_VERSION\config\elasticsearch.yml.new .\$PACKAGE-$OD_VERSION\config\elasticsearch.yml
  type .\$PACKAGE-$OD_VERSION\config\elasticsearch.yml

  echo "running es"
  nohup .\$PACKAGE-$OD_VERSION\bin\elasticsearch.bat &

  echo "Waiting for 160 seconds"
  ping -n 160 127.0.0.1 >.\out.txt
  curl -XGET https://localhost:9200 -u admin:admin --insecure
  #curl -XGET https://localhost:9200/_cluster/health?pretty -u admin:admin --insecure

  echo "es start"
  exit 0
}

###############################################################

# *nosec remove es-security
if ($SETUP_ACTION -eq "--es-nosec" -Or $SETUP_ACTION -eq "--kibana-nosec"){
  echo "removing es security"
  cd $PACKAGE-$OD_VERSION\bin
  .\elasticsearch-plugin.bat remove opendistro_security
  cd ..\..

  echo "Overriding with elasticsearch.yml having no certificates"
  del .\$PACKAGE-$OD_VERSION\config\elasticsearch.yml
  aws s3 cp s3://artifacts.opendistroforelasticsearch.amazon.com/downloads/utils/elasticsearch.yml .\$PACKAGE-$OD_VERSION\config --quiet; echo $?
}

if ($SETUP_ACTION -eq "--es-nosec"){
  echo "running es"
  nohup .\$PACKAGE-$OD_VERSION\bin\elasticsearch.bat &

  echo "Waiting for 160 seconds"
  ping -n 160 127.0.0.1 >.\out.txt
  #curl -XGET http://localhost:9200
  #curl -XGET http://localhost:9200/_cluster/health?pretty

  echo "es-nosec start"
  exit 0
}

###############################################################

# kibana* needs kibana
if ($SETUP_ACTION -eq "--kibana" -Or $SETUP_ACTION -eq "--kibana-nosec"){
  echo "setup kibana"
  $S3_KIBANA_PACKAGE="odfe-"+$OD_VERSION+"-kibana.zip"
  aws s3 cp --quiet s3://artifacts.opendistroforelasticsearch.amazon.com/downloads/odfe-windows/ode-windows-zip/$S3_KIBANA_PACKAGE . --quiet; echo $?\
  unzip -qq .\$S3_KIBANA_PACKAGE
  dir
  .\opendistroforelasticsearch-kibana\bin\kibana-plugin.bat remove opendistro-anomaly-detection-kibana
  $CURRENT_PATH = pwd
  echo $CURRENT_PATH.Path
  $AD_KIBANA_ARTIFACT_PATH = $CURRENT_PATH.Path + "\kibana\plugins\anomaly-detection-kibana-plugin\build\opendistro-anomaly-detection-kibana-" + $OD_VERSION + ".0.zip"
  echo $AD_KIBANA_ARTIFACT_PATH
  ls $AD_KIBANA_ARTIFACT_PATH
  $AD_KIBANA_ARTIFACT_PATH.Replace("\", "/")

  echo "modified uri"
  $VALID_AD_KIBANA_ARTIFACT_URI = $AD_KIBANA_ARTIFACT_PATH.Replace("\", "/")
  echo $VALID_AD_KIBANA_ARTIFACT_URI
  .\opendistroforelasticsearch-kibana\bin\kibana-plugin.bat install file:///$VALID_AD_KIBANA_ARTIFACT_URI
}

if ($SETUP_ACTION -eq "--kibana"){
  echo "running es"
  nohup .\$PACKAGE-$OD_VERSION\bin\elasticsearch.bat &

  echo "running kibana"
  nohup .\opendistroforelasticsearch-kibana\bin\kibana.bat &

  echo "Waiting for 160 seconds"
  ping -n 160 127.0.0.1 >.\out.txt
  #curl -XGET https://localhost:9200 -u admin:admin --insecure
  #curl -XGET https://localhost:9200/_cluster/health?pretty -u admin:admin --insecure
  #curl -v -XGET https://localhost:5601 --insecure
  #curl -v -XGET https://localhost:5601/api/status --insecure

  echo "kibana start"
  exit 0
}

###############################################################

# kibana-nosec remove kibana-security
if ($SETUP_ACTION -eq "--kibana-nosec"){
  cd opendistroforelasticsearch-kibana
  echo "removing kibana security"
  .\bin\kibana-plugin.bat remove opendistro_security
  del .\config\kibana.yml
  aws s3 cp s3://artifacts.opendistroforelasticsearch.amazon.com/downloads/utils/kibana-config-without-security/kibana.yml .\config --quiet; echo $?

  cd ..

  echo "running es"
  nohup .\$PACKAGE-$OD_VERSION\bin\elasticsearch.bat &

  echo "running kibana"
  cd opendistroforelasticsearch-kibana
  nohup .\bin\kibana.bat &
  cd ..

  echo "Waiting for 160 seconds"
  ping -n 160 127.0.0.1 >.\out.txt
  curl -XGET http://localhost:9200
  #curl -XGET http://localhost:9200/_cluster/health?pretty
  #curl -v -XGET http://localhost:5601
  curl -v -XGET http://localhost:5601/api/status

  echo "kibana-nosec start"
  exit 0
}