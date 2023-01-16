import { HelperDeclareSpec, HelperOptions, SafeString, escapeExpression } from 'handlebars';

const buildAttributeString = (attributes: Record<string, string>): string => {
  return Object.entries(attributes)
    .map(([attribute, value]) => `${escapeExpression(attribute)}="${escapeExpression(`${value}`)}"`)
    .join(' ');
};

function buildAttributeObject({ hash }: HelperOptions): Record<string, string> {
  return { ...hash };
}

function googleFontLink({ hash }: HelperOptions): string | SafeString {
  const fonts = 'fonts' in hash && typeof hash.fonts === 'string' ? hash.fonts : 'Share';
  const fontParams = fonts
    .split(',')
    .map((font) => `family=${font.replace(' ', '+')}`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
}

function externalLink(options: HelperOptions): string | SafeString {
  const attributeString = buildAttributeString({
    target: '_blank',
    rel: 'noopener noreferrer',
    class: 'uk-link',
    ...options.hash,
  });
  return new SafeString(`<a ${attributeString}>${options.fn(this)}</a>`);
}

function buildBreadcrumbs(
  breadcrumbs: string[],
  attributes: Record<string, string> = {}
): string | SafeString {
  const list = ['<li><a href="/"><span uk-icon="home"></span> home</a></li>'];
  for (const breadcrumb of breadcrumbs) {
    list.push(`<li><span>${escapeExpression(breadcrumb)}</span></li>`);
  }

  return new SafeString(
    `<h3 ${buildAttributeString(attributes)}><ul class="uk-breadcrumb uk-margin-remove">${list.join(
      ''
    )}</ul></h3>`
  );
}

function floatingBreadcrumbs(options: HelperOptions): string | SafeString {
  const hasBlock = 'fn' in options;
  const block = hasBlock ? options.fn(this) : '';

  const attributeString = {
    class: `floating-header uk-position-absolute uk-position-top uk-position-medium${
      hasBlock ? ' uk-flex uk-flex-wrap' : ''
    }"`,
    ...options.hash.attributes,
  };
  return `<div ${attributeString}>${buildBreadcrumbs(
    options.hash.breadcrumbs,
    hasBlock ? { class: 'uk-flex-auto' } : {}
  )}${block}</div>`;
}

export const helpers: HelperDeclareSpec = {
  attributes: buildAttributeObject,
  googleFontLink,
  externalLink,
  breadcrumbs: ({ hash }) =>
    buildBreadcrumbs(
      typeof hash.breadcrumbs === 'string' ? hash.breadcrumbs.split('/') : [],
      hash.attributes
    ),
  floatingBreadcrumbs,
};
