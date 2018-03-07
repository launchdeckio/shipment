module.exports = (path, delimiter = '.') => {
    if (!path) return null;
    const pos = path.lastIndexOf(delimiter);
    return pos ? path.substring(0, pos) : '';
};