/*! banana-fusion - v1.6.23 - 2018-12-12
 * https://github.com/LucidWorks/banana/wiki
 * Copyright (c) 2018 Andrew Thanalertvisuti; Licensed Apache-2.0 */

require.config({baseUrl:"app",waitSeconds:0,urlArgs:"r=6fa2656",paths:{config:"../config",settings:"components/settings",kbn:"components/kbn",css:"../vendor/require/css",text:"../vendor/require/text",moment:"../vendor/moment",filesaver:"../vendor/filesaver",angular:"../vendor/angular/angular","angular-dragdrop":"../vendor/angular/angular-dragdrop","angular-strap":"../vendor/angular/angular-strap","angular-sanitize":"../vendor/angular/angular-sanitize",timepicker:"../vendor/angular/timepicker",datepicker:"../vendor/angular/datepicker",underscore:"components/underscore.extended","underscore-src":"../vendor/underscore",bootstrap:"../vendor/bootstrap/bootstrap",jquery:"../vendor/jquery/jquery-1.12.1","jquery-ui":"../vendor/jquery/jquery-ui-1.10.3","extend-jquery":"components/extend-jquery","jquery.flot":"../vendor/jquery/jquery.flot","jquery.flot.pie":"../vendor/jquery/jquery.flot.pie","jquery.flot.selection":"../vendor/jquery/jquery.flot.selection","jquery.flot.stack":"../vendor/jquery/jquery.flot.stack","jquery.flot.stackpercent":"../vendor/jquery/jquery.flot.stackpercent","jquery.flot.time":"../vendor/jquery/jquery.flot.time","jquery.flot.axislabels":"../vendor/jquery/jquery.flot.axislabels",showdown:"../vendor/showdown",modernizr:"../vendor/modernizr-2.6.1",elasticjs:"../vendor/elasticjs/elastic-angular-client",solrjs:"../vendor/solrjs/solr-angular-client",d3:"../vendor/d3"},shim:{underscore:{exports:"_"},angular:{deps:["jquery"],exports:"angular"},bootstrap:{deps:["jquery"]},modernizr:{exports:"Modernizr"},jquery:{exports:"jQuery"},"jquery-ui":["jquery"],"jquery.flot":["jquery"],"jquery.flot.pie":["jquery","jquery.flot"],"jquery.flot.selection":["jquery","jquery.flot"],"jquery.flot.stack":["jquery","jquery.flot"],"jquery.flot.stackpercent":["jquery","jquery.flot"],"jquery.flot.time":["jquery","jquery.flot"],"jquery.flot.axislabels":["jquery","jquery.flot"],"angular-sanitize":["angular"],"angular-cookies":["angular"],"angular-dragdrop":["jquery","jquery-ui","angular"],"angular-loader":["angular"],"angular-mocks":["angular"],"angular-resource":["angular"],"angular-route":["angular"],"angular-touch":["angular"],"angular-strap":["angular","bootstrap","timepicker","datepicker"],timepicker:["jquery","bootstrap"],datepicker:["jquery","bootstrap"],elasticjs:["angular","../vendor/elasticjs/elastic"],solrjs:["angular","../vendor/solrjs/solr"]}});