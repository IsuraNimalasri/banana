/*

  ## Facet Panel

  ### Parameters
  * style :: hash of css properties
  * fields :: fields to be faceted on
  * facet limit :: number of values that will be show per field

*/
define([
    'angular',
    'app',
    'underscore',
    'kbn',
    'moment',
    'bootstrap',
  ],
  function(angular, app, _, kbn, moment) {
    'use strict';
    var DEBUG = false; // DEBUG mode
    var module = angular.module('kibana.panels.facet',[]);
    app.useModule(module);
    module.controller('facet', function($rootScope, $scope, fields, querySrv, dashboard, filterSrv) {
      $scope.panelMeta = {
        modals: [{
          description: "Inspect",
          icon: "icon-info-sign",
          partial: "app/partials/inspector.html",
          show: $scope.panel.spyable
        }],
        editorTabs: [{
          title: 'Queries',
          src: 'app/partials/querySelect.html'
        }],
        exportfile: false,
        status: "Experimental",
        description: "This panel provide facet functionality for any field in the data"
      };

      // Set and populate defaults
      var _d = {
        status: "Stable",
        queries: {
          mode: 'all',
          ids: [],
          query: '*:*',
          basic_query: '',
          custom: ''
        },
        group: "default",
        style: {
          'font-size': '9pt'
        },
        overflow: 'min-height',
        fields: [],
        field_list: true,
        spyable: true,
        facet_limit: 10,
        foundResults: true,
        header_title: "Limit Your Search",
        toggle_element: null
      };
      _.defaults($scope.panel, _d);

      $scope.init = function() {
        $scope.Math = Math;
        // Solr
        $scope.sjs = $scope.sjs || sjsResource(dashboard.current.solr.server + dashboard.current.solr.core_name);

        $scope.$on('refresh', function() {
          $scope.get_data();
        });

        $scope.panel.exportSize = $scope.panel.size * $scope.panel.pages;

        $scope.fields = fields;
        $scope.get_data();
      };

      $scope.percent = kbn.to_percent;


      $scope.add_facet_field = function(field) {
        if (_.contains(fields.list, field) && _.indexOf($scope.panel.fields, field) == -1) {
          $scope.panel.fields.push(field);
          $scope.get_data();
        }
      };

      $scope.remove_facet_field = function(field) {
        if (_.contains(fields.list, field) && _.indexOf($scope.panel.fields, field) > -1) {
          $scope.panel.fields = _.without($scope.panel.fields, field);
        }
      };

      $scope.get_data = function(segment, query_id) {
        $scope.panel.error = false;

        // Make sure we have everything for the request to complete
        if (dashboard.indices.length === 0) {
          return;
        }
        $scope.panelMeta.loading = true;
        $scope.panel.queries.ids = querySrv.idsByMode($scope.panel.queries);

        // What this segment is for? => to select which indices to query.
        var _segment = _.isUndefined(segment) ? 0 : segment;
        $scope.segment = _segment;

        $scope.sjs.client.server(dashboard.current.solr.server + dashboard.current.solr.core_name);

        var request = $scope.sjs.Request().indices(dashboard.indices[_segment]);
        var boolQuery = $scope.sjs.BoolQuery();
        _.each($scope.panel.queries.ids, function(id) {
          boolQuery = boolQuery.should(querySrv.getEjsObj(id));
        });

        request = request.query(
          $scope.sjs.FilteredQuery(
            boolQuery,
            filterSrv.getBoolFilter(filterSrv.ids) // search time range is provided here.
          )).size($scope.panel.size * $scope.panel.pages) // Set the size of query result

        $scope.panel_request = request;

        if (DEBUG) {
          console.debug('Facet:\n\trequest=', request, '\n\trequest.toString()=', request.toString());
        }

        var fq = '&' + filterSrv.getSolrFq();
        var query_size = $scope.panel.size * $scope.panel.pages;
        var wt_json = '&wt=json';
        var facet = '&facet=true';
        var facet_fields = '';
        for (var i = 0; i < $scope.panel.fields.length; i++) {
          facet_fields += '&facet.field=' + $scope.panel.fields[i];
        };
        var rows_limit;
        var sorting = '';

        // Set the panel's query

        //var query = $scope.panel.searchQuery == null ? querySrv.getQuery(0) : 'q=' + $scope.panel.searchQuery
        $scope.panel.queries.basic_query = querySrv.getQuery(0) + fq + facet + facet_fields;
        $scope.panel.queries.query = $scope.panel.queries.basic_query + wt_json;

        if (DEBUG) {
          console.debug('Facet: query=', $scope.panel.queries.query);
        }

        // Set the additional custom query
        if ($scope.panel.queries.custom != null) {
          request = request.setQuery($scope.panel.queries.query + $scope.panel.queries.custom);
        } else {
          request = request.setQuery($scope.panel.queries.query);
        }

        var results = request.doSearch();

        // Populate scope when we have results
        results.then(function(results) {
          $scope.panelMeta.loading = false;
          $scope.panel.offset = 0;

          if (_segment === 0) {
            $scope.hits = 0;
            $scope.data = [];
            query_id = $scope.query_id = new Date().getTime();
          } else {
            // Fix BUG with wrong total event count.
            $scope.data = [];
          }

          if (DEBUG) {
            console.debug('Facet :\n\tresults=', results, '\n\t_segment=', _segment, ', $scope.hits=', $scope.hits, ', $scope.data=', $scope.data, ', query_id=', query_id, '\n\t$scope.panel', $scope.panel);
          }

          // Check for error and abort if found
          if (!(_.isUndefined(results.error))) {
            $scope.panel.error = $scope.parse_error(results.error.msg); // There's also results.error.code
            return;
          }

          // Check that we're still on the same query, if not stop
          if ($scope.query_id === query_id) {
            $scope.data = $scope.data.concat(_.map(results.response.docs, function(hit) {
              var _h = _.clone(hit);
              _h.kibana = {
                _source: kbn.flatten_json(hit),
                highlight: kbn.flatten_json(hit.highlighting || {})
              };

              return _h;
            }));

            // Solr does not need to accumulate hits count because it can get total count
            // from a single faceted query.
            $scope.hits = results.response.numFound;
            $scope.panel.foundResults = $scope.hits == 0 ? false : true;
            if (results.highlighting) {
              $scope.highlighting = results.highlighting;
              $scope.highlightingKeys = Object.keys(results.highlighting);
              if ($.isEmptyObject($scope.highlighting[$scope.highlightingKeys[0]]))
                $scope.highlight_flag = false;
              else
                $scope.highlight_flag = true;
            }
            var facet_results = results.facet_counts.facet_fields;
            var facet_data = {};
            _.each($scope.panel.fields, function(field) {
              facet_data[field] = [];
              for (var i = 0; i < facet_results[field].length; i += 2) {
                facet_data[field].push({
                  value: facet_results[field][i],
                  count: facet_results[field][i + 1]
                })
              };
            });
            $scope.facet_data = facet_data;

            if (DEBUG) {
              console.debug('Facet: $scope.hits=', $scope.hits, ', $scope.data=', $scope.data);
            }
          } else {
            return;
          }

          // If we're not sorting in reverse chrono order, query every index for
          // size*pages results
          // Otherwise, only get size*pages results then stop querying
          if ($scope.panel.sortable && ($scope.data.length < $scope.panel.size * $scope.panel.pages || !((_.contains(filterSrv.timeField(), $scope.panel.sort[0])) && $scope.panel.sort[1] === 'desc')) &&
            _segment + 1 < dashboard.indices.length) {
            $scope.get_data(_segment + 1, $scope.query_id);

            if (DEBUG) {
              console.debug('\tnot sorting in reverse chrono order!');
            }
          }

        });
      };

      $scope.populate_modal = function(request) {
        $scope.inspector = angular.toJson(JSON.parse(request.toString()), true);
      };

      $scope.without_kibana = function(row) {
        var _c = _.clone(row);
        delete _c.kibana;
        return _c;
      };

      $scope.set_refresh = function(state) {
        $scope.refresh = state;
      };

      $scope.close_edit = function() {
        if ($scope.refresh) {
          $scope.get_data();
        }
        $scope.refresh = false;
      };

      // Set term filter when click on the one of facet values
      $scope.set_facet_filter = function(field, value) {
        filterSrv.set({
          type: 'terms',
          field: field,
          value: value
        });
        dashboard.refresh();
      }

      // return the length of the filters with specific field 
      // that will be used to detect if the filter is present or not to show close icon beside the facet
      $scope.filter_close = function(field) {
        return filterSrv.idsByTypeAndField('terms', field).length > 0
      }

      // call close filter when click in close icon 
      $scope.delete_filter = function(type, field) {
        filterSrv.removeByTypeAndField(type, field);
        dashboard.refresh();
      }

      // TODO Refactor this jquery code
      // jquery code used to toggle the arrow from up to down when facet is opened
      // also it is used to highlight the header field in faceting
      $('.accordion').on('show hide', function(n) {
        var field = $(n.target).siblings('.accordion-heading').find('.accordion-toggle').text().trim();
        if (n.type == 'show') {
          $scope.panel.toggle_element = field;
        } else {
          if ($scope.panel.toggle_element == field) {
            $scope.panel.toggle_element = null;
          }
        }
        $(n.target).siblings('.accordion-heading').find('.accordion-toggle i').toggleClass('icon-chevron-up icon-chevron-down');
        $(n.target).siblings('.accordion-heading').toggleClass('bold');
      });
    });
  });