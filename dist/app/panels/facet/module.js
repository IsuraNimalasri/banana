/*! banana-fusion - v1.6.3 - 2016-05-11
 * https://github.com/LucidWorks/banana/wiki
 * Copyright (c) 2016 Andrew Thanalertvisuti; Licensed Apache License */

define("panels/facet/module",["angular","app","underscore","kbn","bootstrap"],function(a,b,c,d){"use strict";var e=a.module("kibana.panels.facet",[]);b.useModule(e),e.controller("facet",["$rootScope","$scope","fields","querySrv","dashboard","filterSrv",function(b,e,f,g,h,i){e.panelMeta={modals:[{description:"Inspect",icon:"icon-info-sign",partial:"app/partials/inspector.html",show:e.panel.spyable}],editorTabs:[{title:"Queries",src:"app/partials/querySelect.html"}],exportfile:!1,status:"Experimental",description:"This panel provide facet functionality for any field in the data"};var j={status:"Stable",queries:{mode:"all",ids:[],query:"*:*",basic_query:"",custom:""},group:"default",style:{"font-size":"9pt"},overflow:"min-height",fields:[],spyable:!0,facet_limit:10,maxnum_facets:5,foundResults:!0,header_title:"Facet Fields",toggle_element:null,show_queries:!0};c.defaults(e.panel,j),e.init=function(){e.Math=Math,e.sjs=e.sjs||sjsResource(h.current.solr.server+h.current.solr.core_name),e.$on("refresh",function(){e.get_data()}),e.panel.exportSize=e.panel.size*e.panel.pages,e.fields=f,e.get_data()},e.percent=d.to_percent,e.add_facet_field=function(a){c.contains(f.list,a)&&-1===c.indexOf(e.panel.fields,a)&&e.panel.fields.length<e.panel.maxnum_facets&&(e.panel.fields.push(a),e.set_refresh(!0))},e.remove_facet_field=function(a){c.contains(f.list,a)&&c.indexOf(e.panel.fields,a)>-1&&(e.panel.fields=c.without(e.panel.fields,a))},e.facet_label=function(a){return i.translateLanguageKey("facet",a,h.current)},e.get_data=function(a,b){if(e.panel.error=!1,delete e.panel.error,0!==h.indices.length){e.panelMeta.loading=!0,e.panel.queries.ids=g.idsByMode(e.panel.queries);var f=c.isUndefined(a)?0:a;e.segment=f,e.sjs.client.server(h.current.solr.server+h.current.solr.core_name);var j=e.sjs.Request().indices(h.indices[f]),k=e.sjs.BoolQuery();c.each(e.panel.queries.ids,function(a){k=k.should(g.getEjsObj(a))}),j=j.query(e.sjs.FilteredQuery(k,i.getBoolFilter(i.ids))).size(e.panel.size*e.panel.pages),e.panel_request=j;var l="";i.getSolrFq()&&(l="&"+i.getSolrFq());for(var m="&wt=json",n="&facet=true",o="",p=0;p<e.panel.fields.length;p++)o+="&facet.field="+e.panel.fields[p];e.panel.queries.basic_query=g.getORquery()+l+n+o,e.panel.queries.query=e.panel.queries.basic_query+m,j=null!=e.panel.queries.custom?j.setQuery(e.panel.queries.query+e.panel.queries.custom):j.setQuery(e.panel.queries.query);var q=j.doSearch();q.then(function(a){if(e.panelMeta.loading=!1,e.panel.offset=0,0===f?(e.hits=0,e.data=[],b=e.query_id=(new Date).getTime()):e.data=[],!c.isUndefined(a.error))return void(e.panel.error=e.parse_error(a.error.msg));if(e.query_id===b){e.data=e.data.concat(c.map(a.response.docs,function(a){var b=c.clone(a);return b.kibana={_source:d.flatten_json(a),highlight:d.flatten_json(a.highlighting||{})},b})),e.hits=a.response.numFound,e.panel.foundResults=0!==e.hits,a.highlighting&&(e.highlighting=a.highlighting,e.highlightingKeys=Object.keys(a.highlighting),$.isEmptyObject(e.highlighting[e.highlightingKeys[0]])?e.highlight_flag=!1:e.highlight_flag=!0);var g=a.facet_counts.facet_fields,j={};c.each(e.panel.fields,function(a){j[a]=[];for(var b=0;b<g[a].length;b+=2)j[a].push({value:g[a][b],count:g[a][b+1]})}),e.facet_data=j,e.panel.sortable&&(e.data.length<e.panel.size*e.panel.pages||!c.contains(i.timeField(),e.panel.sort[0])||"desc"!==e.panel.sort[1])&&f+1<h.indices.length&&e.get_data(f+1,e.query_id)}})}},e.populate_modal=function(b){e.inspector=a.toJson(JSON.parse(b.toString()),!0)},e.without_kibana=function(a){var b=c.clone(a);return delete b.kibana,b},e.set_refresh=function(a){e.refresh=a},e.close_edit=function(){e.refresh&&e.get_data(),e.refresh=!1},e.set_facet_filter=function(a,b){i.set({type:"terms",field:a,value:b}),h.refresh()},e.filter_close=function(a){return i.idsByTypeAndField("terms",a).length>0},e.delete_filter=function(a,b){i.removeByTypeAndField(a,b),h.refresh()},$(".accordion").on("show hide",function(a){var b=$(a.target).siblings(".accordion-heading").find(".accordion-toggle").text().trim();"show"===a.type?e.panel.toggle_element=b:e.panel.toggle_element===b&&(e.panel.toggle_element=null),$(a.target).siblings(".accordion-heading").find(".accordion-toggle i").toggleClass("icon-chevron-up icon-chevron-down"),$(a.target).siblings(".accordion-heading").toggleClass("bold")})}])});