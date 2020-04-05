export default (str) => (str.length > 0 ? `${str[0].toUpperCase()}${str.slice(1)}` : '');
