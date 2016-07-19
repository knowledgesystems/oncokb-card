var OncoKBCard = (function(_, $) {
  var templateCache = {};
  var levels = ['1', '2A', '2B', '3A', '3B', '4', 'R1'];
  var levelDes = {
    '1': '<b>FDA-recognized</b> biomarker predictive of response to an <b>FDA-approved</b> drug <b>in this indication</b>',
    '2A': '<b>Standard of care</b> biomarker predictive of response to an <b>FDA-approved</b> drug <b>in this indication</b>',
    '2B': '<b>Standard of care</b> biomarker predictive of response to an <b>FDA-approved</b> drug <b>in another indication</b> but not standard of care for this indication',
    '3A': '<b>Compelling clinical evidence</b> supports the biomarker as being predictive of response to a drug <b>in this indication</b> but neither biomarker and drug are standard of care',
    '3B': '<b>Compelling clinical evidence</b> supports the biomarker as being predictive of response to a drug <b>in another indication</b> but neither biomarker and drug are standard of care',
    '4': '<b>Compelling biological evidence</b> supports the biomarker as being predictive of response to a drug but neither biomarker and drug are standard of care',
    'R1': '<b>Standard of care</b> biomarker predictive of <b>resistance</b> to an <b>FDA-approved</b> drug <b>in this indication</b>'
  };
  var status = {
    mutationRefInitialized: false,
    oncogenicityInitialized: false
  };

  /**
   * Compiles the template for the given template id
   * by using underscore template function.
   *
   * @param templateId    html id of the template content
   * @returns function    compiled template function
   */
  function compileTemplate(templateId) {
    return _.template($('#' + templateId).html());
  }

  /**
   * Gets the template function corresponding to the given template id.
   *
   * @param templateId    html id of the template content
   * @returns function    template function
   */
  function getTemplateFn(templateId) {
    // try to use the cached value first
    var templateFn = templateCache[templateId];

    // compile if not compiled yet
    if (templateFn == null) {
      templateFn = compileTemplate(templateId);
      templateCache[templateId] = templateFn;
    }

    return templateFn;
  }

  function concatAlterations(alterations) {
    var positions = {};
    var regular = [];
    var regExp = new RegExp('([A-Z])([0-9]+)([^0-9/]+)');

    _.each(alterations, function(alteration) {
      var result = regExp.exec(alteration);
      if (_.isArray(result) && result.length === 4) {
        if (!positions.hasOwnProperty(result[2])) {
          positions[result[2]] = {};
        }
        if (!positions[result[2]].hasOwnProperty(result[1])) {
          //Avoid duplication, use object instead of array
          positions[result[2]][result[1]] = {};
        }
        positions[result[2]][result[1]][result[3]] = 1;
      } else {
        regular.push(alteration);
      }
    })

    _.each(_.keys(positions).map(function(e) {
      return Number(e)
    }).sort(), function(position) {
      _.each(_.keys(positions[position]).sort(), function(aa) {
        regular.push(aa + position + _.keys(positions[position][aa]).sort().join('/'));
      });
    })
    return regular.join(', ');
  }

  function init(data, target) {
    var treatmentTemplates = [];
    var levelTemplates = [];

    _.each(data.treatments, function(treatment) {
      var treatmentFn = getTemplateFn('oncokb-card-treatment-row');

      if (treatment.level) {
        treatment.levelDes = levelDes[treatment.level];
      }
      if (_.isArray(treatment.variant)) {
        treatment.variant = concatAlterations(treatment.variant);
      }
      treatmentTemplates.push(treatmentFn(treatment));
    });

    _.each(levels, function(level) {
      var levelFn = getTemplateFn('oncokb-card-level-list-item');
      levelTemplates.push(levelFn({
        level: level,
        levelDes: levelDes[level]
      }));
    });

    var cardMainTemplateFn = getTemplateFn('oncokb-card');
    var cardMainTemplate = cardMainTemplateFn({
      title: data.title,
      gene: data.gene,
      oncogenicity: data.oncogenicity || 'Unknown to be oncogenic',
      oncogenicityCitations: data.oncogenicityCitations,
      mutationEffect: data.mutationEffect || 'Pending curation',
      mutationEffectCitations: data.mutationEffectCitations,
      clinicalSummary: data.clinicalSummary,
      biologicalSummary: data.biologicalSummary,
      treatmentRows: treatmentTemplates.join(''),
      levelRows: levelTemplates.join('')
    });

    // Have to cache template in here. After Ajax call, we lost the template
    var refsItem = getTemplateFn('oncokb-card-refs-item');

    $(target).html(cardMainTemplate);

    // Remove table element if there is no treatment available
    if (!_.isArray(data.treatments) || data.treatments.length === 0) {
      $(target + ' .oncogenicity table').remove();
    }

    if (!data.oncogenicity) {
      $(target + ' a.oncogenicity').addClass('grey-out');
      $(target + ' a.oncogenicity').addClass('tab-disabled');
    }

    if (!data.mutationEffect) {
      $(target + ' a.mutation-effect').addClass('grey-out');
    }

    if (!(data.biologicalSummary || data.mutationEffectCitations)) {
      $(target + ' .tab-pane.mutation-effect').remove();
      $(target + ' a.mutation-effect').removeAttr('href');
      $(target + ' a.oncogenicity').removeAttr('href');
      $(target + ' a.mutation-effect').addClass('tab-disabled');
      $(target + ' .enable-hover').each(function() {
        $(this).removeClass('enable-hover');
      });
    }

    $(target + ' .oncokb-card .collapsible').on('click.collapse', '> li > .collapsible-header', function() {
      $(this).find('i.glyphicon-chevron-down').toggle();
      $(this).find('i.glyphicon-chevron-up').toggle();
    });

    // $(target + ' .oncokb-card i.fa-book').each(function() {
    $(target + ' .oncokb-card [qtip-content]').each(function() {
      var element = $(this);
      var content = element.attr('qtip-content');
      var classes = 'qtip-light qtip-shadow';

      if (content) {
        if (element.hasClass('fa-book')) {
          content = '<img src="images/loader.gif" />';
          classes += ' qtip-oncokb-card-refs';
        }
        if (element.hasClass('level-icon')) {
          classes += ' qtip-oncokb-card-levels';
        }
        element.qtip({
          content: content,
          hide: {
            fixed: true,
            delay: 400,
            event: "mouseleave"
          },
          style: {
            classes: classes,
            tip: true
          },
          show: {
            event: 'mouseover',
            delay: 0,
            ready: false
          },
          position: {
            my: element.attr('position-my') || 'center left',
            at: element.attr('position-at') || 'center right',
            viewport: $(window)
          },
          events: {
            render: function(event, api) {
              if (element.hasClass('fa-book')) {
                $.when(getReferenceRows(element.attr('qtip-content')))
                    .then(function(result) {
                      api.set({
                        'content.text': result
                      });
                      api.reposition(null, false);
                    }, function() {
                      api.set({
                        'content.text': ''
                      });
                    });
              }
            }
          }
        });
      } else {
        $(this).remove();
      }
    })

    $(target + ' a[data-toggle="tab"]').on('shown.bs.tab', function() {
      var isMutationEffect = $(this).hasClass('mutation-effect');
      var isOncogenicity = $(this).hasClass('oncogenicity');
      var classname = '';
      var initialKey = '';
      var citationKey = '';

      if (isMutationEffect) {
        classname = 'mutation-effect';
        initialKey = 'mutationRefInitialized';
        citationKey = 'mutationEffectCitations';
      } else if (isOncogenicity) {
        classname = 'oncogenicity';
        initialKey = 'oncogenicityInitialized';
        citationKey = 'oncogenicityCitations';
      }

      if (classname && !status[initialKey]) {
        if (data[citationKey]) {
          $.when(getReferenceRows(data[citationKey]))
              .then(function(data) {
                if (data) {
                  $(target + ' .tab-pane.' + classname + ' .refs').html(data);
                } else {
                  $(target + ' .tab-pane.' + classname + ' .refs').remove();
                }
              }, function(error) {
                $(target + ' .tab-pane.' + classname + ' .refs').remove();
              }, function() {
                status[initialKey] = true;
              });

        } else {
          $(target + ' .tab-pane.' + classname + ' .refs').remove();
        }
      }
    });

    $(target + ' a.oncogenicity[data-toggle="tab"]').tab('show');
  }

  function getReferenceRows(refs) {
    if (refs) {
      var dfd = $.Deferred();
      $.when(getReferenceInfoCall(refs))
          .then(function(data) {
            var refsTemplates = [];
            var articlesData = data.result;

            if (articlesData !== undefined && _.isArray(articlesData.uids) && articlesData.uids.length > 0) {
              refsTemplates = ['<ul class="list-group" style="margin-bottom: 0">'];

              _.each(articlesData.uids, function(uid) {
                var refsFn = getTemplateFn('oncokb-card-refs-item');
                var articleContent = articlesData[uid];
                refsTemplates.push(refsFn({
                  pmid: articleContent.uid,
                  title: articleContent.title,
                  author: (_.isArray(articleContent.authors) && articleContent.authors.length > 0) ? (articleContent.authors[0].name + ' et al.') : 'Unknown',
                  source: articleContent.source,
                  date: (new Date(articleContent.pubdate)).getFullYear()
                }));
              });
              refsTemplates.push('</ul>');
            }

            dfd.resolve(refsTemplates.join(''));
          }, function(error) {
            dfd.reject(error);
          }, function(status) {

          });
      return dfd.promise();
    } else {
      return '';
    }
  }

  function getReferenceInfoCall(refs) {
    if (refs) {
      var dfd = $.Deferred();

      $.get('http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=' + refs).then(
          function(articles) {
            dfd.resolve(articles);
          },
          function(error) {
            dfd.reject(error);
          },
          function(status) {
          });
      return dfd.promise();
    } else {
      return '';
    }
  }

  return {
    getTemplateFn: getTemplateFn,
    init: init
  };
})(window._, window.$);
