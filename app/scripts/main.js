var OncoKBCard = (function(_, $) {
  var templateCache = {};
  var levelDes = {
    '1': '<b>FDA-recognized</b> biomarker predictive of response to an <b>FDA-approved</b> drug <b>in this indication</b>',
    '2A': '<b>Standard of care</b> biomarker predictive of response to an <b>FDA-approved</b> drug <b>in this indication</b>',
    '2B': '<b>Standard of care</b> biomarker predictive of response to an <b>FDA-approved</b> drug <b>in another indication</b> but not standard of care for this indication',
    '3A': '<b>Compelling clinical evidence</b> supports the biomarker as being predictive of response to a drug <b>in this indication</b> but neither biomarker and drug are standard of care',
    '3B': '<b>Compelling clinical evidence</b> supports the biomarker as being predictive of response to a drug <b>in another indication</b> but neither biomarker and drug are standard of care',
    '4': '<b>Compelling biological evidence</b> supports the biomarker as being predictive of response to a drug but neither biomarker and drug are standard of care',
    'R1': '<b>Standard of care</b> biomarker predictive of <b>resistance</b> to an <b>FDA-approved</b> drug <b>in this indication</b>'
  };

  /**
   * Compiles the template for the given template id
   * by using underscore template function.
   *
   * @param templateId    html id of the template content
   * @returns function    compiled template function
   */
  function compileTemplate(templateId) {
    return _.template($("#" + templateId).html());
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

  function init(data, target) {
    var treatmentTemplates = [];
    var levelTemplates = [];

    _.each(data.treatments, function(treatment) {
      var treatmentFn = getTemplateFn("oncokb-card-treatment-row");

      if(treatment.level){
        treatment.levelDes = levelDes[treatment.level];
      }
      treatmentTemplates.push(treatmentFn(treatment));
    });

    _.each(levelDes, function(levelDes, level) {
      var levelFn = getTemplateFn("oncokb-card-level-list-item");
      levelTemplates.push(levelFn({
        level: level,
        levelDes: levelDes
      }));
    });

    var cardMainTemplateFn = getTemplateFn("oncokb-card");
    var cardMainTemplate = cardMainTemplateFn({
      title: data.title,
      oncogenicity: data.oncogenicity || 'Unknown to be oncogenic',
      oncogenicityCitations: data.oncogenicityCitations,
      mutationEffect: data.mutationEffect || 'Pending curation',
      mutationEffectCitations: data.mutationEffectCitations,
      clinicalSummary: data.clinicalSummary,
      biologicalSummary: data.biologicalSummary,
      treatmentRows: treatmentTemplates.join(''),
      levelRows: levelTemplates.join('')
    });

    $(target).html(cardMainTemplate);

    //Remove table element if there is no treatment available
    if (!_.isArray(data.treatments) || data.treatments.length === 0) {
      $(target + ' .oncogenic table').remove();
    }

    if(!data.oncogenicity) {
      $(target + ' a.oncogenicity').addClass('grey-out');
      $(target + ' a.oncogenicity').addClass('tab-disabled');
    }

    if(!data.mutationEffect) {
      $(target + ' a.mutation-effect').addClass('grey-out');
      $(target + ' a.mutation-effect').addClass('tab-disabled');
    }

    if(!data.biologicalSummary) {
      $(target + ' #mutation-effect').remove();
      $(target + ' a.mutation-effect').removeAttr('href');
      $(target + ' a.oncogenic').removeAttr('href');
      $(target + ' .enable-hover').each(function() {
        $(this).removeClass('enable-hover');
      });
    }else {
      $(target + ' .oncokb-card ul.tabs').tabs();
    }

    $(target + ' .oncokb-card .collapsible').collapsible();

    $(target + ' .oncokb-card .collapsible').on('click.collapse', '> li > .collapsible-header', function() {
      $(this).find('i.glyphicon-chevron-down').toggle();
      $(this).find('i.glyphicon-chevron-up').toggle();
    });

    // $(target + ' .oncokb-card i.fa-book').each(function() {
    $(target + ' .oncokb-card [qtip-content]').each(function() {
      var element = $(this);
      var content = element.attr('qtip-content');

      if (content) {
        $(this).qtip({
          content: content,
          hide: {
            fixed: true,
            delay: 400,
            event: "mouseleave"
          },
          style: {
            classes: 'qtip-light qtip-rounded qtip-shadow',
            tip: true
          },
          show: {
            event: "mouseover",
            delay: 0,
            ready: false
          },
          position: {
            my: element.attr('position-my') || 'center left',
            at: element.attr('position-at') || 'center right',
            viewport: $(window)
          }
        });
      } else {
        $(this).remove();
      }
    })

  }

  return {
    getTemplateFn: getTemplateFn,
    init: init
  }
})(window._, window.$);
