import StringUtils = require("ember-cli-string-utils");

StringUtils.decamelize('innerHTML'); // 'inner_html'
StringUtils.dasherize('innerHTML'); // 'inner-html'
StringUtils.camelize('innerHTML'); // 'innerHTML'
StringUtils.classify('innerHTML'); // 'InnerHTML'
StringUtils.underscore('innerHTML'); // 'inner_html'
StringUtils.capitalize('innerHTML'); // 'InnerHTML'
