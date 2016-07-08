var OncoKBCard = (function(_, $) {
  var templateCache = {};
  var meta = {
    title: 'BRAF V600E in Melanoma',
    oncogenicity: 'Oncogenic',
    oncogenicityCitations: '1,2,4,5',
    mutationEffect: 'Likely Switch-of-function',
    mutationEffectCitations: '1,2,4,5',
    clinicalSummary: 'BRAF encodes an intracellular kinase and component of the pro-oncogenic MAP-kinase signaling pathway. Mutations of BRAF are found in various cancers, including melanoma and lung cancer. The BRAF V600E mutation is known to be oncogenic.',
    biologicalSummary: 'There is level 1 evidence that V600E or V600K mutations in BRAF is associated with response to FDA-approved combination of RAF-inhibitor dabrafenib and trametinib in melanoma (PMID: 25287827, 25399551, 25265492), as well as dabrafenib monotherapy in non-small cell lung cancer (Planchard, D et al. J Clin. Oncol. abstract 8009; 2013).',
    treatments: [
      {
        level: '1',
        treatment: 'Trametinib',
        cancerType: 'Dabrafenib',
        citations: '1,2,4,5'
      },
      {
        level: '2A',
        treatment: 'Dabrafenib',
        cancerType: 'Melanoma',
        citations: '1,2,4,5'
      },
      {
        level: '2B',
        treatment: 'Trametinib + Dabrafenib',
        cancerType: 'Melanoma',
        citations: '1,2,4,5'
      },
      {
        level: '3A',
        treatment: 'Vemurafenib',
        cancerType: 'Melanoma',
        citations: '1,2,4,5'
      },
      {
        level: '3B',
        treatment: 'Vemurafenib+Cobimetinib',
        cancerType: 'Melanoma',
        citations: '1,2,4,5'
      },
      {
        level: '4',
        treatment: 'Cobimetinib',
        cancerType: 'Melanoma',
        citations: '1,2,4,5'
      },
      {
        level: 'R1',
        treatment: 'Cobimetinib',
        cancerType: 'Melanoma',
        citations: '1,2,4,5'
      },
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

  function init() {
    var treamtmentTemplates = [];
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

    $('#main').html(cardMainTemplate);
  }

  return {
    getTemplateFn: getTemplateFn,
    init: init
  }
})(window._, window.$);
