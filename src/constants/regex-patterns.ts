const regexPatterns = {
  WHITE_SPACES: /  +/g,
  REMOVE_ACCENTS: /[\u0300-\u036f]/g,
  VALID_SLUG: /^[a-zA-z0-9]+(?:-[a-zA-z0-9]+)*$/,
};

export default regexPatterns;
