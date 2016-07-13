var OncoKBCard = (function(_, $) {
  var templateCache = {};
  var meta = {
    title: 'BRAF V600G in Melanoma',
    oncogenicity: 'Oncogenic',
    oncogenicityCitations: '1,2,4,5',
    mutationEffect: 'Likely Switch-of-function',
    mutationEffectCitations: '',
    clinicalSummary: 'BRAF V600G has not been functionally or clinically validated. However, BRAF V600E/K [where E/K is the highest level] is known to be oncogenic [or likely oncogenic], and therefore this alteration is considered likely oncogenic. While the therapeutic implications are unknown for BRAF V600G, there are therapeutic implications for BRAF V600E/K in melanoma [where melanoma is the highest level].',
    biologicalSummary: 'There is level 1 evidence that V600E or V600K mutations in BRAF is associated with response to FDA-approved combination of RAF-inhibitor dabrafenib and trametinib in melanoma (PMID: 25287827, 25399551, 25265492), as well as dabrafenib monotherapy in non-small cell lung cancer (Planchard, D et al. J Clin. Oncol. abstract 8009; 2013).',
    treatments: [
      {
        level: '1',
        variant: 'V600E',
        treatment: 'Trametinib',
        cancerType: 'Melanoma',
        citations: '1,2,4,5'
      },
      {
        level: '1',
        variant: 'V600K',
        treatment: 'Dabrafenib',
        cancerType: 'Melanoma',
        citations: '1,2,4,5'
      },
      {
        level: '1',
        variant: 'V600E/K',
        treatment: 'Trametinib + Dabrafenib',
        cancerType: 'Melanoma',
        citations: '1,2,4,5'
      },
      {
        level: '2A',
        variant: 'V600E/K',
        treatment: 'Trametinib + Dabrafenib',
        cancerType: 'Melanoma/Non-Small Cell Lung Cancer',
        citations: '1,2,4,5'
      },
      // {
      //   level: '3A',
      //   variant: 'V600E',
      //   treatment: 'Vemurafenib',
      //   cancerType: 'Melanoma',
      //   citations: '1,2,4,5'
      // },
      // {
      //   level: '3B',
      //   variant: 'V600E/K',
      //   treatment: 'Vemurafenib+Cobimetinib',
      //   cancerType: 'Melanoma',
      //   citations: ''
      // },
      // {
      //   level: '4',
      //   variant: 'V600E',
      //   treatment: 'Cobimetinib',
      //   cancerType: 'Melanoma',
      //   citations: ''
      // },
      // {
      //   level: 'R1',
      //   variant: 'V600E',
      //   treatment: 'Cobimetinib',
      //   cancerType: 'Melanoma',
      //   citations: '1,2,4,5'
      // },
    ]
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
    var treamtmentTemplates = [];

    if(data) {
      meta = data;
    }
    _.each(meta.treatments, function(treatment) {
      var treatmentFn = getTemplateFn("oncokb-card-treatment-row");
      treamtmentTemplates.push(treatmentFn(treatment));
    });
    var cardMainTemplateFn = getTemplateFn("oncokb-card");
    var cardMainTemplate = cardMainTemplateFn({
      title: meta.title,
      oncogenicity: meta.oncogenicity,
      oncogenicityCitations: meta.oncogenicityCitations,
      mutationEffect: meta.mutationEffect,
      mutationEffectCitations: meta.mutationEffectCitations,
      clinicalSummary: meta.clinicalSummary,
      biologicalSummary: meta.biologicalSummary,
      treatmentRows: treamtmentTemplates.join('')
    });

    $(target).html(cardMainTemplate);
    $(target + ' .oncokb-card .collapsible').collapsible();
    $(target + ' .oncokb-card ul.tabs').tabs();

    $(target + ' .oncokb-card .collapsible').on('click.collapse', '> li > .collapsible-header', function() {
      $(this).find('i.glyphicon-chevron-down').toggle();
      $(this).find('i.glyphicon-chevron-up').toggle();
    });

    $(target + ' .oncokb-card i.fa-book').each(function() {
      var content = $(this).attr('qtip-content');

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
            my: 'center left',
            at: 'center right',
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
