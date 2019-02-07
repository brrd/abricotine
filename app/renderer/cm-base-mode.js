module.exports = {
  name: "yaml-frontmatter",
  base: {
    name: "gfm",
    highlightFormatting: true,
    allowAtxHeaderWithoutSpace: true,
    tokenTypeOverrides: {
      "list1": "list",
      "list2": "list",
      "list3": "list"
    }
  }
};
