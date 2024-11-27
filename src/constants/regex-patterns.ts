const regexPatterns = {
  WHITE_SPACES: /  +/g,
  REMOVE_ACCENTS: /[\u0300-\u036f]/g,
  SLUG_WITH_TIMESTAMP: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

export default regexPatterns;
